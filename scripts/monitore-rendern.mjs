// Rendert Bilder aus den 3D-Modellen:
// - Monitore (Rahmen, Knöpfe, Fuß) aus scripts/render/monitore.html → public/monitore/*.webp
//   Maße aus src/config/monitore.json, Bildgrößen nach src/config/monitore-bilder.json
// - Große Szenen (Zeitreise, Leistungen) aus scripts/render/szenen.html → public/bilder/*.webp
//   npm run monitore
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const typen = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const pfad = join(process.cwd(), decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const inhalt = await readFile(pfad);
    res.writeHead(200, { 'Content-Type': typen[extname(pfad)] ?? 'application/octet-stream' });
    res.end(inhalt);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({
  ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}),
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('Fehler im Render-Werkzeug:', e.message));
async function rendere(seite, ordner) {
  await page.goto(`http://localhost:${port}/scripts/render/${seite}`);
  await page.waitForFunction(() => window.bereit, null, { timeout: 120000 });
  const bilder = await page.evaluate(() => window.rendereAlles());
  await mkdir(ordner, { recursive: true });
  const masse = {};
  for (const [name, { daten, b, h }] of Object.entries(bilder)) {
    await writeFile(`${ordner}/${name}.webp`, Buffer.from(daten.split(',')[1], 'base64'));
    masse[name] = { b, h };
  }
  console.log(`${Object.keys(bilder).length} Bilder in ${ordner}/`);
  return masse;
}
// Nur die großen Bilder: node scripts/monitore-rendern.mjs szenen
if (process.argv[2] !== 'szenen') {
  const masse = await rendere('monitore.html', 'public/monitore');
  // Bildgrößen für die Seite (damit nichts springt, bevor die Bilder geladen sind)
  await writeFile('src/config/monitore-bilder.json', JSON.stringify(masse, null, 2) + '\n');
}
// Große Bilder für die Darstellung „Leicht“
await rendere('szenen.html', 'public/bilder');
await browser.close();
server.close();
