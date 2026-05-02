# Personal Portfolio Static Site

A Jekyll-based portfolio site for Charles Beard, deployed to GitHub Pages at `https://charlie-beard.github.io/portfolio`.

## Local development

Requires Ruby and Bundler. Install dependencies once:

```bash
bundle install
```

Then serve the site locally:

```bash
bundle exec jekyll serve
```

Open `http://localhost:4000/portfolio` (the trailing `/portfolio` matches the `baseurl` in `_config.yml`). Jekyll watches for file changes and rebuilds automatically.

## Structure

- `_config.yml` — site config (title, baseurl, author, Cloudflare token, Sass options, plugins, collection)
- `_layouts/default.html` — base HTML shell (head, skip-link, header, main, footer, analytics)
- `_layouts/project.html` — case-study layout, sets `layout: default` and renders the breadcrumb + article wrapper
- `_includes/head-meta.html` — canonical, OG/Twitter, JSON-LD, favicon, preconnect
- `_includes/header.html` / `footer.html` — site chrome
- `_includes/analytics.html` — Cloudflare Web Analytics beacon (driven by `site.cloudflare_token`)
- `_projects/*.md` — case-study source files (front matter + markdown body)
- `index.html`, `about.html`, `cv.html`, `dinoclaude.html` — top-level pages, all use `layout: default`
- `css/styles.scss` — shared styles, compiled and minified by Jekyll's Sass converter
- `js/main.js` — shared site behaviour (header scroll state, copyright year, card-height equalisation)
- `js/game.js` — DinoClaude game (loaded only on `dinoclaude.html` via `extra_scripts` front matter)
- `content/` — project hero SVGs and other static assets
- `favicon.svg`, `favicon-dinoclaude.svg` — favicons (per-page selection via `page.favicon` front matter)
- `robots.txt`, `sitemap.xml` (sitemap generated at build time by `jekyll-sitemap`)
- `.github/workflows/deploy.yml` — GitHub Actions build + deploy pipeline
- `Gemfile` — Ruby gem dependencies (`jekyll`, `kramdown-parser-gfm`, `jekyll-sitemap`)

## Adding or editing a case study

Each file in `_projects/` is a markdown file with a YAML front matter block. Jekyll renders these into project pages at build time (URL pattern: `/project-:name.html`).

Required and commonly-used front matter fields:

```markdown
---
layout: project
title: "Example Project"
slug: example-project
subtitle: "Short summary that appears under the title on the case study page."
description: "Longer SEO description used for meta, og:description, and twitter:description."
role: "Senior AI Product Manager"
company: "J.P.Morgan Asset Management"
timeline: "2024"
impact: "Single-line outcome statement."
cardSummary: "Homepage card summary — one or two sentences."
order: 1
heroImage: content/projects/images/example.svg
heroAlt: "Description of the hero image for screen readers."
published: true
---

## Problem
...
```

- `order` controls the sort order on the homepage.
- `cardSummary` is what appears on the homepage project cards.
- `published: false` excludes the case study from the build (used to hide drafts).
- `heroImage` is optional; if omitted, the case study renders without a hero figure.

## Adding a top-level page

Top-level pages use the `default` layout. Set front matter that the layout reads:

```yaml
---
layout: default
title: "Page Title | Charles Beard"
description: "Page description for meta + OG tags."
body_data_page: my-page          # populates <body data-page="...">; used for page-specific CSS hooks
body_class: optional-class       # extra <body> class (e.g. is-loading)
has_loader: false                # set true to render the page-loader div before page-shell
favicon: favicon.svg             # override the default favicon
extra_scripts:                   # additional deferred scripts loaded after the page shell
  - js/example.js
schema_person: false             # set true to emit Person JSON-LD
schema_website: false            # set true to emit WebSite JSON-LD (home page only)
---
```

Only `layout`, `title`, `description`, and `body_data_page` are typically required.

## Analytics

Cloudflare Web Analytics is configured via `site.cloudflare_token` in `_config.yml`. The beacon is loaded by `_includes/analytics.html` and included via the default layout. To disable analytics, remove or blank the `cloudflare_token` value; the include guards on its presence.

## Deploying to GitHub Pages

Deployment is handled by `.github/workflows/deploy.yml`. On every push to `main` (or a manual trigger via the Actions UI), the workflow:

1. Checks out the repo
2. Sets up Ruby 3.3 with bundler caching
3. Calls `actions/configure-pages` to derive the deploy `base_path`
4. Runs `bundle exec jekyll build --baseurl <base_path>` with `JEKYLL_ENV=production` (the flag overrides the local-dev `baseurl` in `_config.yml`)
5. Uploads the built site as a Pages artifact and deploys it

In the repository **Settings → Pages**, set Source: `GitHub Actions`.
