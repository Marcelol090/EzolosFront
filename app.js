(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const media = {
      news:'./assets/news.gif',
      rankings:'./assets/rankings.gif',
      bazaar:'./assets/bazaar.gif',
      community:'./assets/community.gif',
      server:'./assets/server-info.gif',
      wiki:'./assets/wiki.gif'
    };

    const menuButton = document.querySelector('#menuToggle');
    const siteMenu = document.querySelector('#siteMenu');

    menuButton?.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      if (siteMenu) siteMenu.hidden = !open;
    });

    siteMenu?.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        siteMenu.hidden = true;
        menuButton?.setAttribute('aria-expanded', 'false');
      }
    });

    const sectionTargets = ['#news','#rankings','#store','#community','#top','#wiki'];
    const sectionIcons = [media.news,media.rankings,media.bazaar,media.community,media.server,media.wiki];

    [...document.querySelectorAll('.info-card')].forEach((card, index) => {
      const icon = card.querySelector('.info-icon');
      if (icon && sectionIcons[index]) {
        icon.innerHTML = '<img src="' + sectionIcons[index] + '" alt="" loading="lazy">';
      }
      if (!card.querySelector('.card-action')) {
        const action = document.createElement('span');
        action.className = 'card-action';
        action.textContent = 'Open section';
        card.appendChild(action);
      }

      card.tabIndex = 0;
      card.setAttribute('role','link');
      card.setAttribute('aria-label',(card.querySelector('h3')?.textContent || 'Section') + ' section');

      const openTarget = () => {
        const target = document.querySelector(sectionTargets[index]);
        target?.scrollIntoView({behavior:'smooth',block:'start'});
      };
      card.addEventListener('click',openTarget);
      card.addEventListener('keydown',(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openTarget();
        }
      });
    });

    const revealEls = [...document.querySelectorAll('[data-reveal]')];
    const sectionEls = [...document.querySelectorAll('.section,.store-section,.cta-wrap,.footer')];
    sectionEls.forEach((section) => section.classList.add('section-shell'));

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      sectionEls.forEach((el) => el.classList.add('section-active'));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, {threshold:.14,rootMargin:'0px 0px -8% 0px'});
      revealEls.forEach((el) => revealObserver.observe(el));

      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('section-active');
        });
      }, {threshold:.16,rootMargin:'0px 0px -10% 0px'});
      sectionEls.forEach((el) => sectionObserver.observe(el));

      const hero = document.querySelector('.hero');
      if (hero) {
        let ticking = false;
        addEventListener('scroll',() => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const y = Math.min(scrollY * .11, 40);
            hero.style.backgroundPosition = 'center calc(31% + ' + y + 'px)';
            ticking = false;
          });
        },{passive:true});
      }
    }

    if (!document.querySelector('script[data-store-ring-loader]')) {
      const script = document.createElement('script');
      script.src = './store-ring.js';
      script.defer = true;
      script.dataset.storeRingLoader = 'true';
      document.body.appendChild(script);
    }
  });
})();