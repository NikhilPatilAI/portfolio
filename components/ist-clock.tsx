'use client';

import { useSyncExternalStore } from 'react';

const format = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 15000);
  return () => window.clearInterval(id);
}

/** Live time in Mumbai. The server renders a placeholder; the browser fills in the time. */
export function IstClock() {
  const time = useSyncExternalStore(
    subscribe,
    () => format.format(new Date()),
    () => '--:--',
  );
  return <time>{time}</time>;
}
