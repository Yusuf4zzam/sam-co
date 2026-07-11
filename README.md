# Sam & Co — Website

Production-structured static site: separated HTML/CSS/JS, shared header/footer
components, and an organized asset pipeline. Currently ships the Home page;
built to extend cleanly to the rest of the sitemap in the Build Specification.

## Project structure

```
/
├── index.html              Home page
├── css/
│   └── main.css            All custom CSS (see note on @theme below)
├── js/
│   └── main.js             All site JS — organized into named init functions
├── partials/
│   ├── header.html         <header> + mobile nav drawer (shared, fetched at runtime)
│   └── footer.html         <footer> + back-to-top + video modal (shared)
├── assets/
│   ├── images/              Site-owned images (logo, social share images)
│   ├── videos/               hero-reel.mp4 goes here once supplied
│   ├── fonts/                 Self-hosted font files (currently using Google Fonts CDN — see fonts/README.md)
│   └── icons/                 Favicons (in-page icons are inline SVG — see icons/README.md)
├── home-asset-guide.md      Every placeholder image/video on Home: current
│                            source, recommended final size, format, max weight
└── README.md                This file
```
