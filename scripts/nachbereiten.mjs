// Läuft nach `astro build` (Teil von `npm run build`):
// 1. Schalter REFERENZEN aus → Projektseite und Vorschaubild nicht mit ausliefern.
// 2. dist/_headers für Cloudflare Pages schreiben: Sicherheits-Header und eine Content-Security-Policy,
//    die genau die eingebetteten Skripte der Seite per Prüfsumme erlaubt (sonst nur eigene Dateien).
// 3. Kurzer Bericht: Dateizahl und größte Datei.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { REFERENZEN } from '../src/config/site.ts';

const DIST = 'dist';
const alle = (ordner) =>
  readdirSync(ordner, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? alle(join(ordner, e.name)) : [join(ordner, e.name)]));

// 1. Referenzen
if (!REFERENZEN) {
  rmSync(join(DIST, 'referenzen'), { recursive: true, force: true });
}

// 2. Prüfsummen aller eingebetteten, ausführbaren Skripte (JSON-LD wird nicht ausgeführt und braucht keine)
const hashes = new Set();
for (const datei of alle(DIST).filter((d) => d.endsWith('.html'))) {
  const html = readFileSync(datei, 'utf8');
  for (const [, attribute, inhalt] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attribute) || /application\/ld\+json/.test(attribute) || !inhalt.trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(inhalt).digest('base64')}'`);
  }
}
const csp = (rahmen) =>
  [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].join(' ')}`.trim(),
    // Stile: eigene Dateien plus Inline-Stile (Astro und die Animationen setzen sie); kein Risiko für Skripte
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${rahmen}`,
  ].join('; ');

const header = `# Sicherheits-Header für Cloudflare Pages (erzeugt von scripts/nachbereiten.mjs, nicht von Hand ändern)
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  X-Frame-Options: DENY
  Content-Security-Policy: ${csp("'none'")}

# Projektseite wird im Monitor der eigenen Startseite angezeigt: Einbetten nur durch die eigene Seite
/referenzen/*
  ! X-Frame-Options
  ! Content-Security-Policy
  X-Frame-Options: SAMEORIGIN
  Content-Security-Policy: ${csp("'self'")}

# Dateien mit Prüfsumme im Namen ändern sich nie: lange zwischenspeichern
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`;
writeFileSync(join(DIST, '_headers'), header);

// 3. Bericht
const dateien = alle(DIST);
const groesste = dateien.map((d) => [d, statSync(d).size]).sort((a, b) => b[1] - a[1])[0];
console.log(
  `Nachbereitet: ${dateien.length} Dateien in ${DIST}/, größte: ${relative(DIST, groesste[0])} (${(groesste[1] / 1024).toFixed(0)} KB), ` +
    `${hashes.size} eingebettete Skripte in der CSP, Referenzen ${REFERENZEN ? 'an' : 'aus'}.`,
);
