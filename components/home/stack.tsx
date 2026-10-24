import { CardArt } from '@/components/art';
import { sections, stack } from '@/data/content';
import { tint } from '@/lib/style';

export function Stack() {
  return (
    <section className="section gutter" id="stack" aria-labelledby="stackTitle" style={{ background: 'var(--color-t-mango)' }} data-cur="var(--color-mango-d)">
      <div className="inner">
        <div className="section-head">
          <span className="tag" style={tint('mango')}>
            {sections.stack.tag}
          </span>
          <h2 className="section-title" id="stackTitle">
            {sections.stack.title}
          </h2>
          <p className="section-sub">{sections.stack.sub}</p>
        </div>
        <div className="kits">
          {stack.map((group, i) => (
            <article key={group.id} className={i === 0 ? 'kit kit-wide' : 'kit'} style={tint(group.hue)} aria-labelledby={`kit-${group.id}`}>
              <CardArt name={group.id} className="kit-art" />
              <span className="card-shine" aria-hidden="true" />
              <span className="kit-count">
                <b>{group.tools.length}</b> tools
              </span>
              <h3 className="kit-title" id={`kit-${group.id}`}>
                {group.title}
              </h3>
              <p className="kit-note">{group.note}</p>
              <ul className="kit-tools">
                {group.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
