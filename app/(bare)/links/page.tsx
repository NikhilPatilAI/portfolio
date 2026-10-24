import type { Metadata } from 'next';
import Link from 'next/link';
import { CopyEmail } from '@/components/copy-email';
import { linkHub, site } from '@/data/content';
import { tint } from '@/lib/style';

export const metadata: Metadata = {
  title: 'Links',
  description: `Everything from ${site.name} in one place: portfolio, resume, podcast and socials.`,
  alternates: { canonical: '/links' },
};

/** The link in the Instagram bio: big tap targets, nothing else to load. */
export default function LinksPage() {
  return (
    <main id="content" className="links-page gutter">
      <div className="links-head">
        <span className="tag" style={tint('sun')}>
          Links
        </span>
        <h1>{site.name}</h1>
        <p>
          {site.role} · {site.location}
        </p>
      </div>
      <ul className="hub">
        {linkHub.map((item) => {
          const internal = item.href.startsWith('/');
          const inner = (
            <>
              {item.label}
              {item.note ? <small>{item.note}</small> : null}
            </>
          );
          return (
            <li key={item.label}>
              {internal ? (
                <Link href={item.href} style={tint(item.hue)}>
                  {inner}
                </Link>
              ) : (
                <a href={item.href} target="_blank" rel="noopener" style={tint(item.hue)}>
                  {inner}
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <CopyEmail email={site.email} />
    </main>
  );
}
