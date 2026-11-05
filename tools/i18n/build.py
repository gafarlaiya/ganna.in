"""Build translated copies of ganna.in under public/<lang>/.

Gujarati pages stay the source. Translations live in tools/i18n/tr/<lang>_NN.tsv
as "id<TAB>text" lines (ids from src.json). A language is only built when every
segment is translated. Run: python3 tools/i18n/build.py
"""
import os, sys, re, json, glob, html as H, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from seg import segments, json_strings, norm, GU
from extract import pages, ROOT

LANGS = {  # code: (name in its own script, og locale, google font family or None)
    'gu': ('ગુજરાતી', 'gu_IN', None),
    'hi': ('हिन्दी', 'hi_IN', 'Noto+Sans+Devanagari'),
    'mr': ('मराठी', 'mr_IN', 'Noto+Sans+Devanagari'),
    'pa': ('ਪੰਜਾਬੀ', 'pa_IN', 'Noto+Sans+Gurmukhi'),
    'kn': ('ಕನ್ನಡ', 'kn_IN', 'Noto+Sans+Kannada'),
    'en': ('English', 'en_IN', None),
}
FONTVAR = {'hi': "'Noto Sans Devanagari'", 'mr': "'Noto Sans Devanagari'", 'pa': "'Noto Sans Gurmukhi'", 'kn': "'Noto Sans Kannada'", 'en': "'Plus Jakarta Sans'"}
SITE = 'https://ganna.in'
TR = os.path.join(os.path.dirname(__file__), 'tr')


def url_of(p):  # 'index.html' -> '/', 'public/faq/index.html' -> '/faq/'
    return '/' if p == 'index.html' else p[len('public'):-len('index.html')]


def load(lang, src):
    d = {}
    for f in sorted(glob.glob(os.path.join(TR, f'{lang}_*.tsv'))):
        for ln in open(f, encoding='utf-8'):
            ln = ln.rstrip('\n')
            if '\t' not in ln: continue
            i, t = ln.split('\t', 1)
            i = i.strip()
            if i in src and t.strip():
                d[src[i]] = t.strip()
    return d


def tagnames(s): return sorted(re.findall(r'<\s*(/?[a-zA-Z]+)', s))


def switcher(cur, path, avail):
    links = []
    for code in LANGS:
        if code not in avail: continue
        href = path if code == 'gu' else f'/{code}{path}'
        nm = LANGS[code][0]
        links.append(f'<a href="{href}" lang="{code}"' + (' aria-current="true"' if code == cur else '') + f'>{nm}</a>')
    css = ('<style>.langbar{display:flex;gap:4px;justify-content:flex-end;overflow-x:auto;white-space:nowrap;background:#0a2212;padding:4px 12px;scrollbar-width:none}'
           '.langbar::-webkit-scrollbar{display:none}.langbar a{color:#d8e8d8;text-decoration:none;font-size:13px;font-weight:600;padding:2px 9px;border-radius:999px;line-height:1.6}'
           '.langbar a[aria-current]{background:#f3b72c;color:#0a2212}@media(max-width:600px){.langbar{justify-content:flex-start}}</style>')
    return '<!--langbar-->' + css + '<div class="langbar" aria-label="Language">' + ''.join(links) + '</div><!--/langbar-->'


def alternates(path, avail):
    out = ['<!--hreflang-->']
    for code in LANGS:
        if code in avail:
            out.append(f'<link rel="alternate" hreflang="{code}" href="{SITE}{path if code == "gu" else "/" + code + path}">')
    out.append(f'<link rel="alternate" hreflang="x-default" href="{SITE}{path}">')
    return ''.join(out) + '<!--/hreflang-->'


def decorate(h, lang, path, avail):
    """add hreflang + language bar (idempotent)"""
    h = re.sub(r'<!--hreflang-->.*?<!--/hreflang-->', '', h, flags=re.S)
    h = re.sub(r'<!--langbar-->.*?<!--/langbar-->', '', h, flags=re.S)
    h = re.sub(r'(<link rel="canonical"[^>]*>)', lambda m: m.group(1) + alternates(path, avail), h, count=1)
    h = h.replace('<header class="top">', '<header class="top">' + switcher(lang, path, avail), 1)
    return h


def strip_deco(h):
    h = re.sub(r'<!--hreflang-->.*?<!--/hreflang-->', '', h, flags=re.S)
    return re.sub(r'<!--langbar-->.*?<!--/langbar-->', '', h, flags=re.S)


