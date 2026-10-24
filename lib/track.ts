import { track as vercelTrack } from '@vercel/analytics';

export type EventName = 'resume_download' | 'project_open' | 'email_copy' | 'quick_view_toggle' | 'ask_question';

/** Sends a Vercel Analytics custom event. Off Vercel, or with tracking blocked, it quietly does nothing. */
export function track(name: EventName, props?: Record<string, string>) {
  try {
    vercelTrack(name, props);
  } catch {
    // Analytics must never break the page.
  }
}
