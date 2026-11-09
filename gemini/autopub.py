#!/usr/bin/env python3
"""Gemini auto-publisher for GBO websites (runs in GitHub Actions, no Claude usage).

Usage:  GEMINI_API_KEY=... python3 gemini/autopub.py <site> [count]
  site: www | b2b | ganna        count: max new pieces this run (default from env COUNT or 10)
Optional env: TEXT_MODEL, IMAGE_MODEL (otherwise the newest Flash text and Flash image models are picked automatically).

For each piece: plan a topic -> research with Google Search grounding and write -> check against the owner's rules
-> make one illustration -> save in the site's format -> translate -> build. Anything that fails a check is skipped.
The workflow commits and pushes only if the build is complete. Rules live in AUTOPUBLISH.md (read every run).
"""
import base64, csv, datetime as dt, difflib, glob, io, json, os, re, subprocess, sys, time, html as H
import requests
from PIL import Image

SITE = sys.argv[1]
COUNT = int(sys.argv[2] if len(sys.argv) > 2 else os.environ.get("COUNT", "10"))
KEY = os.environ["GEMINI_API_KEY"]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = dt.date.today().isoformat()
API = "https://generativelanguage.googleapis.com/v1beta"
S = requests.Session(); S.headers["x-goog-api-key"] = KEY
os.chdir(ROOT)
RULES = open("AUTOPUBLISH.md", encoding="utf-8").read()
PHONE_OK = {"9978791167"}
BANNED = ["plantonics", "guarantee", "guaranteed", "100% result", "miracle", "best in india", "no.1", "number one",
          "ગેરંટી", "गारंटी", "चमत्कार", "ચમત્કાર"]
log = lambda *a: print(*a, flush=True)

# ------------------------------------------------------------------ Gemini
def pick_models():
    ms = []
    url = f"{API}/models?pageSize=1000"
    r = S.get(url, timeout=60); r.raise_for_status()
    for m in r.json().get("models", []):
        if "generateContent" in m.get("supportedGenerationMethods", []): ms.append(m["name"].split("/")[-1])
    def ver(n):
        v = re.search(r"gemini-(\d+(?:\.\d+)?)", n); return float(v.group(1)) if v else 0
    text = [m for m in ms if re.fullmatch(r"gemini-\d+(\.\d+)?-flash(-latest)?", m)] or [m for m in ms if re.fullmatch(r"gemini-\d+(\.\d+)?-flash-preview.*", m) and "image" not in m]
    img = [m for m in ms if "image" in m and "flash" in m] or [m for m in ms if "image" in m]
    t = os.environ.get("TEXT_MODEL") or max(text, key=ver)
    i = os.environ.get("IMAGE_MODEL") or (max(img, key=ver) if img else None)
    log("models:", t, i); return t, i

def gen(model, parts, system=None, search=False, json_mode=False, temp=0.6, image=False, tries=4):
    body = {"contents": [{"role": "user", "parts": parts}], "generationConfig": {"temperature": temp}}
    if system: body["systemInstruction"] = {"parts": [{"text": system}]}
    if search: body["tools"] = [{"google_search": {}}]
    if json_mode and not search: body["generationConfig"]["responseMimeType"] = "application/json"
    if image: body["generationConfig"]["responseModalities"] = ["IMAGE", "TEXT"]
    for k in range(tries):
        r = S.post(f"{API}/models/{model}:generateContent", json=body, timeout=300)
        if r.status_code in (429, 500, 503):
            w = 30 * (k + 1); log("  gemini", r.status_code, "waiting", w); time.sleep(w); continue
        if r.status_code != 200: raise RuntimeError(f"gemini {r.status_code}: {r.text[:300]}")
        c = r.json().get("candidates", [{}])[0]
        return c
    raise RuntimeError("gemini: out of retries (quota?)")

