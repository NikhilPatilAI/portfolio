'use client';

import { useEffect, useRef } from 'react';

const STAGES = ['Embed', 'Attend', 'Fire', 'Learn', 'Descend', 'Generate'];

/**
 * The AI lab beside the name. The markup is server-rendered so nothing shifts; the drawing code loads once the
 * browser is idle after hydration. With reduced motion every stage is a single still frame you can step through.
 */
export function LabStage() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const canvas = el?.querySelector('canvas');
    const hud = el?.querySelector<HTMLElement>('.lab-hud');
    if (!el || !canvas || !hud) return;
    const buttons = [...el.querySelectorAll<HTMLButtonElement>('button[data-stage]')];
    const still = document.documentElement.dataset.motion === 'reduce';
    let lab: { destroy(): void } | null = null;
    let cancelled = false;
    const start = () => {
      // The fonts matter: the canvas draws its labels and the NP monogram in Atkinson.
      Promise.all([import('@/lib/lab'), document.fonts.ready]).then(([{ createLab }]) => {
        if (cancelled) return;
        lab = createLab({ root: el, canvas, hud, buttons, still });
        if (lab) el.classList.add('lab-on');
      });
    };
    // Safari has no requestIdleCallback; a short timeout does the same job there.
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const idle = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 300);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      lab?.destroy();
      el.classList.remove('lab-on');
    };
  }, []);

  return (
    <div className="lab" ref={root}>
      <p className="sr-only">A small live model beside the name walks through six steps of how AI works: embedding, attention, a forward pass, training, optimization and generation.</p>
      <canvas className="lab-canvas" aria-hidden="true" />
      <div className="lab-top" aria-hidden="true">
        <p className="lab-cap">
          <b />
          Live · a tiny model, showing its work
        </p>
        <p className="lab-hud" />
      </div>
      <div className="lab-stages" role="group" aria-label="Steps of the live model">
        {STAGES.map((name, i) => (
          <button key={name} type="button" data-stage={i} aria-pressed={i === 0} className={i === 0 ? 'on' : undefined}>
            <b>{String(i + 1).padStart(2, '0')}</b>
            {name}
            <i aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
