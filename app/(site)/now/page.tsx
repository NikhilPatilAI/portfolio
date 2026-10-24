import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { PageFrame } from '@/components/page-frame';
import { now } from '@/data/content';
import { shortDate } from '@/lib/dates';
import { tint } from '@/lib/style';

export const metadata: Metadata = {
  title: 'Now',
  description: 'What Nikhil Patil is building, learning and reading this month.',
  alternates: { canonical: '/now' },
};

const groups = [
  { key: 'building', title: 'Building', hue: 'sky' },
  { key: 'learning', title: 'Learning', hue: 'lime' },
  { key: 'reading', title: 'Reading', hue: 'grape' },
] as const;

export default function NowPage() {
  return (
    <>
      <SiteHeader />
      <PageFrame>
      <main id="content" className="page gutter">
        <div className="inner">
          <div className="page-head">
            <span className="tag" style={tint('sun')}>
              Now
            </span>
            <h1 className="page-title">This month.</h1>
            <p className="section-sub">{now.updated ? `Last updated ${shortDate(now.updated)}.` : 'Waiting for this month\'s update.'}</p>
          </div>
          <div className="beyond">
            {groups.map((g) => (
              <section key={g.key} className="kit" style={tint(g.hue)} aria-labelledby={`now-${g.key}`}>
                <h2 className="kit-title" id={`now-${g.key}`}>
                  {g.title}
                </h2>
                {now[g.key].length ? (
                  <ul className="ticks">
                    {now[g.key].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="todo">TODO: ask Nikhil</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
      </PageFrame>
    </>
  );
}
