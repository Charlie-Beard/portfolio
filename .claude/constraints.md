# Constraints & Hard Rules

## Platform
- **GitHub Pages only** — static files, no server-side logic, no custom HTTP headers
- CSP is delivered via `<meta http-equiv="Content-Security-Policy">` in `_includes/head-meta.html` — the only way to set it on this host
- Current CSP: `script-src 'self' static.cloudflareinsights.com` — any new external script domain must be added here
- Jekyll build only — no Node/webpack/bundler. Keep JS vanilla ES modules

## Content & Privacy
- **No email address on site** — LinkedIn is the only contact channel
- No personal data beyond name, job title, employer, LinkedIn URL, and professional credentials
- External links: always `target="_blank" rel="noopener noreferrer"`

## Writing / Tone
- **No em-dashes** — use colons or commas instead (enforced over multiple commits)
- No emoji in page content or copy
- Register: director-level, not senior IC (repositioned from "Senior PM" framing)
- Metrics always specific and attributed: "83.21% F1 Score", "100+ applications", "$9.15 per ticket"
- Avoid puffery; anchor every claim in a concrete outcome or decision

## CSS
- Single file: `css/styles.css` — no split files, no preprocessors
- All values via CSS custom properties where a variable exists
- No `!important` except `prefers-reduced-motion` reset block
- Breakpoints via `min-width` (mobile-first), with two `max-width` exceptions for specific overrides

## JavaScript
- `js/main.js` is an ES module (`type="module"`) — keep it that way
- `js/game.js` is a plain deferred script — keep separate, do not import into main.js
- No third-party JS libraries (jQuery, etc.) — keep vanilla

## Jekyll / Templating
- Project pages use `_layouts/project.html`; all other pages are raw HTML with front matter
- Nav markup is currently duplicated across `index.html`, `about.html`, `cv.html`, `dinoclaude.html` — do not silently refactor without noting it (known tech debt)
- `published: false` on a project file removes it from `site.projects` and the home grid — MSc thesis is the only current example
- YAML front matter: always quote values that contain colons (learned from `6bd3a6f` — broken build)

## Assets
- Hero images: SVG only, stored in `content/projects/images/`
- Favicon: `favicon.svg` for all pages except DinoClaude (`favicon-dinoclaude.svg`)
- Images: `loading="lazy"`, always include `width` and `height` attributes for layout stability

## Deployment
- Merging to `main` triggers deploy — there is no staging environment
- Cache-bust via `?v={{ site.time | date: '%s' }}` on CSS and JS links
- Do not commit `_site/` — it is gitignored (Jekyll build output)