def text_of(c): return "".join(p.get("text", "") for p in c.get("content", {}).get("parts", []))
def parse_json(t):
    t = t.strip(); m = re.search(r"```(?:json)?\s*(.*?)```", t, re.S)
    if m: t = m.group(1)
    a, b = min([i for i in (t.find("{"), t.find("[")) if i >= 0]), max(t.rfind("}"), t.rfind("]"))
    return json.loads(t[a:b + 1])

def sources_of(c):
    out, seen = [], set()
    for ch in c.get("groundingMetadata", {}).get("groundingChunks", []):
        w = ch.get("web") or {}; u = w.get("uri")
        if not u: continue
        try:
            fu = S.get(u, allow_redirects=True, timeout=20, headers={"User-Agent": "Mozilla/5.0"}).url
        except Exception:
            continue
        if fu in seen or "vertexaisearch" in fu: continue
        seen.add(fu); out.append([w.get("title") or re.sub(r"^https?://(www\.)?", "", fu).split("/")[0], fu])
    return out[:6]

# ------------------------------------------------------------------ site knowledge
def site_pages():
    """(path, title) of existing pages, from the sitemap and the built files."""
    sm = "public/sitemap.xml" if SITE == "ganna" else "sitemap.xml"
    urls = re.findall(r"<loc>https?://[^/<]+(/[^<]*)</loc>", open(sm, encoding="utf-8").read())
    out = []
    for u in urls:
        if re.match(r"^/(hi|gu|mr|pa|kn|en)/", u): continue
        f = ("public" if SITE == "ganna" else ".") + u.rstrip("/") + "/index.html"
        if u == "/": f = ("public" if SITE == "ganna" else ".") + "/index.html"
        if os.path.exists(f):
            m = re.search(r"<title>(.*?)</title>", open(f, encoding="utf-8").read(), re.S)
            out.append((u, H.unescape(m.group(1)).split("|")[0].strip() if m else u))
    return out

def existing_titles():
    t = []
    if os.path.exists("AUTOPUBLISH-LOG.csv"):
        t += [r["title"] for r in csv.DictReader(open("AUTOPUBLISH-LOG.csv", encoding="utf-8"))]
    return t + [x[1] for x in PAGES]

def path_exists(p):
    p = p.split("#")[0].split("?")[0]
    if p in ("", "/"): return True
    base = "public" if SITE == "ganna" else "."
    return any(os.path.exists(base + p.rstrip("/") + s) for s in ("/index.html", "", ".html"))

BRIEF = {
 "www": "www.gujaratbio.com: articles for progressive Indian farmers, FPOs and orchard owners in plain English. Pillars 1,2,3,4,6,7 with the farmer angle (what to apply, when, how to tell good from bad). Not B2B buying topics, not sugarcane how-to for Gujarati farmers.",
 "b2b": "b2b.gujaratbio.com: knowledge-centre guides in English for agri-input marketers, dealers, brand owners, blenders, co-operatives, importers and agronomists. Pillars 1-5 with the buyer and technical angle (how materials are made, specified, tested, bought; FCO rules; private label; state partners; bulk granules; export). Not farmer how-to-apply pieces.",
 "ganna": "ganna.in: sugarcane-only posts in natural South-Gujarat farmer Gujarati (common English farm words allowed), units in vigha and acre (1 acre = 2.5 vigha). Doses only exactly as on /sugarcane-dosage-schedule/ if mentioned at all.",
}
CATS = {"www": "biostimulants|horticulture|problems|soil|crops", "b2b": "-", "ganna": "-"}

