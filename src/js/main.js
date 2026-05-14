(function () {
  'use strict';

  const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // ─── Lenis smooth scroll ────────────────────────────────────────────────────
  let lenis;
  if (!reduced && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  // ─── GSAP + ScrollTrigger ────────────────────────────────────────────────────
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);
  }

  // ─── Star SVG helper ─────────────────────────────────────────────────────────
  const starSvg = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.6-5 4.5 1.5 6.5L12 16.9 5.9 20.2l1.5-6.5-5-4.5 6.6-.6z"/></svg>';
  document.querySelectorAll('.stars').forEach(el => { el.innerHTML = starSvg.repeat(5); });

  // ─── Nav scroll state ─────────────────────────────────────────────────────────
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('is-solid', (window.scrollY || window.pageYOffset) > 60);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ─── Mobile menu ──────────────────────────────────────────────────────────────
  const burger = document.getElementById('hamburger');
  const menu   = document.getElementById('mobile-menu');

  const closeMenu = () => {
    burger.classList.remove('is-open');
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.querySelectorAll('[data-m-link]').forEach(a => {
    a.addEventListener('click', () => {
      closeMenu();
      if (lenis) {
        const id = a.getAttribute('href');
        if (id && id.startsWith('#')) {
          setTimeout(() => {
            const target = document.querySelector(id);
            if (target) lenis.scrollTo(target, { offset: -80 });
          }, 100);
        }
      }
    });
  });

  // ─── Anchor smooth-scroll via Lenis ──────────────────────────────────────────
  if (lenis) {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      if (a.hasAttribute('data-m-link')) return;
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80 });
        }
      });
    });
  }

  // ─── Custom cursor ────────────────────────────────────────────────────────────
  if (!reduced && !isCoarse) {
    const c  = document.getElementById('cursor');
    const r  = document.getElementById('cursor-ring');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      c.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      r.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    document.querySelectorAll('[data-cursor], a, button, input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', () => { c.classList.add('is-hover');    r.classList.add('is-hover'); });
      el.addEventListener('mouseleave', () => { c.classList.remove('is-hover'); r.classList.remove('is-hover'); });
    });
  } else {
    document.getElementById('cursor').style.display      = 'none';
    document.getElementById('cursor-ring').style.display = 'none';
  }

  // ─── Magnetic buttons ─────────────────────────────────────────────────────────
  if (!reduced && !isCoarse) {
    document.querySelectorAll('.magnetic').forEach(el => {
      const strength = 0.35;
      const radius   = 90;
      let rect;

      el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
      el.addEventListener('mousemove', (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = e.clientX - cx;
        const dy   = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < radius * 1.6) {
          el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
        }
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ─── Scroll reveals ───────────────────────────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;

      if (el.classList.contains('word-stagger')) {
        el.classList.add('is-on');
        [...el.querySelectorAll('.word > span')].forEach((s, i) => {
          s.style.transitionDelay = (i * 0.08) + 's';
        });
      } else {
        el.classList.add('is-on');
      }

      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.fade-up, .clip-reveal, .word-stagger').forEach(el => {
    if (reduced) { el.classList.add('is-on'); return; }
    // .a i .b w about__images są position:absolute — obserwujemy rodzica, nie je
    if (el.closest('.about__images')) return;
    io.observe(el);
  });

  // About images: dzieci są position:absolute, IO lepiej działa na rodzicu
  const aboutImages = document.querySelector('.about__images');
  if (aboutImages) {
    if (reduced) {
      aboutImages.querySelectorAll('.clip-reveal').forEach(el => el.classList.add('is-on'));
    } else {
      new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          aboutImages.querySelectorAll('.clip-reveal').forEach(el => el.classList.add('is-on'));
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }).observe(aboutImages);
    }
  }

  // Fire hero reveals immediately
  requestAnimationFrame(() => {
    document.documentElement.classList.add('is-ready');

    const h1 = document.getElementById('hero-h1');
    if (h1) {
      h1.classList.add('is-on');
      [...h1.querySelectorAll('.word > span')].forEach((s, i) => {
        s.style.transitionDelay = (0.15 + i * 0.08) + 's';
      });
    }

    const hm = document.getElementById('hero-media');
    if (hm) hm.classList.add('is-on');

    document.querySelectorAll('.hero .fade-up').forEach((el, i) => {
      el.style.transitionDelay = (0.5 + i * 0.12) + 's';
      el.classList.add('is-on');
    });
  });

  // ─── Hero image parallax (GSAP) ───────────────────────────────────────────────
  if (!reduced && typeof gsap !== 'undefined') {
    gsap.to('#hero-img', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // ─── Offer horizontal scroll (desktop only) ───────────────────────────────────
  if (!reduced && typeof gsap !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
    const track = document.getElementById('offer-track');
    const bar   = document.getElementById('offer-bar');

    const totalWidth = () => track.scrollWidth - window.innerWidth + 96;

    gsap.to(track, {
      x: () => -totalWidth(),
      ease: 'none',
      scrollTrigger: {
        trigger: '#offer-pin',
        start: 'top top',
        end: () => '+=' + totalWidth(),
        scrub: 0.6,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (st) => { if (bar) bar.style.width = (st.progress * 100) + '%'; },
      },
    });
  }

  // ─── Gallery + PhotoSwipe ─────────────────────────────────────────────────────
  const galleryImages = [
    { src: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 2000, alt: 'Bukiet w pastelowych odcieniach' },
    { src: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 1067, alt: 'Delikatna kompozycja' },
    { src: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 2400, alt: 'Polne kwiaty' },
    { src: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 1067, alt: 'Biała wiązanka' },
    { src: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 2400, alt: 'Bukiet z piwonii' },
    { src: 'https://images.unsplash.com/photo-1469259943454-aa100abba749?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 1067, alt: 'Eleganckie róże' },
    { src: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 2400, alt: 'Kwiaty w pracowni' },
    { src: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 1067, alt: 'Bukiet w papierze' },
    { src: 'https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 2400, alt: 'W wazonie' },
    { src: 'https://images.unsplash.com/photo-1469259943454-aa100abba749?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 1067, alt: 'Kompozycja w róży' },
    { src: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 1067, alt: 'Pastelowa kompozycja' },
    { src: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80', w: 1600, h: 2400, alt: 'Polne kwiaty na stole' },
  ];

  const galleryIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-on');
      galleryIO.unobserve(e.target);
    });
  }, { threshold: 0 });

  const grid = document.getElementById('gallery');
  galleryImages.forEach((img) => {
    const a       = document.createElement('a');
    a.className   = 'gallery__item clip-reveal';
    a.href        = img.src;
    a.setAttribute('data-pswp-width',  img.w);
    a.setAttribute('data-pswp-height', img.h);
    a.setAttribute('data-cursor', '');
    a.innerHTML   = `<img src="${img.src.replace('w=1600', 'w=900')}" alt="${img.alt}" loading="lazy" width="${img.w}" height="${img.h}" />`;
    grid.appendChild(a);

    if (reduced) a.classList.add('is-on');
    else galleryIO.observe(a);
  });

  if (typeof PhotoSwipeLightbox !== 'undefined') {
    const lightbox = new PhotoSwipeLightbox({
      gallery: '#gallery',
      children: 'a',
      pswpModule: PhotoSwipe,
      bgOpacity: 0.95,
    });
    lightbox.init();
  }

  // ─── Reviews Swiper ───────────────────────────────────────────────────────────
  if (typeof Swiper !== 'undefined') {
    new Swiper('#reviews-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      breakpoints: {
        640:  { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
        1280: { slidesPerView: 4 },
      },
      pagination: { el: '.reviews .swiper-pagination', clickable: true },
    });
  }

  // ─── Botanical divider draw on enter ─────────────────────────────────────────
  const divider = document.getElementById('divider');
  if (divider) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) divider.classList.add('is-on'); });
    }, { threshold: 0.4 }).observe(divider);
  }

  // ─── Contact form ─────────────────────────────────────────────────────────────
  const form   = document.getElementById('formularz');
  const status = document.getElementById('form-status');

  const setFilled = (input) => {
    const field = input.closest('.field');
    if (!field) return;
    field.classList.toggle('is-filled', !!(input.value && input.value.trim().length > 0));
  };

  form.querySelectorAll('input, select, textarea').forEach(el => {
    setFilled(el);
    el.addEventListener('input',  () => {
      setFilled(el);
      el.closest('.field')?.classList.remove('has-error');
      el.closest('.checkbox')?.classList.remove('has-error');
    });
    el.addEventListener('change', () => {
      setFilled(el);
      el.closest('.checkbox')?.classList.remove('has-error');
    });
    el.addEventListener('blur', () => setFilled(el));
  });

  // Autosize textarea
  document.querySelectorAll('[data-autosize]').forEach(t => {
    const resize = () => { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 280) + 'px'; };
    t.addEventListener('input', resize);
    resize();
  });

  // Date min = today
  const dEl = document.getElementById('f-date');
  if (dEl) dEl.min = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    status.classList.remove('show', 'is-success', 'is-error');

    // Required fields
    ['f-name', 'f-phone', 'f-occ', 'f-date'].forEach(id => {
      const el    = document.getElementById(id);
      const f     = el.closest('.field');
      const valid = !!(el.value && el.value.trim().length > 0);
      f.classList.toggle('has-error', !valid);
      if (!valid) ok = false;
    });

    // Optional email format check
    const em = document.getElementById('f-email');
    if (em.value.trim()) {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim());
      em.closest('.field').classList.toggle('has-error', !valid);
      if (!valid) ok = false;
    }

    // RODO checkbox
    const rodo = document.getElementById('f-rodo');
    const lab  = rodo.closest('.checkbox');
    lab.classList.toggle('has-error', !rodo.checked);
    if (!rodo.checked) ok = false;

    if (!ok) {
      status.querySelector('.text').textContent = 'Sprawdź zaznaczone pola i spróbuj ponownie.';
      status.classList.add('show', 'is-error');
      const first = form.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (first) first.focus();
      return;
    }

    // Success (replace with real fetch/API call)
    const payload = Object.fromEntries(new FormData(form).entries());
    console.log('[Sundavilla] form submit:', payload);

    status.querySelector('.text').textContent = 'Dziękujemy! Skontaktujemy się wkrótce.';
    status.classList.add('show', 'is-success');
    form.reset();
    form.querySelectorAll('.field').forEach(f => f.classList.remove('is-filled', 'has-error'));
  });
})();
