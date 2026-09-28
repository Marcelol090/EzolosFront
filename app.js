(() => {
  const menuButton = document.querySelector('#menuToggle');
  const siteMenu = document.querySelector('#siteMenu');

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    siteMenu.hidden = !open;
  });

  siteMenu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      siteMenu.hidden = true;
      menuButton?.setAttribute('aria-expanded', 'false');
    }
  });

  const revealEls = [...document.querySelectorAll('[data-reveal]')];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  }
})();

const storeRingScript = document.createElement('script');
storeRingScript.src = './store-ring.js';
storeRingScript.defer = true;
document.body.appendChild(storeRingScript);
