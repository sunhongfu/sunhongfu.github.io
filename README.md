# Personal Website — MkDocs Material

**Builds online via GitHub Actions.** No local setup required.

## Deploy
1. Create a **public** GitHub repo (any name).
2. Upload all files in this folder to the repo root.
3. Go to **Settings → Pages** → set **Branch: `gh-pages`** (root).
4. Commit/push to `main` — the workflow builds and publishes.

**URL:** `https://<your-username>.github.io/<repo-name>/`  
(If the repo is named `<your-username>.github.io`, set `site_url` accordingly to host at the root.)

## Edit content
- Markdown pages in `docs/`
- Publications in `docs/bib/papers.bib` (BibTeX)
- Theme and features in `mkdocs.yml`
