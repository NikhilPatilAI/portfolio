'use client';

import { useEffect } from 'react';

const WAKE = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'] as const;
let woken = false;

/**
 * Loads the motion layer for the page it sits in, unless the visitor reduced motion. Smooth scroll, reveals and the
 * cursor only matter once someone moves, so the layer loads on the first pointer move, scroll, touch or key press;
 * the first seconds stay free for the content. When Next.js hides the page (it keeps recent pages alive), the effect
 * cleans up; when the page comes back, it sets everything up again.
 */
export function MotionRoot() {
  useEffect(() => {
    if (document.documentElement.dataset.motion === 'reduce') return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const load = () => {
      woken = true;
      WAKE.forEach((type) => window.removeEventListener(type, load));
      import('@/lib/motion')
        .then((motion) => {
          if (cancelled) return;
          motion.startGlobal();
          dispose = motion.initPage();
        })
        .catch(() => {
          // Without the motion layer the page is simply still, which is fine.
        });
    };
    if (woken) load();
    else WAKE.forEach((type) => window.addEventListener(type, load, { passive: true }));
    return () => {
      cancelled = true;
      WAKE.forEach((type) => window.removeEventListener(type, load));
      dispose?.();
    };
  }, []);
  return null;
}
