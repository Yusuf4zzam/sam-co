# ../assets/icons/

Favicon files referenced from each page's `<head>`:

- `favicon.png`
- `favicon-192.png`
- `favicon-apple-touch.png`

Most in-page icons (nav, arrows, social) are inline SVG directly in the HTML
rather than files here — that avoids extra HTTP requests for small icons that
need to inherit `currentColor` for hover states. If the icon set grows,
consider consolidating into a single SVG sprite in this folder instead.
