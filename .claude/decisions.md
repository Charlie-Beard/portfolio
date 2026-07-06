# Decisions

## No em-dashes
Hard rule, enforced across multiple commits. The institutional tone requires colons/commas. Don't reintroduce.

## Director-level register
Copy was repositioned from "Senior PM" framing. The role governs 100+ applications — scope language, not IC language. Don't soften it.

## MSc thesis deep-link only
`_projects/msc-thesis.md` uses `hidden: true` + `sitemap: false`: the page builds (so the CV's dissertation link works) but is excluded from the home grid, llms.txt, and sitemap via `where_exp` filters. It was previously `published: false`, which broke the CV link with a 404. Confirm before surfacing it on the home grid.

## OG image
`content/og-image.png` (1200×630) is referenced by `og_image` in `_config.yml`; head-meta emits og:image + `twitter:card summary_large_image` when set. Regenerate by rendering a 1200×630 HTML card and screenshotting with headless Chromium.
