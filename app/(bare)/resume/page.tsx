import type { Metadata } from 'next';
import Link from 'next/link';
import { certifications, education, experience, podcast, resume, site, socials, stack } from '@/data/content';
import { PrintButton } from './print-button';

export const metadata: Metadata = {
  title: 'Resume',
  description: `Resume of ${site.name}, ${site.role} in Mumbai.`,
  alternates: { canonical: '/resume' },
};

const display = (href: string) => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** One plain, ATS-friendly page generated from content.ts, with the same text as /resume.pdf. No phone number, by design. */
export default function ResumePage() {
  return (
    <div className="resume-shell gutter">
      <div className="resume-bar">
        <Link className="btn btn-soft" href="/">
          ← Back to the site
        </Link>
        <div className="resume-actions">
          <a className="btn btn-ink" href="/resume.pdf" download="Nikhil-Patil-Resume.pdf" data-track="resume_download" data-track-format="pdf">
            Download PDF
          </a>
          <PrintButton />
        </div>
      </div>
      <main className="resume" id="content">
        <header>
          <h1>{site.name}</h1>
          <p className="r-title">{site.role}</p>
          <ul className="r-contact">
            <li>Mumbai, India</li>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              <a href={socials.linkedin.href}>{display(socials.linkedin.href)}</a>
            </li>
            <li>
              <a href={socials.github.href}>{display(socials.github.href)}</a>
            </li>
          </ul>
        </header>

        <section aria-labelledby="r-summary">
          <h2 id="r-summary">Summary</h2>
          <p>{resume.summary}</p>
        </section>

        <section aria-labelledby="r-experience">
          <h2 id="r-experience">Experience</h2>
          {experience.map((r) => (
            <div key={r.org} className="r-item">
              <div className="r-row">
                <h3>
                  {r.role}, {r.org}
                </h3>
                <span className="r-when">
                  {r.start} to {r.end}
                  {r.place ? ` · ${r.place}` : ''}
                </span>
              </div>
              <ul>
                {(r.bullets.length ? r.bullets : [r.summary]).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section aria-labelledby="r-projects">
          <h2 id="r-projects">Projects</h2>
          {resume.projects.map((p) => (
            <div key={p.slug} className="r-item">
              <div className="r-row">
                <h3>{p.fullTitle}</h3>
                <span className="r-when">{p.date}</span>
              </div>
              <ul>
                {p.resumeBullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="r-when">{display(p.href)}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="r-skills">
          <h2 id="r-skills">Skills</h2>
          <div className="r-skills">
            {stack.map((g) => (
              <p key={g.id}>
                <b>{g.title}:</b> {g.tools.join(', ')}
              </p>
            ))}
            <p>
              <b>{resume.extraSkills.title}:</b> {resume.extraSkills.tools.join(', ')}
            </p>
          </div>
        </section>

        <section aria-labelledby="r-education">
          <h2 id="r-education">Education</h2>
          {education.map((e) => (
            <div key={e.degree} className="r-item">
              <div className="r-row">
                <h3>{e.degree}</h3>
                <span className="r-when">
                  {e.start} to {e.end}
                </span>
              </div>
              <p>
                {e.school} · {e.grade}
              </p>
            </div>
          ))}
        </section>

        <section aria-labelledby="r-certs">
          <h2 id="r-certs">Certifications</h2>
          <ul>
            {certifications.map((c) => (
              <li key={c.name}>
                {c.name}, {c.issuer} ({c.date})
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="r-teaching">
          <h2 id="r-teaching">Teaching</h2>
          <p>
            {resume.teaching} {display(podcast.show.href)}
          </p>
        </section>
      </main>
    </div>
  );
}
