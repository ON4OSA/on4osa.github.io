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
