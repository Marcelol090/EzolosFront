(() => {
  "use strict";
  const ring = document.querySelector("[data-ui-ring]");
  const stage = ring?.querySelector("[data-ring-stage]");
  const dots = document.querySelector("[data-ring-dots]");
  const info = document.querySelector("[data-ring-info]");
  const dialog = document.querySelector("[data-pack-dialog]");
  if (!ring || !stage || !dots || !info) return;

  const packs = [
    [120, "R$ 10.00", 20, 1, "A"], [242, "R$ 20.00", 21, 1, "B"],
    [437, "R$ 35.00", 25, 1, "C"], [750, "R$ 60.00", 25, 2, "D"],
    [1950, "R$ 150.00", 30, 2, "E"], [3990, "R$ 300.00", 33, 3, "F"],
    [6750, "R$ 500.00", 35, 3, "F"], [10275, "R$ 750.00", 37, 4, "F"],
    [14000, "R$ 1,000.00", 40, 4, "F"]
  ].map(([coins, price, bonus, tier, artwork]) => ({ coins, price, bonus, tier, artwork }));

  const zoomSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 5 5"></path></svg>';
  const fallbackArt = "https://ezolos.com/images/general/icon-tibiacoins.png";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const cardArt = (name) => "https://ezolos.com/donate/images/coin_" + name + ".png";
  let active = 4;
  let timer = null;
  let hovered = false;
  let focused = false;
  let visible = true;
  let pointerX = null;
  let cancelledClickUntil = 0;

  stage.innerHTML = packs.map((p, i) =>
    '<button type="button" class="ui-ring-card" data-ring-card="' + i + '" aria-label="' + p.coins.toLocaleString("en-US") + ' Coins" tabindex="-1">' +
    '<span class="ui-coin-card" data-tier="' + p.tier + '">' +
    '<span class="ui-coin-bonus">+' + p.bonus + '%</span>' +
    '<img class="ui-coin-art" src="' + cardArt(p.artwork) + '" alt="" width="128" height="64" decoding="async" draggable="false">' +
    '<strong class="ui-coin-amount">' + p.coins.toLocaleString("en-US") + '</strong>' +
    '<span class="ui-coin-caption">Coins</span>' +
    '<span class="ui-coin-price">' + p.price + '</span></span>' +
    '<span class="ui-ring-zoom" aria-hidden="true">' + zoomSvg + '</span></button>'
  ).join("");

  dots.innerHTML = packs.map((p, i) => '<button type="button" class="ring-dot" data-ring-dot="' + i + '" aria-label="Show ' + p.coins.toLocaleString("en-US") + ' Coins"></button>').join("");
  const cards = [...stage.querySelectorAll("[data-ring-card]")];
  const bullets = [...dots.querySelectorAll("[data-ring-dot]")];

  for (const image of stage.querySelectorAll(".ui-coin-art")) {
    image.addEventListener("error", () => {
      if (image.src !== fallbackArt) image.src = fallbackArt;
    }, { once: true });
  }
  function delta(i) {
    let d = i - active;
    if (d > packs.length / 2) d -= packs.length;
    if (d < -packs.length / 2) d += packs.length;
    return d;
  }
  function updateInfo() {
    const p = packs[active];
    const set = (sel, value) => {
      const el = info.querySelector(sel);
      if (el) el.textContent = value;
    };
    set("[data-ring-name]", p.coins.toLocaleString("en-US") + " Coins");
    set("[data-ring-coins]", p.coins.toLocaleString("en-US"));
    set("[data-ring-price]", p.price);
    set("[data-ring-bonus]", "+" + p.bonus + "% bonus");
    const dialogArt = dialog?.querySelector(".dialog-art");
    if (dialogArt) dialogArt.setAttribute("data-dialog-tier", String(p.tier));
  }
  function render() {
    const width = ring.getBoundingClientRect().width;
    const radius = Math.max(94, Math.min(320, (width - 166) / 2));
    cards.forEach((card, i) => {
      const d = delta(i);
      const angle = d * (2 * Math.PI / packs.length);
      const depth = Math.cos(angle);
      const focus = Math.max(0, depth);
      const x = Math.sin(angle) * radius;
      const y = (depth - 1) * 120;
      const z = (depth - 1) * 245;
      const scale = .50 + focus * .50;
      const front = d === 0;
      card.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px," + z.toFixed(1) + "px) rotateY(" + (-Math.sin(angle) * 24).toFixed(1) + "deg) scale(" + scale.toFixed(3) + ")";
      card.style.opacity = String(Math.max(.13, .14 + focus * .86 - Math.abs(d) * .02));
      card.style.zIndex = String(Math.round(10 + focus * 100));
      card.style.pointerEvents = focus < .15 ? "none" : "auto";
      card.classList.toggle("is-front", front);
      card.setAttribute("aria-current", String(front));
      card.tabIndex = front ? 0 : -1;
    });
    bullets.forEach((bullet, i) => bullet.setAttribute("aria-current", String(i === active)));
    updateInfo();
  }
  function go(i) { active = ((i % packs.length) + packs.length) % packs.length; render(); }
  const next = () => go(active + 1);
  const prev = () => go(active - 1);
  const stop = () => { if (timer !== null) clearInterval(timer); timer = null; };
  function restart() {
    stop();
    const pause = hovered || focused || !visible || document.hidden || reduced.matches || !!dialog?.open;
    ring.classList.toggle("is-paused", hovered || focused);
    if (!pause) timer = setInterval(next, 3500);
  }
  function openDialog() {
    if (!dialog || typeof dialog.showModal !== "function") return;
    const p = packs[active];
    const update = (sel, value) => {
      const el = dialog.querySelector(sel);
      if (el) el.textContent = value;
    };
    update("[data-dialog-coins]", p.coins.toLocaleString("en-US"));
    update("[data-dialog-name]", p.coins.toLocaleString("en-US") + " Coins");
    update("[data-dialog-price]", p.price);
    update("[data-dialog-bonus]", "+" + p.bonus + "% bonus");
    dialog.showModal();
    restart();
  }
  cards.forEach((card, i) => card.addEventListener("click", (event) => {
    if (Date.now() < cancelledClickUntil) { event.preventDefault(); return; }
    if (i === active) openDialog();
    else go(i);
  }));
  bullets.forEach((bullet, i) => bullet.addEventListener("click", () => go(i)));
  document.querySelector("[data-ring-prev]")?.addEventListener("click", prev);
  document.querySelector("[data-ring-next]")?.addEventListener("click", next);
  document.querySelector("[data-ring-open]")?.addEventListener("click", openDialog);
  document.querySelector("[data-pack-close]")?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("close", restart);
  ring.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); next(); }
    if (event.key === "ArrowLeft") { event.preventDefault(); prev(); }
  });
  ring.addEventListener("mouseenter", () => { hovered = true; restart(); });
  ring.addEventListener("mouseleave", () => { hovered = false; restart(); });
  ring.addEventListener("focusin", () => { focused = true; restart(); });
  ring.addEventListener("focusout", (e) => { if (!ring.contains(e.relatedTarget)) { focused = false; restart(); } });
  ring.addEventListener("pointerdown", e => { pointerX = e.clientX; });
  ring.addEventListener("pointerup", e => {
    if (pointerX === null) return;
    const dx = e.clientX - pointerX;
    pointerX = null;
    if (Math.abs(dx) > 36) { cancelledClickUntil = Date.now() + 280; dx < 0 ? next() : prev(); }
  });
  ring.addEventListener("pointercancel", () => { pointerX = null; });
  document.addEventListener("visibilitychange", restart);
  reduced.addEventListener?.("change", restart);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    }, { threshold: .12 });
    observer.observe(ring);
  }
  addEventListener("resize", render, { passive: true });
  render();
  ring.classList.add("is-ready");
  restart();
})();