/**
 * The build crew: on a first visit the Story page arrives as a wireframe, and four named agents with their own
 * cursors assemble it, the hero at once and every section as it scrolls into view. It is a scripted replay, said so
 * in its log, and it uses only the Web Animations API, so it runs before the motion layer has loaded.
 *
 * globals.css hides each part until it carries data-built (an attribute, because React rewrites the class of parts it re-renders, such as the photo) (see "Build crew"); the selectors there and in JOBS match.
 */

type Kind = 'type' | 'pop' | 'wall';
type Job = [selector: string, agent: number, kind: Kind, say: (el: HTMLElement) => string];

// The roles of a multi-agent build, one job each: words, blocks, looks, and a final check.
const CREW: [name: string, hue: string][] = [
  ['Planner', 'sky'],
  ['Coder', 'mint'],
  ['Designer', 'grape'],
  ['Reviewer', 'mango'],
];
const [PLANNER, CODER, DESIGNER, REVIEWER] = [0, 1, 2, 3];

const text = (el: Element, inner?: string) => ((inner ? el.querySelector(inner) : el)?.textContent ?? '').replace(/\s+/g, ' ').trim();
const clip = (s: string, n = 26) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

// DRAFT. What each agent builds, and what the log says while it does.
const JOBS: Job[] = [
  ['.section-title', PLANNER, 'type', (el) => `writing "${clip(text(el))}"`],
  ['.section-sub', PLANNER, 'type', () => 'writing the intro'],
  ['.about-lines li', PLANNER, 'type', () => 'writing a line about Nikhil'],
  ['.card', CODER, 'pop', (el) => `placing ${clip(text(el, '.card-title'))}`],
  ['.kit', CODER, 'pop', (el) => `packing ${clip(text(el, '.kit-title'))}`],
  ['.timeline > li', CODER, 'pop', (el) => `adding ${clip(text(el, '.timeline-role'))}`],
  ['.cred', CODER, 'pop', () => 'filing the credentials'],
  ['.eps', CODER, 'wall', (el) => `stacking ${el.querySelectorAll('.ep').length} episode covers`],
  ['.beyond > li', CODER, 'pop', () => 'adding a side note'],
  ['.lab', DESIGNER, 'pop', () => 'starting the live model'],
  ['.meta .chip', DESIGNER, 'pop', () => 'pinning a fact'],
  ['.tag', DESIGNER, 'pop', (el) => `tagging ${clip(text(el))}`],
  ['.section-hud', DESIGNER, 'pop', () => 'wiring the readout'],
  ['.portrait, .monogram', DESIGNER, 'pop', () => 'developing the photo'],
  ['.teach-links', DESIGNER, 'pop', () => 'linking the podcast'],
];

interface Agent {
  name: string;
  color: string;
  el: HTMLElement;
  x: number;
  y: number;
  on: boolean;
}
interface Part {
  el: HTMLElement;
  kind: Kind;
  say: string;
}

const shown = (el: Element) => el.getClientRects().length > 0;
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const BACK = 'cubic-bezier(0.34, 1.4, 0.64, 1)';

// The flood animates the radius of a hole in the blueprint, which needs a registered length property.
let holes = false;
try {
  CSS.registerProperty({ name: '--fr', syntax: '<length>', inherits: false, initialValue: '0px' });
  holes = true;
} catch {
  // Already registered (a second visit to the page), or not supported: then the sheet fades instead.
  holes = typeof CSS !== 'undefined' && 'registerProperty' in CSS && CSS.supports('mask-image', 'radial-gradient(circle, #000, #000)');
}

