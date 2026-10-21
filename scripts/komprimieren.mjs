// Legt neben jede Text-Datei in dist/ eine komprimierte Fassung (.br und .gz).
// Viele Hoster liefern diese direkt aus; außerdem misst Lighthouse damit realistische Ladezeiten.
//   npm run build && npm run komprimieren
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const arten = new Set(['.html', '.js', '.css', '.svg', '.xml', '.txt', '.json']);
const alle = (ordner) =>
  readdirSync(ordner).flatMap((n) => (statSync(join(ordner, n)).isDirectory() ? alle(join(ordner, n)) : [join(ordner, n)]));
let vorher = 0;
let nachher = 0;
for (const datei of alle('dist')) {
  if (!arten.has(extname(datei))) continue;
  const inhalt = readFileSync(datei);
  const br = brotliCompressSync(inhalt, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
  writeFileSync(`${datei}.br`, br);
  writeFileSync(`${datei}.gz`, gzipSync(inhalt, { level: 9 }));
  vorher += inhalt.length;
  nachher += br.length;
}
console.log(`Text-Dateien: ${Math.round(vorher / 1024)} KB → ${Math.round(nachher / 1024)} KB (Brotli)`);
