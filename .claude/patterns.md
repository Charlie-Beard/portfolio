# Copy-Paste Patterns

## Year (auto-updates)
```html
<span data-year></span>
```

## Asset cache bust
```html
<link rel="stylesheet" href="css/styles.css?v={{ site.time | date: '%s' }}">
<script type="module" src="js/main.js?v={{ site.time | date: '%s' }}"></script>
```

## Cloudflare Analytics (before `</body>` on every page)
```html
<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "6bbaa05b99284a46898a940262447e2d"}'></script><!-- End Cloudflare Web Analytics -->
```
