# Hard Rules

## Platform
- GitHub Pages: no HTTP headers. CSP lives in `_includes/head-meta.html` as a `<meta>` tag.
- Adding any external script domain requires updating `script-src` in that CSP meta.

## Content
- No email on site — LinkedIn only (`https://www.linkedin.com/in/charlesjohnbeard/`)
- No em-dashes — use colons or commas
- No emoji
- Register: director-level, not senior IC ("leads" not "works on", scope language)
- Metrics must be specific: "100+ applications", "83.21% F1 Score", "$9.15 per ticket"
- External links: always `target="_blank" rel="noopener noreferrer"` — both attributes

## Jekyll
- YAML front matter: quote any value containing a colon (unquoted colons break the build)
- `published: false` removes a project from `site.projects` and the home grid

## Assets
- Hero images: SVG only, in `content/projects/images/`
- New images: always `loading="lazy"` + explicit `width` and `height`