# ------------------------------------------------------------------ steps
def plan(model, n):
    month = dt.date.today().strftime("%b")
    titles = existing_titles()[-500:]
    prompt = (f"Today is {TODAY}. Site: {BRIEF[SITE]}\nCalendar month: {month}.\n"
              f"Propose {n + 4} NEW article topics for this site following the rulebook's topic tree, calendar and headline styles "
              "(at most 1 in 4 fear headlines). Each must answer a real question people search, and must NOT duplicate or closely overlap "
              "any existing title below.\nExisting titles:\n- " + "\n- ".join(titles) +
              '\n\nReturn JSON: [{"title": "...", "question": "the searcher\'s question", "pillar": "1-7", "crop": "crop or empty", "headline_style": "..."}]')
    c = gen(model, [{"text": prompt}], system=RULES, json_mode=True, temp=0.9)
    items = parse_json(text_of(c))
    if isinstance(items, dict): items = next((v for v in items.values() if isinstance(v, list)), [])
    items = [it for it in items if isinstance(it, dict) and it.get("title")]
    keep, low = [], [x.lower() for x in titles]
    for it in items:
        if max([difflib.SequenceMatcher(None, it["title"].lower(), x).ratio() for x in low + [k["title"].lower() for k in keep]] or [0]) > 0.72: continue
        keep.append(it)
    return keep[:n]

def write(model, topic):
    links = "\n".join(f"{p} | {t}" for p, t in PAGES[:400])
    lang = "Gujarati (natural farmer Gujarati)" if SITE == "ganna" else "English"
    cat = f'"cat": one of {CATS[SITE]},' if SITE == "www" else ""
    prompt = (f"Write one complete piece for {BRIEF[SITE]}\nTopic: {topic['title']}\nSearcher's question: {topic['question']}\n"
              f"Language: {lang}. Today is {TODAY}.\nUse Google Search to verify every fact; use only facts you found or the GBO facts in the rulebook. "
              "Put GBO's own experience in at least one place. 700-1400 words for English, 500-1000 for Gujarati.\n"
              "Internal links: you may link ONLY to these existing pages (path | title):\n" + links +
              "\n\nReturn ONLY JSON, no commentary:\n"
              '{"slug": "lowercase-hyphen-english-slug", "title": "<=60 chars", "h1": "...", "desc": "<=155 chars", '
              '"answer": "40-60 word direct answer", ' + cat +
              ' "sections": [{"h": "heading", "md": "markdown body: paragraphs, - lists, | tables |, **bold**, [text](/path)"}], '
              '"faq": [["question", "answer"]], "related": ["/path", "/path", "/path"], '
              '"image_prompt": "a realistic photo scene for the article, Indian farm context, no text, no logos, no product packs, no close-up faces", '
              '"image_alt": "short description in the article language", "keyword": "main search phrase (English)", "keywords": ["..."]}')
    c = gen(model, [{"text": prompt}], system=RULES, search=True, temp=0.5)
    a = parse_json(text_of(c))
    if isinstance(a, list): a = a[0]
    a["sources"] = sources_of(c); a.update({k: topic.get(k, "") for k in ("pillar", "crop", "headline_style")})
    return a

def check(a):
    need = ["slug", "title", "h1", "desc", "answer", "sections", "faq", "related", "image_prompt"]
    miss = [k for k in need if not a.get(k)]
    if miss: return f"missing {miss}"
    a["slug"] = re.sub(r"[^a-z0-9-]+", "-", a["slug"].lower()).strip("-")[:70]
    if path_exists(("/blog/" if SITE == "ganna" else "/resources/" if SITE == "b2b" else "/articles/") + a["slug"]): return "slug exists"
    if max([difflib.SequenceMatcher(None, a["title"].lower(), t.lower()).ratio() for t in existing_titles()] or [0]) > 0.75: return "too similar to an existing title"
    blob = json.dumps(a, ensure_ascii=False).lower()
    for b in BANNED:
        if b in blob: return f"banned phrase: {b}"
    for ph in re.findall(r"(?<!\d)(?:\+?91[\s-]?)?([6-9]\d{4}[\s-]?\d{5})(?!\d)", blob):
        if re.sub(r"\D", "", ph) not in PHONE_OK: return f"unknown phone number {ph}"
    if not a.get("sources"): return "no verified sources"
    words = len(re.sub(r"[#*|\[\]()-]", " ", " ".join(s["md"] for s in a["sections"])).split())
    if words < (400 if SITE == "ganna" else 600): return f"too short ({words} words)"
    # internal links to missing pages become plain text
    for s in a["sections"]:
        s["md"] = re.sub(r"\[([^\]]+)\]\((/[^)\s]*)\)", lambda m: m.group(0) if path_exists(m.group(2)) else m.group(1), s["md"])
    a["related"] = [p for p in a["related"] if isinstance(p, str) and path_exists(p)][:4]
    if not a["related"]: a["related"] = ["/"]
    return None

