'use client';

import { useEffect } from 'react';
import { track, type EventName } from '@/lib/track';

/** Reports clicks on anything marked data-track, so server-rendered links need no client code of their own. */
export function Telemetry() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]');
      if (!el) return;
      const props: Record<string, string> = {};
      if (el.dataset.trackProject) props.project = el.dataset.trackProject;
      if (el.dataset.trackFormat) props.format = el.dataset.trackFormat;
      track(el.dataset.track as EventName, props);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}
