(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const media = {
      news:{ still:'./assets/news.png', anim:'./assets/news.gif' },
      rankings:{ still:'./assets/rankings.png', anim:'./assets/wiki.gif' },
      bazaar:{ still:'./assets/bazaar.png', anim:'./assets/community.gif' },
      community:{ still:'./assets/community.png', anim:'./assets/bazaar.gif' },
      server:{ still:'./assets/server-info.png', anim:'./assets/server-info.gif' },
      wiki:{ still:'./assets/wiki.png', anim:'./assets/rankings.gif' }
    };

    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Preload animated sources so hover never flashes while the GIF is fetched. */
    if(!reduced){
      Object.values(media).forEach(({anim}) => {
        const image=new Image();
        image.src=anim;
      });
    }

    const menuButton=document.querySelector('#menuToggle');
    const siteMenu=document.querySelector('#siteMenu');

    const closeMenu=() => {
      if(!siteMenu || !menuButton) return;
      siteMenu.hidden=true;
      menuButton.setAttribute('aria-expanded','false');
    };

    menuButton?.addEventListener('click',()=>{
      const open=menuButton.getAttribute('aria-expanded')!=='true';
      menuButton.setAttribute('aria-expanded',String(open));
      if(siteMenu) siteMenu.hidden=!open;
    });

    siteMenu?.addEventListener('click',(event)=>{
      if(event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown',(event)=>{
      if(event.key==='Escape') closeMenu();
    });

    document.addEventListener('pointerdown',(event)=>{
      if(siteMenu?.hidden) return;
      if(siteMenu?.contains(event.target) || menuButton?.contains(event.target)) return;
      closeMenu();
    });

    const sectionTargets=['#news','#rankings','#store','#community','#top','#wiki'];
    const sectionIcons=[
      media.news,
      media.rankings,
      media.bazaar,
      media.community,
      media.server,
      media.wiki
    ];

    [...document.querySelectorAll('.info-card')].forEach((card,index)=>{
      const icon=card.querySelector('.info-icon');
      const iconMedia=sectionIcons[index];

      if(icon && iconMedia){
        icon.innerHTML='<img class="portal-icon-image" src="'+iconMedia.still+'" data-still="'+iconMedia.still+'" data-animated="'+iconMedia.anim+'" alt="" decoding="async" draggable="false">';
        const image=icon.querySelector('.portal-icon-image');

        if(!reduced && image){
          const showAnimated=()=>{
            if(image.src.endsWith(iconMedia.anim.replace('./',''))) return;
            image.src=iconMedia.anim;
          };
          const showStill=()=>{ image.src=iconMedia.still; };

          card.addEventListener('pointerenter',showAnimated);
          card.addEventListener('pointerleave',showStill);
          card.addEventListener('focusin',showAnimated);
          card.addEventListener('focusout',showStill);
        }
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

      const openTarget=()=>{
        const selector=sectionTargets[index];
        const target=document.querySelector(selector);
        if(!target) return;

        if(selector==='#community' || selector==='#wiki'){
          target.animate(
            [
              {filter:'brightness(1)'},
              {filter:'brightness(1.35)'},
              {filter:'brightness(1)'}
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