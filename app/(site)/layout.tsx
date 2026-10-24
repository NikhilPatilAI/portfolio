import { ReceiptSheets } from '@/components/receipt-sheets';
import { Shortcuts } from '@/components/shortcuts';
import { SiteFooter } from '@/components/site-footer';
import { SkipLink } from '@/components/skip-link';

// The motion layer starts from each page's PageFrame, so it only runs once that page has hydrated.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <div className="site-main">{children}</div>
      <SiteFooter />
      <ReceiptSheets />
      <Shortcuts />
    </>
  );
}
