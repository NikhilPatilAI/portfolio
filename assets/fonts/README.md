# Fonts for the link preview images

Static TrueType instances of Atkinson Hyperlegible Next (400, 700, 800) and Atkinson Hyperlegible Mono (600), Latin subset. They were cut with fontTools from the same variable fonts the site loads from Google Fonts through `next/font`.

They exist only because `next/og` (Satori) reads TrueType and not WOFF2. Nothing here is sent to visitors; the images are drawn at build time by `app/opengraph-image.tsx` and `app/(site)/work/[slug]/opengraph-image.tsx`.

Both families are by the Braille Institute of America and are licensed under the SIL Open Font License 1.1: https://openfontlicense.org
