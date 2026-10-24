import { ViewTransition } from 'react';
import { MotionRoot } from './motion-root';

const slide = { 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' };

/**
 * The frame around every page: it slides left or right when the link says which way the visitor is going, and it
 * starts the motion layer. Both live inside the page, not the layout: layouts never enter or exit, and an effect in
 * here only runs once this page has hydrated, so the motion layer never edits markup React has not claimed yet.
 */
export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={slide} exit={slide} default="none">
      {children}
      <MotionRoot />
    </ViewTransition>
  );
}
