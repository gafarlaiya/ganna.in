import os, sys, json, glob, re
sys.path.insert(0, os.path.dirname(__file__)); from seg import *
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def pages():
    ps = ['index.html'] + sorted(p for p in glob.glob('public/**/index.html', recursive=True))
    return [p for p in ps if not re.match(r'public/(hi|en|mr|kn|pa)/', p)]
if __name__ == '__main__':
    os.chdir(ROOT); seen = {}; order = []
    def add(t):
        k = norm(t)
        if k not in seen: seen[k] = len(order) + 1; order.append(k)
    for p in pages():
        h = re.sub(r'<!--langbar-->.*?<!--/langbar-->', '', open(p, encoding='utf-8').read(), flags=re.S)
        for s, e, kind, t in segments(h):
            if kind == 'json':
                for x in json_strings(t): add(x)
            else: add(t)
    json.dump({str(i + 1): k for i, k in enumerate(order)}, open('tools/i18n/src.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    words = sum(len(re.sub(r'<[^>]*>', ' ', k).split()) for k in order)
    print(len(pages()), 'pages', len(order), 'segments', words, 'words')
