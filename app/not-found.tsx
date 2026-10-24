import Link from 'next/link';
import { tint } from '@/lib/style';

export default function NotFound() {
  return (
    <main id="content" className="lost gutter">
      <div className="inner" style={{ display: 'grid', gap: 22 }}>
        <span className="tag" style={tint('chili')}>
          404
        </span>
        <h1 className="talk">
          <span className="talk-letters">
            <span className="talk-word">
              <span className="talk-ch" style={{ color: 'var(--color-s7)' }}>
                4
              </span>
              <span className="talk-ch" style={{ color: 'var(--color-s3)' }}>
                0
              </span>
              <span className="talk-ch" style={{ color: 'var(--color-s10)' }}>
                4
              </span>
            </span>
          </span>
        </h1>
        <p className="section-sub">This page got lost in the paint.</p>
        <div className="hero-ctas">
          <Link className="btn btn-ink" href="/">
            Back home
          </Link>
          <Link className="btn btn-soft" href="/#work">
            See the work
          </Link>
          <Link className="btn btn-soft" href="/resume">
            Resume
          </Link>
        </div>
      </div>
    </main>
  );
}
