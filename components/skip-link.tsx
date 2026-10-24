'use client';

/**
 * Jumps past the header to the page's main content. Next.js keeps up to three visited pages hidden in the document,
 * each with its own <main id="content">, so the target is the one on screen. Without JavaScript the plain #content link works.
 */
export function SkipLink() {
  return (
    <a
      className="skip"
      href="#content"
      onClick={(e) => {
        const main = [...document.querySelectorAll<HTMLElement>('main')].find((m) => m.getClientRects().length > 0);
        if (!main) return;
        main.tabIndex = -1;
        main.focus({ preventScroll: true });
        // The motion layer may already be gliding there.
        if (!e.defaultPrevented) {
          e.preventDefault();
          main.scrollIntoView();
        }
      }}
    >
      Skip to content
    </a>
  );
}
