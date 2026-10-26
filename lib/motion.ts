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

/* ---------- Cursor: a dot on the pointer, black until a section gives it a color, a query ring that locks on to links, and a labelled pill over projects, proofs and episodes ---------- */

function startCursor() {
  const cursor = document.createElement('div');
  cursor.id = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML =
    '<div class="cursor-ring"><svg class="cursor-reticle" viewBox="-24 -24 48 48"><g class="shade"><circle r="16"/><path d="M0-24v6M0 18v6M-24 0h6M18 0h6"/></g><g class="line"><circle r="16"/><path d="M0-24v6M0 18v6M-24 0h6M18 0h6"/></g></svg><div class="cursor-pill"><span>View</span></div></div><div class="cursor-dot"><i></i></div>';
  document.body.appendChild(cursor);
  document.documentElement.classList.add('fine');
  const ring = cursor.querySelector('.cursor-ring') as HTMLElement;
  const dot = cursor.querySelector('.cursor-dot') as HTMLElement;
  const label = cursor.querySelector('.cursor-pill span') as HTMLElement;
  const labels: Record<string, string> = { view: 'View', proof: 'Proof', play: 'Play' };

  // Where the pointer is, where the dot was last drawn, and where the ring has glided to.
  let px = 0;
  let py = 0;
  let dx = NaN;
  let dy = NaN;
  let rx = 0;
  let ry = 0;
  let on = false;
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX;
      py = e.clientY;
      if (on) return;
      on = true;
      rx = px;
      ry = py;
      cursor.classList.add('is-on');
    },
    { passive: true },
  );
  document.documentElement.addEventListener('mouseleave', () => {
    on = false;
    cursor.classList.remove('is-on', 'is-down');
  });

  // Once a frame: the dot jumps to the pointer, so it never lags; the ring eases after it, at the same speed on
  // any refresh rate. Nothing is written when nothing moved.
  gsap.ticker.add((_time, deltaTime) => {
    if (!on) return;
    if (px !== dx || py !== dy) {
      dx = px;
      dy = py;
      dot.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    }
    const gapX = px - rx;
    const gapY = py - ry;
    if (Math.abs(gapX) < 0.05 && Math.abs(gapY) < 0.05) return;
    const k = 1 - Math.pow(0.75, deltaTime / 16.667);
    rx += gapX * k;
    ry += gapY * k;
    ring.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
  });

  // The palette, receipts and glosses sit in the browser's top layer, above anything a page can draw, and text
  // fields want a caret. Over those the custom cursor steps aside for the system one.
  const topLayer = (el: Element) => {
    if (el.closest('dialog[open]')) return true;
    const pop = el.closest('[popover]');
    try {
      return !!pop?.matches(':popover-open');
    } catch {
      return false;
    }
  };
  let state = '';
  const set = (next: string) => {
    if (next === state) return;
    if (state) cursor.classList.remove(`is-${state}`);
    if (next) cursor.classList.add(`is-${next}`);
    state = next;
  };
  document.addEventListener('pointerover', (e) => {
    const target = e.target as Element;
    if (topLayer(target) || target.closest("input:not([type='button'], [type='submit'], [type='checkbox'], [type='radio']), textarea, [contenteditable='true']")) {
      set('native');
      return;
    }
    const t = target.closest('[data-cursor], a, button, [role="option"], summary, label') as HTMLElement | null;
    const kind = t ? (t.dataset.cursor ?? 'link') : '';
    if (labels[kind]) {
      label.textContent = labels[kind];
      set('label');
    } else set(kind);
  });

  // Pressing squeezes the ring, and every click sends a ripple out from the dot.
  window.addEventListener(
    'pointerdown',
    (e) => {
      if (e.pointerType !== 'mouse' || state === 'native') return;
      cursor.classList.add('is-down');
      const ripple = document.createElement('i');
      ripple.className = 'cursor-ripple';
      ripple.style.translate = `${e.clientX}px ${e.clientY}px`;
      ripple.addEventListener('animationend', () => ripple.remove());
      cursor.appendChild(ripple);
    },
    { passive: true },
  );
  const release = () => cursor.classList.remove('is-down');
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('blur', release);
}

/* ---------- Per page ---------- */

