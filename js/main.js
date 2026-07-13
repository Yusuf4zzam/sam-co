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
  // ---------------------------------------------------------------------
  // Video lightbox ("Watch Our Story") — one trigger button per hero slide
  // WITH SMOOTH ANIMATIONS
  // ---------------------------------------------------------------------
  function initVideoModal() {
    var openBtns = document.querySelectorAll(".watch-video-btn");
    var closeBtn = document.getElementById("video-modal-close");
    var modal = document.getElementById("video-modal");
    var video = document.getElementById("modal-video");
    var modalContent = modal ? modal.querySelector(".relative") : null;

    if (!openBtns.length || !closeBtn || !modal || !video || !modalContent)
      return;

    function open() {
      // Remove pointer-events and opacity classes for smooth entrance
      modal.classList.remove("pointer-events-none");

      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(function () {
        modal.classList.remove("opacity-0");
        modal.classList.add("opacity-100");
        modal.classList.remove("bg-dark/0");
        modal.classList.add("bg-dark/80");
      });

      // Scale up the content smoothly with slight delay for coordinated animation
      requestAnimationFrame(function () {
        setTimeout(function () {
          modalContent.classList.remove("scale-95", "opacity-0");
          modalContent.classList.add("scale-100", "opacity-100");
        }, 50);
      });

      document.body.style.overflow = "hidden";

      // Auto-play with slight delay for smoothness
      setTimeout(function () {
        video.play().catch(function () {});
      }, 400);
    }

    function close() {
      // Scale down and fade out content
      modalContent.classList.remove("scale-100", "opacity-100");
      modalContent.classList.add("scale-95", "opacity-0");

      // Fade out backdrop
      modal.classList.remove("opacity-100", "bg-dark/80");
      modal.classList.add("opacity-0", "bg-dark/0");

      // Pause video
      video.pause();
      video.currentTime = 0;

      // Restore pointer events after animation completes
      setTimeout(function () {
        modal.classList.add("pointer-events-none");
        document.body.style.overflow = "";
      }, 500);
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener("click", open);
    });

    closeBtn.addEventListener("click", close);

    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });

    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        !modal.classList.contains("pointer-events-none")
      ) {
        close();
      }
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
  // FAQ accordion (Conxora Home 5-style) — no-ops on pages without .faq-item
  // ---------------------------------------------------------------------
  function initFAQAccordion() {
    var items = document.querySelectorAll(".faq-item");
    if (!items.length) return;

    items.forEach(function (item) {
      var trigger = item.querySelector(".faq-trigger");
      var panel = item.querySelector(".faq-panel");
      var icon = item.querySelector(".faq-icon");
      if (!trigger || !panel) return;

      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";

        // Close any other open item (single-open accordion, calmer than several at once)
        items.forEach(function (other) {
          if (other === item) return;
          var otherTrigger = other.querySelector(".faq-trigger");
          var otherPanel = other.querySelector(".faq-panel");
          var otherIcon = other.querySelector(".faq-icon");
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
          if (otherPanel) otherPanel.style.maxHeight = "0px";
          if (otherIcon) otherIcon.style.transform = "rotate(0deg)";
        });

        trigger.setAttribute("aria-expanded", String(!isOpen));
        panel.style.maxHeight = isOpen ? "0px" : panel.scrollHeight + "px";
        if (icon)
          icon.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
      });
    });
  }

  // ---------------------------------------------------------------------
  // Skill progress bars (Conxora "Our Experience" pattern) — animate width
  // once when scrolled into view, no-ops on pages without .skill-bar-fill
  // ---------------------------------------------------------------------
  function initSkillBars() {
    var bars = document.querySelectorAll(".skill-bar-fill");
    if (!bars.length) return;

    function fill(el) {
      var target = el.getAttribute("data-percent") || "0";
      requestAnimationFrame(function () {
        el.style.width = target + "%";
      });
    }

    if (!("IntersectionObserver" in window)) {
      bars.forEach(fill);
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              fill(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 },
      );
      bars.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  // ---------------------------------------------------------------------
  // Numbered interactive service list (Conxora "Services We Offer" pattern)
  // Clicking a numbered row swaps the active description + image. No-ops
  // on pages without .service-tab.
  // ---------------------------------------------------------------------
  function initServiceTabs() {
    var tabs = document.querySelectorAll(".service-tab");
    if (!tabs.length) return;
    var panels = document.querySelectorAll(".service-tab-panel");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab-target");
        tabs.forEach(function (t) {
          t.classList.remove("is-active");
        });
        panels.forEach(function (p) {
          p.classList.remove("is-active");
        });
        tab.classList.add("is-active");
        var panel = document.querySelector(
          '.service-tab-panel[data-tab="' + target + '"]',
        );
        if (panel) panel.classList.add("is-active");
      });
    });
  }

  // ---------------------------------------------------------------------
  // Testimonial carousel — Swiper.js instance (no-ops if a page has no
  // .testimonial-swiper, or if Swiper itself isn't loaded on that page)
  // ---------------------------------------------------------------------
  function initTestimonialSwiper() {
    var el = document.querySelector(".testimonial-swiper");
    if (!el || typeof Swiper === "undefined") return;

    new Swiper(".testimonial-swiper", {
      loop: true,
      speed: 700,
      slidesPerView: 1,
      spaceBetween: 24,
      autoplay: prefersReducedMotion
        ? false
        : { delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true },
      navigation: { nextEl: ".testimonial-next", prevEl: ".testimonial-prev" },
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });
  }

  // ---------------------------------------------------------------------
  // Inline "Let's Get Started" inquiry form — no backend wired up yet.
  // Shows an inline confirmation on submit rather than actually sending
  // anywhere. Wire to a real endpoint (or the dedicated Contact page's
  // handler) before launch. No-ops on pages without .cta-inquiry-form.
  // ---------------------------------------------------------------------
  function initContactForm() {
    var forms = document.querySelectorAll(".cta-inquiry-form");
    if (!forms.length) return;

    forms.forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var success = form.querySelector(".cta-inquiry-success");
        var button = form.querySelector('button[type="submit"]');
        if (success) success.classList.remove("hidden");
        if (button) {
          button.disabled = true;
          button.textContent = "Message Sent";
        }
      });
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
    initTestimonialSwiper();
    initCounters();
    initSkillBars();
    initServiceTabs();
    initFAQAccordion();
    initContactForm();

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

