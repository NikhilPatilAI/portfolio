import type { MetadataRoute } from 'next';
import { projects, site } from '@/data/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = site.lastUpdated;
  const pages = ['', '/resume', '/how-i-built-this', '/now', '/links'];
  return [
    ...pages.map((path) => ({ url: `${site.url}${path}`, lastModified, priority: path === '' ? 1 : 0.6 })),
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}`, lastModified, priority: 0.8 })),
  ];
}
