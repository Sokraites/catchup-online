import type { APIRoute } from 'astro';
import { site, INDEXIERUNG } from '../config/site';

/**
 * Schalter INDEXIERUNG (src/config/site.ts):
 * aus → alles gesperrt, kein Verweis auf die Sitemap; an → alle Suchmaschinen und KI-Systeme willkommen.
 */
export const GET: APIRoute = () =>
  new Response(
    INDEXIERUNG
      ? `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`
      : `User-agent: *
Disallow: /
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