def make_image(model, a, out):
    if not model: return False
    try:
        c = gen(model, [{"text": a["image_prompt"] + ". Photorealistic, natural light, 16:9 landscape, India. No text, letters, logos, watermarks or product packaging."}], image=True, temp=0.8, tries=2)
        for p in c.get("content", {}).get("parts", []):
            d = p.get("inlineData") or p.get("inline_data")
            if d and d.get("data"):
                im = Image.open(io.BytesIO(base64.b64decode(d["data"]))).convert("RGB")
                w, h = im.size; th = int(w * 9 / 16)
                if th <= h: im = im.crop((0, (h - th) // 2, w, (h - th) // 2 + th))
                else: tw = int(h * 16 / 9); im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
                os.makedirs(os.path.dirname(out), exist_ok=True)
                im.resize((1200, 675), Image.LANCZOS).save(out, "WEBP", quality=78); return True
    except Exception as e:
        log("  image failed:", e)
    return False

# ------------------------------------------------------------------ markdown -> html (b2b, ganna)
def inline(x):
    x = H.escape(x, quote=False)
    x = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", x)
    return re.sub(r"\[([^\]]+)\]\(((?:https?://|/)[^)\s]+)\)", lambda m: f'<a href="{m.group(2)}"' + ("" if m.group(2).startswith("/") else ' rel="noopener" target="_blank"') + f">{m.group(1)}</a>", x)
def md_html(t):
    out = []
    for b in re.split(r"\n\s*\n", t.strip()):
        b = b.strip()
        if b.startswith("|"):
            rows = [[c.strip() for c in r.strip().strip("|").split("|")] for r in b.split("\n") if not re.fullmatch(r"\|?[\s:|-]+\|?", r.strip())]
            out.append("<table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in rows[0]) + "</tr></thead><tbody>" + "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:]) + "</tbody></table>")
        elif re.match(r"^[-*] ", b):
            out.append("<ul>" + "".join("<li>" + inline(re.sub(r"^[-*] ", "", l)) + "</li>" for l in b.split("\n") if l.strip()) + "</ul>")
        elif re.match(r"^\d+\. ", b):
            out.append("<ol>" + "".join("<li>" + inline(re.sub(r"^\d+\. ", "", l)) + "</li>" for l in b.split("\n") if l.strip()) + "</ol>")
        elif b.startswith("#"):
            out.append(f"<h3>{inline(b.lstrip('# '))}</h3>")
        else:
            out.append(f"<p>{inline(b)}</p>")
    return "\n".join(out)

