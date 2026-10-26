import Link from 'next/link';
import { ViewTransition } from 'react';
import { CardArt } from '@/components/art';
import { LiveObserver } from '@/components/live-observer';
import { RichText } from '@/components/rich-text';
import { SectionHud } from '@/components/section-hud';
import { cardReceipts, projects, sections } from '@/data/content';
import { tint } from '@/lib/style';

// Numbers on the cards that open a receipt.
const proofs = new Set(projects.flatMap(cardReceipts)).size;

export function Work() {
  return (
    <section className="section gutter" id="work" aria-labelledby="workTitle" style={{ background: 'var(--color-t-sky)' }} data-cur="var(--color-sky-d)">
      <div className="inner">
        <div className="section-head">
          <span className="tag" style={tint('sky')}>
            {sections.work.tag}
          </span>
          <h2 className="section-title" id="workTitle">
            {sections.work.title}
          </h2>
          <p className="section-sub">{sections.work.sub}</p>
          <SectionHud hue="sky" items={[`${projects.length} projects`, `${proofs} receipts`, `${projects.filter((p) => p.status === 'Open source').length} open source`]} />
        </div>
        <ul className="cards">
          {projects.map((p) => (
            <li key={p.slug} className="card" style={tint(p.hue)} data-cursor="view">
              <CardArt name={p.slug} />
              <span className="card-shine" aria-hidden="true" />
              <div className="card-top">
                <span className="card-status">
                  <i aria-hidden="true" />
                  {p.status}
                </span>
                <span className="card-date">{p.date}</span>
              </div>
              {/* The title flies into the case study heading when the card is opened. */}
              <ViewTransition name={`title-${p.slug}`} share="morph" default="none">
                <h3 className="card-title">
                  <Link href={`/work/${p.slug}`} transitionTypes={['nav-forward']} data-cursor="view" data-track="project_open" data-track-project={p.slug}>
                    {p.title}
                  </Link>
                </h3>
              </ViewTransition>
              <p className="card-kicker">
                <RichText segments={p.kicker} scope={`${p.slug}-kicker`} />
              </p>
              <p className="card-line">
                <RichText segments={p.line} scope={`${p.slug}-line`} />
              </p>
              <ul className="card-stack" aria-label="Built with">
                {p.cardStack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <span className="card-go" aria-hidden="true">
                →
              </span>
            </li>
          ))}
        </ul>
        <LiveObserver selector="#work .card-art" />
      </div>
    </section>
  );
}
