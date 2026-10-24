import { projects, receipts, type Hue, type ReceiptId } from '@/data/content';
import { tint } from '@/lib/style';

/** The project whose copy cites a receipt lends it its color; anything else uses the podcast's iris. */
function receiptHue(id: ReceiptId): Hue {
  const owner = projects.find((p) => p.line.some((s) => typeof s !== 'string' && 'receipt' in s && s.receipt === id));
  return owner ? owner.hue : 'iris';
}

/** One popover per receipt, opened by any ReceiptButton on the page. Works without JavaScript. */
export function ReceiptSheets() {
  return (
    <>
      {(Object.keys(receipts) as ReceiptId[]).map((id) => {
        const r = receipts[id];
        return (
          <div key={id} id={`receipt-${id}`} popover="auto" role="dialog" aria-label={`Receipt ${r.n}: ${r.fig}`} className="sheet" style={tint(receiptHue(id))}>
            <div className="sheet-stripe" aria-hidden="true" />
            <div className="sheet-top">
              <p className="label">Receipt {String(r.n).padStart(2, '0')}</p>
              <button type="button" className="sheet-close" popoverTarget={`receipt-${id}`} popoverTargetAction="hide">
                Close
              </button>
            </div>
            <p className="sheet-fig">{r.fig}</p>
            <p>{r.what}</p>
            <p className="sheet-how">{r.how}</p>
            <p className="sheet-src">Source · {r.source}</p>
            {r.href ? (
              <a className="sheet-link" href={r.href} target="_blank" rel="noopener">
                Open the source ↗
              </a>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
