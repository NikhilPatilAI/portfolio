import Image from 'next/image';
import { ReceiptButton } from '@/components/rich-text';
import { SectionHud } from '@/components/section-hud';
import { podcast, sections } from '@/data/content';
import { tint } from '@/lib/style';

const month = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const first = podcast.episodes[0].date;
const last = podcast.episodes[podcast.episodes.length - 1].date;
const weeks = Math.round((Date.parse(last) - Date.parse(first)) / (7 * 864e5));

function Play() {
  return (
    <span className="ep-play" aria-hidden="true">
      <svg viewBox="0 0 16 16">
        <path d="M3 1.5v13l11-6.5z" fill="#111318" />
      </svg>
    </span>
  );
}

export function Teaching() {
  return (
    <section className="section gutter" id="teaching" aria-labelledby="teachTitle" style={{ background: 'var(--color-t-iris)' }} data-cur="var(--color-iris-d)">
      <div className="inner">
        <div className="section-head">
          <span className="tag" style={tint('iris')}>
            {sections.teaching.tag}
          </span>
          <h2 className="section-title" id="teachTitle">
            {podcast.name}
          </h2>
          <p className="section-sub">
            {podcast.about} <ReceiptButton id="eps" text="28 episodes" />, {podcast.total} of listening in all.
          </p>
          <SectionHud hue="iris" items={[`${month(first)} to ${month(last)}`, `${podcast.episodes.length} episodes in ${weeks} weeks`, 'Hinglish']} />
          <div className="teach-links">
            {podcast.links.map((link) => (
              <a key={link.label} className="chip" href={link.href} target="_blank" rel="noopener" style={tint(link.hue)}>
                <i aria-hidden="true" />
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
        <ul className="eps" aria-label={`All ${podcast.episodes.length} episodes`}>
          <li className="ep ep-show">
            <a href={podcast.show.href} target="_blank" rel="noopener" data-cursor="play">
              <span className="ep-cover">
                <Image src={podcast.show.cover} alt="" width={640} height={640} sizes="(max-width: 699px) 44vw, 340px" />
                <Play />
              </span>
              <span className="ep-meta">The show · {podcast.episodes.length} episodes</span>
              <span className="ep-title">Listen to the whole series on Spotify</span>
            </a>
          </li>
          {podcast.episodes.map((ep) => (
            <li key={ep.n} className="ep">
              <a href={ep.href} target="_blank" rel="noopener" data-cursor="play">
                <span className="ep-cover">
                  <Image src={ep.cover} alt="" width={360} height={360} sizes="(max-width: 699px) 44vw, 170px" />
                  <Play />
                </span>
                <span className="ep-meta">
                  EP {String(ep.n).padStart(2, '0')} · {ep.length}
                </span>
                <span className="ep-title">{ep.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
