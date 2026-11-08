# Create a Gujarati blog post from tools/autopub/posts/<slug>.json, using an existing post as the page template.
# Usage: python3 tools/autopub/new_post.py <slug> [<slug> ...]
# JSON fields: slug, title (<=60 chars, page title without "| ganna.in"), desc (<=155 chars), h1, crumb (short h1),
#   tag (card label), card (one-line card text), date ("YYYY-MM-DD"), lead (one paragraph, the direct answer),
#   body_html (h2/p/ul/li/strong/div.box only; links only to existing ganna.in pages), faq [[q, a], ...] (optional),
#   related [[url, text], ...] (3-5 existing ganna.in pages), sources [[title, url], ...] (optional)
import json, os, re, sys, html as H
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TPL = os.path.join(ROOT, "public/blog/sugarcane-tillers-dying/index.html")
MON = ["જાન્યુઆરી", "ફેબ્રુઆરી", "માર્ચ", "એપ્રિલ", "મે", "જૂન", "જુલાઈ", "ઑગસ્ટ", "સપ્ટેમ્બર", "ઑક્ટોબર", "નવેમ્બર", "ડિસેમ્બર"]
e = lambda s: H.escape(s, quote=True)

def make(slug):
    d = json.load(open(os.path.join(ROOT, "tools/autopub/posts", slug + ".json"), encoding="utf-8"))
    assert d["slug"] == slug and re.fullmatch(r"[a-z0-9-]+", slug)
    url = f"https://ganna.in/blog/{slug}/"
    h = open(TPL, encoding="utf-8").read()
    h = re.sub(r"<title>.*?</title>", f"<title>{e(d['title'])} | ganna.in</title>", h, count=1, flags=re.S)
    h = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(d["desc"])}">', h, count=1)
    h = h.replace("https://ganna.in/blog/sugarcane-tillers-dying/", url)
    h = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{e(d["title"])}">', h, count=1)
    h = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{e(d["desc"])}">', h, count=1)
    y, m, dd = d["date"].split("-")
    art = {"@context": "https://schema.org", "@type": "Article", "headline": d["h1"], "description": d["desc"], "datePublished": d["date"], "dateModified": d["date"],
           "inLanguage": "gu", "author": {"@type": "Person", "name": "Gafar Laiya"}, "publisher": {"@type": "Organization", "name": "Gujarat Bio Organics Pvt. Ltd.", "url": "https://www.gujaratbio.com/"},
           "mainEntityOfPage": url}
    bc = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "હોમ", "item": "https://ganna.in/"},
        {"@type": "ListItem", "position": 2, "name": "બ્લોગ", "item": "https://ganna.in/blog/"},
        {"@type": "ListItem", "position": 3, "name": d["crumb"], "item": url}]}
    lds = [art, bc]
    if d.get("faq"):
        lds.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in d["faq"]]})
    h = re.sub(r'(<script type="application/ld\+json">.*?</script>\s*)+', "".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in lds), h, count=1, flags=re.S)
    i = h.index('<section class="hero-b">'); j = h.index('<div class="cta-box">', i); k = h.index('<div class="related">', j); z = h.index("</main>", k)
    hero = (f'<section class="hero-b"><div class="container wide"><p class="crumb"><a href="/">હોમ</a> › <a href="/blog/">બ્લોગ</a> › {e(d["crumb"])}</p>'
            f'<h1>{e(d["h1"])}</h1></div></section><main class="container"><p class="meta">{int(dd)} {MON[int(m)-1]} {y} · ગફાર લાઈયા, Gujarat Bio Organics Pvt. Ltd.</p>'
            f'<p class="lead">{e(d["lead"])}</p>\n{d["body_html"]}\n')
    if d.get("faq"):
        hero += "<h2>પ્રશ્નો અને જવાબ</h2>" + "".join(f"<h3>{e(q)}</h3><p>{e(a)}</p>" for q, a in d["faq"])
    if d.get("sources"):
        hero += '<p class="note">સ્રોત: ' + " · ".join(f'<a href="{e(u)}" rel="noopener" target="_blank">{e(t)}</a>' for t, u in d["sources"]) + "</p>"
    hero += '<p class="note">*ખેડૂતોના પરિણામ તેમના પોતાના અનુભવ છે, ગેરંટી નથી. જમીન, પાણી, હવામાન અને સંભાળ પ્રમાણે પરિણામ બદલાય છે.</p>'
    rel = '<div class="related"><h3>વધુ વાંચો</h3>' + "".join(f'<a href="{e(u)}">{e(t)}</a>' for u, t in d["related"]) + "</div>"
    h = h[:i] + hero + h[j:k] + rel + h[z:]
    out = os.path.join(ROOT, "public/blog", slug, "index.html"); os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(h)
    # Blog index: newest card first (skip if already listed)
    bi = os.path.join(ROOT, "public/blog/index.html"); b = open(bi, encoding="utf-8").read()
    if f'href="/blog/{slug}/"' not in b:
        card = f'<a class="card" href="/blog/{slug}/"><span class="tag">{e(d["tag"])}</span><h2>{e(d["h1"])}</h2><p>{e(d["card"])}</p><span class="more">વાંચો →</span></a>'
        b = b.replace('<main class="container wide"><div class="grid">', '<main class="container wide"><div class="grid">' + card, 1)
        open(bi, "w", encoding="utf-8").write(b)
    print("ok", url)

for s in sys.argv[1:]: make(s)
