import { linkHub, podcast, projects, receipts, site, socials } from '@/data/content';

export interface AskLink {
  href: string;
  label: string;
}

/**
 * Every place an Ask Nikhil answer may link to: the site's own pages and sections, plus the outside links the site
 * already shows. The server lists these for the model, and the palette renders any other link as plain text.
 */
export const askLinks: AskLink[] = [
  { href: '/', label: 'Home' },
  { href: '/#work', label: 'Selected work' },
  ...projects.map((p) => ({ href: `/work/${p.slug}`, label: `${p.title} case study` })),
  { href: '/#about', label: 'About' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#teaching', label: `${podcast.name} podcast` },
  { href: '/#contact', label: 'Contact' },
  { href: '/resume', label: 'Resume' },
  { href: '/resume.pdf', label: 'Resume as a PDF' },
  { href: '/?view=quick', label: 'Quick view, a one-page summary' },
  { href: '/how-i-built-this', label: 'How this site was built' },
  { href: '/links', label: 'All links' },
  { href: `mailto:${site.email}`, label: 'Email Nikhil' },
  ...Object.values(socials).map((s) => ({ href: s.href, label: s.label })),
  ...linkHub.filter((l) => l.href.startsWith('http')).map((l) => ({ href: l.href, label: l.label })),
  ...projects.flatMap((p) => [{ href: p.href, label: `${p.title} source or demo` }, ...p.caseStudy.links.map((l) => ({ href: l.href, label: `${p.title}: ${l.label}` }))]),
  ...Object.values(receipts).flatMap((r) => (r.href ? [{ href: r.href, label: `Proof for ${r.fig}` }] : [])),
].filter((link, i, all) => all.findIndex((l) => l.href === link.href) === i);

const allowed = new Set(askLinks.map((l) => l.href));

export const isAskLink = (href: string) => allowed.has(href);
