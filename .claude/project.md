# Project: Charles Beard Portfolio

## Identity
- Owner: Charles Beard, CFA — Senior AI Product Manager, J.P.Morgan Asset Management, London
- Site: https://charlie-beard.github.io/portfolio/
- GitHub repo: charlie-beard/portfolio (deploys via GitHub Actions → GitHub Pages)

## Stack
- **Generator**: Jekyll (kramdown/GFM markdown, jekyll-sitemap plugin)
- **CSS**: single file `css/styles.css`, custom properties only, no preprocessor
- **JS**: `js/main.js` (ES module, DOMContentLoaded init) + `js/game.js` (deferred script, DinoClaude only)
- **Hosting**: GitHub Pages (static only — no server-side logic, no HTTP header control)
- **Analytics**: Cloudflare Web Analytics (token: `6bbaa05b99284a46898a940262447e2d`, inline `<script>` on every page)
- **Config**: `_config.yml` — baseurl `/portfolio`, url `https://charlie-beard.github.io`

## Pages
| File | Route | Purpose |
|---|---|---|
| `index.html` | `/` | Home — project grid |
| `about.html` | `/about.html` | About / focus areas |
| `cv.html` | `/cv.html` | Full CV |
| `dinoclaude.html` | `/dinoclaude.html` | Canvas runner game |
| `_projects/*.md` | `/project-:name.html` | Case study pages (via `_layouts/project.html`) |

## Projects (by card order)
1. SpectrumIQ — AI chat (order: 1)
2. Spectrum Design System — tokenised, MCP-distributed (order: 2)
3. Analytics, Training & Surveys (Pendo.io) — telemetry (order: 3)
4. Help and Support — shared support UX (order: 4)
5. Dashboards — shared visibility surface (order: 5)
6. MSc Thesis: NLP and ML — `published: false`, hidden from home grid (order: 6)

## Deployment
- Push to `main` → GitHub Actions → Jekyll build → GitHub Pages
- Cache-busted assets: `?v={{ site.time | date: '%s' }}`
- SEO/OG/JSON-LD: injected at build time via `_includes/head-meta.html`
