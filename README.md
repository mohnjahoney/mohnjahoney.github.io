# Personal homepage

A small static site built with Vite + React + TypeScript. Deployable to GitHub Pages.

## Edit content

- **Name, bio, links:** `src/content/site.ts`
- **Project list:** `src/content/projects.json`
- **Project detail pages:** `public/projects/<slug>/index.md` (Markdown). Drop images in the same folder and reference them with relative paths.
- **Profile photo / resume:** `public/profile-photo.png`, `public/resume.pdf`

Adding a project: append an entry to `projects.json`, then (optionally) create `public/projects/<slug>/index.md`. Set `hasDetailPage: false` to make the card link straight to its first external URL instead.

## Develop

```bash
npm install
npm run dev
```

## Python experiments

This repository also contains small Python experiments. The Python packages
are declared in `pyproject.toml`; `uv` manages the environment automatically.
Run the trajectory plot with:

```bash
uv sync
uv run python particle-path-plot.py
```

For the animated version:

```bash
uv run python particle-path-plot.py --animate
```

You do not need to activate a virtual environment or remember package flags.

## Build

```bash
npm run build
```

Output goes to `dist/`. `base: './'` in `vite.config.ts` makes it work at any subpath.

## Deploy to GitHub Pages

This repo includes `.github/workflows/deploy.yml`. Push to `main`, then in repo Settings → Pages, set the source to "GitHub Actions".

Routes use `HashRouter`, so deep links like `/#/projects/example-one` work without server-side rewrites.


switching to more update-to-date site

xxforce update
