import type { APIRoute } from 'astro';
import { site } from '../config/site';

/** Alle Suchmaschinen und KI-Systeme sind ausdrücklich willkommen: Wir wollen gefunden werden. */
export const GET: APIRoute = () =>
  new Response(`User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`);
