'use client';

import { useSyncExternalStore } from 'react';
import { toggleMotion } from '@/lib/motion-pref';

const subscribe = () => () => {};

/** "Reduce motion" on or off. The server cannot know the choice, so it renders the default and the browser corrects it. */
export function MotionSwitch() {
  const reduced = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.motion === 'reduce',
    () => false,
  );
  return (
    <button type="button" className="kbd-hint motion-switch" aria-pressed={reduced} onClick={toggleMotion}>
      Reduce motion: {reduced ? 'On' : 'Off'}
    </button>
  );
}
