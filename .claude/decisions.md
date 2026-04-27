# Past Decisions & Rationale

## Content & Copywriting

**No em-dashes anywhere on site**
Use colons or commas instead. Enforced over multiple commits (96cf24d, 50ba6c9). Em-dashes are a style divergence from the institutional tone.

**Director-level register, not "Senior PM"**
Copywriting repositioned (699c377) to reflect scope and seniority of the work — governing 100+ applications is a platform leadership role, not an individual contributor one.

**No email address on site**
Removed from all footers (f4721dc). LinkedIn is the only contact channel. Privacy decision.

**MSc thesis marked `published: false`**
Case study exists (`_projects/msc-thesis.md`) but is not surfaced on the home grid. Status: unclear — may be awaiting refinement or may be intentionally kept as a deep-link only page.

**Pendo project title expanded**
Renamed from a shorter title to "Analytics, Training & Surveys (Pendo.io)" (9d4c7e2) to better describe the full scope of the product.

## Architecture

**No layout file for non-project pages**
`index.html`, `about.html`, `cv.html`, `dinoclaude.html` are raw HTML. Only `_projects/*.md` use `_layouts/project.html`. Nav, header, and footer are extracted to `_includes/header.html` and `_includes/footer.html`, shared by all pages including the project layout. Active nav state is computed from `page.url` via Liquid — no `aria-current` needed in individual pages.

**Single CSS file**
No SCSS, no PostCSS. All in `css/styles.css`. Avoids build tooling complexity for a static site this size.

**CSP via meta tag**
GitHub Pages cannot set HTTP headers. The CSP is a meta fallback — better than nothing for XSS protection, but not as strong as a header (doesn't block navigation-level attacks).

## Design

**Card heights equalized in JS, not CSS**
`equalizeCards()` in `main.js` uses `min-height` to match the tallest card at ≥60rem breakpoint. CSS `grid` with `align-items: stretch` was not used, likely because the CTA needs to pin to the bottom regardless of content height.

**CB-in-frame SVG favicon**
Custom favicon (`favicon.svg`) is a stylised "CB" in a frame. DinoClaude gets its own separate favicon (`favicon-dinoclaude.svg`). The head-meta include conditionally skips the default favicon on the DinoClaude page.

**No dark mode**
Intentional omission — not in scope. The colour palette is light-only.

**Social OG image not configured**
`og_image` is commented out in `_config.yml`. Social previews will render without an image. To fix: add a 1200×630px image to `content/` and uncomment the line.

## SEO & Schema

**JSON-LD injected at build time**
`_includes/head-meta.html` outputs WebSite, Person, BreadcrumbList, and Article schema based on front matter flags (`schema_website`, `schema_person`, `layout == "project"`). No runtime JS needed.

**Canonical URLs**
Generated from `site.url + site.baseurl + page.url` — relies on Jekyll's URL resolution. Correct as long as `_config.yml` values are accurate.

## Ambiguities / Open Questions

1. **MSc thesis visibility**: `published: false` — is this a permanent decision or pending? The page is still accessible by direct URL.
2. ~~**Nav/header/footer includes**: done — extracted to `_includes/header.html` and `_includes/footer.html`.~~
3. **OG image**: No social preview image configured. Low effort to add, but requires a suitable 1200×630px asset.
4. **`data-page` attribute**: Only meaningfully used for `dinoclaude` CSS scoping. Could be used for active nav state on non-project pages, but currently relies on `aria-current="page"` in markup instead.
5. **Project layout nav active state**: Case study pages have no active nav item — none of the four nav links get `aria-current="page"` in `_layouts/project.html`. This is consistent (case studies aren't in the nav) but worth confirming is intentional.
6. **`llms.txt`**: Present in the repo. Content not reviewed here — worth auditing for accuracy.
