# Patterns & Idioms

## Content Width (centred, max-capped)
```css
width: min(calc(100% - (var(--page-gutter) * 2)), var(--max-width));
margin-inline: auto;
```
Used on: `.site-header__inner`, `.site-footer__inner`, `.page-section`, `.page-intro`, `.case-study`, `.cv-layout`

Narrow variant (reading width):
```css
width: min(calc(100% - 2rem), var(--reading-width));
```
Used on: `.page-intro--narrow`, `.case-study`, `.case-study__breadcrumb`

## Pill Element
```css
border-radius: 999px;
```
Used for: nav links (mobile), meta tags on cards, `.button-link`, `.cv-header-actions` buttons

## Scrolled Header State
JS sets `body.is-scrolled` when `scrollY > 18`. CSS responds:
```css
body.is-scrolled .site-header { box-shadow: ...; }
body.is-scrolled .site-header__inner { padding-top: calc(var(--header-padding-compact) + var(--safe-top)); }
```

## Year Injection
```html
<span data-year></span>
```
Filled by `main.js`: `node.textContent = new Date().getFullYear()`

## Safe Area Insets
Used on header padding and footer padding-bottom:
```css
padding-top: calc(var(--header-padding) + var(--safe-top));
padding-bottom: calc(1.7rem + var(--safe-bottom));
```

## Card CTA Pinned to Bottom
```css
.project-card { display: flex; flex-direction: column; }
.project-card > .button-link { margin-top: auto; }
```

## Card Height Equalization (JS)
`equalizeCards()` in `main.js` sets `min-height` on all `.project-card` to the tallest card's height, but only at `≥60rem`. Clears inline style on resize before recalculating. Debounced at 150ms.

## Hover State Convention
Interactive elements follow this 3-property transition pattern:
```css
transition: background var(--transition), color var(--transition), border-color var(--transition);
```
Hover typically inverts: accent-soft bg → solid accent bg, accent text → white text.

## `aria-current="page"` on Nav
Each page sets the correct `<a aria-current="page">` in its own nav markup. The project layout (`_layouts/project.html`) does not set any active nav item (case studies are not directly in the nav).

## Project Grid Last-Odd Span
```css
@media (min-width: 60rem) {
  .project-grid > :last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }
}
```

## Rich Text (case study body)
`.case-study__body.rich-text` — Markdown content rendered by Jekyll. H2 elements get a top border rule. First child has no top margin; last child has no bottom margin.

## Jekyll Asset Cache Bust
```html
<link rel="stylesheet" href="css/styles.css?v={{ site.time | date: '%s' }}">
<script type="module" src="js/main.js?v={{ site.time | date: '%s' }}"></script>
```
Uses build timestamp. Works the same with `site.baseurl` prefix in project layout.

## Project Layout vs Raw HTML Pages
- `_projects/*.md` → use `layout: project` in front matter → rendered by `_layouts/project.html`
- `index.html`, `about.html`, `cv.html`, `dinoclaude.html` → raw HTML with Jekyll front matter — header, nav, footer all hand-written in each file (known duplication)

## External Link Pattern
```html
<a href="..." target="_blank" rel="noopener noreferrer">Label</a>
```
Always both attributes. Internal links: no target, no rel.

## Cloudflare Analytics (on every page, just before `</body>`)
```html
<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "6bbaa05b99284a46898a940262447e2d"}'></script><!-- End Cloudflare Web Analytics -->
```
