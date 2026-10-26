'use client';

import { useEffect } from 'react';

/** Marks the card illustrations that are on screen with .is-live, so their CSS animations only run while visible. */
export function LiveObserver({ selector }: { selector: string }) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.target.classList.toggle('is-live', entry.isIntersecting)),
      { rootMargin: '80px' },
    );
    const els = [...document.querySelectorAll(selector)].filter((el) => el.getClientRects().length > 0);
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      els.forEach((el) => el.classList.remove('is-live'));
    };
  }, [selector]);
  return null;
}
