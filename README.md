# Fenimore Harper Brand Site

Production-ready static site and product demo environment for Fenimore Harper, rebuilt from publicly available information about the brand, products, services, research, and media footprint.

## What is included

- Multi-page marketing site with a premium editorial-tech visual system
- Product pages for `Intelligence Agents`, `Signal Room`, and a `Daily Briefing Preview`
- Service positioning for training, strategy, rapid response, and research partnerships
- Research library with structured summaries of major public investigations
- Press archive page with media coverage and broadcast appearances
- Shared SEO assets including `robots.txt`, `sitemap.xml`, manifest, favicon, and OG card
- No-dependency QA script for link and metadata validation

## Run locally

```bash
npm run check
npm run dev
```

Then open [http://localhost:4173](http://localhost:4173).

## Deployment

This project is fully static and can be deployed directly to any static host, including:

- Cloudflare Pages
- Netlify
- Vercel static deployment
- GitHub Pages
- S3 + CloudFront

## Notes

- Forms intentionally use `mailto:` drafting so the site works without backend dependencies.
- Product data in `/platform/` and `/briefing/` is illustrative demo content designed to show the experience of the product, not to represent live monitoring output.