/** Starts the crew on the Story page's <main>. Returns a function that stops it and shows whatever is left. */
export function startCrew(main: HTMLElement) {
  const root = document.documentElement;
  let stopped = false;
  let waiting = 0;

  const layer = document.createElement('div');
  layer.id = 'crew';
  layer.setAttribute('aria-hidden', 'true');
  const agents: Agent[] = CREW.map(([name, hue]) => {
    const el = document.createElement('div');
    el.className = 'crew-cur';
    el.style.setProperty('--a', `var(--color-${hue})`);
    el.innerHTML = `<svg viewBox="0 0 18 18"><path d="M2 1.5 15.5 8l-6 1.6L7.4 16z"/></svg><span>${name}</span>`;
    layer.appendChild(el);
    return { name, color: `var(--color-${hue})`, el, x: 0, y: 0, on: false };
  });

  const log = document.createElement('div');
  log.id = 'crew-log';
  // DRAFT
  log.innerHTML = '<p class="crew-log-title" aria-hidden="true">Build crew · a scripted replay</p><ol aria-hidden="true"></ol>';
  const lines = log.querySelector('ol') as HTMLOListElement;
  document.body.append(layer, log);

  const say = (agent: Agent, what: string) => {
    const li = document.createElement('li');
    li.style.setProperty('--a', agent.color);
    li.innerHTML = '<i></i><b></b> ';
    (li.querySelector('b') as HTMLElement).textContent = agent.name;
    li.append(what);
    lines.appendChild(li);
    while (lines.children.length > 3) lines.firstElementChild?.remove();
  };

  /** Glides an agent's cursor to a point on the page. A cursor that is off screen joins from the nearest edge. */
  const move = async (agent: Agent, x: number, y: number, ms: number) => {
    const top = window.scrollY;
    const bottom = top + window.innerHeight;
    if (!agent.on) {
      agent.x = x + (agent === agents[PLANNER] ? -260 : 260);
      agent.y = bottom + 40;
      agent.on = true;
      agent.el.classList.add('is-on');
    } else if (agent.y < top - 60 || agent.y > bottom + 60) agent.y = agent.y < top ? top - 40 : bottom + 40;
    const from = `translate(${agent.x}px, ${agent.y}px)`;
    const to = `translate(${x}px, ${y}px)`;
    agent.x = x;
    agent.y = y;
    agent.el.style.transform = to;
    await agent.el.animate([{ transform: from }, { transform: to }], { duration: ms, easing: EASE }).finished.catch(() => {});
  };

  /** Turns a wireframe part into the real thing: text is written in from the left, blocks pop in, the wall cascades. */
  const reveal = (part: Part, agent: Agent, speed: number) => {
    const { el, kind } = part;
    el.dataset.built = '';
    if (kind === 'type') {
      el.animate([{ clipPath: 'inset(-8% 100% -8% 0)' }, { clipPath: 'inset(-8% -2% -8% 0)' }], { duration: Math.min(420, 180 + text(el).length * 5) * speed, easing: 'linear' });
    } else if (kind === 'wall') {
      // The podcast wall cascades in from the show cover, as it always has.
      [...el.children].forEach((child, i) => child.animate([{ opacity: 0, translate: '0 40px', scale: 0.88, offset: 0 }], { duration: 800 * speed, delay: i * 32 * speed, easing: BACK, fill: 'backwards' }));
    } else if (el.matches('.card, .kit')) {
      // Cards keep their own arrival: a rise with a slight turn, then the tool names pop in one by one.
      const turn = [...(el.parentElement?.children ?? [])].indexOf(el) % 2 ? 3 : -3;
      el.animate([{ opacity: 0, translate: '0 80px', rotate: `${turn}deg`, offset: 0 }], { duration: 1200 * speed, easing: EASE });
      el.querySelectorAll('.kit-tools li').forEach((tool, i) => tool.animate([{ opacity: 0, scale: 0.5, offset: 0 }], { duration: 600, delay: 300 * speed + i * 30, easing: 'cubic-bezier(0.34, 1.8, 0.64, 1)', fill: 'backwards' }));
    } else if (el.matches('.portrait, .monogram')) {
      el.animate([{ clipPath: 'inset(100% 0% 0% 0% round 36px)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', scale: 1 }], { duration: 1200 * speed, easing: EASE });
    } else if (el.matches('.timeline > li')) {
      el.animate([{ opacity: 0, translate: '0 30px', offset: 0 }], { duration: 800 * speed, easing: EASE });
      el.querySelector('.timeline-when i')?.animate([{ scale: 0, offset: 0 }], { duration: 600, delay: 100, easing: 'cubic-bezier(0.34, 2, 0.64, 1)', fill: 'backwards' });
    } else {
      el.animate([{ opacity: 0, translate: '0 46px', scale: 0.97, offset: 0 }], { duration: 900 * speed, easing: BACK });
    }
    el.animate(
      [
        { outline: `2px solid ${agent.color}`, outlineOffset: '3px' },
        { outline: '2px solid transparent', outlineOffset: '12px' },
      ],
      { duration: 520 * speed, easing: 'ease-out' },
    );
  };

  const partsOf = (section: HTMLElement) => {
    const found: { part: Part; agent: number }[] = [];
    for (const [selector, agent, kind, label] of JOBS)
      section.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (shown(el) && !('built' in el.dataset)) found.push({ part: { el, kind, say: label(el) }, agent });
      });
    return found.sort((a, b) => (a.part.el.compareDocumentPosition(b.part.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  };
  const finish = (section: HTMLElement) => {
    partsOf(section).forEach(({ part }) => (part.el.dataset.built = ''));
    section.querySelector(':scope > .crew-sheet')?.remove();
  };

  /** The blueprint over a finished section opens from the Reviewer's cursor outwards, and the section's color floods in. */
  const flood = (section: HTMLElement, x: number, y: number, speed: number) => {
    const sheet = section.querySelector<HTMLElement>(':scope > .crew-sheet');
    if (!sheet) return;
    const r = section.getBoundingClientRect();
    const reach = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) + 40;
    sheet.style.setProperty('--fx', `${x}px`);
    sheet.style.setProperty('--fy', `${y}px`);
    const a = holes
      ? sheet.animate([{ '--fr': '0px' }, { '--fr': `${reach}px` }] as Keyframe[], { duration: 900 * speed, easing: 'cubic-bezier(0.3, 0, 0.2, 1)', fill: 'forwards' })
      : sheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 * speed, fill: 'forwards' });
    a.finished.then(
      () => sheet.remove(),
      () => sheet.remove(),
    );
  };

  /** One section: the three builders work their own lists side by side, then the Reviewer checks the result. */
  const build = async (section: HTMLElement) => {
    const found = partsOf(section);
    const gone = section.getBoundingClientRect().bottom < 0;
    if (stopped || gone || !found.length) return finish(section);
    // A visitor scrolling fast has sections queueing up behind this one; the crew hurries to keep pace.
    const speed = waiting > 1 ? 0.45 : 1;
    await Promise.all(
      agents.slice(0, REVIEWER).map(async (agent, index) => {
        for (const { part } of found.filter((f) => f.agent === index)) {
          if (stopped) return;
          const r = part.el.getBoundingClientRect();
          say(agent, part.say);
          await move(agent, r.left + window.scrollX + Math.min(r.width - 8, 28), r.top + window.scrollY + Math.min(r.height / 2, 44), 170 * speed);
          reveal(part, agent, speed);
          await wait(45 * speed);
        }
      }),
    );
    if (stopped) return finish(section);
    section.classList.add('crew-inked');
    const reviewer = agents[REVIEWER];
    const r = section.getBoundingClientRect();
    await move(reviewer, r.left + window.scrollX + Math.min(r.width - 120, r.width * 0.78), r.top + window.scrollY + 72, 190 * speed);
    // DRAFT
    say(reviewer, `checked ${section.id === 'top' ? 'the intro' : section.id}: ${found.length} parts in place`);
    flood(section, reviewer.x - (r.left + window.scrollX), reviewer.y - (r.top + window.scrollY), speed);
    await wait(70 * speed);
  };

  const sections = [...main.querySelectorAll<HTMLElement>('.hero, .section')].filter(shown);
  // Each unbuilt section lies under a blueprint sheet, and each part carries its measurements like a drawing does.
  for (const section of sections) {
    const found = partsOf(section);
    if (!found.length) continue;
    // The hero's name and buttons are on the page from the first paint, so no sheet is laid over them.
    if (section.matches('.hero')) continue;
    const sheet = document.createElement('div');
    sheet.className = 'crew-sheet';
    sheet.setAttribute('aria-hidden', 'true');
    section.prepend(sheet);
    for (const { part } of found) {
      const r = part.el.getBoundingClientRect();
      if (r.width < 90 || !/^(static|relative)$/.test(getComputedStyle(part.el).position)) continue;
      part.el.dataset.dim = `${Math.round(r.width)} × ${Math.round(r.height)}`;
    }
  }
  let left = sections.length;
  let chain = Promise.resolve();
  const queued = new Set<HTMLElement>();
  const queue = (section: HTMLElement) => {
    if (queued.has(section)) return;
    queued.add(section);
    waiting++;
    chain = chain.then(async () => {
      await build(section);
      waiting--;
      if (--left === 0 && !stopped) done();
    });
  };

  /** The page is whole: the wireframe rules come off, the cursors leave, and the log says so before it fades. */
  const done = () => {
    root.classList.remove('crew');
    agents.forEach((a) => a.el.classList.remove('is-on'));
    log.classList.add('is-done');
    // DRAFT
    say(agents[REVIEWER], 'page complete');
    setTimeout(() => {
      layer.remove();
      log.remove();
    }, 1800);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom > 0) continue;
        io.unobserve(entry.target);
        // A jump down the page never brings the sections in between into view, so they go first: built if still
        // on screen, simply shown if already passed.
        for (const section of sections.slice(0, sections.indexOf(entry.target as HTMLElement) + 1)) queue(section);
      }
    },
    { rootMargin: '0px 0px -16% 0px' },
  );

  const stop = () => {
    if (stopped) return;
    stopped = true;
    io.disconnect();
    sections.forEach(finish);
    main.querySelectorAll('.crew-sheet').forEach((sheet) => sheet.remove());
    root.classList.remove('crew');
    layer.remove();
    log.remove();
  };

  try {
    // Once per browser session; /?crew plays it again.
    sessionStorage.setItem('crew', '1');
  } catch {
    // Storage can be blocked; the build then plays on every full load.
  }
  sections.forEach((section) => io.observe(section));
  return stop;
}
