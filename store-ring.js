(() => {
  const ring = document.querySelector('[data-ui-ring]');
  const stage = document.querySelector('[data-ring-stage]');
  const dots = document.querySelector('[data-ring-dots]');
  const info = document.querySelector('[data-ring-info]');
  const dialog = document.querySelector('[data-pack-dialog]');
  if (!ring || !stage || !dots || !info) return;

  const packs = [
    [120,'R$ 10.00',20,1],[242,'R$ 20.00',21,2],[437,'R$ 35.00',25,3],
    [750,'R$ 60.00',25,4],[1950,'R$ 150.00',30,5],[3990,'R$ 300.00',33,6],
    [6750,'R$ 500.00',35,7],[10275,'R$ 750.00',37,8],[14000,'R$ 1,000.00',40,9]
  ].map(([coins,price,bonus,tier]) => ({ coins, price, bonus, tier }));

  const icon = 'https://www.ezolos.com/images/general/icon-tibiacoins.png';
  let active = 4;
  let timer;
  let paused = false;
  let pointerStart = null;

  stage.innerHTML = packs.map((p, i) =>
    '<button type="button" class="coin-card tier-' + p.tier + '" data-ring-card="' + i + '" aria-label="' + p.coins + ' Coins" tabindex="-1">' +
    '<span class="coin-shell"><em>+' + p.bonus + '%</em><img src="' + icon + '" alt="" class="coin-art" draggable="false">' +
    '<strong>' + p.coins.toLocaleString('en-US') + '</strong><small>Coins</small><b>' + p.price + '</b></span></button>'
  ).join('');

  dots.innerHTML = packs.map((p, i) =>
    '<button type="button" class="ring-dot" data-ring-dot="' + i + '" aria-label="' + p.coins + ' Coins"></button>'
  ).join('');

  const cards = [...stage.querySelectorAll('[data-ring-card]')];
  const dotButtons = [...dots.querySelectorAll('[data-ring-dot]')];

  function deltaFor(index) {
    let d = index - active;
    if (d > packs.length / 2) d -= packs.length;
    if (d < -packs.length / 2) d += packs.length;
    return d;
  }

  function updateInfo() {
    const p = packs[active];
    info.querySelector('[data-ring-name]').textContent = p.coins + ' Coins';
    info.querySelector('[data-ring-coins]').textContent = p.coins.toLocaleString('en-US');
    info.querySelector('[data-ring-price]').textContent = p.price;
    info.querySelector('[data-ring-bonus]').textContent = '+' + p.bonus + '% bonus';
  }

  function render() {
    const radius = Math.max(138, Math.min(260, ring.getBoundingClientRect().width * .34));
    cards.forEach((card, index) => {
      const d = deltaFor(index);
      const angle = d * 38 * Math.PI / 180;
      const focus = Math.max(0, Math.cos(angle));
      const x = Math.sin(angle) * radius;
      const z = (Math.cos(angle) - 1) * 430;
      const scale = .56 + focus * .44;
      card.style.transform = 'translate3d(' + x + 'px,' + (Math.abs(d) * 7) + 'px,' + z + 'px) rotateY(' + (d * -7) + 'deg) scale(' + scale + ')';
      card.style.opacity = Math.max(.08, .18 + focus * .82 - Math.abs(d) * .035);
      card.style.zIndex = String(100 - Math.abs(d));
      card.style.filter = d === 0 ? 'saturate(1) brightness(1)' : 'saturate(.74) brightness(.88)';
      card.setAttribute('aria-current', d === 0 ? 'true' : 'false');
      card.tabIndex = d === 0 ? 0 : -1;
    });
    dotButtons.forEach((dot, i) => dot.setAttribute('aria-current', i === active ? 'true' : 'false'));
    updateInfo();
  }

  function go(index) { active = (index + packs.length) % packs.length; render(); }
  const next = () => go(active + 1);
  const prev = () => go(active - 1);
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    stop();
    if (!paused && !matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(next, 3300);
  };

  function openDialog() {
    if (!dialog) return;
    const p = packs[active];
    dialog.querySelector('[data-dialog-coins]').textContent = p.coins.toLocaleString('en-US');
    dialog.querySelector('[data-dialog-name]').textContent = p.coins + ' Coins';
    dialog.querySelector('[data-dialog-price]').textContent = p.price;
    dialog.querySelector('[data-dialog-bonus]').textContent = '+' + p.bonus + '% bonus';
    dialog.showModal();
    stop();
  }

  cards.forEach((card, i) => card.addEventListener('click', () => i === active ? openDialog() : go(i)));
  dotButtons.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
  document.querySelector('[data-ring-next]')?.addEventListener('click', next);
  document.querySelector('[data-ring-prev]')?.addEventListener('click', prev);
  document.querySelector('[data-ring-open]')?.addEventListener('click', openDialog);
  document.querySelector('[data-pack-close]')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('close', start);

  ring.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === 'Enter') { e.preventDefault(); openDialog(); }
  });
  ring.addEventListener('mouseenter', () => { paused = true; stop(); });
  ring.addEventListener('mouseleave', () => { paused = false; start(); });
  ring.addEventListener('focusin', () => { paused = true; stop(); });
  ring.addEventListener('focusout', () => { paused = false; start(); });
  ring.addEventListener('pointerdown', (e) => { pointerStart = e.clientX; });
  ring.addEventListener('pointerup', (e) => {
    if (pointerStart == null) return;
    const dx = e.clientX - pointerStart;
    pointerStart = null;
    if (Math.abs(dx) > 34) dx < 0 ? next() : prev();
  });

  addEventListener('resize', render, { passive: true });
  render();
  start();
})();
