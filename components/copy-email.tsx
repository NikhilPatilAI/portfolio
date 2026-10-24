'use client';

import { useRef, useState } from 'react';
import { track } from '@/lib/track';

type State = 'idle' | 'copied' | 'select';

const labels: Record<State, string> = { idle: 'Copy', copied: 'Copied', select: 'Press Ctrl+C' };

/** Copies the address on click. If the clipboard is blocked, it selects the text instead. */
export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<State>('idle');
  const textRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);

  async function copy() {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setState('copied');
      track('email_copy', { from: 'footer' });
    } catch {
      const node = textRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setState('select');
    }
    timer.current = window.setTimeout(() => setState('idle'), 2600);
  }

  const [user, domain] = email.split('@');
  return (
    <button type="button" className="email-btn" onClick={copy}>
      <span ref={textRef}>
        {user}
        <wbr />@{domain}
      </span>
      <span className="email-state" aria-live="polite">
        {labels[state]}
      </span>
    </button>
  );
}
