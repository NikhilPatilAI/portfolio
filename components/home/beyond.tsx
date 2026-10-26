import { beyond, sections } from '@/data/content';
import { tint } from '@/lib/style';

export function Beyond() {
  return (
    <section className="section gutter" id="beyond" aria-labelledby="beyondTitle" style={{ background: 'var(--color-paper-2)' }} data-cur="var(--color-mint-d)">
      <div className="inner">
        <div className="section-head">
          <span className="tag" style={tint('mint')}>
            {sections.beyond.tag}
          </span>
          <h2 className="section-title" id="beyondTitle">
            {sections.beyond.title}
          </h2>
        </div>
        <ul className="beyond">
          {beyond.map((item) => (
            <li key={item.title} style={tint(item.hue)}>
              <span className="label">{item.meta}</span>
              <h3>{item.title}</h3>
              <p>
                {item.body}
                {item.href ? (
                  <>
                    {' '}
                    <a href={item.href} target="_blank" rel="noopener">
                      Follow along ↗
                    </a>
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
