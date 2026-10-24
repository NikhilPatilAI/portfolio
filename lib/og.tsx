import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Hue } from '@/data/content';

/**
 * Shared pieces for the Open Graph images (next/og). Satori reads TrueType, not the WOFF2 the site serves,
 * so assets/fonts holds static instances of the same Atkinson fonts (SIL Open Font License 1.1).
 */
const font = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file));
const [extraBold, bold, regular, mono] = await Promise.all([
  font('AtkinsonHyperlegibleNext-ExtraBold.ttf'),
  font('AtkinsonHyperlegibleNext-Bold.ttf'),
  font('AtkinsonHyperlegibleNext-Regular.ttf'),
  font('AtkinsonHyperlegibleMono-SemiBold.ttf'),
]);

export const ogSize = { width: 1200, height: 630 };

export const ogFonts = [
  { name: 'Atkinson', data: extraBold, weight: 800 as const, style: 'normal' as const },
  { name: 'Atkinson', data: bold, weight: 700 as const, style: 'normal' as const },
  { name: 'Atkinson', data: regular, weight: 400 as const, style: 'normal' as const },
  { name: 'Atkinson Mono', data: mono, weight: 600 as const, style: 'normal' as const },
];

export const INK = '#111318';
export const INK_SOFT = '#3b3f48';
const SPECTRUM = ['#ff4d4d', '#ff8a1f', '#ffc61a', '#8bd42a', '#14c98a', '#12c2cc', '#1fa2ff', '#6f7dff', '#b266ff', '#ff4fb2'];
export const RAINBOW = `linear-gradient(90deg, ${SPECTRUM.join(', ')})`;

/** The bright strength of each hue, as in globals.css (--color-<hue>). */
export const BRIGHT: Record<Hue, string> = {
  chili: '#fda297',
  mango: '#fea660',
  sun: '#ffd64d',
  lime: '#98d423',
  mint: '#09e095',
  sea: '#0cd7e0',
  sky: '#71c8ff',
  iris: '#a7baff',
  grape: '#d0a9fe',
  rose: '#fe98ca',
};

/** The ten-color bar that closes every section of the site. */
export function SpectrumBar({ width }: { width: number }) {
  return (
    <div style={{ display: 'flex', width, height: 12, borderRadius: 999, overflow: 'hidden' }}>
      {SPECTRUM.map((c) => (
        <div key={c} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );
}
