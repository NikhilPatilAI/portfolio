import { PDFDocument, PDFString, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import { certifications, education, experience, podcast, resume, site, socials, stack, topSkills } from '@/data/content';

/**
 * /resume.pdf: the same text as /resume, typeset with pdf-lib when the site builds. Helvetica keeps the file small
 * and readable by every applicant tracking system, and the links stay clickable. No phone number, by design.
 */

const PAGE: [number, number] = [595.28, 841.89]; // A4 in points
const MARGIN = 52;
const WIDTH = PAGE[0] - MARGIN * 2;
const INK = rgb(17 / 255, 19 / 255, 24 / 255);
const SOFT = rgb(59 / 255, 63 / 255, 72 / 255);
const LINE = rgb(0.86, 0.87, 0.9);
const BODY = 9.7;
const LEAD = 13.4;

const display = (href: string) => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

// Helvetica only knows the WinAnsi characters, so the few outside it get a plain-text stand-in.
const winAnsiExtras = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
const safe = (text: string) => text.replace(/₹\s?/g, 'INR ').replace(/[^\x20-\x7e\xa0-\xff]/g, (c) => (winAnsiExtras.includes(c) ? c : ''));

interface Style {
  font: PDFFont;
  size: number;
  color?: RGB;
  lead?: number;
}

/** A top-to-bottom writer that wraps words, breaks pages and keeps headings with what follows them. */
class Sheet {
  page: PDFPage;
  y = PAGE[1] - MARGIN;

  constructor(
    private doc: PDFDocument,
    private regular: PDFFont,
    private bold: PDFFont,
  ) {
    this.page = doc.addPage(PAGE);
  }

  room(height: number) {
    if (this.y - height >= MARGIN) return;
    this.page = this.doc.addPage(PAGE);
    this.y = PAGE[1] - MARGIN;
  }

  gap(points: number) {
    this.y -= points;
  }

  /** Splits text into lines; the first line can be shorter, to make room for an inline label. */
  wrap(text: string, { font, size }: Style, width: number, firstWidth = width) {
    const lines: string[] = [];
    let line = '';
    for (const word of safe(text).split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (!line || font.widthOfTextAtSize(next, size) <= (lines.length ? width : firstWidth)) line = next;
      else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  text(text: string, style: Style, href?: string) {
    const lead = style.lead ?? style.size * 1.38;
    for (const line of this.wrap(text, style, WIDTH)) {
      this.room(lead);
      this.draw(line, MARGIN, style);
      if (href) this.link(href, MARGIN, style.font.widthOfTextAtSize(line, style.size), style.size);
      this.y -= lead;
    }
  }

  /** A bold label followed by text on the same line, as in "Agents and RAG: LangGraph, ...". */
  labelled(label: string, text: string) {
    const style = { font: this.regular, size: BODY };
    const labelWidth = this.bold.widthOfTextAtSize(label, BODY);
    this.wrap(text, style, WIDTH, WIDTH - labelWidth).forEach((line, i) => {
      this.room(LEAD);
      if (i === 0) this.draw(label, MARGIN, { font: this.bold, size: BODY });
      this.draw(line, MARGIN + (i === 0 ? labelWidth : 0), style);
      this.y -= LEAD;
    });
  }

  heading(title: string) {
    this.room(48);
    this.gap(9);
    this.draw(title.toUpperCase(), MARGIN, { font: this.bold, size: 10.2 });
    this.y -= 15;
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: MARGIN + WIDTH, y: this.y }, thickness: 0.8, color: LINE });
    this.y -= 8;
  }

  /** A role or project title with its dates flush right. Keeps at least one line of what follows on the same page. */
  row(title: string, when: string) {
    const size = 10.6;
    const whenSize = 9;
    const whenWidth = this.regular.widthOfTextAtSize(safe(when), whenSize);
    const lines = this.wrap(title, { font: this.bold, size }, WIDTH - whenWidth - 14);
    this.room(lines.length * 14 + LEAD + 2);
    this.draw(when, MARGIN + WIDTH - whenWidth, { font: this.regular, size: whenSize, color: SOFT });
    for (const line of lines) {
      this.draw(line, MARGIN, { font: this.bold, size });
      this.y -= 14;
    }
    this.gap(2);
  }

  bullet(text: string) {
    const indent = 12;
    this.wrap(text, { font: this.regular, size: BODY }, WIDTH - indent).forEach((line, i) => {
      this.room(LEAD);
      if (i === 0) this.draw('•', MARGIN + 2, { font: this.regular, size: BODY, color: SOFT });
      this.draw(line, MARGIN + indent, { font: this.regular, size: BODY });
      this.y -= LEAD;
    });
  }

  /** Items separated by bars (plain ASCII reads best in tracking systems), wrapped as whole items, each one a link when it has a target. */
  contact(items: { label: string; href?: string }[]) {
    const size = 9.6;
    const dot = '  |  ';
    const dotWidth = this.regular.widthOfTextAtSize(dot, size);
    let x = 0;
    this.room(LEAD);
    items.forEach((item, i) => {
      const label = safe(item.label);
      const width = this.regular.widthOfTextAtSize(label, size);
      if (i > 0 && x + dotWidth + width > WIDTH) {
        this.y -= LEAD;
        this.room(LEAD);
        x = 0;
      } else if (i > 0) {
        this.draw(dot, MARGIN + x, { font: this.regular, size, color: SOFT });
        x += dotWidth;
      }
      this.draw(label, MARGIN + x, { font: this.regular, size });
      if (item.href) this.link(item.href, MARGIN + x, width, size);
      x += width;
    });
    this.y -= LEAD;
  }

  private draw(text: string, x: number, { font, size, color = INK }: Style) {
    this.page.drawText(safe(text), { x, y: this.y - size, size, font, color });
  }

  private link(href: string, x: number, width: number, size: number) {
    const { context } = this.doc;
    const base = this.y - size;
    const annot = context.register(
      context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [x, base - size * 0.25, x + width, base + size * 0.95],
        Border: [0, 0, 0],
        A: { Type: 'Action', S: 'URI', URI: PDFString.of(href) },
      }),
    );
    this.page.node.addAnnot(annot);
  }
}

