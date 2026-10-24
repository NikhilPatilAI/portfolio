import Link from 'next/link';
import { certifications, education, experience, sections } from '@/data/content';
import { tint } from '@/lib/style';

export function Experience() {
  return (
    <section className="section gutter" id="experience" aria-labelledby="experienceTitle" style={{ background: 'var(--color-t-lime)' }} data-cur="var(--color-lime-d)">
      <div className="inner">
        <div className="section-head">
          <span className="tag" style={tint('lime')}>
            {sections.experience.tag}
          </span>
          <h2 className="section-title" id="experienceTitle">
            {sections.experience.title}
          </h2>
          <p className="section-sub">{sections.experience.sub}</p>
        </div>
        <ol className="timeline">
          {experience.map((r) => (
            <li key={r.org}>
              <p className="timeline-when" style={tint(r.hue)}>
                <i aria-hidden="true" />
                {r.start} to {r.end}
              </p>
              <div>
                <h3 className="timeline-role">{r.role}</h3>
                <p className="timeline-org">
                  {r.org}
                  {r.place ? ` · ${r.place}` : ''}
                </p>
                <p className="timeline-summary">{r.summary}</p>
                {r.link ? (
                  <Link className="timeline-link" href={r.link}>
                    Read the case study →
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <div className="creds">
          <div className="cred">
            <h3>Education</h3>
            <ul>
              {education.map((e) => (
                <li key={e.degree}>
                  <b>{e.degree}</b>
                  <span>
                    {e.school} · {e.start} to {e.end}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cred">
            <h3>Certifications</h3>
            <ul>
              {certifications.map((c) => (
                <li key={c.name}>
                  <b>{c.name}</b>
                  <span>
                    {c.issuer} · {c.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
