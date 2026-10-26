'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { podcast, projects, site, socials, type Hue } from '@/data/content';
import { AskPanel } from './ask-panel';
import { isMotionReduced, toggleMotion } from '@/lib/motion-pref';
import { tint } from '@/lib/style';
import { track } from '@/lib/track';
import type { PaletteMode } from './shortcuts';

type Action =
  | { kind: 'go'; href: string; project?: string }
  | { kind: 'open'; href: string }
  | { kind: 'view'; to: 'story' | 'quick' }
  | { kind: 'resume'; format: 'page' | 'pdf' }
  | { kind: 'copy' }
  | { kind: 'motion' }
  | { kind: 'help' }
  | { kind: 'ask'; question?: string };

interface Command {
  label: string;
  hint: string;
  hue: Hue;
  keywords?: string;
  action: Action;
}

const shortcuts: [string, string][] = [
  ['⌘K or Ctrl+K', 'Open this command palette'],
  ['A', 'Ask Nikhil a question'],
  ['?', 'Show these shortcuts'],
  ['Q', 'Switch between Story and Quick view'],
  ['M', 'Turn motion on or off'],
  ['Esc', 'Close any panel'],
];

function listCommands(copied: boolean, reduced: boolean): Command[] {
  return [
    { label: 'Ask Nikhil a question', hint: 'AI', hue: 'grape', keywords: 'ai chat assistant question answer', action: { kind: 'ask' } },
    { label: 'Selected work', hint: 'Section', hue: 'sky', keywords: 'projects', action: { kind: 'go', href: '/#work' } },
    ...projects.map<Command>((p) => ({ label: `${p.title} case study`, hint: 'Project', hue: p.hue, keywords: p.fullTitle, action: { kind: 'go', href: `/work/${p.slug}`, project: p.slug } })),
    { label: 'About me', hint: 'Section', hue: 'grape', action: { kind: 'go', href: '/#about' } },
    { label: 'Experience', hint: 'Section', hue: 'lime', keywords: 'jobs roles education', action: { kind: 'go', href: '/#experience' } },
    { label: 'Stack', hint: 'Section', hue: 'mango', keywords: 'skills tools', action: { kind: 'go', href: '/#stack' } },
    { label: `${podcast.name} podcast`, hint: 'Section', hue: 'iris', keywords: 'teaching episodes', action: { kind: 'go', href: '/#teaching' } },
    { label: 'Contact', hint: 'Section', hue: 'grape', keywords: 'email hire', action: { kind: 'go', href: '/#contact' } },
    { label: 'Quick view', hint: 'View', hue: 'sun', keywords: 'recruiter summary one page', action: { kind: 'view', to: 'quick' } },
    { label: 'Story view', hint: 'View', hue: 'sun', keywords: 'full', action: { kind: 'view', to: 'story' } },
    { label: 'Resume', hint: 'Page', hue: 'mango', keywords: 'cv', action: { kind: 'resume', format: 'page' } },
    { label: 'Download the resume as a PDF', hint: 'File', hue: 'mango', keywords: 'cv pdf', action: { kind: 'resume', format: 'pdf' } },
    { label: copied ? 'Copied the email address' : 'Copy the email address', hint: site.email, hue: 'mint', keywords: 'mail contact', action: { kind: 'copy' } },
    { label: reduced ? 'Turn motion back on' : 'Reduce motion', hint: 'Setting', hue: 'sea', keywords: 'animation accessibility', action: { kind: 'motion' } },
    { label: 'How I built this', hint: 'Page', hue: 'mint', action: { kind: 'go', href: '/how-i-built-this' } },
    { label: 'What I am doing now', hint: 'Page', hue: 'sun', keywords: 'now', action: { kind: 'go', href: '/now' } },
    { label: 'All links', hint: 'Page', hue: 'rose', action: { kind: 'go', href: '/links' } },
    { label: 'LinkedIn', hint: 'External', hue: 'sky', action: { kind: 'open', href: socials.linkedin.href } },
    { label: 'GitHub', hint: 'External', hue: 'lime', action: { kind: 'open', href: socials.github.href } },
    { label: 'Podcast on Spotify', hint: 'External', hue: 'mint', action: { kind: 'open', href: podcast.show.href } },
    { label: 'Keyboard shortcuts', hint: '?', hue: 'iris', action: { kind: 'help' } },
  ];
}

// Typing something that reads like a question offers to ask it, above the matching commands.
const looksLikeQuestion = (q: string) => q.includes('?') || q.split(/\s+/).length >= 3;

