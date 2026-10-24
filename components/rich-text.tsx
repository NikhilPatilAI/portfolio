import { Fragment } from 'react';
import { glosses, receipts, type GlossId, type ReceiptId, type Segment } from '@/data/content';
import { cssVar } from '@/lib/style';

/** A number that opens its receipt. The receipt panels live once per page, in ReceiptSheets. */
export function ReceiptButton({ id, text }: { id: ReceiptId; text: string }) {
  return (
    <button type="button" className="receipt" popoverTarget={`receipt-${id}`} data-cursor="proof">
      {text}
      <sup>{receipts[id].n}</sup>
    </button>
  );
}

/** A term of art with its plain-words explanation, anchored under the word where the browser supports it. */
export function Gloss({ id, text, uid }: { id: GlossId; text: string; uid: string }) {
  const anchor = cssVar('--anchor', `--gloss-${uid}`);
  return (
    <>
      <button type="button" className="gloss" popoverTarget={`gloss-${uid}`} style={anchor}>
        {text}
      </button>
      <span id={`gloss-${uid}`} popover="auto" className="gloss-pop" style={anchor}>
        <span className="label">In plain words</span>
        <span className="gloss-text">{glosses[id].text}</span>
      </span>
    </>
  );
}

/** Renders inline copy that mixes plain text, receipts and glosses. `scope` keeps popover ids unique on the page. */
export function RichText({ segments, scope }: { segments: Segment[]; scope: string }) {
  return (
    <>
      {segments.map((segment, i) => {
        if (typeof segment === 'string') return <Fragment key={i}>{segment}</Fragment>;
        if ('receipt' in segment) return <ReceiptButton key={i} id={segment.receipt} text={segment.text} />;
        return <Gloss key={i} id={segment.gloss} text={segment.text} uid={`${scope}-${i}`} />;
      })}
    </>
  );
}
