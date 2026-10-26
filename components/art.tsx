/**
 * Live illustrations in the corner of project and tool cards: each one loops a tiny version of what the project does.
 * Pure SVG and CSS (the la-* classes in globals.css). They run only while on screen (LiveObserver adds .is-live), and
 * their resting frame is the finished picture, which is what reduced motion and no JavaScript show.
 */
const INK = '#111318';

const art: Record<string, React.ReactNode> = {
  // A page of claims: a scan passes, each claim gets a tick or a cross, and the verified seal lands.
  'legal-bot': (
    <g className="la-legal">
      <rect x="34" y="18" width="116" height="150" rx="14" fill="#FFFFFF" fillOpacity="0.75" />
      <g fill={INK} fillOpacity="0.2">
        <rect x="50" y="40" width="62" height="8" rx="4" />
        <rect x="50" y="62" width="74" height="8" rx="4" />
        <rect x="50" y="84" width="56" height="8" rx="4" />
        <rect x="50" y="106" width="68" height="8" rx="4" />
        <rect x="50" y="128" width="50" height="8" rx="4" />
      </g>
      <rect className="la-scan" x="40" y="32" width="104" height="24" rx="7" fill={INK} fillOpacity="0.1" />
      <g fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path className="la-mark m1" d="M122 44l5 5 9-10" stroke={INK} />
        <path className="la-mark m2" d="M132 66l5 5 9-10" stroke={INK} />
        <path className="la-mark m3" d="M116 83l10 10M126 83l-10 10" stroke="#C2181D" />
        <path className="la-mark m4" d="M128 110l5 5 9-10" stroke={INK} />
        <path className="la-mark m5" d="M110 132l5 5 9-10" stroke={INK} />
      </g>
      <g className="la-seal">
        <circle cx="152" cy="156" r="30" fill="#FFFFFF" />
        <path d="M139 156l9 9 17-19" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  ),
  // Four agents around an orchestrator; one message travels the loop and each agent lights up as it arrives.
  'agentic-rag': (
    <g className="la-rag">
      <g stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="8" strokeLinecap="round">
        <path d="M100 100L40 52" />
        <path d="M100 100L158 44" />
        <path d="M100 100L168 132" />
        <path d="M100 100L52 152" />
      </g>
      <g fill="#FFFFFF">
        <circle cx="100" cy="100" r="26" fillOpacity="0.9" />
        <circle className="la-node n1" cx="40" cy="52" r="15" />
        <circle className="la-node n2" cx="158" cy="44" r="16" />
        <circle className="la-node n3" cx="168" cy="132" r="14" />
        <circle className="la-node n4" cx="52" cy="152" r="16" />
      </g>
      <circle className="la-msg" cx="40" cy="52" r="7" fill={INK} />
    </g>
  ),
  // A training run: the loss falls, a little noisily, and a dot marks where the epoch ended.
  'gemma-shorts': (
    <g className="la-gemma">
      <path d="M22 22V178H182" fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path
        className="la-curve"
        d="M30 34L40 66L48 60L58 92L66 86L76 110L86 104L96 124L108 119L120 134L134 131L148 143L162 140L176 150"
        pathLength="1"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="la-end" cx="176" cy="150" r="10" fill={INK} />
    </g>
  ),
  // A queue of image jobs: tiles go from noise to finished, one after another.
  'grphte-ai': (
    <g className="la-grphte">
      {[0, 1, 2].flatMap((row) =>
        [0, 1, 2].map((col) => {
          const i = row * 3 + col;
          const x = 22 + col * 56;
          const y = 22 + row * 56;
          return (
            <g key={i}>
              <rect x={x} y={y} width="46" height="46" rx="11" fill="#FFFFFF" fillOpacity="0.28" />
              <g fill={INK} fillOpacity="0.18">
                <rect x={x + 8} y={y + 9} width="7" height="7" rx="2" />
                <rect x={x + 26} y={y + 15} width="7" height="7" rx="2" />
                <rect x={x + 14} y={y + 30} width="7" height="7" rx="2" />
              </g>
              <rect className={`la-tile t${i}`} x={x} y={y} width="46" height="46" rx="11" fill="#FFFFFF" />
            </g>
          );
        }),
      )}
    </g>
  ),
  // Chat bubbles, with the reply being typed.
  llm: (
    <g className="la-llm">
      <path d="M34 30h104a22 22 0 0 1 22 22v44a22 22 0 0 1-22 22H86l-34 28v-28H34a22 22 0 0 1-22-22V52a22 22 0 0 1 22-22z" fill="#FFFFFF" fillOpacity="0.85" />
      <path d="M120 120h46a22 22 0 0 1 22 22v24a22 22 0 0 1-22 22h-2v20l-26-20h-18a22 22 0 0 1-22-22v-24a22 22 0 0 1 22-22z" fill="#FFFFFF" fillOpacity="0.6" />
      <g fill={INK} fillOpacity="0.55">
        <circle className="la-dot d1" cx="62" cy="74" r="8" />
        <circle className="la-dot d2" cx="86" cy="74" r="8" />
        <circle className="la-dot d3" cx="110" cy="74" r="8" />
      </g>
    </g>
  ),
  // A detector's brackets lock onto an object while a scan line passes.
  cv: (
    <g className="la-cv">
      <g className="la-brackets" fill="none" stroke="#FFFFFF" strokeWidth="14" strokeLinecap="round">
        <path d="M24 64V24h40" />
        <path d="M136 24h40v40" />
        <path d="M176 136v40h-40" />
        <path d="M64 176H24v-40" />
      </g>
      <circle className="la-target" cx="100" cy="100" r="34" fill="#FFFFFF" fillOpacity="0.9" />
      <rect className="la-cvscan" x="34" y="40" width="132" height="6" rx="3" fill={INK} fillOpacity="0.35" />
    </g>
  ),
  // A pipeline: train, evaluate, deploy, each stage filling in turn.
  ops: (
    <g className="la-ops">
      {[30, 82, 134].map((y, i) => (
        <g key={y}>
          <rect x="20" y={y} width="160" height="40" rx="14" fill="#FFFFFF" fillOpacity="0.35" />
          <rect className={`la-bar b${i}`} x="20" y={y} width="160" height="40" rx="14" fill="#FFFFFF" fillOpacity="0.9" />
        </g>
      ))}
    </g>
  ),
};

export function CardArt({ name, className = 'card-art' }: { name: string; className?: string }) {
  if (!art[name]) return null;
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      {art[name]}
    </svg>
  );
}
