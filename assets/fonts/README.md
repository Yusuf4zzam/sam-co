# ../assets/fonts/

Currently empty — DM Serif Display and DM Sans are loaded from Google Fonts'
CDN (see the `<link>` tags in each page's `<head>`).

**To self-host instead (recommended for production — removes a third-party
network request and gives full control over caching):**

1. Download the `.woff2` files for DM Serif Display and DM Sans from
   [Google Fonts](https://fonts.google.com/).
2. Place them here, e.g. `dm-serif-display.woff2`, `dm-sans-400.woff2`, etc.
3. Add `@font-face` rules to the top of `../css/main.css` pointing at these files.
4. Remove the Google Fonts `<link>` tags from every page's `<head>`.
