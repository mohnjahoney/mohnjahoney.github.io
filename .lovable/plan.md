
## Goal

A small, calm, content-focused personal homepage. Project listings come from a JSON file; project detail pages come from Markdown files. Static build, deployable to GitHub Pages.

## Stack

- Vite + React + TypeScript (React earns its place by simplifying the Markdown route and the JSON-driven listing).
- `react-router-dom` with `HashRouter` — works on GitHub Pages with zero server config and no 404 issues on refresh.
- `react-markdown` + `remark-gfm` for project pages.
- Plain CSS (single `styles.css`, CSS variables for the palette). No Tailwind, no UI library.

The current TanStack Start scaffolding is replaced with a clean Vite SPA setup so the output of `vite build` is a static `dist/` folder that GitHub Pages can serve as-is.

## File layout

```
index.html
vite.config.ts
package.json
public/
  profile-photo.jpg          (placeholder)
  resume.pdf                 (placeholder)
  projects/
    example-one/
      index.md
      thumbnail.png
    example-two/
      index.md
      thumbnail.png
    example-three/
      index.md
src/
  main.tsx
  App.tsx
  content/
    site.ts                  (name, bio, links, section URLs)
    projects.json            (project metadata array)
  components/
    Layout.tsx               (header nav + footer, max-width 900px)
    ProjectCard.tsx
    Markdown.tsx             (react-markdown wrapper)
  pages/
    Home.tsx                 (intro + sections + project grid)
    Projects.tsx             (full list + tag filter)
    ProjectDetail.tsx        (loads /projects/<slug>/index.md via fetch)
    NotFound.tsx
  styles/
    styles.css
```

Project media lives next to its markdown under `public/projects/<slug>/` so Markdown can reference images with relative URLs and Vite copies them verbatim.

## Content model

`src/content/projects.json` — array of:

```json
{
  "slug": "example-one",
  "title": "Example One",
  "description": "One-sentence summary.",
  "status": "active",
  "categories": ["Useful Tools", "Data Science & Visualization"],
  "thumbnail": "/projects/example-one/thumbnail.png",
  "links": [{ "label": "GitHub", "url": "https://..." }],
  "hasDetailPage": true
}
```

`src/content/site.ts` — name, short intro, interests list, photo path, resume path, teaching URL, research URL, GitHub, email, LinkedIn. Editing these two files is the entire "update the site" workflow.

## Pages

- **Home (`/`)** — profile photo, name, 2–3 sentence intro, interests line. Then small sections: Teaching (link out), Research (link out), Projects (grid of cards, link to `/projects`), Resume (link to PDF), Contact (GitHub / email / LinkedIn).
- **Projects (`/projects`)** — full grid rendered from `projects.json`, with a simple tag filter (plain `<button>`s toggling a state).
- **Project detail (`/projects/:slug`)** — looks up metadata in JSON, fetches `/projects/<slug>/index.md` at runtime, renders with `react-markdown`. Shows title, status, categories, external links, then markdown body. Falls back to NotFound if slug missing.
- **404** — simple message + link home.

A project with `hasDetailPage: false` renders its card as a direct external link instead of an internal route — so a "card + one link" project needs no markdown file.

## Visual design

- Max content width 900px, generous padding.
- Neutral palette: near-white background, dark slate text, one restrained accent (muted teal) for links.
- System serif for headings (`Georgia, 'Iowan Old Style', serif`), system sans for body. No webfonts.
- Subtle 1px borders on cards, no shadows, no gradients, no animations.
- Mobile: single column, nav wraps.

## GitHub Pages deployment

- `vite.config.ts` sets `base: './'` so the build works at any subpath (user-site or project-site).
- `HashRouter` avoids the SPA-refresh-404 problem entirely.
- A short README section explains: `npm run build`, then push `dist/` to the `gh-pages` branch (or use the GitHub Actions snippet included in the README). No Actions file added by default to keep the repo minimal — README documents both options.

## Out of scope for v1

No CMS, no search, no dark mode toggle, no analytics, no animations, no contact form, no RSS, no tag pages, no draft system. Everything above can be added later without restructuring.

## Implementation steps

1. Remove TanStack Start scaffolding (`src/routes`, `src/router.tsx`, `src/start.ts`, `src/server.ts`, `vite.config.ts`, server-only libs) and rewrite `vite.config.ts` as a plain React SPA config.
2. Add `react-router-dom`, `react-markdown`, `remark-gfm`; drop TanStack and Cloudflare-related deps from `package.json`.
3. Create `index.html`, `src/main.tsx`, `src/App.tsx` with `HashRouter` and routes.
4. Add `src/content/site.ts` and `src/content/projects.json` with placeholder content (3 example projects covering different shapes: full markdown page, image-only, link-only).
5. Build `Layout`, `Home`, `Projects`, `ProjectDetail`, `ProjectCard`, `Markdown`, `NotFound`.
6. Write `styles/styles.css` with CSS variables and the layout rules above.
7. Add placeholder `public/profile-photo.jpg`, `public/resume.pdf`, and three example `public/projects/<slug>/` folders.
8. Add README section with edit-the-site instructions and GitHub Pages deploy steps.
