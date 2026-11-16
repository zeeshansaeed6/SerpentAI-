import { useEffect } from 'react';

// Publishes pointer position as CSS variables (rAF-throttled, no React renders):
//   --px/--py  on <html>  → ambient light that follows the cursor
//   --mx/--my  on the hovered .glass-card → spotlight inside that card
// Skipped on touch devices and for reduced-motion users.
export const usePointerGlow = () => {
  useEffect(() => {
    const skip =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (skip) return undefined;

    let frame = 0;
    let x = 0;
    let y = 0;
    let card = null;

    const flush = () => {
      frame = 0;
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty('--px', `${x}px`);
      rootStyle.setProperty('--py', `${y}px`);
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${x - rect.left}px`);
        card.style.setProperty('--my', `${y - rect.top}px`);
      }
    };

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;
      card = event.target instanceof Element ? event.target.closest('.glass-card') : null;
      if (!frame) frame = requestAnimationFrame(flush);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
};
