import Link from 'next/link';
import { IstClock } from '@/components/ist-clock';
import { site } from '@/data/content';
import { tint } from '@/lib/style';
import { LabStage } from './lab-stage';

export function Hero() {
  const [first, ...rest] = site.name.split(' ');
  return (
    <section className="hero" id="top" aria-label="Introduction" data-cur="var(--color-ink)">
      <div className="hero-inner gutter">
        <div className="hero-main inner">
          <div className="hero-copy">
            {/* One solid ink color, stacked; nothing ever plays behind it. */}
            <h1 className="hero-name" id="heroName">
              <span>{first}</span> <span>{rest.join(' ')}</span>
            </h1>
            <p className="hero-tagline">
              {site.tagline.before}
              {/* Keeps the closing period on the same line as the underlined words. */}
              <span className="keep">
                <span className="uline">{site.tagline.highlight}</span>
                {site.tagline.after}
              </span>
            </p>
            <div className="hero-ctas">
              <a className="btn btn-ink" href="#work">
                View work
                <span className="btn-arrow" aria-hidden="true">
                  ↓
                </span>
              </a>
              <Link className="btn btn-soft" href="/resume" data-track="resume_download" data-track-format="page">
                Resume
              </Link>
            </div>
          </div>
          <LabStage />
        </div>
        <div className="hero-foot inner">
          <ul className="meta" aria-label="About me">
            <li className="chip" style={tint('sky')}>
              <i aria-hidden="true" />
              {site.role}
            </li>
            <li className="chip" style={tint('mint')}>
              <i aria-hidden="true" />
              {site.location} · <IstClock /> IST
            </li>
            <li className="chip" style={tint('mango')}>
              <i aria-hidden="true" />
              {site.experience}
            </li>
          </ul>
          <div className="spectrum-bar" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
