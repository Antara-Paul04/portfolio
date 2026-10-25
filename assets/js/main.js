/* Scales every design-pixel canvas ([data-fit] > .fit-in) to the width its
   stage actually gets. --w is the canvas width in Figma pixels. */
(function () {
  'use strict';

  var stages = Array.prototype.slice.call(document.querySelectorAll('[data-fit]'));
  if (!stages.length) return;

  function fit(el) {
    var w = parseFloat(getComputedStyle(el).getPropertyValue('--w'));
    if (!w) return;
    el.style.setProperty('--s', el.clientWidth / w);
  }

  if (typeof ResizeObserver === 'function') {
    var ro = new ResizeObserver(function (entries) {
      entries.forEach(function (entry) { fit(entry.target); });
    });
    stages.forEach(function (el) { ro.observe(el); });
  } else {
    var run = function () { stages.forEach(fit); };
    run();
    window.addEventListener('resize', run);
  }

  stages.forEach(fit);

  /* Once the intro has played, drop its clip-paths. animation-fill-mode: both
     otherwise keeps a clip-path on ~14 elements forever, which holds each of
     them on its own compositor layer for the life of the page. Purely a
     release: if this never runs, the CSS fill state already shows the
     finished hero. */
  window.setTimeout(function () {
    document.documentElement.classList.add('hero-settled');
  }, 4100);
})();

/* Inertia scrolling — eases the real scroll position, so the scrollbar,
   anchor links and the footer's scroll-driven parallax all keep working. */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;   // trackpad/mouse only

  /* Fraction of the remaining distance covered per 60Hz frame.
     Higher = snappier, lower = longer glide. Below about 0.18 the trailing
     lag starts reading as lag rather than smoothness. */
  var EASE = 0.26;

  var target = window.scrollY;
  var current = target;
  var raf = null;
  var last = 0;

  function limit() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  /* 'instant' matters: html sets scroll-behavior: smooth for anchor links, and
     without it every frame of the glide would itself get smooth-scrolled. */
  function put(y) {
    window.scrollTo({ top: y, behavior: 'instant' });
  }

  function loop(now) {
    /* Normalise to a 60Hz step so the glide feels identical on a 120Hz
       display instead of settling twice as fast. */
    var dt = last ? Math.min(now - last, 50) : 16.67;
    last = now;
    var k = 1 - Math.pow(1 - EASE, dt / 16.67);

    current += (target - current) * k;
    if (Math.abs(target - current) < 0.5) {
      current = target;
      put(current);
      raf = null;
      last = 0;
      return;
    }
    put(current);
    raf = window.requestAnimationFrame(loop);
  }

  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.defaultPrevented) return;   // leave pinch-zoom alone
    e.preventDefault();

    // deltaMode: 0 = px, 1 = lines, 2 = pages
    var d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);

    if (raf === null) {          // idle: resync to wherever the page actually is
      current = window.scrollY;
      target = current;
      last = 0;
    }
    target = Math.max(0, Math.min(target + d, limit()));
    if (raf === null) raf = window.requestAnimationFrame(loop);
  }, { passive: false });   // preventDefault needs a non-passive listener

  window.addEventListener('resize', function () {
    target = Math.min(target, limit());
  });
})();
/* Ticket accordion: one ticket open at a time. Opening is purely a class
   swap — the CSS width transition does the motion, DOM order never changes.
   Stubs, the arrow buttons, ←/→ keys, and the #playground nav link all
   route through open(). */
(function () {
  'use strict';

  var row = document.querySelector('.tickets');
  if (!row) return;
  var tickets = Array.prototype.slice.call(row.querySelectorAll('.ticket'));
  var current = Math.max(0, tickets.findIndex(function (t) { return t.classList.contains('is-open'); }));

  function open(i) {
    i = (i + tickets.length) % tickets.length;
    tickets.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('is-open', on);
      t.querySelector('.ticket__stub').setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    current = i;
  }

  tickets.forEach(function (t, i) {
    t.querySelector('.ticket__stub').addEventListener('click', function () { open(i); });
  });

  Array.prototype.forEach.call(document.querySelectorAll('.tickets__btn'), function (b) {
    b.addEventListener('click', function () { open(current + Number(b.dataset.dir)); });
  });

  row.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { open(current + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { open(current - 1); e.preventDefault(); }
  });

  /* Nav "Playground" opens that ticket and brings the row into view. */
  Array.prototype.forEach.call(document.querySelectorAll('a[href="#playground"]'), function (a) {
    a.addEventListener('click', function (e) {
      var i = tickets.findIndex(function (t) { return t.id === 'playground'; });
      if (i < 0) return;
      e.preventDefault();
      open(i);
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
})();