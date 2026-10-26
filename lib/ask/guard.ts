import { createHash } from 'node:crypto';

/**
 * Rate limits and the anonymous question log for Ask Nikhil.
 * With Upstash Redis connected (Vercel Marketplace, free tier) the limits hold across every server and the log is
 * kept; without it, each server counts on its own and questions go to the Vercel runtime log instead.
 */
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const LIMITS = {
  /** Questions per visitor in ten minutes, and in a day. */
  burst: 6,
  daily: 30,
  /** Questions for the whole site in a day: a ceiling on spend whatever happens. */
  site: Number(process.env.ASK_DAILY_CAP) || 300,
};

async function redis(commands: string[][]) {
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(commands),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Redis answered ${res.status}`);
  return (await res.json()) as { result?: unknown; error?: string }[];
}

const local = new Map<string, { n: number; until: number }>();

/** Adds one to a counter that resets after `seconds`, and returns the new count. */
async function count(key: string, seconds: number) {
  if (url && token) {
    try {
      const out = await redis([
        ['SET', key, '0', 'EX', String(seconds), 'NX'],
        ['INCR', key],
      ]);
      return Number(out[1]?.result ?? 0);
    } catch (error) {
      console.error('ask: rate limit store unavailable, counting on this server', error);
    }
  }
  const now = Date.now();
  if (local.size > 5000) for (const [k, v] of local) if (v.until < now) local.delete(k);
  const hit = local.get(key);
  if (!hit || hit.until < now) {
    local.set(key, { n: 1, until: now + seconds * 1000 });
    return 1;
  }
  return ++hit.n;
}

/** Counts this question and says whether it may go ahead. The visitor's IP is hashed with the date and never stored. */
export async function admit(ip: string): Promise<'ok' | 'visitor' | 'site'> {
  const day = new Date().toISOString().slice(0, 10);
  const who = createHash('sha256').update(`${day}|${ip}`).digest('hex').slice(0, 24);
  const [burst, daily, all] = await Promise.all([count(`ask:v:${who}:burst`, 600), count(`ask:v:${who}:${day}`, 86_400), count(`ask:site:${day}`, 86_400)]);
  if (burst > LIMITS.burst || daily > LIMITS.daily) return 'visitor';
  if (all > LIMITS.site) return 'site';
  return 'ok';
}

// Questions are kept so Nikhil can see what visitors want to know, with anything that looks like contact details removed.
const scrub = (text: string) =>
  text
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]')
    .replace(/\+?\d[\d ().-]{7,}\d/g, '[number]')
    .slice(0, 300);

export async function logQuestion(entry: { question: string; stop: string; chars: number; ms: number }) {
  const line = JSON.stringify({ at: new Date().toISOString(), q: scrub(entry.question), stop: entry.stop, chars: entry.chars, ms: entry.ms });
  if (url && token) {
    try {
      await redis([
        ['LPUSH', 'ask:log', line],
        ['LTRIM', 'ask:log', '0', '1999'],
      ]);
      return;
    } catch (error) {
      console.error('ask: question log unavailable', error);
    }
  }
  console.info(`ask ${line}`);
}