def translate(h, lang, d, internal, missing):
    h = strip_deco(h)
    segs = segments(h)
    for s, e, kind, t in sorted(segs, key=lambda x: -x[0]):
        if kind == 'json':
            o = json.loads(t)
            def walk(v):
                if isinstance(v, dict): return {k: walk(x) for k, x in v.items()}
                if isinstance(v, list): return [walk(x) for x in v]
                if isinstance(v, str):
                    if GU.search(v):
                        r = d.get(norm(v))
                        if r is None: missing.add(norm(v)); return v
                        return re.sub(r'<[^>]*>', '', H.unescape(r))
                    if v.startswith(SITE + '/'):
                        p = v[len(SITE):].split('#')[0]
                        if p in internal: return SITE + '/' + lang + v[len(SITE):]
                return v
            o = walk(o)
            if isinstance(o, dict) and 'inLanguage' in o: o['inLanguage'] = lang
            rep = json.dumps(o, ensure_ascii=False)
        else:
            r = d.get(norm(t))
            if r is None: missing.add(norm(t)); continue
            if kind == 'wa': rep = urllib.parse.quote(H.unescape(r), safe='')
            elif kind == 'attr': rep = H.escape(H.unescape(re.sub(r'<[^>]*>', '', r)), quote=True)
            else: rep = r
        h = h[:s] + rep + h[e:]
    return h


# Gujarati text inside the home page's inline scripts (WhatsApp messages the farmer sends, button labels)
JS = {
    "'નમસ્તે, મારી શેરડી: '": {'hi': "'नमस्ते, मेरा गन्ना: '", 'mr': "'नमस्कार, माझा ऊस: '", 'pa': "'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਮੇਰਾ ਗੰਨਾ: '", 'kn': "'ನಮಸ್ಕಾರ, ನನ್ನ ಕಬ್ಬು: '", 'en': "'Hello, my sugarcane: '"},
    "'. મારે Immunity Program જાણવો છે.'": {'hi': "'. मुझे Immunity Program जानना है।'", 'mr': "'. मला Immunity Program जाणून घ्यायचा आहे.'", 'pa': "'. ਮੈਂ Immunity Program ਜਾਣਨਾ ਚਾਹੁੰਦਾ ਹਾਂ।'", 'kn': "'. ನನಗೆ Immunity Program ಬಗ್ಗೆ ತಿಳಿಯಬೇಕು.'", 'en': "'. I want to know about the Immunity Program.'"},
    'aria-label="Video ચલાવો"': {'hi': 'aria-label="वीडियो चलाएं"', 'mr': 'aria-label="व्हिडिओ चालू करा"', 'pa': 'aria-label="ਵੀਡੀਓ ਚਲਾਓ"', 'kn': 'aria-label="ವೀಡಿಯೊ ಪ್ಲೇ ಮಾಡಿ"', 'en': 'aria-label="Play video"'},
    "' પંપ'": {'hi': "' पंप'", 'mr': "' पंप'", 'pa': "' ਪੰਪ'", 'kn': "' ಪಂಪ್'", 'en': "' pumps'"},
    "'નમસ્તે, મારી પાસે '": {'hi': "'नमस्ते, मेरे पास '", 'mr': "'नमस्कार, माझ्याकडे '", 'pa': "'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਮੇਰੇ ਕੋਲ '", 'kn': "'ನಮಸ್ಕಾರ, ನನ್ನ ಬಳಿ '", 'en': "'Hello, I have '"},
    "' જમીન છે. ગણતરી મુજબ: Granules: '": {'hi': "' ज़मीन है। गणना के अनुसार: Granules: '", 'mr': "' जमीन आहे. गणनेनुसार: Granules: '", 'pa': "' ਜ਼ਮੀਨ ਹੈ। ਹਿਸਾਬ ਮੁਤਾਬਕ: Granules: '", 'kn': "' ಜಮೀನು ಇದೆ. ಲೆಕ್ಕದ ಪ್ರಕಾರ: Granules: '", 'en': "' of land. As per the calculator: Granules: '"},
    "'). આ પ્રોગ્રામ સમજાવો.'": {'hi': "'). यह प्रोग्राम समझाइए।'", 'mr': "'). हा प्रोग्राम समजावून सांगा.'", 'pa': "'). ਇਹ ਪ੍ਰੋਗਰਾਮ ਸਮਝਾਓ ਜੀ।'", 'kn': "'). ಈ ಪ್ರೋಗ್ರಾಂ ಬಗ್ಗೆ ತಿಳಿಸಿ.'", 'en': "'). Please explain this program.'"},
    "'મોકલી રહ્યા છીએ...'": {'hi': "'भेज रहे हैं...'", 'mr': "'पाठवत आहोत...'", 'pa': "'ਭੇਜ ਰਹੇ ਹਾਂ...'", 'kn': "'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...'", 'en': "'Sending...'"},
    "'નમસ્તે, મારું નામ '": {'hi': "'नमस्ते, मेरा नाम '", 'mr': "'नमस्कार, माझे नाव '", 'pa': "'ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਮੇਰਾ ਨਾਮ '", 'kn': "'ನಮಸ್ಕಾರ, ನನ್ನ ಹೆಸರು '", 'en': "'Hello, my name is '"},
    "'. ગામ: '": {'hi': "'. गाँव: '", 'mr': "'. गाव: '", 'pa': "'. ਪਿੰਡ: '", 'kn': "'. ಗ್ರಾಮ: '", 'en': "'. Village: '"},
    "'. શેરડી: '": {'hi': "'. गन्ना: '", 'mr': "'. ऊस: '", 'pa': "'. ਗੰਨਾ: '", 'kn': "'. ಕಬ್ಬು: '", 'en': "'. Sugarcane: '"},
    "'. મારે Immunity Sugarcane Program જાણવો છે.'": {'hi': "'. मुझे Immunity Sugarcane Program जानना है।'", 'mr': "'. मला Immunity Sugarcane Program जाणून घ्यायचा आहे.'", 'pa': "'. ਮੈਂ Immunity Sugarcane Program ਜਾਣਨਾ ਚਾਹੁੰਦਾ ਹਾਂ।'", 'kn': "'. ನನಗೆ Immunity Sugarcane Program ಬಗ್ಗೆ ತಿಳಿಯಬೇಕು.'", 'en': "'. I want to know about the Immunity Sugarcane Program.'"},
}


