(() => {
  "use strict";
  const ready = (fn) => document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn, { once: true }) : fn();
  ready(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const menuButton = document.querySelector("#menuToggle");
    const siteMenu = document.querySelector("#siteMenu");
    const closeMenu = () => {
      if (!siteMenu || !menuButton) return;
      siteMenu.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
    };
    menuButton?.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      if (siteMenu) siteMenu.hidden = !open;
    });
    siteMenu?.addEventListener("click", e => { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
    document.addEventListener("pointerdown", e => {
      if (siteMenu?.hidden || !siteMenu) return;
      if (!siteMenu.contains(e.target) && !menuButton?.contains(e.target)) closeMenu();
    });

    // Two persistent layers, not src swapping: avoid flashes in pixel GIFs.
    const animatedAssets = {
      "rankings.png": "./assets/wiki.gif",
      "bazaar.png": "./assets/community.gif",
      "community.png": "./assets/bazaar.gif",
      "server-info.png": "./assets/server-info.gif",
      "wiki.png": "./assets/rankings.gif"
    };
    const portalCards = [...document.querySelectorAll(".portal-card")];
    if (!reduced) {
      portalCards.forEach(card => {
        const parent = card.querySelector(".portal-card-icon");
        const still = parent?.querySelector("img");
        if (!parent || !still) return;
        const name = still.getAttribute("src")?.split("/").pop();
        const src = animatedAssets[name];
        if (!src) return;
        const gif = document.createElement("img");
        gif.src = src;
        gif.alt = "";
        gif.className = "portal-animated-icon";
        gif.setAttribute("aria-hidden", "true");
        gif.decoding = "async";
        gif.draggable = false;
        gif.onload = () => gif.classList.add("is-loaded");
        if (gif.complete && gif.naturalWidth) gif.classList.add("is-loaded");
        parent.appendChild(gif);
      });
      if ("IntersectionObserver" in window && matchMedia("(hover: none)").matches) {
        const iconObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => entry.target.classList.toggle("icon-visible", entry.isIntersecting));
        }, { threshold: .65 });
        portalCards.forEach(card => iconObserver.observe(card));
      }
    }

    const revealEls = [...document.querySelectorAll("[data-reveal]")];
    const motionTargets = [
      ".hero-boosted", ".hero-boost-card", ".store-panel-heading",
      ".store-copy > *", ".ring-column", ".news-panel",
      ".portal-card", ".cta > *", ".footer-grid > *", ".footer-bottom"
    ];
    const motionItems = [...new Set(document.querySelectorAll(motionTargets.join(",")))];
    motionItems.forEach((el, index) => {
      el.classList.add("motion-item");
      el.style.setProperty("--motion-delay", ((index % 5) * 65) + "ms");
      if (el.matches(".store-copy > *")) el.classList.add("motion-left");
      if (el.matches(".ring-column")) el.classList.add("motion-right");
    });

    if (reduced || !("IntersectionObserver" in window)) {
      revealEls.forEach(el => el.classList.add("is-visible"));
      motionItems.forEach(el => el.classList.add("is-motion-visible"));
    } else {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => target.classList.toggle("is-visible", isIntersecting));
      }, { threshold: .08, rootMargin: "0px 0px -5% 0px" });
      revealEls.forEach(el => revealObserver.observe(el));

      const motionObserver = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => target.classList.toggle("is-motion-visible", isIntersecting));
      }, { threshold: .08, rootMargin: "0px 0px -5% 0px" });
      motionItems.forEach(el => motionObserver.observe(el));

      // Modest parallax limited to the hero only; sections keep natural document flow.
      const hero = document.querySelector(".hero");
      if (hero) {
        let ticking = false;
        addEventListener("scroll", () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const y = Math.min(scrollY * .06, 24);
            hero.style.backgroundPosition = "center calc(31% + " + y + "px)";
            ticking = false;
          });
        }, { passive: true });
      }
    }

    if (!document.querySelector("script[data-store-ring-loader]")) {
      const script = document.createElement("script");
      script.src = "./store-ring.js";
      script.defer = true;
      script.dataset.storeRingLoader = "true";
      document.body.appendChild(script);
    }
  });
})();