/** Sets up everything for the page on screen and returns a function that undoes it. Each part checks for its own elements. */
export function initPage() {
  const cleanups: Array<() => void> = [];
  const ctx = gsap.context(() => {
    sectionColors();
    reveals(cleanups);
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

/** The cursor takes the color of the section under the middle of the screen, and goes back to black between them. */
function sectionColors() {
  const paint = (value: string) => document.getElementById('cursor')?.style.setProperty('--cur', value);
  let current: Element | null = null;
  live('[data-cur]').forEach((el) => {
    // The footer is pinned behind the page, so it always looks on screen; it counts only once the page lifts off it.
    const pinned = el.matches('.footer') ? live('.site-main')[0] : undefined;
    ScrollTrigger.create({
      trigger: pinned ?? el,
      start: pinned ? 'bottom 55%' : 'top 55%',
      // Past the page's end, so the very bottom still counts as inside it.
      end: pinned ? 'bottom -100%' : 'bottom 55%',
      onToggle: (self) => {
        if (self.isActive) {
          current = el;
          paint(el.dataset.cur ?? 'var(--color-ink)');
        } else if (current === el) {
          // Leaving a section with nothing after it, such as the top of the page, falls back to black.
          current = null;
          paint('var(--color-ink)');
        }
      },
    });
  });
}

/* ---------- Reveals: ScrollTrigger decides when, the browser's compositor does the moving ---------- */

// Rough cubic-bezier stand-ins for browsers without CSS linear() easing.
const BEZIER: Record<string, string> = {
  'expo.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'back.out(1.4)': 'cubic-bezier(0.34, 1.4, 0.64, 1)',
  'back.out(1.7)': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'back.out(1.8)': 'cubic-bezier(0.34, 1.6, 0.64, 1)',
  'back.out(2.4)': 'cubic-bezier(0.34, 1.8, 0.64, 1)',
  'back.out(3)': 'cubic-bezier(0.34, 2, 0.64, 1)',
};
const eases = new Map<string, string>();

/** A GSAP ease as a CSS easing: sampled into linear() where supported, so the curve is exactly GSAP's. */
function cssEase(name: string) {
  let css = eases.get(name);
  if (!css) {
    if (CSS.supports('animation-timing-function', 'linear(0, 1)')) {
      const f = gsap.parseEase(name);
      css = `linear(${Array.from({ length: 41 }, (_, i) => +f(i / 40).toFixed(4)).join(', ')})`;
    } else css = BEZIER[name] ?? BEZIER['expo.out'];
    eases.set(name, css);
  }
  return css;
}

type From = (i: number) => Record<string, string | number>;
type Stagger = number | ((i: number, el: Element, all: Element[]) => number);

function reveals(cleanups: Array<() => void>) {
  // Web Animations on translate, scale, rotate and opacity run on the compositor, so a section full of items
  // arriving costs the main thread nothing per frame. Tweening them from script repainted the page on every frame.
  const running = new Set<Animation>();
  const held = new Set<HTMLElement>();
  const play = (targets: Iterable<Element>, from: From, o: { duration: number; ease: string; stagger?: Stagger; delay?: number }) => {
    const all = [...targets];
    const easing = cssEase(o.ease);
    all.forEach((el, i) => {
      const step = typeof o.stagger === 'function' ? o.stagger(i, el, all) : (o.stagger ?? 0) * i;
      // The style that held it hidden comes off in the same task the animation starts, so no frame shows it early.
      if (held.delete(el as HTMLElement)) for (const k of Object.keys(from(i))) (el as HTMLElement).style.removeProperty(k);
      // offset 0 makes this the starting pose; the end is the element's own style. A lone keyframe would be the end.
      const a = el.animate([{ ...from(i), offset: 0 }], { duration: o.duration * 1000, delay: ((o.delay ?? 0) + step) * 1000, easing, fill: 'backwards' });
      running.add(a);
      a.finished.then(
        () => running.delete(a),
        () => running.delete(a),
      );
    });
  };
  // Hides items that wait below the fold for their cue, in the pose their reveal starts from.
  const hold = (targets: Iterable<Element>, from: From) =>
    [...targets].forEach((el, i) => {
      for (const [k, v] of Object.entries(from(i))) (el as HTMLElement).style.setProperty(k, String(v));
      held.add(el as HTMLElement);
    });
  cleanups.push(() => {
    running.forEach((a) => a.cancel());
    running.clear();
    held.forEach((el) => ['translate', 'scale', 'rotate', 'opacity'].forEach((k) => el.style.removeProperty(k)));
    held.clear();
  });

  // Headings rise line by line behind a mask, once the real fonts set the line breaks.
  const risen = new WeakSet<Element>();
  offScreen('.section-title, .cs-h2, .page-title').forEach((h) => {
    let trigger: ScrollTrigger | null = null;
    const from: From = () => ({ translate: '0 110%' });
    SplitText.create(h, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => {
        trigger?.kill();
        if (risen.has(h)) return;
        hold(self.lines, from);
        trigger = ScrollTrigger.create({
          trigger: h,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            risen.add(h);
            play(self.lines, from, { duration: 1.1, ease: 'expo.out', stagger: 0.09 });
          },
        });
      },
    });
  });

  // Cards rise with a slight turn; tool names pop in after their card.
  ScrollTrigger.batch(offScreen('.card, .kit'), {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      play(batch, (i) => ({ translate: '0 80px', rotate: `${i % 2 ? 3 : -3}deg`, opacity: 0 }), { duration: 1.2, ease: 'expo.out', stagger: 0.1 });
      batch.forEach((card, i) => {
        const tools = card.querySelectorAll('.kit-tools li');
        if (tools.length) play(tools, () => ({ scale: 0.5, opacity: 0 }), { duration: 0.6, ease: 'back.out(2.4)', stagger: 0.03, delay: 0.3 + i * 0.1 });
      });
    },
  });

  ScrollTrigger.batch(offScreen('.beyond > li, .cred, .tldr > div, .decisions > li, .results > li, .teach-links, .next-card'), {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => play(batch, () => ({ translate: '0 46px', scale: 0.97, opacity: 0 }), { duration: 0.9, ease: 'back.out(1.4)', stagger: 0.08 }),
  });

  // About: the portrait (or monogram) is revealed through a mask, then the three lines follow.
  offScreen('.monogram, .portrait').forEach((monogram) => {
    gsap.fromTo(monogram, { clipPath: 'inset(100% 0% 0% 0% round 36px)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', scale: 1, duration: 1.2, ease: 'expo.out', clearProps: 'clipPath,transform', scrollTrigger: { trigger: monogram, start: 'top 85%', once: true } });
  });
  const aboutLines = offScreen('.about-lines li');
  if (aboutLines.length) {
    const from: From = () => ({ translate: '0 30px', opacity: 0 });
    hold(aboutLines, from);
    ScrollTrigger.create({ trigger: aboutLines[0], start: 'top 88%', once: true, onEnter: () => play(aboutLines, from, { duration: 0.9, ease: 'expo.out', stagger: 0.12 }) });
  }

  // Experience: the rule draws itself, then each role arrives.
  offScreen('.timeline').forEach((list) => {
    const roles = list.querySelectorAll(':scope > li');
    const dots = list.querySelectorAll('.timeline-when i');
    const roleFrom: From = () => ({ translate: '0 30px', opacity: 0 });
    const dotFrom: From = () => ({ scale: 0 });
    hold(roles, roleFrom);
    hold(dots, dotFrom);
    const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 85%', once: true } });
    tl.fromTo(list, { '--draw': 0 }, { '--draw': 1, duration: 1.1, ease: 'power2.inOut' });
    tl.call(() => play(roles, roleFrom, { duration: 0.8, ease: 'expo.out', stagger: 0.12 }), [], 0.25);
    tl.call(() => play(dots, dotFrom, { duration: 0.6, ease: 'back.out(3)', stagger: 0.12 }), [], 0.35);
  });

  // Podcast: the wall cascades in from the show cover.
  offScreen('.eps').forEach((eps) => {
    const items = eps.querySelectorAll('.ep');
    const spread = gsap.utils.distribute({ amount: 0.9, grid: 'auto', from: 'start' });
    ScrollTrigger.create({
      trigger: eps,
      start: 'top 88%',
      once: true,
      onEnter: () => play(items, () => ({ translate: '0 40px', scale: 0.88, opacity: 0 }), { duration: 0.8, ease: 'back.out(1.7)', stagger: (i, el, all) => spread(i, el, all) }),
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
    const chars = talk.querySelectorAll('.talk-ch');
    const from: From = (i) => ({ translate: '0 70%', rotate: `${i % 2 ? 14 : -14}deg`, opacity: 0 });
    hold(chars, from);
    ScrollTrigger.create({ trigger: main, start: 'bottom 85%', once: true, onEnter: () => play(chars, from, { duration: 1, ease: 'back.out(1.8)', stagger: 0.045 }) });
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
    const shine = card.querySelector<HTMLElement>('.card-shine');
    let box: DOMRect | null = null;
    let boxAt = -1;
    const move = (e: PointerEvent) => {
      // Reading the box every move forced a style pass each time; it only changes when the page scrolls.
      if (!box || boxAt !== window.scrollY) {
        box = card.getBoundingClientRect();
        boxAt = window.scrollY;
      }
      const r = box;
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rx((0.5 - py) * 9 * strength);
      ry((px - 0.5) * 11 * strength);
      ax?.((px - 0.5) * -28);
      ay?.((py - 0.5) * -28);
      shine?.style.setProperty('--sx', `${e.clientX - r.left}px`);
      shine?.style.setProperty('--sy', `${e.clientY - r.top}px`);
    };
    const leave = () => {
      box = null;
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
