# Components & HTML Patterns

## Page Shell (every page)
```html
<body data-page="[home|about|cv|project|dinoclaude]">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="page-shell">
    <header class="site-header">...</header>
    <main class="page-content" id="main-content">...</main>
    <footer class="site-footer">...</footer>
  </div>
```
- `data-page` drives page-specific CSS (only actively used for `dinoclaude`)
- DinoClaude omits `<footer>` entirely (hidden via CSS)

## Navigation (duplicated across all non-project pages — not yet an include)
```html
<nav class="site-nav" aria-label="Primary">
  <ul>
    <li><a href="index.html" [aria-current="page"]>Home</a></li>
    <li><a href="about.html">About</a></li>
    <li><a href="cv.html">CV</a></li>
    <li><a href="dinoclaude.html">DinoClaude</a></li>
  </ul>
</nav>
```
- Set `aria-current="page"` on the active link

## Eyebrow + Title + Lead (page intro)
```html
<section class="page-intro [page-intro--narrow]">
  <p class="eyebrow">Label</p>
  <h1 class="page-title">Heading</h1>
  <p class="page-lead">Lead paragraph.</p>
</section>
```
- Add `page-intro--narrow` to constrain to `--reading-width`

## Project Card Grid (index.html)
- Cards are generated via Liquid from `site.projects | sort: "order"`
- Grid: 1-col → 2-col at 60rem; last odd card spans full width
- Card structure: `project-card > project-card__content > [intro, meta, impact]` + `button-link` CTA

## Button / CTA
```html
<a class="button-link" href="...">Label</a>
```
- Full-width on mobile, `fit-content` at ≥48rem
- Hover: bg becomes `--accent`, text becomes white
- Also used for `<button>` elements (e.g. CV print)

## Section
```html
<section class="page-section" aria-labelledby="section-id">
  <div class="section-heading">
    <h2 id="section-id">Title</h2>
    <p class="section-copy">Optional subtitle.</p>
  </div>
  <!-- content -->
</section>
```

## Content Grid (2-col panels)
```html
<div class="content-grid">
  <article class="content-panel">
    <h3>Title</h3>
    <p>...</p>
  </article>
</div>
```
- 1-col mobile, 2-col at ≥48rem

## Summary Panel (full-width prose panel)
```html
<div class="summary-panel">
  <p>...</p>
</div>
```

## Meta Grid (case study header — 3 cols: Role, Company, Timeline)
```html
<dl class="meta-grid">
  <div><dt>Role</dt><dd>...</dd></div>
  <div><dt>Company</dt><dd>...</dd></div>
  <div><dt>Timeline</dt><dd>...</dd></div>
</dl>
```
- Collapses to 1-col below 43rem

## CV Item
```html
<article class="cv-item">
  <div class="cv-item__heading">
    <h3>Job Title</h3>
    <p class="cv-meta">Org · Dates</p>
  </div>
  <p>Description.</p>
  <ul class="cv-list">
    <li>...</li>
  </ul>
</article>
```

## Project Front Matter (for `_projects/*.md`)
```yaml
layout: project
title:        # H1 on case study; used in nav/SEO
slug:         # used in file naming (project-[slug].html)
subtitle:     # subhead on case study; fallback for OG description
description:  # SEO meta description
role:         # shown in meta-grid and project card
company:      # shown in meta-grid and project card
timeline:     # shown in meta-grid
impact:       # bold callout line on project card
cardSummary:  # summary text on project card
order:        # integer, ascending sort for home grid
heroImage:    # optional: content/projects/images/xxx.svg
heroAlt:      # alt text for hero
heroCaption:  # figcaption for hero
published:    # set false to hide from home grid (msc-thesis only)
```

## Case Study Body (rendered as `.rich-text`)
- Written in Markdown, converted by kramdown/GFM
- H2 sections separated by top border rule
- Standard section order: Problem → Approach → Solution → [Product decisions] → Impact → [Publications]
- Bold `**text**` used for sub-headers within Solution sections
- Tables supported (msc-thesis uses one for F1 score progression)

## Head Meta Include
`{% include head-meta.html %}` — outputs: favicon, CSP meta, canonical, OG, Twitter Card, JSON-LD
- Toggle `schema_website: true` (index only) and `schema_person: true` (index + about) in front matter
- Project layout automatically adds BreadcrumbList + Article JSON-LD

## DinoClaude Specifics
- Own favicon: `favicon-dinoclaude.svg` (set inline, not via head-meta.html)
- `body.is-loading` class — cleared by game.js on load
- `<div class="page-loader">` for loading state
- `game.js` loaded with `defer` (not a module), after closing `</div>`
- Footer hidden via `body[data-page="dinoclaude"] .site-footer { display: none }`
