(function () {
  'use strict';

  if (typeof emailjs !== 'undefined') {
    emailjs.init('FB41naf9YGA9bYH6m');
  }

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
    burger.setAttribute('aria-label', 'Otwórz menu');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
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
    // Hero animuje się samym CSS-em (_hero.scss)
    if (el.closest('.hero')) return;
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

  requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));

  // ─── Hero image parallax (GSAP) ───────────────────────────────────────────────
  if (!reduced && typeof gsap !== 'undefined' && document.getElementById('hero-img')) {
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
  const offerTrack = document.getElementById('offer-track');
  if (!reduced && offerTrack && typeof gsap !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
    const track = offerTrack;
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
  const grid = document.getElementById('gallery');
  if (grid) {
    const galleryImages = [
      { src: './Img/Gallery_1.webp',  w: 1000, h: 964,  alt: 'Bukiet w pastelowych odcieniach' },
      { src: './Img/Gallery_2.webp',  w: 768,  h: 1024, alt: 'Delikatna kompozycja' },
      { src: './Img/Gallery_3.webp',  w: 1000, h: 1333, alt: 'Polne kwiaty' },
      { src: './Img/Gallery_4_.webp', w: 1000, h: 1333, alt: 'Biała wiązanka' },
      { src: './Img/Gallery_5.webp',  w: 1000, h: 1333, alt: 'Bukiet z piwonii' },
      { src: './Img/Gallery_6.webp',  w: 1000, h: 1333, alt: 'Eleganckie róże' },
      { src: './Img/Gallery_7_.webp', w: 1000, h: 1333, alt: 'Kwiaty w pracowni' },
      { src: './Img/Gallery_8.webp',  w: 1000, h: 1333, alt: 'Bukiet w papierze' },
      { src: './Img/Gallery_9.webp',  w: 1000, h: 1333, alt: 'W wazonie' },
      { src: './Img/Gallery_10.webp', w: 1000, h: 1333, alt: 'Kompozycja w róży' },
      { src: './Img/Gallery_11.webp', w: 1000, h: 1333, alt: 'Pastelowa kompozycja' },
      { src: './Img/Gallery_12_.webp',w: 1000, h: 1333, alt: 'Polne kwiaty na stole' },
    ];

    const galleryIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-on');
        galleryIO.unobserve(e.target);
      });
    }, { threshold: 0 });

    galleryImages.forEach((img) => {
      const a       = document.createElement('a');
      a.className   = 'gallery__item clip-reveal';
      a.href        = img.src;
      a.setAttribute('data-pswp-width',  img.w);
      a.setAttribute('data-pswp-height', img.h);
      // Miniatura z wariantów 480/720 px; PhotoSwipe (href) otwiera oryginał
      const base    = img.src.replace('.webp', '');
      a.innerHTML   = `<img src="${base}-480.webp" srcset="${base}-480.webp 480w, ${base}-720.webp 720w, ${img.src} ${img.w}w"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 48px)"
        alt="${img.alt}" loading="lazy" width="${img.w}" height="${img.h}" />`;
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
  }

  // ─── Reviews Swiper ───────────────────────────────────────────────────────────
  if (typeof Swiper !== 'undefined' && document.getElementById('reviews-swiper')) {
    new Swiper('#reviews-swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: 2,
          spaceBetween: 28,
          grid: { rows: 2, fill: 'row' },
        },
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

  if (form) {
    const setFilled = (input) => {
      const field = input.closest('.field');
      if (!field) return;
      field.classList.toggle('is-filled', !!(input.value && input.value.trim().length > 0));
    };

    form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(el => {
      setFilled(el);
      el.addEventListener('input',  () => {
        setFilled(el);
        el.closest('.field')?.classList.remove('has-error');
        el.closest('.checkbox')?.classList.remove('has-error');
        el.setAttribute('aria-invalid', 'false');
      });
      el.addEventListener('change', () => {
        setFilled(el);
        el.closest('.checkbox')?.classList.remove('has-error');
      });
      el.addEventListener('blur', () => setFilled(el));
    });

    // Blokada cyfr w imieniu i nazwisko
    document.getElementById('f-name').addEventListener('input', function () {
      this.value = this.value.replace(/[0-9]/g, '');
    });

    // Tylko cyfry i znaki telefonu
    document.getElementById('f-phone').addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9+\-() ]/g, '');
    });

    // Budżet — po opuszczeniu pola sprawdź, czy kwota nie jest niższa niż minimum
    document.getElementById('f-budget').addEventListener('blur', function () {
      const field = this.closest('.field');
      if (this.value.trim() !== '' && Number(this.value) < 50) {
        field.classList.add('has-error');
      }
    });

    // Autosize textarea
    document.querySelectorAll('[data-autosize]').forEach(t => {
      const resize = () => { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 280) + 'px'; };
      t.addEventListener('input', resize);
      resize();
    });

    // Data i godzina odbioru — min = teraz (czas lokalny, format YYYY-MM-DDTHH:MM)
    const dEl    = document.getElementById('f-date');
    const dOut   = document.getElementById('f-date-out');
    const pad    = (n) => String(n).padStart(2, '0');
    const toLocalInput = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    dEl.min = toLocalInput(new Date());

    // Poprawny termin: nie w przeszłości, pn–sob, 07:30–20:30
    const validPickup = (value) => {
      if (!value) return false;
      const d = new Date(value);
      if (isNaN(d) || d < new Date()) return false;
      const mins = d.getHours() * 60 + d.getMinutes();
      return d.getDay() !== 0 && mins >= 7 * 60 + 30 && mins <= 20 * 60 + 30;
    };

    // Np. „czwartek, 25.09.2026, godz. 14:30” — trafia do maila jako {{date}}
    const formatPickup = (value) => {
      const d = new Date(value);
      const day = d.toLocaleDateString('pl-PL', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
      return `${day}, godz. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      status.classList.remove('show', 'is-success', 'is-error');

      // Wymagane pola tekstowe / select / wiadomość
      ['f-name', 'f-phone', 'f-occ', 'f-msg'].forEach(id => {
        const el    = document.getElementById(id);
        const f     = el.closest('.field');
        const valid = !!(el.value && el.value.trim().length > 0);
        f.classList.toggle('has-error', !valid);
        el.setAttribute('aria-invalid', String(!valid));
        if (!valid) ok = false;
      });

      // Data i godzina odbioru
      const dValid = validPickup(dEl.value);
      dEl.closest('.field').classList.toggle('has-error', !dValid);
      dEl.setAttribute('aria-invalid', String(!dValid));
      if (!dValid) ok = false;
      dOut.value = dValid ? formatPickup(dEl.value) : '';

      // Email — wymagany i poprawny format
      const em      = document.getElementById('f-email');
      const emValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim());
      em.closest('.field').classList.toggle('has-error', !emValid);
      em.setAttribute('aria-invalid', String(!emValid));
      if (!emValid) ok = false;

      // Budżet — wymagany, min. 50 zł
      const bud      = document.getElementById('f-budget');
      const budValid = bud.value.trim() !== '' && Number(bud.value) >= 50;
      bud.closest('.field').classList.toggle('has-error', !budValid);
      bud.setAttribute('aria-invalid', String(!budValid));
      if (!budValid) ok = false;

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

      const btn         = form.querySelector('[type="submit"]');
      const btnOriginal = btn.innerHTML;
      btn.disabled  = true;
      btn.innerHTML = 'Wysyłanie… <span aria-hidden="true">⟳</span>';

      const done = (success) => {
        btn.disabled  = false;
        btn.innerHTML = btnOriginal;
        if (success) {
          status.querySelector('.text').textContent = 'Dziękujemy! Skontaktujemy się wkrótce.';
          status.classList.add('show', 'is-success');
          form.reset();
          form.querySelectorAll('.field').forEach(f => f.classList.remove('is-filled', 'has-error'));
        } else {
          status.querySelector('.text').textContent = 'Coś poszło nie tak. Zadzwoń do nas lub spróbuj ponownie.';
          status.classList.add('show', 'is-error');
        }
      };

      emailjs.sendForm('service_x19a3yn', 'template_00pymrm', form)
        .then(() => {
          // autoodpowiedź do klienta (uzupełnij AUTOREPLY_TEMPLATE_ID)
          const email    = document.getElementById('f-email').value.trim();
          const name     = document.getElementById('f-name').value.trim();
          const occasion = document.getElementById('f-occ').value;
          const date     = dOut.value;
          const budget   = document.getElementById('f-budget').value;
          if (email && typeof emailjs !== 'undefined') {
            emailjs.send('service_x19a3yn', 'template_2rtae9h', { name, email, occasion, date, budget });
          }
          done(true);
        })
        .catch(() => done(false));
    });
  }
})();
