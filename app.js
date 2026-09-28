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
    const sectionIcons = [
      media.news,
      media.rankings,
      media.community,
      media.bazaar,
      media.server,
      media.wiki
    ];

    [...document.querySelectorAll('.info-card')].forEach((card,index) => {
      const icon=card.querySelector('.info-icon');
      if(icon && sectionIcons[index]){
        icon.innerHTML='<img src="'+sectionIcons[index]+'" alt="" loading="eager">';
      }

      if(!card.querySelector('.card-action')){
        const action=document.createElement('span');
        action.className='card-action';
        action.textContent='Open section';
        card.appendChild(action);
      }

      card.tabIndex=0;
      card.setAttribute('role','link');
      card.setAttribute('aria-label',(card.querySelector('h3')?.textContent||'Section')+' section');

      const openTarget=() => {
        const selector=sectionTargets[index];
        const target=document.querySelector(selector);
        if(!target) return;

        if(selector==='#community' || selector==='#wiki'){
          target.animate(
            [
              {transform:getComputedStyle(target).transform,filter:'brightness(1)'},
              {transform:getComputedStyle(target).transform,filter:'brightness(1.35)'},
              {transform:getComputedStyle(target).transform,filter:'brightness(1)'}
            ],
            {duration:520,easing:'ease-out'}
          );
          target.querySelector('a')?.focus({preventScroll:true});
          return;
        }
        target.scrollIntoView({behavior:'smooth',block:'start'});
      };

      card.addEventListener('click',openTarget);
      card.addEventListener('keydown',(event)=>{
        if(event.key==='Enter'||event.key===' '){
          event.preventDefault();
          openTarget();
        }
      });
    });

    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealEls=[...document.querySelectorAll('[data-reveal]')];

    const motionSelectors=[
      '.overview-head',
      '.info-card',
      '.store-copy > *',
      '.ring-column',
      '.news-head',
      '.news-card',
      '.hero-boosted',
      '.hero-boost-card',
      '.cta > *',
      '.footer-grid > *',
      '.footer-bottom'
    ];
    const motionItems=[...new Set([...document.querySelectorAll(motionSelectors.join(','))])];

    motionItems.forEach((el,index)=>{
      el.classList.add('motion-item');
      el.style.setProperty('--motion-delay',((index%6)*65)+'ms');
      if(el.matches('.store-copy > *')) el.classList.add('motion-left');
      if(el.matches('.ring-column,.hero-boosted')) el.classList.add('motion-right');
    });

    if(reduced){
      revealEls.forEach((el)=>el.classList.add('is-visible'));
      motionItems.forEach((el)=>el.classList.add('is-motion-visible'));
    }else{
      const revealObserver=new IntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
          entry.target.classList.toggle('is-visible',entry.isIntersecting);
        });
      },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
      revealEls.forEach((el)=>revealObserver.observe(el));

      const motionObserver=new IntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
          entry.target.classList.toggle('is-motion-visible',entry.isIntersecting);
        });
      },{threshold:.11,rootMargin:'0px 0px -7% 0px'});
      motionItems.forEach((el)=>motionObserver.observe(el));

      const hero=document.querySelector('.hero');
      if(hero){
        let ticking=false;
        addEventListener('scroll',()=>{
          if(ticking) return;
          ticking=true;
          requestAnimationFrame(()=>{
            const y=Math.min(scrollY*.07,26);
            hero.style.backgroundPosition='center calc(31% + '+y+'px)';
            ticking=false;
          });
        },{passive:true});
      }
    }

    if(!document.querySelector('script[data-store-ring-loader]')){
      const script=document.createElement('script');
      script.src='./store-ring.js';
      script.defer=true;
      script.dataset.storeRingLoader='true';
      document.body.appendChild(script);
    }
  });
})();