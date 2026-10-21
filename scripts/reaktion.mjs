// Misst die Reaktionszeit auf Eingaben (Interaction to Next Paint) bei 4-fach gedrosseltem Prozessor,
// ungefähr wie auf einem einfachen Handy. Voraussetzung: Seite läuft (siehe scripts/messen.sh).
//   node scripts/reaktion.mjs [adresse]
import { chromium } from 'playwright';

const basis = process.argv[2] ?? 'http://localhost:4322';
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.addInitScript(() => {
  window.__dauern = [];
  new PerformanceObserver((liste) => {
    for (const e of liste.getEntries()) if (e.interactionId) window.__dauern.push([e.name, Math.round(e.duration)]);
  }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
});
const schritte = [
  ['Startseite: Menü-Link „Was wir machen“', '/', async () => page.tap('.monitor-flaeche a[href="#leistungen"]')],
  ['Startseite: Termin buchen (Buch öffnen)', '/', async () => page.tap('.header-cta')],
  ['Terminbuch: Tag wählen', null, async () => page.tap('.tb-links .tb-tag:not(:disabled) >> nth=2')],
  ['Häufige Frage aufklappen', '/auffindbarkeit/', async () => page.tap('.faq summary')],
  ['KI-Seite: nächste Stufe', '/ki-mitarbeiter/', async () => page.tap('[data-stufe-weiter]')],
];
let schlimmste = 0;
for (const [name, pfad, aktion] of schritte) {
  if (pfad) {
    await page.goto(basis + pfad);
    await page.waitForTimeout(1500);
  }
  await page.evaluate(() => (window.__dauern = []));
  await aktion();
  await page.waitForTimeout(1200);
  const dauern = await page.evaluate(() => window.__dauern);
  const max = Math.max(0, ...dauern.map((d) => d[1]));
  schlimmste = Math.max(schlimmste, max);
  console.log(`${max.toString().padStart(4)} ms  ${name}`);
}
console.log(`\nLängste Reaktion: ${schlimmste} ms (Ziel: höchstens 200 ms)`);
await browser.close();