document.addEventListener("DOMContentLoaded", function () {
  const lenis = new Lenis({
    duration: 2,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
});

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("video-modal");
  const modalVideo = document.getElementById("modal-video");
  const closeBtn = document.getElementById("video-modal-close");
  const playBtns = document.querySelectorAll(".video-play-btn");
  const modalContent = modal.querySelector(".relative");

  function openModal(videoSrc, posterSrc) {
    // Set video sources
    modalVideo.querySelector("source").src = videoSrc;
    modalVideo.poster = posterSrc || "";
    modalVideo.load();

    // Remove pointer-events and opacity classes for smooth entrance
    modal.classList.remove("pointer-events-none");

    // Use requestAnimationFrame for smooth transition
    requestAnimationFrame(() => {
      modal.classList.remove("opacity-0");
      modal.classList.add("opacity-100");
      modal.classList.remove("bg-dark/0");
      modal.classList.add("bg-dark/80");
    });

    // Scale up the content smoothly
    requestAnimationFrame(() => {
      modalContent.classList.remove("scale-95");
      modalContent.classList.add("scale-100");
    });

    document.body.style.overflow = "hidden";

    // Auto-play with slight delay for smoothness
    setTimeout(() => {
      modalVideo.play().catch(() => {});
    }, 300);
  }

  function closeModal() {
    // Scale down
    modalContent.classList.remove("scale-100");
    modalContent.classList.add("scale-95");

    // Fade out
    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0");
    modal.classList.remove("bg-dark/80");
    modal.classList.add("bg-dark/0");

    // Pause video
    modalVideo.pause();
    modalVideo.currentTime = 0;

    // Restore pointer events after animation completes
    setTimeout(() => {
      modal.classList.add("pointer-events-none");
      document.body.style.overflow = "";
    }, 500);
  }

  // Open modal on video button click
  playBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const videoSrc = this.dataset.videoSrc;
      const posterSrc = this.dataset.videoPoster;
      if (videoSrc) {
        openModal(videoSrc, posterSrc);
      }
    });
  });

  // Close modal
  closeBtn.addEventListener("click", closeModal);

  // Close on backdrop click
  modal.addEventListener("click", function (e) {
    if (e.target === this) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      !modal.classList.contains("pointer-events-none")
    ) {
      closeModal();
    }
  });
});
