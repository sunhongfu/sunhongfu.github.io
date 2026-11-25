"""Pre-deploy checks: no placeholder text in docs/, no broken internal links in the built site."""
import pathlib, re, sys
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

PLACEHOLDERS = [r"Add figures", r"Add individual names", r"List names", r"\bTODO\b", r"\bTBD\b",
                r"Lorem ipsum", r'href="#"', r"\]\(#\)"]
errors = []

for md in pathlib.Path("docs").rglob("*.md"):
    for n, line in enumerate(md.read_text(encoding="utf-8").splitlines(), 1):
        for pat in PLACEHOLDERS:
            if re.search(pat, line):
                errors.append(f"placeholder {pat!r}: {md}:{n}: {line.strip()[:100]}")

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.urls = []
    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k in ("href", "src") and v:
                self.urls.append(v)

site = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "site").resolve()
for page in site.rglob("*.html"):
    p = Links(); p.feed(page.read_text(encoding="utf-8", errors="ignore"))
    for url in p.urls:
        u = urlsplit(url)
        if u.scheme or u.netloc or url.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
            continue
        path = unquote(u.path)
        target = (site / path.lstrip("/")) if path.startswith("/") else (page.parent / path)
        if target.is_dir() or path.endswith("/"):
            target = target / "index.html"
        if not target.exists():
            errors.append(f"broken link: {page.relative_to(site)} -> {url}")

print("\n".join(errors) or "check_site: OK")
sys.exit(1 if errors else 0)
