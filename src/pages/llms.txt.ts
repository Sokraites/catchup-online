import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { leistungen } from '../content/leistungen';

/** Kurzüberblick für KI-Systeme (llms.txt). Nutzen nicht belegt, aber günstig. */
export const GET: APIRoute = () => {
  const zeilen = [
    `# ${site.name}`,
    '',
    `> ${site.beschreibung}`,
    '',
    'Sprache: Deutsch.',
    '',
    '## Leistungen',
    '',
    ...leistungen.map((l) => `- [${l.titel}](${new URL(l.href, site.url).href}): ${l.kurz}`),
    '',
    '## Kontakt',
    '',
    `- [Termin buchen](${site.url}/termin/)`,
    `- [Impressum](${site.url}/impressum/)`,
    '',
  ];
  return new Response(zeilen.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
