/* ==========================================================================
   Sam & Co — main.js
   Site-wide behavior, organized into named init functions:
     - loadIncludes()     fetches partials/header.html + partials/footer.html
                          and injects them, so header/footer are truly shared
                          (edit once, applies to every page)
     - initPreloader()    brand preloader, waits for real load + includes
     - initHeaderScroll() hide-on-scroll-down / reveal-on-scroll-up header
     - initMobileDrawer() right-side sliding mobile nav
     - initVideoModal()   "Watch Our Story" lightbox
     - initBackToTop()    icon-only scroll-to-top button
     - initHeroSwiper()   Swiper.js hero carousel (only runs if a page has one)
     - initCounters()     animated count-up stat bands
     - initReveal()       calm scroll-reveal for elements with .reveal

   IMPORTANT: loadIncludes() uses fetch() on local files (partials/header.html,
   partials/footer.html). Browsers block fetch() of local files when a page is
   opened directly via file:// — this only works when the site is served over
   http(s). Run a local server while developing, e.g.:
     python3 -m http.server 8000        (then visit http://localhost:8000)
     npx serve .
   See README.md for details.
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ---------------------------------------------------------------------
  // Includes loader — injects partials/header.html and partials/footer.html
  // into their placeholder elements. Returns a Promise that resolves once
  // both are in the DOM, so callers can safely wire up header/footer JS.
  // ---------------------------------------------------------------------
  function loadIncludes() {
    var headerSlot = document.getElementById("header-placeholder");
    var footerSlot = document.getElementById("footer-placeholder");

    function inject(slot, url) {
      if (!slot) return Promise.resolve();
      return fetch(url)
        .then(function (res) {
          if (!res.ok)
            throw new Error("Failed to fetch " + url + " (" + res.status + ")");
          return res.text();
        })
        .then(function (html) {
          slot.outerHTML = html;
        })
        .catch(function (err) {
          console.error(
            "[Sam & Co] Could not load " +
              url +
              ". If you opened this file " +
              "directly (file://), serve the project over http(s) instead — " +
              "see README.md.",
            err,
          );
        });
    }

    return Promise.all([
      inject(headerSlot, "partials/header.html"),
      inject(footerSlot, "partials/footer.html"),
    ]);
  }

  // ---------------------------------------------------------------------
  // Preloader — hides once BOTH the window has fully loaded AND the header/
  // footer includes have finished injecting (so nothing "pops in" after the
  // preloader fades). Hard 2.5s fallback so a slow network never blocks the
  // page indefinitely.
  // ---------------------------------------------------------------------
  function initPreloader() {
    var pre = document.getElementById("preloader");
    if (!pre) return function () {};
    var hidden = false;
    return function hide() {
      if (hidden) return;
      hidden = true;
      pre.classList.add("is-hidden");
      setTimeout(function () {
        pre.style.display = "none";
      }, 700);
    };
  }

  // ---------------------------------------------------------------------
  // Header: hide on scroll down, reveal on scroll up, always visible near top
  // ---------------------------------------------------------------------
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var lastY = window.scrollY;
    var ticking = false;

    function isDrawerOpen() {
      var drawer = document.getElementById("mobile-menu");
      return !!drawer && drawer.classList.contains("is-open");
    }

    function onScroll() {
      var y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 8);

      if (!isDrawerOpen()) {
        if (y > lastY && y > header.offsetHeight + 40) {
          header.classList.add("header-hidden");
        } else if (y < lastY || y <= 8) {
          header.classList.remove("header-hidden");
        }
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true },
    );
    onScroll();
  }

  // ---------------------------------------------------------------------
  // Mobile drawer (slides in from the right)
  // ---------------------------------------------------------------------
  function initMobileDrawer() {
    var toggleBtn = document.getElementById("menu-toggle");
    var closeBtn = document.getElementById("menu-close");
    var drawer = document.getElementById("mobile-menu");
    var backdrop = document.getElementById("mobile-menu-backdrop");
    if (!toggleBtn || !closeBtn || !drawer || !backdrop) return;
    var isOpen = false;

    function setOpen(open) {
      isOpen = open;
      toggleBtn.setAttribute("aria-expanded", String(open));
      drawer.setAttribute("aria-hidden", String(!open));
      drawer.classList.toggle("is-open", open);
      backdrop.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        var header = document.querySelector(".site-header");
        if (header) header.classList.remove("header-hidden");
      } else {
        toggleBtn.focus();
      }
    }

    toggleBtn.addEventListener("click", function () {
      setOpen(true);
    });
    closeBtn.addEventListener("click", function () {
      setOpen(false);
    });
    backdrop.addEventListener("click", function () {
      setOpen(false);
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setOpen(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen) setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024 && isOpen) setOpen(false);
    });
  }

  // ---------------------------------------------------------------------
  // Video lightbox ("Watch Our Story") — one trigger button per hero slide
  // ---------------------------------------------------------------------
  function initVideoModal() {
    var openBtns = document.querySelectorAll(".watch-video-btn");
    var closeBtn = document.getElementById("video-modal-close");
    var modal = document.getElementById("video-modal");
    var video = document.getElementById("modal-video");
    if (!openBtns.length || !closeBtn || !modal || !video) return;

    function open() {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      video.play().catch(function () {});
    }
    function close() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      video.pause();
    }
    openBtns.forEach(function (btn) {
      btn.addEventListener("click", open);
    });
    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) close();
    });
  }

  // ---------------------------------------------------------------------
  // Back to top
  // ---------------------------------------------------------------------
  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      function () {
        btn.classList.toggle("is-visible", window.scrollY > 500);
      },
      { passive: true },
    );
    btn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  // ---------------------------------------------------------------------
  // Hero slider — Swiper.js instance (no-ops if a page has no .hero-swiper)
  // ---------------------------------------------------------------------
  function initHeroSwiper() {
    var section = document.querySelector(".hero-slider");
    if (!section || typeof Swiper === "undefined") return;

    var indicator = document.getElementById("hero-indicator");
    var slideEls = section.querySelectorAll(".swiper-slide");
    var labels = Array.prototype.map.call(slideEls, function (el) {
      return el.getAttribute("data-label") || "";
    });
    var total = labels.length;

    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function updateIndicator(swiper) {
      if (!indicator) return;
      var i = swiper.realIndex; // correct logical index even with loop-mode clones
      indicator.textContent =
        pad(i + 1) + " / " + pad(total) + " — " + labels[i];
    }

    var heroSwiper = new Swiper(".hero-swiper", {
      loop: true,
      speed: 900,
      effect: "fade",
      fadeEffect: { crossFade: true },

      // No mouse-drag / touch-swipe — only buttons + autoplay change slides
      allowTouchMove: false,
      simulateTouch: false,

      autoplay: prefersReducedMotion
        ? false
        : {
            delay: 6500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },

      navigation: {
        nextEl: "#hero-next",
        prevEl: "#hero-prev",
      },

      on: {
        init: updateIndicator,
        slideChange: updateIndicator,
      },
    });

    // Pause autoplay while keyboard focus is inside the hero (mirrors pauseOnMouseEnter)
    section.addEventListener("focusin", function () {
      heroSwiper.autoplay && heroSwiper.autoplay.stop();
    });
    section.addEventListener("focusout", function () {
      heroSwiper.autoplay && heroSwiper.autoplay.start();
    });
  }

  // ---------------------------------------------------------------------
  // Calm count-up for stat bands (runs once per element, respects reduced motion)
  // ---------------------------------------------------------------------
  function initCounters() {
    var counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    function animate(el) {
      var target = parseInt(el.getAttribute("data-target"), 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }
      var start = null;
      var duration = 1200;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animate(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 },
      );
      counters.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  // ---------------------------------------------------------------------
  // Calm scroll-reveal via IntersectionObserver
  // ---------------------------------------------------------------------
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  }

  // ---------------------------------------------------------------------
  // Boot sequence
  // ---------------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    var hidePreloader = initPreloader();

    // These only touch each page's own <main> content, already in the initial
    // HTML — no need to wait on the header/footer includes.
    initHeroSwiper();
    initCounters();

    var windowLoaded = new Promise(function (resolve) {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve);
    });

    var includesLoaded = loadIncludes().then(function () {
      initHeaderScroll();
      initMobileDrawer();
      initVideoModal();
      initBackToTop();
      initReveal(); // after includes, in case header/footer ever gain .reveal elements
    });

    Promise.all([windowLoaded, includesLoaded])
      .then(hidePreloader)
      .catch(hidePreloader);
    setTimeout(hidePreloader, 2500); // hard fallback
  });
})();
