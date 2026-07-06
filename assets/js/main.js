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
