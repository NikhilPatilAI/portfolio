import type { CSSProperties } from 'react';
import type { Hue } from '@/data/content';

/** Sets the --c custom property that colors cards, chips and tags. */
export function tint(hue: Hue, strength: '' | '-d' | 't-' = ''): CSSProperties {
  const name = strength === 't-' ? `t-${hue}` : `${hue}${strength}`;
  return { '--c': `var(--color-${name})` } as CSSProperties;
}

/** Sets an arbitrary CSS custom property. */
export function cssVar(name: string, value: string): CSSProperties {
  return { [name]: value } as CSSProperties;
}
