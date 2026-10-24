import { ImageResponse } from 'next/og';
import { site } from '@/data/content';
import { INK, INK_SOFT, ogFonts, ogSize, RAINBOW, SpectrumBar } from '@/lib/og';

export const alt = `${site.name}, ${site.role} in Mumbai. ${site.tagline.before}${site.tagline.highlight}${site.tagline.after}`;
export const size = ogSize;
export const contentType = 'image/png';

// The same deep hues the hero's embedding map uses, one per topic cluster.
const HUES = ['#0171a3', '#853dc2', '#0a7d51', '#c2410c', '#4556d9', '#b51c79'];
const CENTERS: [number, number][] = [
  [860, 170],
  [1050, 230],
  [960, 360],
  [1100, 420],
  [880, 500],
  [1040, 560],
];

/** A seeded scatter, so the preview is identical on every build. */
function scatter() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd());
  return Array.from({ length: 210 }, (_, i) => {
    const c = i % 6;
    return { c, x: CENTERS[c][0] + gauss() * 44, y: CENTERS[c][1] + gauss() * 36, r: i % 9 === 0 ? 6 : 3 };
  });
}

/** The link preview for the site: the name in solid ink, with the hero's embedding map beside it. */
export default function Image() {
  const dots = scatter();
  const [qx, qy] = [985, 330];
  const top = [...dots]
    .filter((d) => d.r === 6)
    .sort((a, b) => Math.hypot(a.x - qx, a.y - qy) - Math.hypot(b.x - qx, b.y - qy))
    .slice(0, 4);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#ffffff', fontFamily: 'Atkinson', color: INK }}>
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: 'absolute', left: 0, top: 0 }}>
          {top.map((d) => (
            <line key={`l${d.x}`} x1={qx} y1={qy} x2={d.x} y2={d.y} stroke={HUES[d.c]} strokeWidth={3} strokeLinecap="round" />
          ))}
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={HUES[d.c]} fillOpacity={d.r === 6 ? 1 : 0.55} />
          ))}
          <circle cx={qx} cy={qy} r={13} fill="none" stroke={INK} strokeWidth={3} />
          <path d={`M${qx - 24} ${qy}h14M${qx + 10} ${qy}h14M${qx} ${qy - 24}v14M${qx} ${qy + 10}v14`} stroke={INK} strokeWidth={3} />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: '64px 72px' }}>
          <div style={{ display: 'flex', fontFamily: 'Atkinson Mono', fontWeight: 600, fontSize: 24, letterSpacing: 2.4, color: INK_SOFT }}>{`${site.role} · ${site.location}`.toUpperCase()}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {site.name.split(' ').map((part) => (
              <div key={part} style={{ display: 'flex', fontSize: 150, fontWeight: 800, letterSpacing: -8, lineHeight: 0.86 }}>
                {part}
              </div>
            ))}
            <div style={{ display: 'flex', marginTop: 34, fontSize: 46, fontWeight: 700, letterSpacing: -0.5 }}>
              <span style={{ whiteSpace: 'pre' }}>{site.tagline.before}</span>
              <span style={{ display: 'flex', position: 'relative' }}>
                {site.tagline.highlight}
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: -4, height: 10, borderRadius: 999, backgroundImage: RAINBOW }} />
              </span>
              <span>{site.tagline.after}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SpectrumBar width={340} />
            {/* A white backing keeps the address readable over the map's dots. */}
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, background: '#ffffff', padding: '6px 14px', borderRadius: 999 }}>{new URL(site.url).host}</div>
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: ogFonts },
  );
}
