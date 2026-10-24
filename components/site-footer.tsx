import { CopyEmail } from '@/components/copy-email';
import { IstClock } from '@/components/ist-clock';
import { MotionSwitch } from '@/components/motion-switch';
import { PaletteButton } from '@/components/shortcuts';
import { sections, site, socials } from '@/data/content';
import { shortDate } from '@/lib/dates';
import { tint } from '@/lib/style';

const letterColors = ['--color-s1', '--color-s2', '--color-s3', '--color-s4', '--color-s5', '--color-s6', '--color-s7', '--color-s8', '--color-s9', '--color-s10'];

function StickerLetters({ text }: { text: string }) {
  let n = 0;
  return (
    <span className="talk-letters" aria-hidden="true">
      {text.split(' ').map((word, w) => (
        <span key={w} className="talk-word">
          {Array.from(word).map((ch, i) => (
            <span key={i} className="talk-ch" style={{ color: `var(${letterColors[n++ % letterColors.length]})` }}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export function SiteFooter() {
  // Stamped at build time by next.config.ts, so it always shows the latest deploy.
  const lastUpdated = shortDate(process.env.NEXT_PUBLIC_BUILD_DATE ?? site.lastUpdated);
  return (
    <footer className="footer gutter" id="contact" data-cur="var(--color-grape-d)">
      <div className="inner footer-grid">
        <span className="tag" style={tint('grape')}>
          {sections.contact.tag}
        </span>
        <h2 className="talk">
          <span className="sr-only">{sections.contact.title}</span>
          <StickerLetters text={sections.contact.title} />
        </h2>
        <CopyEmail email={site.email} />
        <ul className="socials">
          {Object.values(socials).map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener" style={{ background: `var(--color-${s.hue})` }}>
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
        <div className="spectrum-bar" aria-hidden="true" />
        <div className="footer-meta">
          <span>
            {site.location} · <IstClock /> IST
          </span>
          <span>Last updated {lastUpdated}</span>
          <a href="#top">Back to the top ↑</a>
        </div>
        <div className="footer-tools">
          <PaletteButton label="Jump to" />
          <PaletteButton mode="help" label="Keyboard shortcuts" />
          <MotionSwitch />
        </div>
      </div>
    </footer>
  );
}
