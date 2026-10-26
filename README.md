# Nikhil Patil · portfolio

The personal site of Nikhil Patil, AI/ML engineer in Mumbai: projects with receipts, case studies, a recruiter-friendly Quick view, the resume as a page and a PDF, and the AI, but Simple podcast.

## What is in it

- **Story page** (`/`): the hero with a live AI lab beside the name, then work, about, experience, stack, teaching and beyond.
- **Quick view** (`/?view=quick`): one column for recruiters. It is the `/quick` route behind a rewrite in `next.config.ts`, and the site remembers the visitor's choice.
- **Case studies** (`/work/[slug]`): context, architecture, decisions, results with sources, limits and what I would do differently.
- **Resume** (`/resume` and `/resume.pdf`): the same text from one source; the PDF is typeset with pdf-lib at build time. No phone number, by design.
- **Links** (`/links`), **Now** (`/now`) and **How I built this** (`/how-i-built-this`).

## The AI lab

`lib/lab.ts` draws a small live model on a 2D canvas, with no libraries. About 900 particles morph through six stages:

1. **Embed:** skills and projects as a 3D embedding space; the cursor is the query and its four nearest documents come back ranked.
2. **Attend:** particles stream along attention weights, computed as softmax(QKᵀ / √d) over seeded embeddings.
3. **Fire:** a 4-7-7-4 network passes signals forward.
4. **Learn:** a real 2-12-12-1 network trains with Adam on every frame; its decision boundary is made of particles.
5. **Descend:** SGD, Momentum and Adam race down a rotating loss surface.
6. **Generate:** diffusion samples a brain out of noise in 40 steps, then its neurons fire.

The name is plain HTML in one ink color and nothing plays behind it. With reduced motion the lab shows still frames; without JavaScript it is left out.

## Stack

Next.js 16 (App Router, Cache Components, every route prerendered), React 19.3 view transitions, TypeScript, Tailwind CSS 4, GSAP with ScrollTrigger and SplitText plus Lenis for the motion layer (loaded on the visitor's first move), pdf-lib, `next/og` for link previews, Vercel Analytics and Speed Insights.

## Run it

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

## Editing content

Every word lives in `data/content.ts`: projects, receipts, experience, stack, podcast episodes and the resume text. Lines marked `// DRAFT` were drafted for review; `TODO: ask Nikhil` marks missing facts. Every number should trace to a results file, a README or the resume.

## Deploying

Vercel builds it with no settings. The site URL comes from `NEXT_PUBLIC_SITE_URL` when set, otherwise from Vercel's production URL. Analytics and Speed Insights only load on Vercel.

## Fonts

Atkinson Hyperlegible Next and Mono come from Google Fonts through `next/font`. `assets/fonts` holds static TrueType copies used only to draw the link-preview images; both families are under the SIL Open Font License 1.1.
