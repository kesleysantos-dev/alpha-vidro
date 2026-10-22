(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const body = document.body;
  const header = document.querySelector('.header');

  // Loader
  body.classList.add('is-loading');
  const finishLoad = () => {
    body.classList.remove('is-loading');
    document.documentElement.classList.add('loaded');
  };
  window.addEventListener('load', () => setTimeout(finishLoad, 500));
  setTimeout(finishLoad, 3500);

  // Hero title: wrap each line so it slides up
  document.querySelectorAll('.split').forEach((el, i) => {
    el.innerHTML = `<span style="--d:${0.35 + i * 0.14}s">${el.innerHTML}</span>`;
  });

  // Hero video: make sure it keeps looping even if autoplay is interrupted
  const video = document.querySelector('.hero__video');
  if (video) {
    video.play().catch(() => {});
    video.addEventListener('ended', () => { video.currentTime = 0; video.play(); });
  }

  // Reveal on scroll with sibling stagger
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.setProperty('--d', `${idx * 0.1}s`);
    io.observe(el);
  });

  // Counters
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const dur = 1800;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

  // Parallax + header state
  const layers = [...document.querySelectorAll('[data-parallax]')];
  let lastY = 0;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;

    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hidden', y > lastY && y > vh * 0.8 && !body.classList.contains('menu-open'));
    lastY = y;

    if (!reduce) {
      layers.forEach((el) => {
        const rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const speed = parseFloat(el.dataset.parallax);
        const offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      const hero = document.querySelector('.hero__content');
      if (hero) hero.style.opacity = Math.max(1 - y / (vh * 0.7), 0);
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  // Active nav link
  const links = [...document.querySelectorAll('.nav a')];
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((a) => {
    const sec = document.querySelector(a.getAttribute('href'));
    if (sec) navIO.observe(sec);
  });

  // Mobile menu
  const burger = document.querySelector('.burger');
  const toggleMenu = (open) => {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', () => toggleMenu(!body.classList.contains('menu-open')));
  links.forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

  // Carousel: duplicate slides for a seamless right-to-left loop
  const track = document.querySelector('.carousel__track');
  if (track) {
    [...track.children].forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  if (fine && !reduce) {
    // Card tilt + glow following the cursor
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // Magnetic buttons
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // Form -> WhatsApp
  const form = document.getElementById('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const text = `Olá, Alpha Vidro! Meu nome é ${d.get('nome')}.\nTenho interesse em: ${d.get('servico')}.\nTelefone: ${d.get('tel')}` +
      (d.get('msg') ? `\n\n${d.get('msg')}` : '');
    window.open(`https://wa.me/5500000000000?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  document.getElementById('ano').textContent = new Date().getFullYear();
})();
