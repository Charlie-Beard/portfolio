# Components Reference

## Project Front Matter (`_projects/*.md`)
```yaml
layout: project
title:        # H1 and SEO title
slug:         # → /project-[slug].html
subtitle:     # case study subhead; fallback OG description
description:  # meta description
role:         # meta-grid + project card
company:      # meta-grid + project card
timeline:     # meta-grid
impact:       # bold callout on project card
cardSummary:  # summary text on project card
order:        # ascending int, controls home grid sort
heroImage:    # optional — content/projects/images/xxx.svg
heroAlt:
heroCaption:
published:    # false = hidden from site.projects / home grid
```

## Case Study Section Order
Problem → Approach → Solution → [Product decisions] → Impact → [Publications / Research foundation]

## Head Meta Flags (front matter)
- `schema_website: true` — index.html only
- `schema_person: true` — index.html and about.html
- Project layout auto-adds BreadcrumbList + Article JSON-LD

## DinoClaude Exceptions
- Favicon set inline (`favicon-dinoclaude.svg`), overrides head-meta.html default
- `game.js` is a plain `defer` script (not a module), loaded after `.page-shell` closes
- Footer exists in HTML but is hidden via `body[data-page="dinoclaude"] .site-footer { display: none }`
