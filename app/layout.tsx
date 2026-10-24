import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next, Instrument_Serif } from 'next/font/google';
import { Telemetry } from '@/components/telemetry';
import { podcast, site, socials, topSkills } from '@/data/content';
import { motionScript } from '@/lib/motion-pref';
import './globals.css';

// next/font has no metrics for the two Atkinson families, so globals.css defines size-matched fallbacks for them (see "Fallback faces").
const sans = Atkinson_Hyperlegible_Next({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-atkinson',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Atkinson Next Fallback'],
});
const mono = Atkinson_Hyperlegible_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-atkinson-mono',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['Atkinson Mono Fallback'],
});
// Only the gloss popovers use the serif, so it loads when one opens instead of competing with the first paint.
const voice = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument', display: 'swap', preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · ${site.role}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} · ${site.role}`,
    description: site.description,
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: `${site.name} · ${site.role}`, description: site.description },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
  viewportFit: 'cover',
};

const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  email: `mailto:${site.email}`,
  address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressCountry: 'IN' },
  knowsAbout: topSkills,
  sameAs: [socials.linkedin.href, socials.github.href, socials.instagram.href, podcast.show.href, podcast.links[1].href],
};

// Vercel serves the analytics scripts itself; anywhere else they would only 404.
const onVercel = Boolean(process.env.VERCEL);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The <head> script sets data-motion and the js class before paint, so <html> differs from the server copy on purpose.
    <html lang="en" className={`${sans.variable} ${mono.variable} ${voice.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, '\\u003c') }} />
        {children}
        <Telemetry />
        {onVercel ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
