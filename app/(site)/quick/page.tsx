import type { Metadata } from 'next';
import Link from 'next/link';
import { CopyEmail } from '@/components/copy-email';
import { PageFrame } from '@/components/page-frame';
import { SiteHeader } from '@/components/site-header';
import { certifications, education, experience, podcast, projects, site, socials, topSkills } from '@/data/content';

export const metadata: Metadata = {
  title: 'Quick view',
  description: `${site.name}, ${site.role} in Mumbai: skills, projects with results, experience and contact on one page.`,
  alternates: { canonical: '/?view=quick' },
};

/** One column, no motion: everything a recruiter needs in under a minute. Shared as /?view=quick. */
export default function QuickView() {
  return (
    <>
      <SiteHeader view="quick" />
      <PageFrame>
      <main id="content" className="gutter">
        <div className="quick">
          <section className="quick-lead" aria-labelledby="quickName">
            <p className="label">Quick view</p>
            <h1 id="quickName">{site.name}</h1>
            <p>
              <b>{site.role}</b> · {site.location} · {site.experience}
            </p>
            <p>{site.oneLiner}</p>
            <div className="hero-ctas">
              <Link className="btn btn-ink" href="/resume" data-track="resume_download" data-track-format="page">
                Resume
              </Link>
              <a className="btn btn-soft" href={socials.linkedin.href} target="_blank" rel="noopener">
                LinkedIn ↗
              </a>
              <a className="btn btn-soft" href={socials.github.href} target="_blank" rel="noopener">
                GitHub ↗
              </a>
            </div>
          </section>

          <section aria-labelledby="quickSkills">
            <h2 id="quickSkills">Top skills</h2>
            <ul className="pills">
              {topSkills.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="quickProjects">
            <h2 id="quickProjects">Projects</h2>
            <ul className="quick-list">
              {projects.map((p) => (
                <li key={p.slug}>
                  <span className="quick-when">
                    {p.status} · {p.date}
                  </span>
                  <b>
                    <Link href={`/work/${p.slug}`} transitionTypes={['nav-forward']} data-track="project_open" data-track-project={p.slug}>
                      {p.fullTitle}
                    </Link>
                  </b>
                  <p>{p.outcome}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="quickExperience">
            <h2 id="quickExperience">Experience</h2>
            <ul className="quick-list">
              {experience.map((r) => (
                <li key={r.org}>
                  <span className="quick-when">
                    {r.start} to {r.end}
                  </span>
                  <b>
                    {r.role}, {r.org}
                  </b>
                  <p>{r.summary}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="quickEducation">
            <h2 id="quickEducation">Education and certifications</h2>
            <ul className="quick-list">
              {education.map((e) => (
                <li key={e.degree}>
                  <span className="quick-when">
                    {e.start} to {e.end}
                  </span>
                  <b>{e.degree}</b>
                  <p>{e.school}</p>
                </li>
              ))}
              {certifications.map((c) => (
                <li key={c.name}>
                  <span className="quick-when">{c.date}</span>
                  <b>{c.name}</b>
                  <p>{c.issuer}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="quickTeaching">
            <h2 id="quickTeaching">Teaching</h2>
            <p>
              {podcast.about}{' '}
              <a href={podcast.show.href} target="_blank" rel="noopener">
                {podcast.episodes.length} episodes on Spotify ↗
              </a>
            </p>
          </section>

          <section aria-labelledby="quickContact">
            <h2 id="quickContact">Contact</h2>
            <CopyEmail email={site.email} />
          </section>
        </div>
      </main>
      </PageFrame>
    </>
  );
}
