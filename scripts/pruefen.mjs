// Prüft die gebaute Seite auf Handy-, Tablet- und Desktop-Breite.
// Voraussetzung: `npm run build` und `npm run preview` laufen (Port 4321).
//   node scripts/pruefen.mjs [ordner-für-bildschirmfotos]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const basis = process.env.BASIS ?? 'http://localhost:4321';
const fotos = process.argv[2];
const seiten = ['/', '/webseiten-erstellen/', '/webseiten-modernisieren/', '/auffindbarkeit/', '/ki-mitarbeiter/', '/termin/', '/impressum/', '/datenschutz/'];
const geraete = {
  handy: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1440, height: 900 },
};

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
let fehler = 0;
for (const [name, viewport] of Object.entries(geraete)) {
  for (const js of [true, false]) {
    const ctx = await browser.newContext({ viewport, javaScriptEnabled: js, hasTouch: name !== 'desktop' });
    const page = await ctx.newPage();
    const konsole = [];
    page.on('console', (m) => m.type() === 'error' && konsole.push(m.text()));
    for (const pfad of seiten) {
      await page.goto(basis + pfad);
      const info = await page.evaluate(() => ({
        h1: document.querySelectorAll('h1').length,
        ueberlauf: document.documentElement.scrollWidth > innerWidth,
        kleineZiele: [...document.querySelectorAll('a, button, summary')]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            const imText = e.closest('p, dd, li:not(.nav-list li)') && getComputedStyle(e).display === 'inline';
            return r.width > 0 && r.height < 24 && !imText;
          })
          .map((e) => e.textContent.trim().slice(0, 30)),
      }));
      let axeFehler = [];
      if (js) {
        await page.addScriptTag({ content: axe });
        axeFehler = await page.evaluate(async () => {
          const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'best-practice'] });
          return r.violations.map((v) => `${v.id} (${v.nodes.length})`);
        });
      }
      const probleme = [];
      if (info.h1 !== 1) probleme.push(`H1-Anzahl ${info.h1}`);
      if (info.ueberlauf) probleme.push('seitlicher Überlauf');
      if (info.kleineZiele.length) probleme.push(`kleine Ziele: ${info.kleineZiele.join(' | ')}`);
      if (axeFehler.length) probleme.push(`Barrierefreiheit: ${axeFehler.join(', ')}`);
      fehler += probleme.length;
      console.log(`${probleme.length ? '✗' : '✓'} ${name}${js ? '' : ' (ohne JS)'} ${pfad} ${probleme.join('; ')}`);
      if (fotos && js && ['/', '/ki-mitarbeiter/', '/auffindbarkeit/'].includes(pfad)) {
        await page.screenshot({ path: `${fotos}/${name}${pfad.replaceAll('/', '_')}.png`, fullPage: true });
      }
    }
    if (konsole.length) console.log('Konsole:', konsole);
    await ctx.close();
  }
}
await browser.close();
console.log(fehler ? `\n${fehler} Probleme gefunden.` : '\nKeine Probleme gefunden.');
process.exitCode = fehler ? 1 : 0;
