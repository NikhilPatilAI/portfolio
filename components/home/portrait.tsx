'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface Face {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The About photo, with a computer-vision joke: when the card scrolls into view a scan line passes and a
 * detection box locks onto the face, the way an object detector labels a frame. Without JavaScript the box simply
 * sits there; with reduced motion it appears without moving.
 */
export function Portrait({ src, alt, face }: { src: string; alt: string; face: Face }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className={seen ? 'portrait seen' : 'portrait'}>
      <Image className="portrait-img" src={src} alt={alt} width={800} height={800} sizes="(max-width: 900px) 80vw, 380px" />
      <span className="portrait-scan" aria-hidden="true" />
      <span className="detect" aria-hidden="true" style={{ left: `${face.x}%`, top: `${face.y}%`, width: `${face.w}%`, height: `${face.h}%` }}>
        <span className="detect-label">person · Nikhil Patil</span>
      </span>
    </figure>
  );
}
