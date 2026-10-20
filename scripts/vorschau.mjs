// Baut aus dist/ eine Vorschau mit relativen Links (für private Vorschau-Links ohne eigene Domain).
// Ergebnis: .vorschau/site/…  und .vorschau/dateien.json (Liste aller Dateien).
//   npm run build && npm run vorschau
import { cpSync, rmSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const ziel = '.vorschau/site';
rmSync('.vorschau', { recursive: true, force: true });
cpSync('dist', ziel, { recursive: true });

const alle = (ordner) =>
  readdirSync(ordner).flatMap((n) => (statSync(join(ordner, n)).isDirectory() ? alle(join(ordner, n)) : [join(ordner, n)]));
const dateien = alle(ziel);

for (const datei of dateien) {
  const zuWurzel = relative(dirname(datei), ziel) || '.';
  const prefix = zuWurzel === '.' ? '' : `${zuWurzel}/`;
  if (datei.endsWith('.html')) {
    let html = readFileSync(datei, 'utf8');
    html = html.replace(/(href|src)="\/([^"]*)"/g, (_, attr, pfad) => {
      const [weg, anker = ''] = pfad.split('#');
      let neu = weg === '' ? 'index.html' : weg.endsWith('/') ? `${weg}index.html` : weg;
      return `${attr}="${prefix}${neu}${anker ? '#' + anker : ''}"`;
    });
    html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="robots" content="noindex">');
    writeFileSync(datei, html);
  } else if (datei.endsWith('.css')) {
    writeFileSync(datei, readFileSync(datei, 'utf8').replace(/url\(\/([^)]*)\)/g, `url(${prefix}$1)`));
  }
}

const liste = Object.fromEntries(dateien.map((d) => [relative('.vorschau', d), d]));
writeFileSync('.vorschau/dateien.json', JSON.stringify(liste, null, 2));
console.log(`${dateien.length} Dateien in ${ziel}`);
