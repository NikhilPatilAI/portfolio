import { ribbonWords } from '@/data/content';

function Track({ words }: { words: readonly string[] }) {
  // Two copies, so the band still fills wide screens once Phase 3 sets it moving.
  const doubled = [...words, ...words];
  return (
    <div className="ribbon-track">
      {doubled.flatMap((word, i) => [<span key={`w${i}`}>{word}</span>, <i key={`d${i}`} />])}
    </div>
  );
}

/** Two crossing bands between the hero and the work. Decorative; the same words appear in the Stack section. */
export function Ribbons() {
  return (
    <div className="ribbons" aria-hidden="true">
      <div className="ribbon ribbon-a">
        <Track words={ribbonWords} />
      </div>
      <div className="ribbon ribbon-b">
        <Track words={[...ribbonWords].reverse()} />
      </div>
    </div>
  );
}
