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

    /*
     * Correct icon association:
     * Bazaar uses Yasir (merchant), while Community uses the previous item/character GIF.
     */
    const sectionTargets = ['#news','#rankings','#store','#community','#top','#wiki'];
    const sectionIcons = [
      media.news,
      media.rankings,
      media.community,
      media.bazaar,
      media.server,
      media.wiki
    ];

    [...document.querySelectorAll('.info-card')].forEach((card, index) => {
      const icon = card.querySelector('.info-icon');
      if (icon && sectionIcons[index]) {
        icon.innerHTML = '<img src="' + sectionIcons[index] + '" alt="" loading="eager">';
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
        document.querySelector(sectionTargets[index])
          ?.scrollIntoView({behavior:'smooth',block:'start'});
      };

      card.addEventListener('click', openTarget);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openTarget();
        }
      });
    });

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Animate all major sections, including ones that previously had no data-reveal child. */
    const sectionEls = [...document.querySelectorAll(
      '.overview,.store-section,#news,.boosted,.cta-wrap,.footer'
    )];
    sectionEls.forEach((section) => section.classList.add('section-shell'));

    /* Fine-grained motion for headings/cards/items in every section. */
    const motionSelectors = [
      '.overview-head',
      '.info-card',
      '.store-copy > *',
      '.ring-column',
      '.news-head',
      '.news-card',
      '.boost-panel',
      '.community-panel',
      '.boost-card',
      '.community-item',
      '.cta > *',
      '.footer-grid > *',
      '.footer-bottom'
    ];

    const motionItems = [];
    document.querySelectorAll(motionSelectors.join(',')).forEach((el, index) => {
      el.classList.add('motion-item');
      const localIndex = index % 6;
      el.style.setProperty('--motion-delay', (localIndex * 70) + 'ms');

      if (el.matches('.store-copy,.boost-panel')) el.classList.add('motion-left');
      if (el.matches('.ring-column,.community-panel')) el.classList.add('motion-right');
      motionItems.push(el);
    });

    const revealEls = [...document.querySelectorAll('[data-reveal]')];

    if (reduced) {
      sectionEls.forEach((el) => el.classList.add('section-active'));
      revealEls.forEach((el) => el.classList.add('is-visible'));
      motionItems.forEach((el) => el.classList.add('is-motion-visible'));
    } else {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('section-active', entry.isIntersecting);
        });
      }, { threshold:.10, rootMargin:'0px 0px -8% 0px' });
      sectionEls.forEach((el) => sectionObserver.observe(el));

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      }, { threshold:.12, rootMargin:'0px 0px -7% 0px' });
      revealEls.forEach((el) => revealObserver.observe(el));

      const motionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-motion-visible', entry.isIntersecting);
        });
      }, { threshold:.10, rootMargin:'0px 0px -6% 0px' });
      motionItems.forEach((el) => motionObserver.observe(el));

      /* Hero gets a small parallax only; global background stays fixed and whole. */
      const hero = document.querySelector('.hero');
      if (hero) {
        let ticking = false;
        addEventListener('scroll', () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const y = Math.min(scrollY * .08, 30);
            hero.style.backgroundPosition = 'center calc(31% + ' + y + 'px)';
            ticking = false;
          });
        }, { passive:true });
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