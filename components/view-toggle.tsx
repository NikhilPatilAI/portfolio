'use client';

import Link from 'next/link';
import { track } from '@/lib/track';

type View = 'story' | 'quick';

function remember(view: View) {
  try {
    window.localStorage.setItem('view', view);
  } catch {
    // Private windows can refuse storage; the toggle still works for this visit.
  }
  track('quick_view_toggle', { to: view });
}

/** Switches between the full Story page and the one-column Quick view, and remembers the choice. */
export function ViewToggle({ current }: { current: View }) {
  return (
    <span className="view-toggle" role="group" aria-label="How to read this site">
      <Link href="/" aria-current={current === 'story' ? 'page' : undefined} onClick={() => current !== 'story' && remember('story')}>
        Story
      </Link>
      <Link href="/?view=quick" aria-current={current === 'quick' ? 'page' : undefined} onClick={() => current !== 'quick' && remember('quick')}>
        Quick view
      </Link>
    </span>
  );
}