def localise_js(h, lang):
    def fix(m):
        s = m.group(0)
        for k, v in JS.items():
            s = s.replace(k, v[lang])
        return s
    return re.sub(r'<script>.*?</script>', fix, h, flags=re.S)


def localise(h, lang, path, internal):
    h = localise_js(h, lang)
    nm, loc, font = LANGS[lang]
    h = h.replace('<html lang="gu">', f'<html lang="{lang}">', 1)
    h = h.replace('content="gu_IN"', f'content="{loc}"')
    # internal links -> /<lang>/...
    def fix(m):
        attr, q, u = m.group(1), m.group(2), m.group(3)
        base = u
        if base.startswith(SITE): base = base[len(SITE):] or '/'
        p = base.split('#')[0].split('?')[0]
        if p in internal:
            return f'{attr}={q}{"" if not u.startswith(SITE) else SITE}/{lang}{base}{q}'
        return m.group(0)
    h = re.sub(r'\b(href|content)=(["\'])((?:https://ganna\.in)?/[^"\']*)\2', fix, h)
    if font:
        h = h.replace('family=Noto+Sans+Gujarati:wght@', f'family={font}:wght@')
    elif lang == 'en':
        h = h.replace('family=Noto+Sans+Gujarati:wght@400;500;600;700;800;900&', '')
    h = h.replace('</head>', f'<style>:root{{--font:{FONTVAR[lang]},\'Plus Jakarta Sans\',system-ui,sans-serif}}</style>\n</head>', 1)
    return h


def main():
    os.chdir(ROOT)
    src = json.load(open('tools/i18n/src.json', encoding='utf-8'))
    ps = pages()
    internal = {url_of(p) for p in ps}
    built = {}
    dicts = {}
    report = {}
    for lang in LANGS:
        if lang == 'gu': continue
        d = load(lang, src)
        bad = [k for k, v in d.items() if tagnames(k) != tagnames(v)]
        for k in bad: d.pop(k)
        miss = set(src.values()) - set(d)
        report[lang] = (len(src) - len(miss), len(src), len(bad))
        dicts[lang] = d
        if not miss: built[lang] = d
    avail = {'gu'} | set(built)
    for p in ps:
        path = url_of(p)
        h = open(p, encoding='utf-8').read()
        open(p, 'w', encoding='utf-8').write(decorate(h, 'gu', path, avail))
        for lang, d in built.items():
            missing = set()
            out = translate(h, lang, d, internal, missing)
            if missing: print('MISSING', lang, p, list(missing)[:3]); continue
            out = decorate(localise(out, lang, path, internal), lang, path, avail)
            dst = os.path.join('public', lang, path.strip('/'), 'index.html')
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            open(dst, 'w', encoding='utf-8').write(out)
    # sitemap
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    old = open('public/sitemap.xml', encoding='utf-8').read()
    meta = {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r'<loc>https://ganna\.in(/[^<]*)</loc><lastmod>([^<]*)</lastmod><priority>([^<]*)</priority>', old)}
    for p in ps:
        path = url_of(p); lm, pr = meta.get(path, ('2026-11-05', '0.5'))
        alts = ''.join(f'<xhtml:link rel="alternate" hreflang="{c}" href="{SITE}{path if c == "gu" else "/" + c + path}"/>' for c in LANGS if c in avail)
        for c in LANGS:
            if c in avail:
                sm.append(f'  <url><loc>{SITE}{path if c == "gu" else "/" + c + path}</loc><lastmod>{lm}</lastmod><priority>{pr}</priority>{alts}</url>')
    sm.append('</urlset>')
    open('public/sitemap.xml', 'w', encoding='utf-8').write('\n'.join(sm) + '\n')
    for lang, (n, t, b) in report.items():
        print(f'{lang}: {n}/{t} translated' + (f', {b} rejected (tags changed)' if b else '') + (' -> built' if lang in built else ''))


if __name__ == '__main__':
    main()
