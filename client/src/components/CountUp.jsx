import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

// Counts up to `to` by writing straight to the DOM node (no React re-renders per frame).
// Reduced-motion users get the final value immediately.
export default function CountUp({ to, decimals = 0, prefix = '', suffix = '', delay = 0, duration = 1.8 }) {
  const ref = useRef(null);

  useGSAP(() => {
    const el = ref.current;
    const format = (value) =>
      `${prefix}${value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}${suffix}`;

    el.textContent = format(to);

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const counter = { value: 0 };
      el.textContent = format(0);
      gsap.to(counter, {
        value: to,
        duration,
        delay,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = format(counter.value); }
      });
    });
  }, { scope: ref });

  return <span ref={ref} />;
}
