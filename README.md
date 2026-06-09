# Personal homepage

A small static site built with Vite + React + TypeScript. Deployable to GitHub Pages.

## Edit content

- **Name, bio, links:** `src/content/site.ts`
- **Project list:** `src/content/projects.json`
- **Project detail pages:** `public/projects/<slug>/index.md` (Markdown). Drop images in the same folder and reference them with relative paths.
- **Profile photo / resume:** `public/profile-photo.svg`, `public/resume.pdf`

Adding a project: append an entry to `projects.json`, then (optionally) create `public/projects/<slug>/index.md`. Set `hasDetailPage: false` to make the card link straight to its first external URL instead.

## Develop

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

Output goes to `dist/`. `base: './'` in `vite.config.ts` makes it work at any subpath.

## Deploy to GitHub Pages

**Option A — manual:** push the contents of `dist/` to the `gh-pages` branch of your repo.

**Option B — GitHub Actions:** add `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

Then in repo Settings → Pages, set the source to "GitHub Actions".

Routes use `HashRouter`, so deep links like `/#/projects/example-one` work without server-side rewrites.