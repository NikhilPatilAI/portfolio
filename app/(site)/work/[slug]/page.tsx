import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ViewTransition } from 'react';
import { Flow } from '@/components/flow';
import { PageFrame } from '@/components/page-frame';
import { RichText } from '@/components/rich-text';
import { SiteHeader } from '@/components/site-header';
import { projectBySlug, projects } from '@/data/content';
import { tint } from '@/lib/style';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return {
    title: project.fullTitle,
    description: project.caseStudy.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: project.fullTitle, description: project.caseStudy.summary, type: 'article' },
  };
}

export default async function CaseStudyPage({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  const cs = project.caseStudy;
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <SiteHeader />
      <PageFrame>
      <main id="content">
        <header className="cs-hero gutter" style={tint(project.hue)} data-cur={`var(--color-${project.hue}-d)`}>
          <div className="inner cs-hero-grid">
            <Link className="crumb" href="/#work" transitionTypes={['nav-back']}>
              ← All work
            </Link>
            <p className="label" style={{ color: 'var(--color-ink)' }}>
              Case study · {project.status} · {project.date}
            </p>
            <ViewTransition name={`title-${project.slug}`} share="morph" default="none">
              <h1 className="cs-title">{project.title}</h1>
            </ViewTransition>
            <p className="cs-kicker">
              <RichText segments={project.kicker} scope={`${project.slug}-hero`} />
            </p>
            <dl className="cs-facts">
              <div>
                <dt>My role</dt>
                <dd>{cs.role}</dd>
              </div>
              <div>
                <dt>Built with</dt>
                <dd>{project.cardStack.join(', ')}</dd>
              </div>
              <div>
                <dt>Links</dt>
                <dd className="link-row">
                  {cs.links.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noopener">
                      {link.label} ↗
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="gutter" data-cur="var(--color-ink)">
          <div className="inner cs-body">
            <section className="cs-section" aria-labelledby={`${project.slug}-tldr`}>
              <h2 className="cs-h2" id={`${project.slug}-tldr`}>
                In short
              </h2>
              <div className="tldr" style={tint(project.hue, 't-')}>
                <div>
                  <span className="label">The problem</span>
                  <p>{cs.tldr.problem}</p>
                </div>
                <div>
                  <span className="label">What I built</span>
                  <p>{cs.tldr.built}</p>
                </div>
                <div>
                  <span className="label">The result</span>
                  <p>{cs.tldr.result}</p>
                </div>
              </div>
            </section>

            <section className="cs-section" aria-labelledby={`${project.slug}-context`}>
              <h2 className="cs-h2" id={`${project.slug}-context`}>
                Context and constraints
              </h2>
              <div className="prose">
                {cs.context.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <ul className="ticks" style={tint(project.hue)}>
                {cs.constraints.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>

            <section className="cs-section" aria-labelledby={`${project.slug}-architecture`}>
              <h2 className="cs-h2" id={`${project.slug}-architecture`}>
                How it works
              </h2>
              <Flow flow={cs.flow} hue={project.hue} />
            </section>

            <section className="cs-section" aria-labelledby={`${project.slug}-decisions`}>
              <h2 className="cs-h2" id={`${project.slug}-decisions`}>
                Decisions and tradeoffs
              </h2>
              <ul className="decisions">
                {cs.decisions.map((d) => (
                  <li key={d.title} style={tint(project.hue)}>
                    <h3>{d.title}</h3>
                    <p>{d.body}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="cs-section" aria-labelledby={`${project.slug}-results`}>
              <h2 className="cs-h2" id={`${project.slug}-results`}>
                Results
              </h2>
              <ul className="results">
                {cs.results.map((r) => (
                  <li key={r.label} style={tint(project.hue, 't-')}>
                    <b>{r.value}</b>
                    <span>{r.label}</span>
                    {r.detail ? <small>{r.detail}</small> : null}
                  </li>
                ))}
              </ul>
              <p className="source-line">
                Source:{' '}
                {cs.resultsSource.href ? (
                  <a href={cs.resultsSource.href} target="_blank" rel="noopener">
                    {cs.resultsSource.label} ↗
                  </a>
                ) : (
                  cs.resultsSource.label
                )}
              </p>
              <h3 className="label">Limits I state up front</h3>
              <ul className="ticks">
                {cs.limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </section>

            <section className="cs-section" aria-labelledby={`${project.slug}-differently`}>
              <h2 className="cs-h2" id={`${project.slug}-differently`}>
                What I would do differently
              </h2>
              <ul className="ticks" style={tint(project.hue)}>
                {cs.differently.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </section>

            <section className="cs-section" aria-labelledby={`${project.slug}-stack`}>
              <h2 className="cs-h2" id={`${project.slug}-stack`}>
                Stack and links
              </h2>
              <ul className="pills">
                {cs.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <div className="link-row">
                {cs.links.map((link) => (
                  <a key={link.href} className="btn btn-soft" href={link.href} target="_blank" rel="noopener">
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </section>

            <nav aria-label="Next project">
              <Link
                className="next-card"
                href={`/work/${next.slug}`}
                style={tint(next.hue)}
                transitionTypes={['nav-forward']}
                data-cursor="view"
                data-track="project_open"
                data-track-project={next.slug}
              >
                <span className="label" style={{ color: 'var(--color-ink)' }}>
                  Next project
                </span>
                <b>{next.title} →</b>
                <span>{next.caseStudy.summary}</span>
              </Link>
            </nav>
          </div>
        </div>
      </main>
      </PageFrame>
    </>
  );
}
