/**
 * The visitor's motion choice. The system setting is the default; the site's switch overrides it either way.
 * The <head> script in app/layout.tsx applies it before first paint as html[data-motion="reduce" | "full"]
 * and marks the page as scripted (html.js), then as fully parsed (html.ready).
 */
export type MotionPref = 'reduce' | 'full';

export const motionScript = `(function(){var d=document.documentElement,s=null;d.classList.add('js');try{s=localStorage.getItem('motion')}catch(e){}var r=s?s==='reduce':window.matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.motion=r?'reduce':'full';document.addEventListener('DOMContentLoaded',function(){d.classList.add('ready')})})();`;

export function isMotionReduced() {
  return document.documentElement.dataset.motion === 'reduce';
}

/** Saves the choice and reloads, so every animation starts from the right state. */
export function setMotion(pref: MotionPref) {
  try {
    localStorage.setItem('motion', pref);
  } catch {
    // Storage can be blocked in some private windows; the reload then falls back to the system setting.
  }
  document.documentElement.dataset.motion = pref;
  window.location.reload();
}

export function toggleMotion() {
  setMotion(isMotionReduced() ? 'full' : 'reduce');
}
