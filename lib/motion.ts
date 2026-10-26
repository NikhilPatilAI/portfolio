/**
 * The motion layer. Loaded after first paint and never when motion is reduced.
 * GSAP owns everything tied to scroll or time; CSS owns hover and open/close states. No element is animated by both.
 * Tokens: reveals expo.out (cubic-bezier(0.16, 1, 0.3, 1)), moves power2.inOut, 0.6 to 1.2 s, stagger 40 to 100 ms.
 *
 * Next.js keeps up to three visited pages in the document, hidden with display: none, so every lookup here
 * goes through live() and only touches the page on screen.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const shown = (el: Element) => el.getClientRects().length > 0;
const live = (selector: string) => gsap.utils.toArray<HTMLElement>(selector).filter(shown);
// Anything already on screen when the page starts stays as it is: hiding it now would only make it blink.
const inView = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
};
const offScreen = (selector: string) => live(selector).filter((el) => !inView(el));
const HEADER_OFFSET = -72;

let lenis: Lenis | null = null;
let started = false;

/** Things that live for the whole visit: smooth scroll, same-page anchors and the cursor. */
export function startGlobal() {
  if (started) return;
  started = true;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener('click', onAnchorClick, true);
  settleOnNavigation();
  if (finePointer()) startCursor();
}

/**
 * A glide still in flight would drag the next page to the old scroll position, because Lenis ignores native scrolls
 * while it animates. Next.js pushes the new URL just before it scrolls, so stopping the glide there lets its scroll win.
 */
function settleOnNavigation() {
  const settle = () => {
    if (!lenis?.isScrolling) return;
    lenis.stop();
    lenis.start();
  };
  const push = history.pushState;
  history.pushState = function (this: History, ...args: Parameters<History['pushState']>) {
    settle();
    return push.apply(this, args);
  };
  window.addEventListener('popstate', settle);
}

/** Same-page links (#work, or /#work while on the home page) glide there instead of jumping. */
function onAnchorClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null;
  if (!a || a.target === '_blank') return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
  const id = decodeURIComponent(url.hash.slice(1));
  const target = id === 'top' ? 0 : gsap.utils.toArray<HTMLElement>(`[id="${CSS.escape(id)}"]`).find(shown);
  if (target === undefined) return;
  e.preventDefault();
  history.replaceState(history.state, '', id === 'top' ? url.pathname + url.search : url.hash);
  lenis?.scrollTo(target, { offset: target === 0 ? 0 : HEADER_OFFSET, duration: 1.3 });
}

/* ---------- Cursor: a dot that takes the section's color, and a labelled pill over projects, proofs and episodes ---------- */

function startCursor() {
  const cursor = document.createElement('div');
  cursor.id = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-pill"><span>View</span></div>';
  document.body.appendChild(cursor);
  document.documentElement.classList.add('fine');
  const dot = cursor.querySelector('.cursor-dot') as HTMLElement;
  const pill = cursor.querySelector('.cursor-pill') as HTMLElement;
  const label = pill.querySelector('span') as HTMLElement;
  const x = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3.out' });
  const y = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3.out' });
  const labels: Record<string, string> = { view: 'View', proof: 'Proof', play: 'Play' };
  let state = 'default';
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      x(e.clientX);
      y(e.clientY);
      gsap.to(cursor, { autoAlpha: 1, duration: 0.2, overwrite: 'auto' });
    },
    { passive: true },
  );
  document.documentElement.addEventListener('mouseleave', () => gsap.to(cursor, { autoAlpha: 0, duration: 0.2 }));
  document.addEventListener('pointerover', (e) => {
    const t = (e.target as Element).closest('[data-cursor], a, button, input, [role="option"]') as HTMLElement | null;
    const next = t ? t.dataset.cursor ?? 'link' : 'default';
    if (next === state) return;
    state = next;
    if (labels[next]) {
      label.textContent = labels[next];
      gsap.to(dot, { scale: 0, duration: 0.2, overwrite: 'auto' });
      gsap.to(pill, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', overwrite: 'auto' });
    } else {
      gsap.to(pill, { scale: 0.4, opacity: 0, duration: 0.25, overwrite: 'auto' });
      gsap.to(dot, { scale: next === 'link' ? 2.6 : 1, duration: 0.4, ease: 'back.out(2)', overwrite: 'auto' });
    }
  });
}

/* ---------- Per page ---------- */

/** Sets up everything for the page on screen and returns a function that undoes it. Each part checks for its own elements. */
export function initPage() {
  const cleanups: Array<() => void> = [];
  const ctx = gsap.context(() => {
    sectionColors();
    reveals();
    ribbons(cleanups);
  });
  if (finePointer()) {
    tilt(cleanups);
    magnetic(cleanups);
  }
  hops(cleanups);
  lenis?.resize();
  let alive = true;
  document.fonts.ready.then(() => alive && ScrollTrigger.refresh());
  return () => {
    alive = false;
    cleanups.forEach((fn) => fn());
    ctx.revert();
  };
}

