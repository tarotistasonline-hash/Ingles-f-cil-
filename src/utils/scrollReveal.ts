/**
 * Zero-dependency, GPU-accelerated Scroll Reveal Utility
 * Uses IntersectionObserver to reveal sections and cards smoothly as the user scrolls.
 * Respects prefers-reduced-motion automatically.
 */

export function initScrollReveal(): () => void {
  if (typeof window === 'undefined') return () => {};

  // If browser does not support IntersectionObserver or user prefers reduced motion, reveal all immediately
  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    document.querySelectorAll('.reveal-on-scroll, .scroll-reveal').forEach((el) => {
      el.classList.add('is-revealed');
    });
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  const observeElements = () => {
    const targets = document.querySelectorAll(
      '.reveal-on-scroll:not(.is-revealed), .scroll-reveal:not(.is-revealed)'
    );
    targets.forEach((el) => observer.observe(el));
  };

  // Initial scan
  observeElements();

  // Re-scan when content dynamically renders (tab switches, level changes)
  const mutationObserver = new MutationObserver(() => {
    observeElements();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
    mutationObserver.disconnect();
  };
}
