// Legt eine neue Version der fertigen Seite im Ordner releases/ an. Veröffentlicht und pusht nichts.
//   npm run release -- v2
//   npm run release -- v2 "Was ist neu: Impressum ausgefüllt"
// Ablauf: npm run build → ZIP (index.html im Stamm) → Prüfungen (unzip -t, Dateiliste = dist/) →
// releases/<Version>/ mit ZIP, PRUEFSUMME.txt, INHALT.txt, VERSION.txt → eine Zeile in releases/AKTUELL.md.
// Bricht ab, wenn es den Versionsordner schon gibt: Eine alte Version wird nie überschrieben.
// Nur für Tests: RELEASE_ORDNER=/anderer/ordner legt die Version dort an statt in releases/.
import { execFileSync, execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { INDEXIERUNG, REFERENZEN } from '../src/config/site.ts';

const [version, neu = '–'] = process.argv.slice(2);
const ORDNER = resolve(process.env.RELEASE_ORDNER ?? 'releases');
const DIST = 'dist';

function abbruch(text) {
  console.error(`\nAbgebrochen: ${text}`);
  process.exit(1);
}

if (!version || !/^v\d+(\.\d+)*$/.test(version)) abbruch('Bitte eine Version angeben, z. B.: npm run release -- v2');
const ziel = join(ORDNER, version);
if (existsSync(ziel)) abbruch(`${ziel} gibt es schon. Alte Versionen werden nie überschrieben, bitte eine neue Nummer wählen.`);

// Stand der Quellen: Commit und ob Dateien, die die Seite beeinflussen, davon abweichen
const git = (befehl) => execSync(`git ${befehl}`, { encoding: 'utf8' }).trim();
const commit = git('rev-parse HEAD');
const kurz = git('rev-parse --short HEAD');
const abweichend = git('status --porcelain -- src public astro.config.mjs scripts/nachbereiten.mjs');
if (abweichend) {
  console.warn(`\nAchtung: Diese Dateien der Seite weichen vom Commit ${kurz} ab:\n${abweichend}\n`);
}

// 1. Bauen
console.log('Baue die Seite …');
execSync('npm run build', { stdio: 'inherit' });

// 2. Dateiliste von dist/ (ohne vorkomprimierte Fassungen, die gehören nicht ins Paket)
const alle = (o) => readdirSync(o, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? alle(join(o, e.name)) : [join(o, e.name)]));
const dateien = alle(DIST)
  .filter((d) => !/\.(br|gz)$/.test(d))
  .map((d) => ({ pfad: relative(DIST, d).split('\\').join('/'), groesse: statSync(d).size }))
  .sort((a, b) => a.pfad.localeCompare(b.pfad));
const groesste = [...dateien].sort((a, b) => b.groesse - a.groesse)[0];
if (dateien.length > 1000) abbruch(`zu viele Dateien: ${dateien.length} (höchstens 1.000)`);
if (groesste.groesse > 25 * 1024 * 1024) abbruch(`Datei zu groß: ${groesste.pfad}`);

// 3. ZIP erzeugen, index.html liegt im Stamm
mkdirSync(ziel, { recursive: true });
const zipName = `catchup-seite-${version}.zip`;
const zip = join(ziel, zipName);
try {
  execFileSync('zip', ['-q', '-r', '-X', zip, '.', '-x', '*.br', '*.gz'], { cwd: DIST });

  // 4. Prüfungen: Unversehrtheit, index.html im Stamm, gleiche Dateien wie dist/
  const test = execFileSync('unzip', ['-t', zip], { encoding: 'utf8' });
  if (!/No errors detected/.test(test)) throw new Error(`unzip -t meldet Fehler:\n${test}`);
  const imZip = execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' })
    .split('\n')
    .filter((z) => z && !z.endsWith('/'))
    .sort((a, b) => a.localeCompare(b));
  if (!imZip.includes('index.html')) throw new Error('index.html liegt nicht im Stamm der ZIP');
  const sollListe = dateien.map((d) => d.pfad);
  const fehlt = sollListe.filter((p) => !imZip.includes(p));
  const zuviel = imZip.filter((p) => !sollListe.includes(p));
  if (fehlt.length || zuviel.length) throw new Error(`ZIP weicht von dist/ ab. Fehlt: ${fehlt.join(', ') || '–'}; zu viel: ${zuviel.join(', ') || '–'}`);
} catch (fehler) {
  rmSync(ziel, { recursive: true, force: true });
  abbruch(fehler.message);
}

