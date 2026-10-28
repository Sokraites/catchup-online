// Baut aus dist/ eine Vorschau für den privaten Vorschau-Link (ohne eigene Domain).
// - Jede Seite ist in sich geschlossen: CSS, Skripte und Schriften stehen direkt in der Datei.
// - Links sind relativ, Seiten liegen unter site/…
// - Die Startseite ist zugleich die Hauptseite der Vorschau (index.html).
// - Eine kleine Statusanzeige unten links zeigt, ob Skripte laufen und ob „Bewegung reduzieren“ an ist.
// Ergebnis: .vorschau/index.html, .vorschau/site/…, .vorschau/dateien.json
//   npm run build && npm run vorschau
import { mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync, statSync, copyFileSync, cpSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { buildSync } from 'esbuild';

const AUS = '.vorschau';
rmSync(AUS, { recursive: true, force: true });

const alle = (ordner) =>
  readdirSync(ordner).flatMap((n) => (statSync(join(ordner, n)).isDirectory() ? alle(join(ordner, n)) : [join(ordner, n)]));

const schrift = (pfad) => `data:font/woff2;base64,${readFileSync(join('dist', pfad)).toString('base64')}`;
const css = (pfad) =>
  readFileSync(join('dist', pfad), 'utf8').replace(/url\(\/(fonts\/[^)]+)\)/g, (_, f) => `url(${schrift(f)})`);
// Skripte samt nachgeladenen Teilen (z. B. 3D) zu einer Datei bündeln, damit sie direkt in der Seite stehen können.
// Das Foto der Aussicht liegt im Skript als absoluter Pfad: in der Vorschau direkt als Datenadresse einbetten
const fotoDaten = `data:image/webp;base64,${readFileSync(join('dist', 'aussicht', 'fenster.webp')).toString('base64')}`;
// Nachgeladene Teile (z. B. GSAP) werden hier mitgebündelt. Die Vorab-Lade-Hilfe von Vite würde trotzdem
// Dateien unter /_astro/ anfragen, die es in der Vorschau nicht gibt: In einer Arbeitskopie durch einen
// Platzhalter ersetzen, der die Ladefunktion direkt aufruft.
const SKRIPTE = join(AUS, '.skripte');
cpSync(join('dist', '_astro'), join(SKRIPTE, '_astro'), { recursive: true });
for (const datei of readdirSync(join(SKRIPTE, '_astro'))) {
  if (/^preload-helper\..+\.js$/.test(datei)) writeFileSync(join(SKRIPTE, '_astro', datei), 'export const t = (laden) => laden();\n');
}
const js = (pfad) =>
  buildSync({ entryPoints: [join(SKRIPTE, pfad)], bundle: true, format: 'esm', write: false, minify: true, logLevel: 'error' })
    .outputFiles[0].text.replace(/<\/script/gi, '<\\/script').split('"/aussicht/fenster.webp"').join(`"${fotoDaten}"`);

const STATUS = `
<div id="vorschau-status" aria-hidden="true" style="position:fixed;z-index:99;left:max(8px,env(safe-area-inset-left,0px));bottom:calc(8px + env(safe-area-inset-bottom,0px));padding:6px 10px;border-radius:999px;background:#ffd166;color:#1a1400;font:600 11px/1.3 ui-monospace,Menlo,monospace;pointer-events:none;max-width:calc(100vw - 16px)">Vorschau · Skripte laufen nicht</div>
<script>
(function () {
  var el = document.getElementById('vorschau-status');
  var ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = !matchMedia('(pointer: fine)').matches;
  var gescrollt = false;
  addEventListener('scroll', function () { gescrollt = true; }, { passive: true });
  function zeige() {
    var p = window.kachelPfad;
    var teile = ['Vorschau', 'Skripte ✓', touch ? 'Touch' : 'Maus'];
    teile.push(ruhig ? 'Bewegung reduziert: Effekte aus' : 'Bewegung normal');
    if (p) teile.push('Pfad ' + p.freigeschaltet + '/' + p.ziele.length);
    if (document.documentElement.classList.contains('monitor-an')) teile.push(gescrollt ? 'Monitor ✓' : 'Monitor: scrollen');
    el.textContent = teile.join(' · ');
  }
  zeige();
  setInterval(zeige, 500);
})();
</script>`;

