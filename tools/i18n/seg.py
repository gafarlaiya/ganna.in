"""Find translatable Gujarati segments in ganna.in pages.
segments(html) -> list of (start, end, kind, text). kind: html | attr | json | wa
"""
import re, json, urllib.parse
GU = re.compile(r'[઀-૿]')
INLINE = {'a','strong','b','em','i','span','small','br','sup','sub','u','mark','code','abbr','wbr','s'}
SKIP = {'script','style','noscript','svg','template','textarea'}
TOK = re.compile(r'<!--.*?-->|<(/?)([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"\']|"[^"]*"|\'[^\']*\')*)>|[^<]+|<', re.S)
ATTR = re.compile(r'([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|\'([^\']*)\')')
VOID = {'svg','br','img','input','meta','link','hr','wbr','source','area','col','embed','param','track'}

def norm(s): return re.sub(r'\s+', ' ', s).strip()

def _attrs(tagtext, base, out):
    for m in ATTR.finditer(tagtext):
        name = m.group(1).lower(); val = m.group(3) if m.group(3) is not None else m.group(4)
        vs = base + m.start(2) + 1; ve = vs + len(val)
        if name == 'href' and 'wa.me/' in val and 'text=' in val:
            q = val.split('text=', 1)[1].split('&')[0]
            t = urllib.parse.unquote(q.replace('&amp;', '&'))
            if GU.search(t):
                qs = vs + val.index('text=') + 5
                out.append((qs, qs + len(q), 'wa', t))
        elif name not in ('href','src','class','id','style','srcset') and GU.search(val):
            out.append((vs, ve, 'attr', val))

def _flush(buf, html, out):
    # buf: list of (start,end,kind,tag,closing) items: kind 'text' or 'tag'
    def blank(x): return (x[1] == 'text' and not html[x[0][0]:x[0][1]].strip()) or x[2] in ('svg', 'img', 'br')
    while buf and blank(buf[0]): buf.pop(0)
    while buf and blank(buf[-1]): buf.pop()
    if not buf: return
    s, e = buf[0][0][0], buf[-1][0][1]
    frag = html[s:e]
    if not GU.search(re.sub(r'<[^>]*>', '', frag)): return
    # split into top-level elements if no top-level text
    depth = 0; tops = []; toptext = False; cur = None
    for (a, b), kind, tag, closing in buf:
        if kind == 'text':
            if depth == 0 and html[a:b].strip(): toptext = True
            continue
        if tag in VOID:
            if depth == 0: tops.append([(a, b)])
            continue
        if not closing:
            if depth == 0: cur = [(a, b)]
            depth += 1
        else:
            depth -= 1
            if depth == 0 and cur is not None: cur.append((a, b)); tops.append(cur); cur = None
    if not toptext and depth == 0 and tops and all(len(t) == 2 for t in tops if len(t) > 1):
        # descend: each top-level element's inner part becomes its own segment
        inner = []
        for t in tops:
            if len(t) != 2: continue
            (os_, oe), (cs, ce) = t
            sub = [x for x in buf if x[0][0] >= oe and x[0][1] <= cs]
            inner.append(sub)
        for sub in inner: _flush(sub, html, out)
        return
    out.append((s, e, 'html', frag))

def segments(html):
    out = []
    # head: title + json-ld
    for m in re.finditer(r'<title>(.*?)</title>', html, re.S):
        if GU.search(m.group(1)): out.append((m.start(1), m.end(1), 'html', m.group(1)))
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        out.append((m.start(1), m.end(1), 'json', m.group(1)))
    body_start = html.find('<body')
    for m in re.finditer(r'<meta\b[^>]*>', html[:body_start]):
        _attrs(m.group(0), m.start(), out)
    buf = []; skip = None; pos = body_start
    while True:
        m = TOK.match(html, pos)
        if not m: break
        pos = m.end()
        closing, tag = m.group(1), (m.group(2) or '').lower()
        if skip:
            if tag == skip and closing: skip = None
            continue
        if m.group(0).startswith('<!--'): continue
        if tag == 'svg' and not closing:
            e = html.index('</svg>', m.end()) + 6; pos = e
            buf.append(((m.start(), e), 'tag', 'svg', False)); continue
        if tag:
            if not closing: _attrs(m.group(3) or '', m.start(3), out)
            if tag in SKIP and not closing: _flush(buf, html, out); buf = []; skip = tag; continue
            if tag in INLINE or tag == 'img':
                buf.append(((m.start(), m.end()), 'tag', tag, bool(closing))); continue
            _flush(buf, html, out); buf = []
        else:
            buf.append(((m.start(), m.end()), 'text', None, False))
    _flush(buf, html, out)
    return out

def json_strings(js):
    """yield translatable strings in a JSON-LD blob"""
    res = []
    def walk(o, k=None):
        if isinstance(o, dict):
            for kk, v in o.items(): walk(v, kk)
        elif isinstance(o, list):
            for v in o: walk(v, k)
        elif isinstance(o, str) and GU.search(o): res.append(o)
    walk(json.loads(js)); return res
