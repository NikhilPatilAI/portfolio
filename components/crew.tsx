'use client';

import { useEffect } from 'react';

/**
 * Runs before paint on the Story page: on the first visit of a browser session (or with ?crew in the address) and
 * with motion on, it marks the page for the build crew, so the wireframe is what paints first. If the crew's code
 * never arrives, the mark comes off after six seconds and the page simply shows.
 */
export const crewScript =
  "try{var d=document.documentElement,q=location.search;if(d.dataset.motion!=='reduce'&&q.indexOf('view=quick')<0&&(q.indexOf('crew')>=0||!sessionStorage.getItem('crew'))){d.classList.add('crew');setTimeout(function(){if(!window.__crew)d.classList.remove('crew')},6000)}}catch(e){}";

/** Starts the build crew (lib/crew.ts) for the page it sits in, when the page was marked for it. */
export function Crew() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('crew')) return;
    const main = [...document.querySelectorAll<HTMLElement>('[data-crew]')].find((el) => el.getClientRects().length > 0);
    if (!main) return;
    (window as unknown as { __crew?: boolean }).__crew = true;
    // Tells the motion layer that this page's reveals belong to the crew.
    main.dataset.crew = 'run';
    let stop: (() => void) | undefined;
    let cancelled = false;
    import('@/lib/crew')
      .then((crew) => {
        if (!cancelled) stop = crew.startCrew(main);
      })
      .catch(() => root.classList.remove('crew'));
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);
  return null;
}
