# Style Guide

## CSS Custom Properties (`:root`)
```css
--background: #ffffff
--background-soft: #f7f9fc
--surface: #ffffff
--surface-muted: #f8fafc
--border: #dbe3ee
--border-strong: #c4d0e0
--text: #122033
--text-muted: #516072
--text-subtle: #66758a
--accent: #1f5fd6
--accent-soft: #edf4ff
--shadow-soft: 0 14px 34px rgba(15,23,42,0.06)
--max-width: 72rem           /* page content max width */
--reading-width: 46rem       /* narrow text / case study width */
--radius: 1rem
--radius-lg: 1.5rem
--transition: 180ms ease
--font-system: "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
--page-gutter: 1.25rem       /* drops to 0.9rem below 23.5rem */
```

## Breakpoints
| Min/Max | Purpose |
|---|---|
| `min-width: 48rem` | Nav pills → plain links; intro padding increases; content-grid goes 2-col |
| `min-width: 60rem` | Project grid goes 2-col; last odd card spans full width |
| `max-width: 43rem` | meta-grid → 1-col; cv-item__heading stacks |
| `max-width: 23.5rem` | gutter narrows; project meta pills stack vertically |

## Typography Scale
- Page title / case study title: `clamp(1.95rem, 10vw, 4.2rem)`, `line-height: 1.04`, `letter-spacing: -0.04em`
- Page lead: `clamp(1rem, 4.8vw, 1.32rem)`, `line-height: 1.55`
- Section h2: `1.3rem`, `letter-spacing: -0.02em`
- Card title: `1.22rem`, `letter-spacing: -0.03em`, `line-height: 1.12`
- Eyebrow: `0.76rem`, `font-weight: 700`, `letter-spacing: 0.1em`, `text-transform: uppercase`, colour `--accent`
- Body / summary: `0.96rem`, `line-height: 1.5`
- Impact (bold callout on card): `0.94rem`, `font-weight: 600`
- Meta pill dt: `0.78rem`; dd: `0.86rem`

## Key Visual Conventions
- Pill-shaped borders: `border-radius: 999px` (nav links, meta tags, buttons)
- Cards: `border-radius: 1.2rem`, border `1px solid --border`, `box-shadow: --shadow-soft`
- Panels: `border-radius: --radius-lg`, border `1px solid --border`, bg `--surface-muted`
- Sticky header: `backdrop-filter: blur(12px)`, bg `rgba(255,255,255,0.96)`, adds shadow when `.is-scrolled`
- Focus: `outline: 0.16rem solid --accent`, `outline-offset: 0.18rem`
- Links: `text-decoration-thickness: 0.08em`, `text-underline-offset: 0.16em`
- Transitions: always `var(--transition)` (180ms ease) — background, color, border-color, box-shadow
- `prefers-reduced-motion`: all animation/transition durations set to `0.01ms`

## Content Width Pattern
```css
width: min(calc(100% - (var(--page-gutter) * 2)), var(--max-width));
margin-inline: auto;
```
Narrow (reading width): `min(calc(100% - 2rem), var(--reading-width))`

## Design Taste
- Clean, minimal, institutional — not a creative portfolio
- Whitespace-forward; no decorative elements or illustration
- Tone: authoritative but not flashy
- No dark mode currently
- No emoji on the site
