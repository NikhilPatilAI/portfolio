import Link from 'next/link';
import { nav, site } from '@/data/content';
import { tint } from '@/lib/style';
import { PaletteButton } from './shortcuts';
import { ViewToggle } from './view-toggle';

export function SiteHeader({ view }: { view?: 'story' | 'quick' }) {
  // The header stays put while pages slide underneath it (see ::view-transition-group(site-header)).
  return (
    <header className="topbar" style={{ viewTransitionName: 'site-header' }}>
      <Link className="logo" href="/" transitionTypes={['nav-back']}>
        {site.name}
      </Link>
      <nav aria-label="Main" className="topnav">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} style={tint(item.hue)} transitionTypes={['nav-back']}>
            {item.label}
          </Link>
        ))}
        {view ? <ViewToggle current={view} /> : null}
        <PaletteButton label="Jump to" />
      </nav>
    </header>
  );
}
