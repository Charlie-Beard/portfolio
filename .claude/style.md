# Style Reference

## CSS Custom Properties
```css
--background: #ffffff;      --background-soft: #f7f9fc;
--surface: #ffffff;         --surface-muted: #f8fafc;
--border: #dbe3ee;          --border-strong: #c4d0e0;
--text: #122033;            --text-muted: #516072;    --text-subtle: #66758a;
--accent: #1f5fd6;          --accent-soft: #edf4ff;
--shadow-soft: 0 14px 34px rgba(15,23,42,0.06);
--max-width: 72rem;         --reading-width: 46rem;
--radius: 1rem;             --radius-lg: 1.5rem;
--transition: 180ms ease;
--page-gutter: 1.25rem;     /* 0.9rem below 23.5rem */
--font-system: "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

## Breakpoints
| | Purpose |
|---|---|
| `min-width: 48rem` | Nav pills → plain links; padding increases; content-grid 2-col |
| `min-width: 60rem` | Project grid 2-col; last odd card `grid-column: 1 / -1` |
| `max-width: 43rem` | meta-grid 1-col; cv-item__heading stacks |
| `max-width: 23.5rem` | gutter narrows; project meta pills stack |

## Content Width Formula
```css
/* standard */
width: min(calc(100% - (var(--page-gutter) * 2)), var(--max-width));
margin-inline: auto;

/* narrow (case study / reading) */
width: min(calc(100% - 2rem), var(--reading-width));
```
