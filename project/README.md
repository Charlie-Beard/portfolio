# Personal Portfolio Static Site

This folder contains a production-ready static portfolio built with plain HTML, vanilla CSS, and vanilla JavaScript. It is designed to run without build tools or dependencies and works well for GitHub Pages.

## Local preview

Because the project pages load markdown via `fetch()`, preview the site through a local web server rather than opening the files directly.

1. Open a terminal in `/Users/charlesbeard/Documents/New project/project`
2. Run `python3 -m http.server 8000`
3. Open `http://localhost:8000`

## Structure

- `index.html` home page
- `about.html` about page
- `cv.html` CV page
- `project-template.html` reusable markdown-driven case study template
- `project-*.html` generated project pages that point to specific markdown files
- `css/styles.css` shared styles
- `js/main.js` shared site behavior
- `js/markdown.js` lightweight markdown parser and renderer
- `content/projects/*.md` project content source files
- `content/projects/images/*.svg` placeholder case study images

## Deploying to GitHub Pages

GitHub Pages does not publish from an arbitrary `/project` folder on the main branch. The two clean deployment options are:

### Option 1: Publish from `/docs`

1. Rename the `project` folder to `docs`
2. Push the repository to GitHub
3. In the repository settings, open **Pages**
4. Set the source to the `main` branch and the `/docs` folder
5. Save and wait for the site to publish

### Option 2: Publish from a `gh-pages` branch

1. Create a `gh-pages` branch
2. Copy the contents of `/project` to the root of that branch
3. Push the branch to GitHub
4. In the repository settings, open **Pages**
5. Set the source to the `gh-pages` branch root

## Editing case studies

Each project is driven by a markdown file with a small metadata block at the top:

```md
---
title: Example Project
slug: example-project
subtitle: Short summary
role: Technical Product Manager
company: Example Co
timeline: 2024
impact: Key outcome
cardSummary: Homepage summary
order: 1
---
## Problem
...
```

The homepage cards and project pages both read from these markdown files, so you only need to update content in one place.
