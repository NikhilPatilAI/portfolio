'use client';

// The palette's code loads on first open; pointing at the button starts that download a moment early.
const warm = () => {
  void import('./command-palette');
};

/**
 * Ask Nikhil, one click away on every page: a pill in the bottom corner with Nikhil's glasses, his name and an AI tag.
 * On hover the eyes look around. On phones it shrinks to the glasses, clear of the floating Story or Quick view
 * switch. It steps aside while the palette is open.
 */
export function AskButton({ away, onOpen }: { away: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      className={away ? 'btn btn-ink ask-fab is-away' : 'btn btn-ink ask-fab'}
      aria-haspopup="dialog"
      aria-keyshortcuts="A"
      onClick={onOpen}
      onPointerEnter={warm}
      onFocus={warm}
    >
      <svg className="ask-fab-icon" viewBox="0 0 40 40" aria-hidden="true">
        <circle className="ask-fab-disc" cx="20" cy="20" r="20" />
        <path className="ask-fab-temple" d="M8.6 17.2 6.2 15.8M31.4 17.2l2.4-1.4" />
        <rect className="ask-fab-lens" x="8.6" y="14.8" width="10" height="8.4" rx="2" />
        <rect className="ask-fab-lens" x="21.4" y="14.8" width="10" height="8.4" rx="2" />
        <path className="ask-fab-bridge" d="M18.6 17.4q1.4-1.3 2.8 0" />
        <g className="ask-fab-eyes">
          <circle cx="13.6" cy="19.2" r="1.7" />
          <circle cx="26.4" cy="19.2" r="1.7" />
        </g>
      </svg>
      <span className="ask-fab-label">Ask Nikhil</span>
      <span className="ask-fab-tag">AI</span>
    </button>
  );
}
