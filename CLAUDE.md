# CLAUDE.md

Personal academic website of Hongfu Sun, built with MkDocs Material and served at https://sunhongfu.github.io.

## Git workflow

- The owner is the only contributor. Commit and push directly to `main`.
- Do not create feature branches or pull requests for this repo.
- Pushing to `main` triggers `.github/workflows/mkdocs.yml`, which builds with `mkdocs build --strict` and deploys to the `gh-pages` branch. Never edit `gh-pages` by hand.

## Layout

- Site config: `mkdocs.yml`. Page content: `docs/*.md`. Custom styles and scripts: `docs/assets/`.
- Publications live in `docs/publications.md`, grouped into sections (Preprints, Journal Articles, Editorials, Conference Papers, Conference Abstracts). Each entry is a `pub-card` HTML block; copy an existing card's format. Mark the owner as `<span class="me">H. Sun</span>`, with `*` for corresponding author. Newest entries go at the top of their section.
- SSRN and arXiv entries are preprints, not journal articles.

## Checking publications

ORCID (`0000-0003-3436-7831`), Crossref and arXiv APIs can be used to find papers missing from the site. Many unrelated authors share the name "Hongfu Sun"; only MRI / medical imaging / neuroimaging work is his.
