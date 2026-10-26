'use client';

import Link from 'next/link';
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { site } from '@/data/content';
import { isAskLink } from '@/lib/ask/links';
import { track } from '@/lib/track';

// The three starters from the brief.
const SUGGESTED = ['What has he built with LLMs?', 'Is he open to roles?', 'Explain his best project in 30 seconds.'];

// DRAFT. What the box says when it can't answer.
const NOTES: Record<string, string> = {
  off: `Ask Nikhil isn't switched on yet. Email Nikhil at ${site.email}.`,
  slow: 'That is a lot of questions in a short time. Try again in a few minutes, or email Nikhil.',
  busy: `Ask Nikhil has answered a lot today and is resting. Email Nikhil at ${site.email}.`,
  refusal: "That one isn't something I can help with. Ask about Nikhil's work, skills or teaching.",
  max_tokens: 'That answer ran long, so it stops here. Ask a narrower question for the rest.',
  error: 'Something went wrong on the way. Try again, or email Nikhil.',
};

interface Turn {
  q: string;
  a: string;
  state: 'streaming' | 'done' | 'failed';
  note?: string;
}

/** Inline links and bold. Links only render when they point somewhere the site allows; anything else stays text. */
function inline(text: string, onNavigate: () => void, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${m.index}`;
    if (m[3]) out.push(<strong key={k}>{m[3]}</strong>);
    else if (!isAskLink(m[2])) out.push(m[1]);
    else if (m[2].startsWith('/'))
      out.push(
        <Link key={k} href={m[2]} onClick={onNavigate}>
          {m[1]}
        </Link>,
      );
    else
      out.push(
        <a key={k} href={m[2]} {...(m[2].startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>
          {m[1]}
        </a>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Paragraphs and "•" lists, from the plain text the model writes. */
function render(answer: string, onNavigate: () => void) {
  const blocks: ReactNode[] = [];
  let items: string[] = [];
  const flush = (i: number) => {
    if (!items.length) return;
    blocks.push(
      <ul key={`l${i}`}>
        {items.map((it, j) => (
          <li key={j}>{inline(it, onNavigate, `l${i}-${j}`)}</li>
        ))}
      </ul>,
    );
    items = [];
  };
  answer.split('\n').forEach((line, i) => {
    const bullet = line.match(/^\s*(?:•|-|\*)\s+(.*)$/);
    if (bullet) {
      items.push(bullet[1]);
      return;
    }
    flush(i);
    if (line.trim()) blocks.push(<p key={`p${i}`}>{inline(line, onNavigate, `p${i}`)}</p>);
  });
  flush(-1);
  return blocks;
}

/**
 * Ask Nikhil, inside the command palette: questions about Nikhil, answered by an AI model from this site's content only,
 * streamed in as they are written. Labelled as AI on screen; each question counts one ask_question event.
 */
export function AskPanel({ initial, onBack, onNavigate }: { initial?: string; onBack: () => void; onNavigate: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const asking = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const busy = turns.some((t) => t.state === 'streaming');

  const update = (fn: (t: Turn) => Turn) => setTurns((all) => all.map((t, i) => (i === all.length - 1 ? fn(t) : t)));

  async function ask(question: string, source: 'typed' | 'suggested' | 'palette') {
    const q = question.trim().slice(0, 300);
    if (!q || busy) return;
    track('ask_question', { source });
    const history = turns.filter((t) => t.state === 'done' && t.a).slice(-2).map(({ q, a }) => ({ q, a }));
    setTurns((all) => [...all, { q, a: '', state: 'streaming' }]);
    setDraft('');
    const controller = new AbortController();
    asking.current = controller;
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: q, history }),
        signal: controller.signal,
      });
      // A JSON reply instead of a stream carries a note: switched off, too many questions, or a refusal at the door.
      if (!res.ok || !res.body || !res.headers.get('content-type')?.includes('ndjson')) {
        const code = ((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? 'error';
        update((t) => ({ ...t, state: 'failed', note: NOTES[code] ?? NOTES.error }));
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let ended = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as { type: string; text?: string; stop?: string; code?: string };
          if (event.type === 'text') update((t) => ({ ...t, a: t.a + (event.text ?? '') }));
          else if (event.type === 'error') {
            ended = true;
            update((t) => ({ ...t, state: 'failed', note: NOTES[event.code ?? 'error'] ?? NOTES.error }));
          } else if (event.type === 'end') {
            ended = true;
            const stop = event.stop ?? 'end_turn';
            update((t) => (stop === 'refusal' ? { ...t, a: '', state: 'failed', note: NOTES.refusal } : { ...t, state: 'done', note: NOTES[stop] }));
          }
        }
      }
      if (!ended) update((t) => ({ ...t, state: 'failed', note: NOTES.error }));
    } catch {
      if (!controller.signal.aborted) update((t) => ({ ...t, state: 'failed', note: NOTES.error }));
    } finally {
      if (asking.current === controller) asking.current = null;
    }
  }

  // A question typed into the palette arrives with the panel and is asked straight away, once.
  const asked = useRef(false);
  useEffect(() => {
    if (initial && !asked.current) {
      asked.current = true;
      void ask(initial, 'palette');
    }
    // ask is recreated each render; the guard above makes this run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  // Closing the palette stops an answer that is still being written.
  useEffect(() => () => asking.current?.abort(), []);

  // Keep the newest words in view while they stream in.
  const last = turns[turns.length - 1];
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [last?.a, last?.note, turns.length]);

  return (
    <div className="ask">
      <div className="ask-head">
        <button type="button" className="ask-back" onClick={onBack}>
          ← Commands
        </button>
        <p className="ask-title">Ask Nikhil</p>
        <span className="ask-badge">AI-generated answers</span>
      </div>

      <div className="ask-log" ref={log} aria-live="polite" aria-busy={busy}>
        {turns.length === 0 ? (
          <div className="ask-intro">
            <p>Ask about Nikhil&apos;s work, skills or teaching. Answers come only from this site, written by an AI.</p>
            <div className="ask-chips">
              {SUGGESTED.map((q) => (
                <button key={q} type="button" onClick={() => void ask(q, 'suggested')}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          turns.map((t, i) => (
            <div key={i} className="ask-turn">
              <p className="ask-q">{t.q}</p>
              {(t.a || t.state === 'streaming') && (
                <div className="ask-a">
                  {render(t.a, onNavigate).map((b, j) => (
                    <Fragment key={j}>{b}</Fragment>
                  ))}
                  {t.state === 'streaming' && <span className="ask-caret" aria-hidden="true" />}
                </div>
              )}
              {t.note && <p className="ask-note">{t.note}</p>}
            </div>
          ))
        )}
      </div>

      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(draft, 'typed');
          input.current?.focus();
        }}
      >
        <input
          ref={input}
          className="ask-input"
          type="text"
          aria-label="Your question for Ask Nikhil"
          placeholder={turns.length ? 'Ask a follow-up' : 'Type a question'}
          value={draft}
          maxLength={300}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="ask-send" disabled={busy || !draft.trim()}>
          Ask
        </button>
      </form>
      <p className="palette-foot ask-foot">
        {/* DRAFT */}
        Answers come from this site and can be wrong. Questions go to a free AI model, so please skip personal details. For anything important,{' '}
        <a href={`mailto:${site.email}`} onClick={onNavigate}>
          email Nikhil
        </a>
        .
      </p>
    </div>
  );
}
