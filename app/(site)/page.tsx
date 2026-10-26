import type { Metadata } from 'next';
import { About } from '@/components/home/about';
import { Beyond } from '@/components/home/beyond';
import { Experience } from '@/components/home/experience';
import { Hero } from '@/components/home/hero';
import { Ribbons } from '@/components/home/ribbons';
import { Stack } from '@/components/home/stack';
import { Teaching } from '@/components/home/teaching';
import { Work } from '@/components/home/work';
import { LiveObserver } from '@/components/live-observer';
import { PageFrame } from '@/components/page-frame';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

// A visitor who picked Quick view before lands on it again. Runs before paint, only on a full page load.
const rememberView = "try{if(localStorage.getItem('view')==='quick')location.replace('/?view=quick')}catch(e){}";

export default function StoryPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: rememberView }} />
      <SiteHeader view="story" />
      <PageFrame>
        <main id="content">
          <Hero />
          <Ribbons />
          <Work />
          <About />
          <Experience />
          <Stack />
          <Teaching />
          <Beyond />
          <LiveObserver selector=".section-hud" />
        </main>
      </PageFrame>
    </>
  );
}
