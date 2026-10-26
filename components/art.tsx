import type { CSSProperties, ReactNode } from 'react';

/**
 * Live illustrations in the corner of project and tool cards: each one loops a tiny version of what the project does.
 * The still drawing is one SVG, and every moving part is its own small SVG laid over it, so each animation (the la-*
 * classes in globals.css, transform and opacity only) sits on an element the browser can hand to the GPU. Animating
 * shapes inside a single SVG made the main thread redraw it on every frame. The loops run only on screen
 * (LiveObserver adds .is-live), and their resting frame is the finished picture, which reduced motion and no
 * JavaScript show.
 */
const INK = '#111318';

/** Places a box from the drawing's 200 x 200 space over the still drawing, in percent. */
const at = (x: number, y: number, w: number, h: number): CSSProperties => ({ left: `${x / 2}%`, top: `${y / 2}%`, width: `${w / 2}%`, height: `${h / 2}%` });

/** A moving part. Its box is in the drawing's own coordinates, so the shapes inside keep their original numbers. */
function Part({ className, x, y, w, h, children }: { className: string; x: number; y: number; w: number; h: number; children: ReactNode }) {
  return (
    <svg className={className} viewBox={`${x} ${y} ${w} ${h}`} style={at(x, y, w, h)} focusable="false">
      {children}
    </svg>
  );
}

/** A tick at (x, y), as on the Legal Bot page; its box is centred on the tick so it scales about its middle. */
function Tick({ className, x, y }: { className: string; x: number; y: number }) {
  return (
    <Part className={className} x={x - 3} y={y - 8} w={20} h={16}>
      <path d={`M${x} ${y}l5 5 9-10`} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </Part>
  );
}

const tiles = [0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => ({ i: row * 3 + col, x: 22 + col * 56, y: 22 + row * 56 })));
const bars = [30, 82, 134];

