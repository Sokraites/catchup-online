// Zeigt die fertige Seite (Ordner dist/) lokal an, so wie ein statisches Hosting sie ausliefert:
// Ordner → index.html, unbekannte Adressen → 404.html, Header aus dist/_headers (Format von Cloudflare Pages),
// Text-Dateien komprimiert (wie bei Cloudflare).
//   npm run build, dann npm run ansehen → http://localhost:4321
// Nur Node, keine weiteren Pakete.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const WURZEL = process.env.ORDNER ?? 'dist';
const PORT = Number(process.env.PORT ?? 4321);
const typen = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

/** Liest _headers: Pfadmuster (mit *) und darunter eingerückte Header; „! Name“ entfernt einen geerbten Header. */
async function leseRegeln() {
  let text = '';
  try {
    text = await readFile(join(WURZEL, '_headers'), 'utf8');
  } catch {
    return [];
  }
  const regeln = [];
  for (const zeile of text.split('\n')) {
    if (!zeile.trim() || zeile.trim().startsWith('#')) continue;
    if (!/^\s/.test(zeile)) {
      const muster = new RegExp('^' + zeile.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      regeln.push({ muster, setzen: [], entfernen: [] });
    } else if (regeln.length) {
      const z = zeile.trim();
      if (z.startsWith('!')) regeln.at(-1).entfernen.push(z.slice(1).trim().toLowerCase());
      else {
        const i = z.indexOf(':');
        regeln.at(-1).setzen.push([z.slice(0, i).trim(), z.slice(i + 1).trim()]);
      }
    }
  }
  return regeln;
}

function header(regeln, pfad) {
  const h = new Map();
  for (const r of regeln) {
    if (!r.muster.test(pfad)) continue;
    r.entfernen.forEach((n) => h.delete(n));
    r.setzen.forEach(([n, w]) => h.set(n.toLowerCase(), [n, w]));
  }
  return Object.fromEntries([...h.values()]);
}

async function datei(pfad) {
  const ziel = normalize(join(WURZEL, decodeURIComponent(pfad)));
  if (!ziel.startsWith(normalize(WURZEL))) return null;
  try {
    const s = await stat(ziel);
    if (s.isDirectory()) return datei(join(pfad, 'index.html'));
    return { ziel, inhalt: await readFile(ziel) };
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const regeln = await leseRegeln();
  const pfad = new URL(req.url, 'http://x').pathname;
  let gefunden = await datei(pfad);
  let status = 200;
  if (!gefunden) {
    gefunden = await datei('/404.html');
    status = 404;
  }
  if (!gefunden) {
    res.writeHead(404).end('Nicht gefunden');
    return;
  }
  const typ = typen[extname(gefunden.ziel)] ?? 'application/octet-stream';
  const kopf = { 'Content-Type': typ, ...header(regeln, pfad) };
  let inhalt = gefunden.inhalt;
  const annahme = req.headers['accept-encoding'] ?? '';
  if (/text|javascript|json|xml|svg/.test(typ)) {
    if (annahme.includes('br')) [inhalt, kopf['Content-Encoding']] = [brotliCompressSync(inhalt), 'br'];
    else if (annahme.includes('gzip')) [inhalt, kopf['Content-Encoding']] = [gzipSync(inhalt), 'gzip'];
    kopf['Vary'] = 'Accept-Encoding';
  }
  res.writeHead(status, kopf);
  res.end(inhalt);
}).listen(PORT, () => console.log(`Seite läuft: http://localhost:${PORT}  (beenden mit Strg+C)`));
