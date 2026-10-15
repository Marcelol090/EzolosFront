(() => {
  "use strict";
  const ready = fn => document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded",fn,{once:true}) : fn();

  ready(() => {
    const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = reducedQuery.matches;
    const menuButton = document.querySelector("#menuToggle");
    const siteMenu = document.querySelector("#siteMenu");
    const closeMenu = () => {
      if (!siteMenu || !menuButton) return;
      siteMenu.hidden = true;
      menuButton.setAttribute("aria-expanded","false");
    };
    menuButton?.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded",String(open));
      if (siteMenu) siteMenu.hidden = !open;
    });
    siteMenu?.addEventListener("click",e => { if(e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown",e => { if(e.key === "Escape") closeMenu(); });
    document.addEventListener("pointerdown",e => {
      if(siteMenu?.hidden || !siteMenu) return;
      if(!siteMenu.contains(e.target) && !menuButton?.contains(e.target)) closeMenu();
    });

    /*
     * Mapping is deliberate: the first asset set had wiki/rankings and
     * bazaar/community filenames interchanged. Stable PNG remains visible,
     * and a second small GIF layer fades in once the image has decoded.
     * No src swapping, no repeated network activity at hover time.
     */
    const animatedAssets = {
      "rankings.png":"./assets/wiki.gif",
      "bazaar.png":"./assets/community.gif",
      "community.png":"./assets/bazaar.gif",
      "server-info.png":"./assets/server-info.gif",
      "wiki.png":"./assets/rankings.gif"
    };
    const heroPaths = {
      rankings:'<path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4m13-6h-3v2a4 4 0 0 1-4 4M12 14v6m-4 0h8"/>',
      bazaar:'<path d="M5 8h14l1.5 12h-17L5 8ZM9 8V6a3 3 0 1 1 6 0v2"/>',
      community:'<circle cx="9" cy="7" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 4a3.5 3.5 0 0 1 0 7M20 20v-2a5 5 0 0 0-3-4.6"/>',
      server:'<rect x="3.5" y="4" width="17" height="6" rx="1.5"/><rect x="3.5" y="14" width="17" height="6" rx="1.5"/><circle cx="7" cy="7" r=".6"/><circle cx="7" cy="17" r=".6"/>',
      wiki:'<path d="M12 6a8 8 0 0 0-8-2v15a8 8 0 0 1 8 2V6Zm0 0a8 8 0 0 1 8-2v15a8 8 0 0 0-8 2V6Z"/>'
    };
    const portalCards = [...document.querySelectorAll(".portal-card")];
    const prepared = new WeakSet();
    const createSvg = key => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
      svg.setAttribute("viewBox","0 0 24 24");
      svg.setAttribute("fill","none");
      svg.setAttribute("stroke","currentColor");
      svg.setAttribute("stroke-width","1.65");
      svg.setAttribute("stroke-linecap","round");
      svg.setAttribute("stroke-linejoin","round");
      svg.setAttribute("class","portal-heroicon");
      svg.setAttribute("aria-hidden","true");
      svg.innerHTML = heroPaths[key] || heroPaths.wiki;
      return svg;
    };
    const ensureFallback = (parent,key) => {
      if(!parent.querySelector(".portal-heroicon")) parent.appendChild(createSvg(key));
      parent.classList.add("has-fallback");
    };
    function prepareIcon(card) {
      if(prepared.has(card) || reduced) return;
      prepared.add(card);
      const parent = card.querySelector(".portal-card-icon");
      const still = parent?.querySelector("img");
      if(!parent || !still) return;
      const file = still.getAttribute("src")?.split("/").pop() || "";
      const key = file.split(".")[0];
      const src = animatedAssets[file];
      still.addEventListener("error",() => ensureFallback(parent,key),{once:true});
      if(still.complete && !still.naturalWidth) ensureFallback(parent,key);
      if(!src) { ensureFallback(parent,key); return; }
      const gif = document.createElement("img");
      gif.className = "portal-animated-icon";
      gif.alt = "";
      gif.setAttribute("aria-hidden","true");
      gif.draggable = false;
      gif.decoding = "async";
      gif.onload = () => {
        if(gif.naturalWidth) gif.classList.add("is-loaded");
      };
      gif.onerror = () => { gif.remove(); ensureFallback(parent,key); };
      gif.src = src;
      parent.appendChild(gif);
      if(gif.complete && gif.naturalWidth) gif.classList.add("is-loaded");
    }
    // Prepares icons as they near the viewport instead of waking every GIF at page load.
    if("IntersectionObserver" in window) {
      const iconLoadObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if(entry.isIntersecting) { prepareIcon(entry.target); iconLoadObserver.unobserve(entry.target); }
      }),{rootMargin:"230px 0px",threshold:0});
      portalCards.forEach(card => iconLoadObserver.observe(card));
    } else portalCards.forEach(prepareIcon);

    // Heroicons are the fallback for absent or unsupported sprites.
    portalCards.forEach((card,i) => {
      card.style.setProperty("--card-sequence",String(i));
      const parent = card.querySelector(".portal-card-icon");
      if(parent) parent.style.setProperty("--icon-delay",(i * -.67) + "s");
      if(reduced || !matchMedia("(hover: hover)").matches) return;
      let queued=false;
      let nextX=0,nextY=0;
      card.addEventListener("pointermove",e => {
        if(e.pointerType!=="mouse") return;
        const rect=card.getBoundingClientRect();
        nextX=((e.clientX-rect.left)/rect.width-.5)*12;
        nextY=((e.clientY-rect.top)/rect.height-.5)*-12;
        if(queued) return;
        queued=true;
        requestAnimationFrame(()=>{
          card.style.setProperty("--tilt-x",nextY.toFixed(2)+"deg");
          card.style.setProperty("--tilt-y",nextX.toFixed(2)+"deg");
          card.style.setProperty("--spot-x",((nextX/12+.5)*100).toFixed(1)+"%");
          queued=false;
        });
      },{passive:true});
      card.addEventListener("pointerleave",()=>{
        card.style.setProperty("--tilt-x","0deg");
        card.style.setProperty("--tilt-y","0deg");
      });
    });

    if(!reduced && "IntersectionObserver" in window && matchMedia("(hover: none)").matches) {
      const io=new IntersectionObserver(entries=>entries.forEach(entry => {
        entry.target.classList.toggle("icon-visible",entry.isIntersecting);
      }),{threshold:.6});
      portalCards.forEach(card => io.observe(card));
    }

    // A single entrance state per element avoids competing 'transform'
    // rules from parent/child observers, and content never vanishes on scroll back.
    const revealed = [...document.querySelectorAll("[data-reveal]")];
    const selectors=[
      ".hero-copy > *", ".hero-boosted-head", ".hero-server-strip",
      ".hero-boost-card", ".store-panel-heading", ".store-copy > *",
      ".ring-column", ".portal-news-head", ".news-empty-state",
      ".portal-card", ".cta > *", ".footer-grid > *", ".footer-bottom"
    ];
    const staged = [...new Set(document.querySelectorAll(selectors.join(",")))];
    staged.forEach((el,i)=>{
      if(el.hasAttribute("data-reveal")) return;
      el.classList.add("motion-item");
      el.style.setProperty("--motion-delay",(i%5*78)+"ms");
      if(el.matches(".ring-column")) el.classList.add("motion-right");
      if(el.matches(".store-copy > *")) el.classList.add("motion-left");
    });
    const targets=[...new Set([...revealed,...staged])];
    const show=el=>{
      el.classList.add("is-visible");
      el.classList.add("is-motion-visible");
    };
    if(reduced || !("IntersectionObserver" in window)) targets.forEach(show);
    else {
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      }),{rootMargin:"0px 0px -4% 0px",threshold:.06});
      targets.forEach(el=>observer.observe(el));
    }

    // Continuous visual response, restricted to 2 low-cost, GPU-transformed ambient glows.
    if(!reduced && "IntersectionObserver" in window) {
      const surfaces=[...document.querySelectorAll(".store-layout,.news-panel")];
      const inView=new Set();
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      }),{threshold:0});
      surfaces.forEach(el=>{el.classList.add("fx-surface");observer.observe(el);});
      let raf=false;
      const update=()=>{
        raf=false;
        inView.forEach(surface=>{
          const r=surface.getBoundingClientRect();
          const middle=(r.top+r.height/2-window.innerHeight/2)/window.innerHeight;
          surface.style.setProperty("--ambient-shift",(Math.max(-1,Math.min(1,middle))*27).toFixed(1)+"px");
        });
      };
      addEventListener("scroll",()=>{if(!raf){raf=true;requestAnimationFrame(update)}},{passive:true});
      addEventListener("resize",()=>{if(!raf){raf=true;requestAnimationFrame(update)}},{passive:true});
      update();
    }

    // The ring's own script owns autoplay, pause, keyboard and drag.
    if(!document.querySelector("script[data-store-ring-loader]")) {
      const script=document.createElement("script");
      script.src="./store-ring.js";
      script.defer=true;
      script.dataset.storeRingLoader="true";
      document.body.appendChild(script);
    }
  });
})();