// Packt den fertigen Build (dist/) als catchup-seite.zip für den Upload bei Cloudflare Pages.
// index.html liegt direkt im Stamm des ZIP. Vorher: npm run build.
//   npm run paket
// Prüft die Grenzen von Cloudflare Pages: höchstens 1.000 Dateien, höchstens 25 MiB pro Datei.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const ZIEL = 'catchup-seite.zip';
if (!existsSync(join(DIST, 'index.html'))) throw new Error('Kein Build gefunden. Erst „npm run build“ ausführen.');

const alle = (ordner) =>
  readdirSync(ordner, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? alle(join(ordner, e.name)) : [join(ordner, e.name)]));
// Vorkomprimierte Fassungen (npm run komprimieren) gehören nicht ins Paket: Cloudflare komprimiert selbst.
const dateien = alle(DIST).filter((d) => !/\.(br|gz)$/.test(d));
const groesste = dateien.map((d) => [d, statSync(d).size]).sort((a, b) => b[1] - a[1])[0];
const MiB = 1024 * 1024;
if (dateien.length > 1000) throw new Error(`Zu viele Dateien: ${dateien.length} (höchstens 1.000)`);
if (groesste[1] > 25 * MiB) throw new Error(`Datei zu groß: ${groesste[0]}`);

rmSync(ZIEL, { force: true });
execFileSync('zip', ['-q', '-r', '-X', join('..', ZIEL), '.', '-x', '*.br', '*.gz'], { cwd: DIST });
console.log(`${ZIEL}: ${dateien.length} Dateien, größte ${relative(DIST, groesste[0])} (${(groesste[1] / 1024).toFixed(0)} KB), ZIP ${(statSync(ZIEL).size / 1024).toFixed(0)} KB`);