// 5. Begleitdateien
const sha = createHash('sha256').update(readFileSync(zip)).digest('hex');
const datum = new Date().toLocaleDateString('sv-SE'); // JJJJ-MM-TT
const kb = (b) => `${(b / 1024).toFixed(1)} KB`;
const platzhalter = dateien
  .filter((d) => d.pfad.endsWith('.html'))
  .some((d) => readFileSync(join(DIST, d.pfad), 'utf8').includes('HIER ANGABE EINTRAGEN'));
const an = (b) => (b ? 'an' : 'aus');

writeFileSync(
  join(ziel, 'PRUEFSUMME.txt'),
  `SHA-256-Prüfsumme der Datei ${zipName}
(stimmt die selbst berechnete Zahl damit überein, ist die Datei unversehrt; Anleitung in START-HIER.md)

${sha}  ${zipName}
`,
);

writeFileSync(
  join(ziel, 'INHALT.txt'),
  `Inhalt von ${zipName}
Dateien: ${dateien.length}
Größte Datei: ${groesste.pfad} (${kb(groesste.groesse)})
ZIP-Größe: ${kb(statSync(zip).size)}
Geprüft: unzip -t ohne Fehler, index.html im Stamm, Dateiliste gleich dem Ordner dist/ (ohne .br/.gz)

Größe      Datei
${dateien.map((d) => `${kb(d.groesse).padStart(9)}  ${d.pfad}`).join('\n')}
`,
);

writeFileSync(
  join(ziel, 'VERSION.txt'),
  `Version: ${version}
Datum: ${datum}
Commit: ${kurz} (${commit})
${abweichend ? `ACHTUNG: Beim Bauen wichen diese Dateien vom Commit ab:\n${abweichend}\n` : 'Quellen der Seite entsprechen genau diesem Commit.\n'}
Schalter INDEXIERUNG: ${an(INDEXIERUNG)}${INDEXIERUNG ? '' : ' (alle Seiten noindex, robots.txt sperrt Suchmaschinen)'}
Schalter REFERENZEN: ${an(REFERENZEN)}
Platzhalter offen: ${platzhalter ? 'ja (Impressum/Datenschutz enthalten <<HIER ANGABE EINTRAGEN …>>)' : 'nein'}

${platzhalter || !INDEXIERUNG ? 'HINWEIS: Testversion. Enthält Platzhalter bzw. noindex. Nicht weitergeben und nicht als fertige Seite veröffentlichen.\n' : ''}`,
);

// 6. Zeile in AKTUELL.md
const aktuell = join(ORDNER, 'AKTUELL.md');
if (!existsSync(aktuell)) {
  writeFileSync(
    aktuell,
    `# Alle Versionen

Neueste unten. Jede Version liegt in ihrem eigenen Ordner (z. B. \`releases/v1/\`) und wird nie überschrieben.

| Version | Datum | Commit | Indexierung | Platzhalter offen | Was ist neu |
|---|---|---|---|---|---|
`,
  );
}
appendFileSync(aktuell, `| ${version} | ${datum} | ${kurz} | ${an(INDEXIERUNG)} | ${platzhalter ? 'ja' : 'nein'} | ${neu.replace(/\|/g, '/')} |\n`);

console.log(`
Fertig: ${relative(process.cwd(), ziel) || ziel}/
  ${zipName}  (${dateien.length} Dateien, ${kb(statSync(zip).size)})
  SHA-256: ${sha}
Nichts wurde gepusht oder veröffentlicht. Nächster Schritt steht in START-HIER.md.`);