# ------------------------------------------------------------------ save per site
def save(a, has_img):
    title_of = dict(PAGES)
    if SITE == "www":
        arts = json.load(open("content_articles.json", encoding="utf-8"))
        body = "\n\n".join(f"## {s['h']}\n\n{s['md']}" for s in a["sections"])
        cat = a.get("cat") if a.get("cat") in CATS["www"].split("|") else "biostimulants"
        x = {"slug": a["slug"], "title": a["title"], "h1": a["h1"], "desc": a["desc"], "lang": "en", "cat": cat, "crop": "",
             "date": TODAY, "answer": a["answer"], "body": body, "faq": a["faq"][:6], "sources": a["sources"]}
        if has_img: x.update(image=f"/assets/media/articles/{a['slug']}.webp", image_alt=a.get("image_alt", a["h1"]))
        arts.append(x); json.dump(arts, open("content_articles.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        return f"/articles/{a['slug']}"
    if SITE == "b2b":
        x = {"slug": a["slug"], "date": TODAY, "h1": a["h1"], "title": a["title"], "desc": a["desc"], "answer": a["answer"],
             "sections": [[re.sub(r"[^a-z0-9]+", "-", s["h"].lower()).strip("-")[:40] or f"s{i}", s["h"], md_html(s["md"])] for i, s in enumerate(a["sections"])],
             "faq": a["faq"][:6], "related": [[p, title_of.get(p, p), ""] for p in a["related"]], "keyword": a.get("keyword", a["title"]),
             "keywords": a.get("keywords", [])[:6], "audience": "Agri-input marketers, dealers, brand owners, blenders", "sources": a["sources"]}
        if has_img: x.update(image=f"/assets/img/auto/{a['slug']}.webp", image_alt=a.get("image_alt", a["h1"]))
        os.makedirs("content/auto", exist_ok=True)
        json.dump(x, open(f"content/auto/{a['slug']}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        return f"/resources/{a['slug']}"
    if SITE == "ganna":
        x = {"slug": a["slug"], "title": a["title"][:60], "desc": a["desc"][:155], "h1": a["h1"], "crumb": a["h1"][:40], "tag": "શેરડી",
             "card": a["desc"][:120], "date": TODAY, "lead": a["answer"],
             "body_html": "\n".join(f"<h2>{H.escape(s['h'])}</h2>\n{md_html(s['md'])}" for s in a["sections"]),
             "faq": a["faq"][:6], "related": [[p, title_of.get(p, p)] for p in a["related"]], "sources": a["sources"]}
        if has_img: x.update(image=f"/img/blog/{a['slug']}.webp", image_alt=a.get("image_alt", a["h1"]))
        os.makedirs("tools/autopub/posts", exist_ok=True)
        json.dump(x, open(f"tools/autopub/posts/{a['slug']}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        subprocess.run([sys.executable, "tools/autopub/new_post.py", a["slug"]], check=True)
        return f"/blog/{a['slug']}/"

# ------------------------------------------------------------------ translation
TAGS = lambda s: sorted(re.findall(r"<\s*/?\s*([a-zA-Z0-9]+)", s)) + sorted(re.findall(r'href="([^"]*)"', s))
LANGNAME = {"hi": "Hindi", "gu": "Gujarati", "mr": "Marathi", "pa": "Punjabi", "kn": "Kannada", "en": "English"}
def translate_lines(model, lines, lang, src_lang):
    """lines: [(id, text)] -> {id: translation}; keeps HTML tags/hrefs identical."""
    out = {}
    for i in range(0, len(lines), 40):
        chunk = lines[i:i + 40]
        for attempt in range(3):
            todo = [(k, v) for k, v in chunk if k not in out]
            if not todo: break
            prompt = (f"Translate each item from {src_lang} into natural {LANGNAME[lang]} as farmers in India speak it. Keep every HTML tag, attribute and href "
                      "exactly as is; keep numbers, units, product names (Immunity ...), brand and company names unchanged. "
                      "Glossary: vigha -> वीघा (hi), वीघा (mr), ਵੀਘਾ (pa), ವೀಘಾ (kn), vigha (en); ratoon -> पेड़ी (hi), खोडवा (mr), ਮੁੱਢੀ (pa), ಕೂಳೆ (kn). "
                      'Return JSON object {"id": "translation"} for every id.\n' + json.dumps({str(k): v for k, v in todo}, ensure_ascii=False))
            try:
                res = parse_json(text_of(gen(model, [{"text": prompt}], json_mode=True, temp=0.2)))
            except Exception as e:
                log("  translate error", e); continue
            for k, v in todo:
                t = res.get(str(k))
                if isinstance(t, str) and t.strip() and TAGS(t) == TAGS(v) and "\t" not in t and "\n" not in t: out[k] = t.strip()
    return out

def translate_site(model, new_paths):
    tag = "g" + TODAY.replace("-", "")
    if SITE == "www":
        subprocess.run([sys.executable, "build.py"], check=True, capture_output=True)
        subprocess.run([sys.executable, "i18n/missing_auto.py", tag, "--add", *new_paths], check=True)
        keys = json.load(open(f"i18n/src{tag}.json", encoding="utf-8"))
        lines = list(enumerate(keys))
        for lang in ("hi", "gu"):
            tr = translate_lines(model, lines, lang, "English")
            with open(f"i18n/tr/{lang}{tag}_01.tsv", "w", encoding="utf-8") as f:
                for k, v in tr.items(): f.write(f"{k}\t{v}\n")
        subprocess.run([sys.executable, "i18n/merge.py"], check=True)
        out = subprocess.run([sys.executable, "build.py"], capture_output=True, text=True).stdout
        log(out[-300:]); return "incomplete: {}" in out
    if SITE == "ganna":
        subprocess.run([sys.executable, "tools/i18n/extract.py"], check=True)
        for lang in ("hi", "mr", "pa", "kn", "en"):
            miss = subprocess.run([sys.executable, "tools/autopub/missing.py", lang], capture_output=True, text=True).stdout
            lines = [tuple(l.split("\t", 1)) for l in miss.splitlines() if "\t" in l]
            if not lines: continue
            tr = translate_lines(model, lines, lang, "Gujarati")
            with open(f"tools/i18n/tr/{lang}_auto_{tag}.tsv", "a", encoding="utf-8") as f:
                for k, v in tr.items(): f.write(f"{k}\t{v}\n")
        out = subprocess.run([sys.executable, "tools/i18n/build.py"], capture_output=True, text=True)
        log((out.stdout + out.stderr)[-400:]); return "MISSING" not in out.stdout + out.stderr and out.returncode == 0
    out = subprocess.run([sys.executable, "build.py"], capture_output=True, text=True)
    log(out.stdout[-200:]); return out.returncode == 0

# ------------------------------------------------------------------ main
PAGES = site_pages()
def main():
    tmodel, imodel = pick_models()
    topics = plan(tmodel, COUNT); log("topics:", [t["title"] for t in topics])
    done, held = [], []
    for t in topics:
        try:
            a = write(tmodel, t)
            why = check(a)
            if why: held.append((t["title"], why)); log("  held:", t["title"], why); continue
            img = {"www": f"assets/media/articles/{a['slug']}.webp", "b2b": f"assets/img/auto/{a['slug']}.webp", "ganna": f"public/img/blog/{a['slug']}.webp"}[SITE]
            path = save(a, make_image(imodel, a, img))
            done.append((a["title"], path, t)); PAGES.append((path, a["title"]))
            log("  ok:", a["title"], path)
        except Exception as e:
            held.append((t.get("title", "?"), f"error: {e}"[:200])); log("  error:", e)
    ok = translate_site(tmodel, [p for _, p, _ in done]) if done else True
    if not ok: print("BUILD-INCOMPLETE"); sys.exit(2)
    with open("AUTOPUBLISH-LOG.csv", "a", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        for title, path, t in done:
            w.writerow([TODAY, SITE, path.strip("/").split("/")[-1], title, t.get("pillar", ""), t.get("crop", ""), t.get("headline_style", "") + " (gemini)"])
    host = {"www": "https://www.gujaratbio.com", "b2b": "https://b2b.gujaratbio.com", "ganna": "https://ganna.in"}[SITE]
    rep = [f"{SITE}: {len(done)} published, {len(held)} held back"] + [f"- {ti}: {host}{p}" for ti, p, _ in done] + [f"- HELD {ti}: {w}" for ti, w in held]
    open(os.environ.get("GITHUB_STEP_SUMMARY", "/dev/null"), "a").write("\n".join(rep) + "\n")
    print("\n".join(rep))

if __name__ == "__main__":
    main()