const art: Record<string, { still?: ReactNode; moving: ReactNode }> = {
  // A page of claims: a scan passes, each claim gets a tick or a cross, and the verified seal lands.
  'legal-bot': {
    still: (
      <>
        <rect x="34" y="18" width="116" height="150" rx="14" fill="#FFFFFF" fillOpacity="0.75" />
        <g fill={INK} fillOpacity="0.2">
          <rect x="50" y="40" width="62" height="8" rx="4" />
          <rect x="50" y="62" width="74" height="8" rx="4" />
          <rect x="50" y="84" width="56" height="8" rx="4" />
          <rect x="50" y="106" width="68" height="8" rx="4" />
          <rect x="50" y="128" width="50" height="8" rx="4" />
        </g>
      </>
    ),
    moving: (
      <>
        <Part className="la-scan" x={40} y={32} w={104} h={24}>
          <rect x="40" y="32" width="104" height="24" rx="7" fill={INK} fillOpacity="0.1" />
        </Part>
        <Tick className="la-mark m1" x={122} y={44} />
        <Tick className="la-mark m2" x={132} y={66} />
        <Part className="la-mark m3" x={113} y={80} w={16} h={16}>
          <path d="M116 83l10 10M126 83l-10 10" fill="none" stroke="#C2181D" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </Part>
        <Tick className="la-mark m4" x={128} y={110} />
        <Tick className="la-mark m5" x={110} y={132} />
        <Part className="la-seal" x={122} y={126} w={60} h={60}>
          <circle cx="152" cy="156" r="30" fill="#FFFFFF" />
          <path d="M139 156l9 9 17-19" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </Part>
      </>
    ),
  },
  // Four agents around an orchestrator; one message travels the loop and each agent lights up as it arrives.
  'agentic-rag': {
    still: (
      <>
        <g stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="8" strokeLinecap="round">
          <path d="M100 100L40 52" />
          <path d="M100 100L158 44" />
          <path d="M100 100L168 132" />
          <path d="M100 100L52 152" />
        </g>
        <circle cx="100" cy="100" r="26" fill="#FFFFFF" fillOpacity="0.9" />
      </>
    ),
    moving: (
      <>
        <Part className="la-node n1" x={25} y={37} w={30} h={30}>
          <circle cx="40" cy="52" r="15" fill="#FFFFFF" />
        </Part>
        <Part className="la-node n2" x={142} y={28} w={32} h={32}>
          <circle cx="158" cy="44" r="16" fill="#FFFFFF" />
        </Part>
        <Part className="la-node n3" x={154} y={118} w={28} h={28}>
          <circle cx="168" cy="132" r="14" fill="#FFFFFF" />
        </Part>
        <Part className="la-node n4" x={36} y={136} w={32} h={32}>
          <circle cx="52" cy="152" r="16" fill="#FFFFFF" />
        </Part>
        <Part className="la-msg" x={33} y={45} w={14} h={14}>
          <circle cx="40" cy="52" r="7" fill={INK} />
        </Part>
      </>
    ),
  },
  // A training run: the loss falls, a little noisily, and a dot marks where the epoch ended.
  'gemma-shorts': {
    still: <path d="M22 22V178H182" fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />,
    moving: (
      <>
        <Part className="la-curve" x={24} y={28} w={158} h={128}>
          <path d="M30 34L40 66L48 60L58 92L66 86L76 110L86 104L96 124L108 119L120 134L134 131L148 143L162 140L176 150" pathLength="1" fill="none" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        </Part>
        <Part className="la-end" x={166} y={140} w={20} h={20}>
          <circle cx="176" cy="150" r="10" fill={INK} />
        </Part>
      </>
    ),
  },
  // A queue of image jobs: tiles go from noise to finished, one after another.
  'grphte-ai': {
    still: (
      <>
        {tiles.map(({ i, x, y }) => (
          <g key={i}>
            <rect x={x} y={y} width="46" height="46" rx="11" fill="#FFFFFF" fillOpacity="0.28" />
            <g fill={INK} fillOpacity="0.18">
              <rect x={x + 8} y={y + 9} width="7" height="7" rx="2" />
              <rect x={x + 26} y={y + 15} width="7" height="7" rx="2" />
              <rect x={x + 14} y={y + 30} width="7" height="7" rx="2" />
            </g>
          </g>
        ))}
      </>
    ),
    moving: (
      <>
        {tiles.map(({ i, x, y }) => (
          <Part key={i} className={`la-tile t${i}`} x={x} y={y} w={46} h={46}>
            <rect x={x} y={y} width="46" height="46" rx="11" fill="#FFFFFF" />
          </Part>
        ))}
      </>
    ),
  },
  // Chat bubbles, with the reply being typed.
  llm: {
    still: (
      <>
        <path d="M34 30h104a22 22 0 0 1 22 22v44a22 22 0 0 1-22 22H86l-34 28v-28H34a22 22 0 0 1-22-22V52a22 22 0 0 1 22-22z" fill="#FFFFFF" fillOpacity="0.85" />
        <path d="M120 120h46a22 22 0 0 1 22 22v24a22 22 0 0 1-22 22h-2v20l-26-20h-18a22 22 0 0 1-22-22v-24a22 22 0 0 1 22-22z" fill="#FFFFFF" fillOpacity="0.6" />
      </>
    ),
    moving: (
      <>
        {[62, 86, 110].map((cx, i) => (
          <Part key={cx} className={`la-dot d${i + 1}`} x={cx - 8} y={66} w={16} h={16}>
            <circle cx={cx} cy="74" r="8" fill={INK} fillOpacity="0.55" />
          </Part>
        ))}
      </>
    ),
  },
  // A detector's brackets lock onto an object while a scan line passes.
  cv: {
    moving: (
      <>
        <Part className="la-brackets" x={17} y={17} w={166} h={166}>
          <g fill="none" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round">
            <path d="M24 64V24h40" />
            <path d="M136 24h40v40" />
            <path d="M176 136v40h-40" />
            <path d="M64 176H24v-40" />
          </g>
        </Part>
        <Part className="la-target" x={66} y={66} w={68} h={68}>
          <circle cx="100" cy="100" r="34" fill="#FFFFFF" fillOpacity="0.9" />
        </Part>
        <Part className="la-cvscan" x={34} y={40} w={132} h={6}>
          <rect x="34" y="40" width="132" height="6" rx="3" fill={INK} fillOpacity="0.35" />
        </Part>
      </>
    ),
  },
  // A pipeline: train, evaluate, deploy, each stage filling in turn.
  ops: {
    still: (
      <>
        {bars.map((y) => (
          <rect key={y} x="20" y={y} width="160" height="40" rx="14" fill="#FFFFFF" fillOpacity="0.35" />
        ))}
      </>
    ),
    moving: (
      <>
        {bars.map((y, i) => (
          <Part key={y} className={`la-bar b${i}`} x={20} y={y} w={160} h={40}>
            <rect x="20" y={y} width="160" height="40" rx="14" fill="#FFFFFF" fillOpacity="0.9" />
          </Part>
        ))}
      </>
    ),
  },
};

export function CardArt({ name, className = 'card-art' }: { name: string; className?: string }) {
  const a = art[name];
  if (!a) return null;
  return (
    <span className={className} aria-hidden="true">
      {a.still && (
        <svg className="art-still" viewBox="0 0 200 200" focusable="false">
          {a.still}
        </svg>
      )}
      {a.moving}
    </span>
  );
}
