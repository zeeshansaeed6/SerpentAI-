import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Tweens a displayed integer from its previous value to `value` by writing to the DOM node
// directly (no per-frame React renders). Reduced-motion users get the new value immediately.
export default function AnimatedNumber({ value, duration = 0.7 }) {
  const ref = useRef(null);
  const shown = useRef(0);

  useGSAP(() => {
    const el = ref.current;
    const show = (v) => { el.textContent = String(Math.round(v)); };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shown.current = value;
      show(value);
      return;
    }

    const state = { v: shown.current };
    gsap.to(state, {
      v: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        shown.current = state.v;
        show(state.v);
      }
    });
  }, { dependencies: [value], scope: ref });

  return <span ref={ref} />;
}
