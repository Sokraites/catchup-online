import type { APIRoute } from 'astro';
import { site } from '../config/site';

/** Web-App-Manifest: Name und Farben aus der zentralen Konfiguration. */
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: site.name,
        short_name: site.name,
        description: site.beschreibung,
        lang: site.sprache,
        start_url: '/',
        display: 'browser',
        background_color: '#0D0D13',
        theme_color: '#0D0D13',
        icons: [
          { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
          { src: '/logo.png', type: 'image/png', sizes: '512x512' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
