# List segments not yet translated, for each language, as "id<TAB>gujarati text" lines.
# Usage: python3 tools/autopub/missing.py <lang>   (lang: hi, mr, pa, kn, en)
# Translate each line and save as tools/i18n/tr/<lang>_auto_<YYYYMMDD>.tsv ("id<TAB>translation"), keeping every tag.
import json, glob, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
lang = sys.argv[1]
src = json.load(open(os.path.join(ROOT, "tools/i18n/src.json"), encoding="utf-8"))
done = set()
for f in glob.glob(os.path.join(ROOT, f"tools/i18n/tr/{lang}_*.tsv")):
    for ln in open(f, encoding="utf-8"):
        if "\t" in ln and ln.split("\t", 1)[1].strip(): done.add(ln.split("\t", 1)[0].strip())
miss = [i for i in sorted(src, key=int) if i not in done]
for i in miss: print(f"{i}\t{src[i]}")
print(f"# {len(miss)} missing for {lang}", file=sys.stderr)
