import { cardReceipts, podcast, projects, receipts, ribbonWords } from '@/data/content';

type Item = string | { fig: string; from: string };

// Every number on the project cards with the project it belongs to, then the podcast's episode count.
const numbers: Item[] = [
  ...projects.flatMap((p) => cardReceipts(p).map((id) => ({ fig: receipts[id].fig, from: p.title }))),
  { fig: receipts.eps.fig, from: podcast.name },
];

function Track({ items }: { items: readonly Item[] }) {
  // Two copies, so the moving band loops without a gap.
  const doubled = [...items, ...items];
  return (
    <div className="ribbon-track">
      {doubled.flatMap((item, i) => [
        <span key={`w${i}`}>
          {typeof item === 'string' ? (
            item
          ) : (
            <>
              {item.fig}
              <small>{item.from}</small>
            </>
          )}
        </span>,
        <i key={`d${i}`} />,
      ])}
    </div>
  );
}

/** Two crossing bands between the hero and the work: what I build, then the numbers behind it. Decorative; every word and number also appears in the sections below. */
export function Ribbons() {
  return (
    <div className="ribbons" aria-hidden="true">
      <div className="ribbon ribbon-a">
        <Track items={ribbonWords} />
      </div>
      <div className="ribbon ribbon-b">
        <Track items={numbers} />
      </div>
    </div>
  );
}