async function render() {
  // Dates come from the build, never the clock, so the file is identical for everyone and can be prerendered.
  const built = new Date(`${process.env.NEXT_PUBLIC_BUILD_DATE ?? site.lastUpdated}T00:00:00Z`);
  const doc = await PDFDocument.create({ updateMetadata: false });
  doc.setTitle(`${site.name}, ${site.role}: Resume`);
  doc.setAuthor(site.name);
  doc.setSubject(`Resume of ${site.name}, ${site.role} in Mumbai`);
  doc.setKeywords(topSkills);
  doc.setCreator(site.url);
  doc.setProducer('pdf-lib');
  doc.setLanguage('en-IN');
  doc.setCreationDate(built);
  doc.setModificationDate(built);

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const s = new Sheet(doc, regular, bold);
  const body = { font: regular, size: BODY, lead: LEAD };

  s.text(site.name, { font: bold, size: 24, lead: 29 });
  s.text(site.role, { font: regular, size: 12, color: SOFT, lead: 19 });
  s.contact([
    { label: 'Mumbai, India' },
    { label: site.email, href: `mailto:${site.email}` },
    { label: display(socials.linkedin.href), href: socials.linkedin.href },
    { label: display(socials.github.href), href: socials.github.href },
    { label: display(site.url), href: site.url },
  ]);

  s.heading('Summary');
  s.text(resume.summary, body);

  s.heading('Experience');
  experience.forEach((r) => {
    s.row(`${r.role}, ${r.org}`, `${r.start} to ${r.end}${r.place ? `, ${r.place}` : ''}`);
    (r.bullets.length ? r.bullets : [r.summary]).forEach((b) => s.bullet(b));
    s.gap(6);
  });

  s.heading('Projects');
  resume.projects.forEach((p) => {
    s.row(p.fullTitle, p.date);
    p.resumeBullets.forEach((b) => s.bullet(b));
    s.text(display(p.href), { font: regular, size: 8.8, color: SOFT, lead: 12 }, p.href);
    s.gap(6);
  });

  s.heading('Skills');
  stack.forEach((g) => s.labelled(`${g.title}: `, g.tools.join(', ')));
  s.labelled(`${resume.extraSkills.title}: `, resume.extraSkills.tools.join(', '));

  s.heading('Education');
  education.forEach((e) => {
    s.row(e.degree, `${e.start} to ${e.end}`);
    s.text(`${e.school}, ${e.grade}`, body);
    s.gap(4);
  });

  s.heading('Certifications');
  certifications.forEach((c) => s.bullet(`${c.name}, ${c.issuer} (${c.date})`));

  s.heading('Teaching');
  s.text(resume.teaching, body);
  s.text(display(podcast.show.href), { font: regular, size: 8.8, color: SOFT, lead: 12 }, podcast.show.href);

  const pages = doc.getPages();
  pages.forEach((page, i) => {
    const footer = `${site.name}  |  Resume  |  Page ${i + 1} of ${pages.length}`;
    page.drawText(footer, { x: MARGIN + WIDTH - regular.widthOfTextAtSize(footer, 8), y: MARGIN / 2, size: 8, font: regular, color: SOFT });
  });

  // One pass with no pauses between objects, so the whole file is written during the build.
  return doc.save({ objectsPerTick: Infinity });
}

export async function GET() {
  const pdf = await render();
  return new Response(new Blob([pdf as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }), {
    headers: { 'Content-Disposition': `inline; filename="${site.name.replace(/\s+/g, '-')}-Resume.pdf"` },
  });
}
