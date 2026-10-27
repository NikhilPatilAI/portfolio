'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { site } from '@/data/content';
import { toggleMotion } from '@/lib/motion-pref';
import { track } from '@/lib/track';
import { AskButton } from './ask-button';

// The palette's code loads only when someone opens it.
const CommandPalette = dynamic(() => import('./command-palette'), { ssr: false });

export type PaletteMode = 'palette' | 'help' | 'ask';

const typing = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

let greeted = false;

/**
 * Keyboard shortcuts for the whole site: ⌘K or Ctrl+K, ?, A, Q and M, plus the Ask Nikhil button for everyone without
 * a keyboard. Also says hello in the console, once per visit.
 */
export function Shortcuts() {
  const [mode, setMode] = useState<PaletteMode | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (greeted) return;
    greeted = true;
    console.log(
      `%cHi, I'm ${site.name}.%c\nYou're reading the source of a site that shows its work. Say hello: ${site.email}`,
      'font: 800 16px/1.4 system-ui, sans-serif; color: #111318; background: linear-gradient(90deg, #ff4d4d, #ffc61a, #14c98a, #1fa2ff, #b266ff); padding: 4px 10px; border-radius: 8px;',
      'font: 13px/1.6 system-ui, sans-serif; color: #3b3f48;',
    );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMode((m) => (m ? null : 'palette'));
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target) || mode) return;
      if (e.key === '?') {
        e.preventDefault();
        setMode('help');
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setMode('ask');
      } else if (e.key.toLowerCase() === 'q') {
        const quick = new URLSearchParams(window.location.search).get('view') === 'quick';
        try {
          window.localStorage.setItem('view', quick ? 'story' : 'quick');
        } catch {
          // Storage can be blocked; the switch still works for this visit.
        }
        track('quick_view_toggle', { to: quick ? 'story' : 'quick' });
        router.push(quick ? '/' : '/?view=quick');
      } else if (e.key.toLowerCase() === 'm') {
        toggleMotion();
      }
    };
    const onOpen = (e: Event) => setMode((e as CustomEvent<PaletteMode>).detail ?? 'palette');
    window.addEventListener('keydown', onKey);
    window.addEventListener('palette:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('palette:open', onOpen);
    };
  }, [mode, router]);

  return (
    <>
      <AskButton away={mode !== null} onOpen={() => setMode('ask')} />
      {mode ? <CommandPalette mode={mode} onMode={setMode} onClose={() => setMode(null)} /> : null}
    </>
  );
}

const noSubscribe = () => () => {};
const appleKeys = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** A small button that opens the palette or the shortcut list, for people who don't use shortcuts. Shows ⌘ on Apple keyboards, Ctrl elsewhere. */
export function PaletteButton({ mode = 'palette', label }: { mode?: PaletteMode; label: string }) {
  const mod = useSyncExternalStore(noSubscribe, () => (appleKeys() ? '⌘' : 'Ctrl'), () => 'Ctrl');
  return (
    <button
      type="button"
      className={mode === 'help' ? 'kbd-hint keys-only' : 'kbd-hint'}
      aria-keyshortcuts={mode === 'help' ? '?' : 'Control+K Meta+K'}
      onClick={() => window.dispatchEvent(new CustomEvent('palette:open', { detail: mode }))}
    >
      {label} <kbd>{mode === 'help' ? '?' : `${mod} K`}</kbd>
    </button>
  );
}
