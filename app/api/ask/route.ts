import { site } from '@/data/content';
import { admit, logQuestion } from '@/lib/ask/guard';
import { systemPrompt } from '@/lib/ask/knowledge';

/**
 * Ask Nikhil: answers a visitor's question from the site's own content with a free NVIDIA Nemotron model on
 * OpenRouter, streamed back as newline-delimited JSON events: {type: "text"} chunks, then {type: "end"} with the
 * stop reason, or {type: "error"}. The key lives only in the server's environment (OPENROUTER_API_KEY on Vercel);
 * without it the route says so.
 */
export const maxDuration = 60;

const ENDPOINT = `${process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'}/chat/completions`;
// Free NVIDIA models, best first. When one is busy or rate limited, OpenRouter moves on to the next.
// ASK_MODEL puts another model at the front.
const MODELS = [process.env.ASK_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free', 'nvidia/nemotron-3.5-super-vl:free', 'nvidia/nemotron-3.5-lightning:free'].filter((m, i, all) => all.indexOf(m) === i);

const QUESTION_MAX = 300;
const ANSWER_MAX = 2000;

interface Turn {
  q: string;
  a: string;
}

const fail = (status: number, code: string) => Response.json({ error: code }, { status, headers: { 'cache-control': 'no-store' } });
// Switched off, rate limited or busy are normal moments for a real visitor, not faults: they answer 200 with a note,
// so the browser console stays clean. Malformed or cross-site requests, which the site never sends, get real errors.
const note = (code: string) => fail(200, code);

/** The question, plus up to two earlier exchanges so follow-ups like "tell me more" work. */
function read(body: unknown): { question: string; history: Turn[] } | null {
  if (!body || typeof body !== 'object') return null;
  const { question, history } = body as { question?: unknown; history?: unknown };
  if (typeof question !== 'string') return null;
  const q = question.trim();
  if (!q || q.length > QUESTION_MAX) return null;
  const turns = Array.isArray(history) ? history.slice(-2) : [];
  const clean: Turn[] = [];
  for (const t of turns) {
    if (!t || typeof t !== 'object') return null;
    const { q: tq, a: ta } = t as { q?: unknown; a?: unknown };
    if (typeof tq !== 'string' || typeof ta !== 'string' || !tq.trim() || !ta.trim()) return null;
    clean.push({ q: tq.trim().slice(0, QUESTION_MAX), a: ta.trim().slice(0, ANSWER_MAX) });
  }
  return { question: q, history: clean };
}

// OpenAI-style finish reasons, in the words the palette understands.
const STOPS: Record<string, string> = { stop: 'end_turn', length: 'max_tokens', content_filter: 'refusal' };

/**
 * Passes answer text through, minus any <think>…</think> block an open model writes before its answer. The model
 * is asked to keep its reasoning out of the reply; this catches the ones that write it inline anyway.
 */
function withoutThinking(send: (text: string) => void) {
  let held = '';
  let state: 'deciding' | 'thinking' | 'answering' = 'deciding';
  return (text: string) => {
    if (state === 'answering') return send(text);
    held += text;
    if (state === 'deciding') {
      const head = held.trimStart();
      if (!head || ('<think>'.startsWith(head) && head.length < 7)) return;
      if (!head.startsWith('<think>')) {
        state = 'answering';
        send(held);
        held = '';
        return;
      }
      state = 'thinking';
    }
    const end = held.indexOf('</think>');
    if (end < 0) return;
    const rest = held.slice(end + 8).trimStart();
    held = '';
    state = 'answering';
    if (rest) send(rest);
  };
}

export async function POST(req: Request) {
  // Only this site's own pages may ask, so no other site can borrow the endpoint as a free model.
  const fetchSite = req.headers.get('sec-fetch-site');
  const origin = req.headers.get('origin');
  if ((fetchSite && fetchSite !== 'same-origin') || (origin && new URL(origin).host !== req.headers.get('host'))) return fail(403, 'forbidden');
  if (!process.env.OPENROUTER_API_KEY) return note('off');

  const raw = await req.text();
  if (raw.length > 12_000) return fail(413, 'too_long');
  let input: ReturnType<typeof read> = null;
  try {
    input = read(JSON.parse(raw));
  } catch {
    input = null;
  }
  if (!input) return fail(400, 'bad_question');

  const ip = req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const gate = await admit(ip);
  if (gate !== 'ok') return note(gate === 'site' ? 'busy' : 'slow');

  const { question, history } = input;
  const started = Date.now();
  let upstream: Response;
  try {
    upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        // Lets OpenRouter credit the requests to this site.
        'HTTP-Referer': site.url,
        'X-Title': `${site.name} portfolio`,
      },
      body: JSON.stringify({
        models: MODELS,
        stream: true,
        max_tokens: 1500,
        // Short factual answers from one document: a little reasoning, kept out of the reply, and a low temperature.
        reasoning: { effort: 'low', exclude: true },
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.flatMap((t) => [
            { role: 'user', content: t.q },
            { role: 'assistant', content: t.a },
          ]),
          { role: 'user', content: question },
        ],
      }),
      signal: req.signal,
      cache: 'no-store',
    });
  } catch (error) {
    if (!req.signal.aborted) console.error('ask: OpenRouter unreachable', error);
    await logQuestion({ question, stop: 'error', chars: 0, ms: Date.now() - started });
    return note('error');
  }
  if (!upstream.ok || !upstream.body) {
    // 429: the free model's daily or per-minute limit; 402: credits; 502 and 503: every provider busy.
    const code = [402, 429, 502, 503].includes(upstream.status) ? 'busy' : 'error';
    console.error(`ask: OpenRouter answered ${upstream.status}`, (await upstream.text().catch(() => '')).slice(0, 500));
    await logQuestion({ question, stop: code, chars: 0, ms: Date.now() - started });
    return note(code);
  }

  const encoder = new TextEncoder();
  const source = upstream.body;
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, string>) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // The visitor has gone; nothing to send to.
        }
      };
      let chars = 0;
      let stop = 'end_turn';
      let failed = '';
      const emit = withoutThinking((text) => {
        chars += text.length;
        send({ type: 'text', text });
      });
      try {
        const reader = source.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        read: for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            // Server-sent events: skip blank lines and keep-alive comments such as ": OPENROUTER PROCESSING".
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (data === '[DONE]') break read;
            const chunk = JSON.parse(data) as {
              error?: { code?: number; message?: string };
              choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[];
            };
            if (chunk.error) {
              failed = chunk.error.code === 429 ? 'busy' : 'error';
              console.error('ask: OpenRouter failed mid-answer', chunk.error);
              break read;
            }
            const choice = chunk.choices?.[0];
            if (choice?.delta?.content) emit(choice.delta.content);
            if (choice?.finish_reason) stop = STOPS[choice.finish_reason] ?? choice.finish_reason;
          }
        }
        if (failed) {
          stop = failed;
          send({ type: 'error', code: failed });
        } else send({ type: 'end', stop });
      } catch (error) {
        if (req.signal.aborted) {
          stop = 'left';
        } else {
          stop = 'error';
          console.error('ask: answer stream broke', error);
          send({ type: 'error', code: stop });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed by a visitor who left.
        }
        await logQuestion({ question, stop, chars, ms: Date.now() - started });
      }
    },
  });

  return new Response(body, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store',
      'x-accel-buffering': 'no',
    },
  });
}
