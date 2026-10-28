import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenis = null;

// Smooth (eased) wheel scrolling for the page. Touch keeps the native scroll, and
// Lenis turns itself off for readers who prefer reduced motion.
export function initSmoothScroll() {
  if (lenis || typeof window === 'undefined') return lenis;
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    // Drawers, modals and menus scroll natively instead of moving the page.
    prevent: (node) => node.matches('[role="dialog"], [role="menu"], [data-lenis-prevent]'),
  });

  // Pause Lenis while a drawer or modal is open (Chakra portals them into <body>),
  // so wheeling over the overlay doesn't scroll the page behind it.
  const syncLock = () => {
    if (document.querySelector('[aria-modal="true"]')) lenis.stop();
    else lenis.start();
  };
  new MutationObserver(syncLock).observe(document.body, { childList: true, subtree: true });
  return lenis;
}

// Scroll the page to `top`, through Lenis when it's running so the easing matches.
export function scrollToTop(top = 0) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (lenis && !reduceMotion) lenis.scrollTo(top);
  else window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
}