function sectionColors() {
  const root = document.documentElement;
  live('[data-cur]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (self.isActive) root.style.setProperty('--cur', el.dataset.cur ?? 'var(--color-ink)');
      },
    });
  });
}

function reveals() {
  // Headings rise line by line behind a mask, once the real fonts set the line breaks.
  offScreen('.section-title, .cs-h2, .page-title').forEach((h) => {
    SplitText.create(h, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: h, start: 'top 90%', once: true } }),
    });
  });

  // Cards rise with a slight turn; tool names pop in after their card.
  ScrollTrigger.batch(offScreen('.card, .kit'), {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(batch, { y: 80, rotation: (i) => (i % 2 ? 3 : -3), autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out', stagger: 0.1, clearProps: 'transform,opacity,visibility' });
      batch.forEach((card, i) => {
        const tools = card.querySelectorAll('.kit-tools li');
        if (tools.length) gsap.fromTo(tools, { scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2.4)', stagger: 0.03, delay: 0.3 + i * 0.1, clearProps: 'transform,opacity,visibility' });
      });
    },
  });

  ScrollTrigger.batch(offScreen('.beyond > li, .cred, .tldr > div, .decisions > li, .results > li, .teach-links, .next-card'), {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.fromTo(batch, { y: 46, autoAlpha: 0, scale: 0.97 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)', stagger: 0.08, clearProps: 'transform,opacity,visibility' }),
  });

  // About: the portrait (or monogram) is revealed through a mask, then the three lines follow.
  offScreen('.monogram, .portrait').forEach((monogram) => {
    gsap.fromTo(monogram, { clipPath: 'inset(100% 0% 0% 0% round 36px)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', scale: 1, duration: 1.2, ease: 'expo.out', clearProps: 'clipPath,transform', scrollTrigger: { trigger: monogram, start: 'top 85%', once: true } });
  });
  const aboutLines = offScreen('.about-lines li');
  if (aboutLines.length) gsap.from(aboutLines, { y: 30, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: aboutLines[0], start: 'top 88%', once: true } });

  // Experience: the rule draws itself, then each role arrives.
  offScreen('.timeline').forEach((list) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 85%', once: true } });
    tl.fromTo(list, { '--draw': 0 }, { '--draw': 1, duration: 1.1, ease: 'power2.inOut' });
    tl.from(list.querySelectorAll(':scope > li'), { y: 30, autoAlpha: 0, duration: 0.8, ease: 'expo.out', stagger: 0.12 }, 0.25);
    tl.from(list.querySelectorAll('.timeline-when i'), { scale: 0, duration: 0.6, ease: 'back.out(3)', stagger: 0.12 }, 0.35);
  });

  // Podcast: the wall cascades in from the show cover.
  offScreen('.eps').forEach((eps) => {
    const items = eps.querySelectorAll('.ep');
    ScrollTrigger.create({
      trigger: eps,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.fromTo(items, { y: 40, scale: 0.88, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.7)', stagger: { amount: 0.9, grid: 'auto', from: 'start' }, clearProps: 'transform,opacity,visibility' }),
    });
  });

  // Case studies: the architecture draws itself, step by step, arrows first.
  offScreen('.lane').forEach((lane) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: lane, start: 'top 82%', once: true } });
    lane.querySelectorAll<HTMLElement>('.step').forEach((step, i) => {
      const arrow = step.querySelector('.step-arrow path');
      if (arrow) tl.fromTo(arrow, { strokeDasharray: 32, strokeDashoffset: 32 }, { strokeDashoffset: 0, duration: 0.25, ease: 'none' }, i * 0.16);
      tl.from(step.querySelector('.step-box'), { y: 14, autoAlpha: 0, duration: 0.45, ease: 'expo.out' }, i * 0.16 + 0.08);
    });
  });

  // Results count up to their real values.
  offScreen('.results b').forEach((el) => {
    const text = el.textContent ?? '';
    const m = text.match(/^(\d[\d,]*(?:\.\d+)?)(.*)$/);
    if (!m) return;
    const target = parseFloat(m[1].replace(/,/g, ''));
    const decimals = (m[1].split('.')[1] ?? '').length;
    const commas = m[1].includes(',');
    const suffix = m[2];
    const counter = { v: 0 };
    const format = (v: number) => {
      const fixed = v.toFixed(decimals);
      return (commas ? Number(fixed).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : fixed) + suffix;
    };
    el.textContent = format(0);
    gsap.to(counter, {
      v: target,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = format(counter.v);
      },
      onComplete: () => {
        el.textContent = text;
      },
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });

  // Footer: the sign-off letters pop up as the page lifts off it.
  const talk = live('.talk')[0];
  const main = live('.site-main')[0];
  if (talk && main && !inView(talk)) {
    gsap.fromTo(talk.querySelectorAll('.talk-ch'), { yPercent: 70, rotation: (i) => (i % 2 ? 14 : -14), autoAlpha: 0 }, { yPercent: 0, rotation: 0, autoAlpha: 1, duration: 1, ease: 'back.out(1.8)', stagger: 0.045, scrollTrigger: { trigger: main, start: 'bottom 85%', once: true } });
  }
}

