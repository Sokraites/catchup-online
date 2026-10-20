import type { APIRoute } from 'astro';
import { site } from '../config/site';

/** Alle Seiten aus src/pages, außer 404 und Endpunkten. */
const seiten = Object.keys(import.meta.glob('./**/*.astro'))
  .map((datei) => datei.replace(/^\.\//, '').replace(/\.astro$/, ''))
  .filter((name) => name !== '404')
  .map((name) => (name === 'index' ? '/' : `/${name.replace(/\/index$/, '')}/`))
  .sort();

export const GET: APIRoute = () => {
  const eintraege = seiten.map((pfad) => `  <url><loc>${new URL(pfad, site.url).href}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${eintraege}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
