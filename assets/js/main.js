/* OSA — small progressive-enhancement layer.
   Bootstrap handles the navbar toggle & collapse; this only adds
   a subtle reveal-on-scroll for cards and section headings. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    var targets = document.querySelectorAll(
      '.section-head, .meeting-card, .newsletter-card, .hero-title, .hero-lead, .hero-actions'
    );

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    targets.forEach(function (el) { el.classList.add('reveal'); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  });
})();

/* ---------------------------------------------------------------------------
 * Language switcher — remember the choice so the gateway pages (/, /about/, …)
 * can send this visitor straight to the right language next time.
 * The link itself does the navigating; this only records the preference.
 * localStorage throws in private mode and when site data is blocked, so every
 * access is guarded.
 * ------------------------------------------------------------------------- */
(function () {
  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-lang]');
    if (!link) return;
    try {
      window.localStorage.setItem('lang', link.getAttribute('data-lang'));
    } catch (e) {
      /* preference simply is not remembered */
    }
  });
})();

/* ---------------------------------------------------------------------------
 * Gallery lightbox — keyboard and loading behaviour.
 *
 * Bootstrap gives us Esc, backdrop-click, focus trapping, scroll locking and
 * touch swipe for free. Its carousel also handles arrow keys, but only while
 * focus sits inside the carousel itself — in a modal focus lands on the dialog,
 * so the keys do nothing. This binds them at document level for as long as a
 * gallery is open, and adds a slide counter plus neighbour preloading.
 * ------------------------------------------------------------------------- */
(function () {
  var galleries = document.querySelectorAll('.galerij-modal');
  if (!galleries.length || typeof bootstrap === 'undefined') return;

  Array.prototype.forEach.call(galleries, function (modal) {
    var carouselEl = modal.querySelector('.carousel');
    if (!carouselEl) return;

    var items = modal.querySelectorAll('.carousel-item');
    var counter = modal.querySelector('.galerij-counter');
    var carousel = null;

    function index() {
      return Array.prototype.indexOf.call(items, carouselEl.querySelector('.carousel-item.active'));
    }

    /* Slides are lazy-loaded so opening a gallery does not pull every photo.
       Un-lazy the current one and its neighbours so paging feels instant. */
    function preload(i) {
      [i - 1, i, i + 1].forEach(function (n) {
        var item = items[(n + items.length) % items.length];
        var img = item && item.querySelector('img');
        if (img) img.loading = 'eager';
      });
    }

    function sync() {
      var i = index();
      if (counter) counter.textContent = (i + 1) + ' / ' + items.length;
      preload(i);
    }

    function onKey(event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      var handled = true;
      switch (event.key) {
        case 'ArrowLeft':  carousel.prev(); break;
        case 'ArrowRight': carousel.next(); break;
        case 'Home':       carousel.to(0); break;
        case 'End':        carousel.to(items.length - 1); break;
        default:           handled = false;
      }
      if (handled) event.preventDefault();
    }

    modal.addEventListener('shown.bs.modal', function () {
      // interval: false — a lightbox that advances on its own is infuriating
      carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl, { interval: false });
      if (items.length > 1) document.addEventListener('keydown', onKey);
      sync();
    });

    modal.addEventListener('hidden.bs.modal', function () {
      document.removeEventListener('keydown', onKey);
    });

    carouselEl.addEventListener('slid.bs.carousel', sync);
  });
})();

/* ---------------------------------------------------------------------------
 * Section deep links — clicking the icon beside a heading copies that
 * section's URL, so a visitor can share a link straight to it.
 *
 * The icon is a real <a href="#id">, so it still works as a jump link with
 * JavaScript off, or when the clipboard is refused. On success we update the
 * address bar with replaceState rather than letting the link navigate: the
 * default jump would scroll the heading under the fixed navbar for no reason,
 * since the reader is already looking at it.
 * ------------------------------------------------------------------------- */
(function () {
  'use strict';

  var RESET_MS = 1800;
  var status = null;

  // One shared live region; a CSS ::after bubble is invisible to screen readers.
  function announce(message) {
    if (!status) {
      status = document.createElement('span');
      status.className = 'visually-hidden';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      document.body.appendChild(status);
    }
    status.textContent = message;
  }

  function copy(text) {
    // The async API needs a secure context: https, or localhost while testing.
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;top:0;left:-9999px';
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { /* ok stays false */ }
      document.body.removeChild(field);
      ok ? resolve() : reject();
    });
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('.heading-anchor') : null;
    if (!link) return;
    event.preventDefault();

    var url = link.href; // absolute, hash included

    copy(url).then(function () {
      if (window.history && history.replaceState) history.replaceState(null, '', url);
      link.classList.add('is-copied');
      announce(link.getAttribute('data-copied') || '');
      clearTimeout(link.copiedTimer);
      link.copiedTimer = setTimeout(function () {
        link.classList.remove('is-copied');
      }, RESET_MS);
    }, function () {
      // Clipboard unavailable or blocked — behave like the plain link it is.
      window.location.hash = link.getAttribute('href');
    });
  });
})();