/** Schreibt eine Seite aus dist um. `tiefe`: wie viele Ordner unter AUS die Datei liegt. */
function seite(quelle, tiefe, { fragment = false } = {}) {
  const zurWurzel = '../'.repeat(tiefe);
  let html = readFileSync(join('dist', quelle), 'utf8');
  // CSS und Skripte direkt einbetten
  html = html.replace(/<link rel="stylesheet" href="\/(_astro\/[^"]+\.css)">/g, (_, f) => `<style>${css(f)}</style>`);
  html = html.replace(/<script type="module" src="\/(_astro\/[^"]+\.js)"><\/script>/g, (_, f) => `<script type="module">${js(f)}</script>`);
  html = html.replace(/<link rel="preload"[^>]*as="font"[^>]*>/g, '');
  // Astro setzt das CSS oft direkt ins HTML (kein <link>): Schriften auch dort einbetten
  html = html.replace(/url\(\/(fonts\/[^)]+)\)/g, (_, f) => `url(${schrift(f)})`);
  // Links relativ machen; die Startseite der Vorschau ist der Monitor-Entwurf
  html = html.replace(/(href|src)="\/([^"]*)"/g, (_, attr, pfad) => {
    const [weg, anker = ''] = pfad.split('#');
    const ziel = weg === '' ? 'index.html' : weg.endsWith('/') ? `${weg}index.html` : weg;
    return `${attr}="${zurWurzel}site/${ziel}${anker ? '#' + anker : ''}"`;
  });
  html = html.replace(/url\(\/((?:monitore|ki)\/)/g, `url(${zurWurzel}site/$1`);
  // Bildvarianten (srcset, z. B. Hochformat fürs Handy) ebenso
  html = html.replace(/srcset="([^"]*)"/g, (_, liste) =>
    `srcset="${liste.replace(/(^|,\s*)\/(\S+)/g, (__, vor, pfad) => `${vor}${zurWurzel}site/${pfad}`)}"`,
  );
  // Videoquellen stehen als JSON im Attribut data-quellen (Medium.astro): gleich umschreiben
  html = html.replace(/&quot;src&quot;:&quot;\/([^&]*)&quot;/g, (_, pfad) => `&quot;src&quot;:&quot;${zurWurzel}site/${pfad}&quot;`);
  html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="robots" content="noindex">');
  if (!quelle.startsWith("referenzen/")) html = html.replace(/<\/body>/, `${STATUS}</body>`);
  if (fragment) {
    // Hauptseite: Die Vorschau-Umgebung setzt das Grundgerüst selbst.
    html = html
      .replace(/<!DOCTYPE html>/i, '')
      .replace(/<html[^>]*>|<\/html>|<head>|<\/head>|<\/body>/g, '')
      .replace(/<body>/, '<meta name="claude:viewport-fit-sides" content="cover">');
  }
  return html;
}

const liste = {};
function schreibe(ziel, inhalt) {
  mkdirSync(dirname(join(AUS, ziel)), { recursive: true });
  writeFileSync(join(AUS, ziel), inhalt);
  if (ziel !== 'index.html') liste[ziel] = join(AUS, ziel);
}

for (const datei of alle('dist')) {
  const rel = relative('dist', datei);
  if (rel.startsWith('_astro/') || rel.startsWith('fonts/') || rel.endsWith('LICENSE.txt') || /\.(br|gz)$/.test(rel)) continue;
  if (rel.endsWith('.html')) {
    const quelle = rel;
    const tiefe = 1 + rel.split('/').length - 1;
    schreibe(`site/${rel}`, seite(quelle, tiefe));
  } else {
    mkdirSync(dirname(join(AUS, 'site', rel)), { recursive: true });
    copyFileSync(datei, join(AUS, 'site', rel));
    liste[`site/${rel}`] = join(AUS, 'site', rel);
  }
}
// Hauptseite der Vorschau
schreibe('index.html', seite('index.html', 0, { fragment: true }));

writeFileSync(join(AUS, 'dateien.json'), JSON.stringify(liste, null, 2));
rmSync(SKRIPTE, { recursive: true, force: true });
console.log(`${Object.keys(liste).length + 1} Dateien in ${AUS}`);
