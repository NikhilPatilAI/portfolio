import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { PageFrame } from '@/components/page-frame';
import { tint } from '@/lib/style';

export const metadata: Metadata = {
  title: 'How I built this',
  description: 'The decisions behind this portfolio: one content file, a ten-hue color system, a live AI lab drawn on a plain canvas, and the performance budget.',
  alternates: { canonical: '/how-i-built-this' },
};

// DRAFT. The sizes and scores below were measured on the production build before launch, 24 Oct 2026.
const parts = [
  {
    title: 'One file holds every word',
    hue: 'sky',
    body: [
      'Every project, number, role and episode lives in data/content.ts. The Story page, Quick view, the resume, the metadata and the Ask Nikhil assistant all read from it, so a change lands everywhere at once.',
      'Every number in that file points back to a results file, a README or my resume. If it cannot be traced, it does not ship.',
    ],
  },
  {
    title: 'Ten colors, four strengths, one job each',
    hue: 'grape',
    body: [
      'Each hue comes in a bright version for decoration, a soft version that carries dark text at 9:1 contrast or better, a deep version for colored text on white at 5:1 or better, and a pale tint that washes a section.',
      'Each project owns one hue, and the tool families do too: blues for LLMs and agents, greens for computer vision, warm colors for MLOps.',
    ],
  },
  {
    title: 'A live model in the hero, with no library',
    hue: 'mint',
    body: [
      'The lab beside my name is about 10 KB of my own code, gzipped, drawing on a plain 2D canvas. A real 2-12-12-1 network trains with Adam on every frame, attention is computed as softmax(QKᵀ / √d), and SGD, Momentum and Adam descend a real loss surface. No machine learning, 3D or animation library ships for it.',
      'My name is plain HTML text with nothing behind it, so it paints first. With reduced motion the lab shows still frames you can step through, and without JavaScript the page simply leaves it out.',
    ],
  },
  {
    // DRAFT
    title: 'Ask Nikhil, from this site only',
    hue: 'grape',
    body: [
      'The button with my glasses, in the corner of every page, answers questions about me with NVIDIA Nemotron, a free open model, through OpenRouter. It reads only what this site says, about 8,000 tokens in its prompt, so there is no vector database to drift out of date.',
      'Answers stream in, carry an AI label, link only to pages that exist, and point to my email instead of guessing. Each visitor gets a few questions every ten minutes, and the whole site has a daily ceiling.',
    ],
  },
  {
    title: 'Static by default',
    hue: 'mango',
    body: [
      'Every page is prerendered at build time. The podcast covers load only as they near the screen, and receipts and glosses use the browser\'s built-in popovers, so they work even before JavaScript loads.',
      'Smooth scrolling, scroll reveals and the custom cursor load on your first move, so the first seconds go to the content.',
      'The little loops on the project and tool cards are plain SVG and CSS, and they only run while they are on screen.',
    ],
  },
  {
    title: 'Measured, not promised',
    hue: 'iris',
    body: [
      'Lighthouse on a simulated mid-range phone: Performance 94 on the home page and 95 to 97 on the others, with Accessibility, Best Practices and SEO at 100 and no layout shift.',
    ],
  },
] as const;

export default function HowIBuiltThis() {
  return (
    <>
      <SiteHeader />
      <PageFrame>
      <main id="content" className="page gutter">
        <div className="inner">
          <div className="page-head">
            <span className="tag" style={tint('mint')}>
              Case study · this site
            </span>
            <h1 className="page-title">How I built this.</h1>
            <p className="section-sub">The portfolio is a project too. Here is what it is made of, and why.</p>
          </div>
          <div className="article">
            {parts.map((part, i) => (
              <section key={part.title} aria-labelledby={`part-${i}`}>
                <h2 className="cs-h2" id={`part-${i}`}>
                  {part.title}
                </h2>
                <div className="prose">
                  {part.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <div className="spectrum-bar" style={{ maxWidth: 200 }} aria-hidden="true" />
              </section>
            ))}
          </div>
        </div>
      </main>
      </PageFrame>
    </>
  );
}
