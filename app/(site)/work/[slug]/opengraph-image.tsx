import { ImageResponse } from 'next/og';
import { plain, projectBySlug, projects, site } from '@/data/content';
import { BRIGHT, INK, INK_SOFT, ogFonts, ogSize, SpectrumBar } from '@/lib/og';

export const alt = `Case study by ${site.name}`;
export const size = ogSize;
export const contentType = 'image/png';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/** A case study's link preview: the project's own color band, as at the top of its page, and its headline result. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug) ?? projects[0];
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#ffffff', fontFamily: 'Atkinson', color: INK }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 418, padding: '52px 72px 44px', background: BRIGHT[project.hue] }}>
          <div style={{ display: 'flex', fontFamily: 'Atkinson Mono', fontWeight: 600, fontSize: 24, letterSpacing: 2.4 }}>{`Case study · ${project.status} · ${project.date}`.toUpperCase()}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 132, fontWeight: 800, letterSpacing: -6, lineHeight: 0.95 }}>{project.title}</div>
            <div style={{ display: 'flex', marginTop: 22, fontSize: 44, fontWeight: 700, letterSpacing: -0.4 }}>{plain(project.kicker)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: '30px 72px 38px' }}>
          <div style={{ display: 'flex', fontSize: 27, lineHeight: 1.38, color: INK_SOFT }}>{project.outcome}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', fontSize: 28, fontWeight: 800 }}>{site.name}</div>
            <SpectrumBar width={300} />
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: ogFonts },
  );
}