/** Two bands drift in opposite directions and speed up with scroll velocity. */
function ribbons(cleanups: Array<() => void>) {
  const host = live('.ribbons')[0];
  if (!host) return;
  const tracks = gsap.utils.toArray<HTMLElement>(host.querySelectorAll('.ribbon-track'));
  if (!tracks.length) return;
  let periods: number[] = [];
  const measure = () => {
    periods = tracks.map((t) => {
      const half = t.children.length / 2;
      const first = t.children[0] as HTMLElement;
      const twin = t.children[half] as HTMLElement | undefined;
      return twin ? twin.offsetLeft - first.offsetLeft : t.scrollWidth / 2;
    });
  };
  measure();
  document.fonts.ready.then(measure);
  window.addEventListener('resize', measure);
  let visible = false;
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((x) => x.isIntersecting);
  });
  io.observe(host);
  let shift = 0;
  const tick = (_time: number, deltaTime: number) => {
    if (!visible) return;
    const v = lenis ? Math.abs(lenis.velocity) : 0;
    shift += (0.9 + Math.min(v * 0.5, 24)) * (deltaTime / 16.667);
    tracks.forEach((t, i) => {
      const p = periods[i] || 1;
      const s = shift % p;
      t.style.transform = `translate3d(${(i % 2 ? s - p : -s).toFixed(2)}px,0,0)`;
    });
  };
  gsap.ticker.add(tick);
  cleanups.push(() => {
    gsap.ticker.remove(tick);
    io.disconnect();
    window.removeEventListener('resize', measure);
    tracks.forEach((t) => (t.style.transform = ''));
  });
}

/** Project and tool cards lean toward the cursor, with a soft shine and the illustration drifting the other way. */
function tilt(cleanups: Array<() => void>) {
  live('.card, .kit').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const art = card.querySelector('.card-art, .kit-art');
    const ax = art ? gsap.quickTo(art, 'x', { duration: 0.8, ease: 'power3.out' }) : null;
    const ay = art ? gsap.quickTo(art, 'y', { duration: 0.8, ease: 'power3.out' }) : null;
    const strength = card.classList.contains('kit-wide') ? 0.5 : 1;
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rx((0.5 - py) * 9 * strength);
      ry((px - 0.5) * 11 * strength);
      ax?.((px - 0.5) * -28);
      ay?.((py - 0.5) * -28);
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
      ax?.(0);
      ay?.(0);
    };
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
      gsap.set(card, { clearProps: 'transform' });
    });
  });
}

/** Buttons and nav links lean toward the cursor, 8 px at most, and spring back. */
function magnetic(cleanups: Array<() => void>) {
  live('.btn, .email-btn, .topnav > a').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo(gsap.utils.clamp(-8, 8, (e.clientX - (r.left + r.width / 2)) * 0.25));
      yTo(gsap.utils.clamp(-8, 8, (e.clientY - (r.top + r.height / 2)) * 0.35));
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.set(el, { clearProps: 'transform' });
    });
  });
}

/** Tool names and the sign-off letters jump when touched. */
function hops(cleanups: Array<() => void>) {
  const hop = (el: HTMLElement, height: number, turn: number) => gsap.fromTo(el, { y: 0, rotation: 0 }, { y: -height, rotation: gsap.utils.random(-turn, turn), duration: 0.24, ease: 'power2.out', yoyo: true, repeat: 1, overwrite: 'auto' });
  const pairs: Array<[HTMLElement, () => void]> = [];
  live('.kit-tools li').forEach((el) => pairs.push([el, () => hop(el, 7, 6)]));
  live('.talk-ch').forEach((el) => pairs.push([el, () => hop(el, 28, 12)]));
  pairs.forEach(([el, fn]) => {
    el.addEventListener('pointerenter', fn);
    el.addEventListener('pointerdown', fn);
  });
  cleanups.push(() =>
    pairs.forEach(([el, fn]) => {
      el.removeEventListener('pointerenter', fn);
      el.removeEventListener('pointerdown', fn);
    }),
  );
}