/** ⌘K: jump anywhere, copy the email, switch views or motion, or ask a question. Built on the native <dialog>, so focus and Esc just work. */
export default function CommandPalette({ mode, onMode, onClose }: { mode: PaletteMode; onMode: (m: PaletteMode) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [reduced] = useState(isMotionReduced);
  const [question, setQuestion] = useState<string>();

  useEffect(() => {
    const d = dialog.current;
    if (!d || d.open) return;
    d.showModal();
    // showModal focuses the first control it finds; the text box is where typing should start.
    d.querySelector<HTMLInputElement>('.ask-input, .palette-search')?.focus();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = listCommands(copied, reduced);
    if (!q) return all;
    const found = all.filter((c) => `${c.label} ${c.keywords ?? ''} ${c.hint}`.toLowerCase().includes(q));
    const askIt: Command = { label: `Ask Nikhil: “${query.trim()}”`, hint: 'AI', hue: 'grape', action: { kind: 'ask', question: query.trim() } };
    return looksLikeQuestion(q) || !found.length ? [askIt, ...found] : found;
  }, [query, copied, reduced]);
  const current = Math.min(active, Math.max(0, results.length - 1));

  function run({ action }: Command) {
    const close = () => dialog.current?.close();
    switch (action.kind) {
      case 'go':
        if (action.project) track('project_open', { project: action.project });
        close();
        router.push(action.href);
        break;
      case 'open':
        close();
        window.open(action.href, '_blank', 'noopener');
        break;
      case 'view':
        try {
          window.localStorage.setItem('view', action.to);
        } catch {
          // Storage can be blocked; the switch still works for this visit.
        }
        track('quick_view_toggle', { to: action.to });
        close();
        router.push(action.to === 'quick' ? '/?view=quick' : '/');
        break;
      case 'resume':
        track('resume_download', { format: action.format });
        close();
        if (action.format === 'page') {
          router.push('/resume');
        } else {
          // A file, not a page, so a plain link click instead of the router.
          const a = document.createElement('a');
          a.href = '/resume.pdf';
          a.download = 'Nikhil-Patil-Resume.pdf';
          a.click();
        }
        break;
      case 'copy':
        navigator.clipboard?.writeText(site.email).then(
          () => {
            track('email_copy', { from: 'palette' });
            setCopied(true);
            window.setTimeout(close, 700);
          },
          () => {
            close();
            router.push('/#contact');
          },
        );
        break;
      case 'motion':
        toggleMotion();
        break;
      case 'help':
        onMode('help');
        break;
      case 'ask':
        setQuestion(action.question);
        onMode('ask');
        break;
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((current + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((current - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[current]) run(results[current]);
    }
  };

  return (
    <dialog
      ref={dialog}
      className="palette"
      aria-label={mode === 'palette' ? 'Command palette' : mode === 'ask' ? 'Ask Nikhil' : 'Keyboard shortcuts'}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="palette-stripe" aria-hidden="true" />
      {mode === 'ask' ? (
        <AskPanel initial={question} onBack={() => onMode('palette')} onNavigate={() => dialog.current?.close()} />
      ) : mode === 'palette' ? (
        <>
          <input
            className="palette-search"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results.length ? `${listId}-${current}` : undefined}
            aria-autocomplete="list"
            aria-label="Search commands"
            placeholder="Jump to a project, a section, or an action"
            value={query}
            autoFocus
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          {results.length ? (
            <ul className="palette-list" id={listId} role="listbox" aria-label="Commands">
              {results.map((c, i) => (
                <li
                  key={c.label}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === current}
                  style={tint(c.hue, 't-')}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(c)}
                >
                  <span>{c.label}</span>
                  <small>{c.hint}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="palette-empty">Nothing matches. Try “resume”, “Legal Bot” or “email”, or ask a question.</p>
          )}
          <p className="palette-foot">
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> to move
            </span>
            <span>
              <kbd>Enter</kbd> to open
            </span>
            <span>
              <kbd>Esc</kbd> to close
            </span>
          </p>
        </>
      ) : (
        <>
          <p className="label" style={{ padding: '18px 22px 0' }}>
            Keyboard shortcuts
          </p>
          <dl className="shortcut-list">
            {shortcuts.map(([keys, what]) => (
              <div key={keys}>
                <dt>
                  <kbd>{keys}</kbd>
                </dt>
                <dd>{what}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </dialog>
  );
}
