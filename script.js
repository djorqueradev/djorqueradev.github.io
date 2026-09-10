(() => {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Theme toggle ----
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const SUN = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>';
  const MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';

  function systemPrefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyTheme(theme) {
    if (theme) {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
    const isDark = theme ? theme === 'dark' : systemPrefersDark();
    themeIcon.innerHTML = isDark ? MOON : SUN;
  }

  const savedTheme = (() => {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  })();
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || (systemPrefersDark() ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // ---- Mobile nav ----
  const burger = document.getElementById('nav-burger');
  const sheet = document.getElementById('nav-sheet');
  burger.addEventListener('click', () => {
    const open = sheet.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  sheet.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      sheet.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`;
      observer.observe(el);
    });
  }

  // ---- Footer year ----
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---- Tilt on project mockups ----
  if (!prefersReducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      let raf = null;
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateZ(0)`;
        });
      });
      el.addEventListener('pointerleave', () => {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    });
  }
})();
