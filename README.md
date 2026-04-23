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

Open `http://localhost:4000/portfolio` in your browser. Jekyll watches for file changes and rebuilds automatically.

## Structure

- `_config.yml` — Jekyll site config (title, baseurl, collection settings)
- `_layouts/project.html` — shared layout for all project/case study pages
- `_projects/*.md` — project content source files (front matter + markdown body)
- `index.html` — home page (reads project collection at build time)
- `about.html` — about page
- `cv.html` — CV page
- `dinoclaude.html` — DinoClaude easter egg page
- `css/styles.css` — shared styles
- `js/main.js` — shared site behaviour
- `Gemfile` — Ruby gem dependencies (jekyll, kramdown-parser-gfm)

## Adding or editing a case study

Each file in `_projects/` is a markdown file with a YAML front matter block. Jekyll renders these into project pages at build time.

```markdown
---
layout: project
title: Example Project
subtitle: Short summary
role: Senior Product Manager
company: J.P.Morgan Chase
timeline: 2024
impact: Key outcome
cardSummary: Homepage card summary
order: 1
---

## Problem
...
```

The `order` field controls the sort order on the homepage. The `cardSummary` field is what appears on the homepage project cards.

## Deploying to GitHub Pages

The site is configured to deploy directly from the `main` branch root. GitHub Pages has native Jekyll support, so no build step is needed — push to `main` and Pages will build and publish automatically.

In the repository **Settings → Pages**, set:
- Source: `Deploy from a branch`
- Branch: `main`, folder: `/ (root)`

The `baseurl` is set to `/portfolio` in `_config.yml` to match the GitHub Pages path.
