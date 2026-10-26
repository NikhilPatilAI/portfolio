import type { CSSProperties } from 'react';
import type { Hue } from '@/data/content';

/** A small readout under a section heading, in the voice of the hero's lab, with real counts from content.ts. */
export function SectionHud({ items, hue }: { items: string[]; hue: Hue }) {
  return (
    <p className="section-hud" style={{ '--hud': `var(--color-${hue}-d)` } as CSSProperties}>
      <b aria-hidden="true" />
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </p>
  );
}
