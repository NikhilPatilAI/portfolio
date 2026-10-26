import { about, portrait, sections } from '@/data/content';
import { tint } from '@/lib/style';
import type { Hue } from '@/data/content';
import { Portrait } from './portrait';

const dots: Hue[] = ['sky', 'grape', 'mint'];

export function About() {
  return (
    <section className="section gutter" id="about" aria-labelledby="aboutTitle" data-cur="var(--color-grape-d)">
      <div className="inner about">
        {portrait ? (
          <Portrait src={portrait.src} alt={portrait.alt} face={portrait.face} />
        ) : (
          <div className="monogram" aria-hidden="true">
            <span>NP</span>
          </div>
        )}
        <div>
          <div className="section-head">
            <span className="tag" style={tint('grape')}>
              {sections.about.tag}
            </span>
            <h2 className="section-title" id="aboutTitle">
              {sections.about.title}
            </h2>
          </div>
          <ul className="about-lines">
            {about.map((line, i) => (
              <li key={i} style={tint(dots[i % dots.length])}>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
