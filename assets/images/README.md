# assets/images/

Local images live here (logo, team photos, icons used as images, etc.).

**Current state:** most content photography on the site is still placeholder
imagery loaded from Unsplash (see `/home-asset-guide.md` at the project root
for the full list, sizes, and what to shoot/source to replace each one).
Only site-owned assets — `logo.png`, `og-image.jpg`, `twitter-image.jpg` — are
expected to live directly in this folder right now.

**When real photography is ready:**
1. Export at the dimensions listed in `home-asset-guide.md`.
2. Compress with Squoosh or TinyPNG (targets are noted per-image in that guide).
3. Prefer `.webp` with a `.jpg` fallback via `<picture>` where support matters.
4. Drop the file in here and update the `src` in the relevant HTML page.
