// Funktionstest der fertigen Seite MIT aktiven Sicherheits-Headern (CSP aus dist/_headers).
// Voraussetzung: npm run build, dann npm run ansehen (oder BASIS=… auf einen anderen Server).
//   node scripts/funktionstest.mjs
// Prüft: Konsolenfehler und CSP-Verstöße auf allen Seiten (360, 768, 1440 px), alle internen Links,
// Terminbuch (öffnen, blättern, Tag wählen, absenden), Stufen-Wahl, Tabs im Monitor, Kachel-Pfad per Finger,
// Tastatur-Fokus sichtbar, Header vorhanden.
import { chromium } from 'playwright';

const BASIS = process.env.BASIS ?? 'http://localhost:4321';
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const befunde = [];
const ok = (text) => console.log(`✓ ${text}`);
const fehler = (text) => {
  befunde.push(text);
  console.log(`✗ ${text}`);
};

async function neueSeite(breite, stufe) {
  const ctx = await browser.newContext({
    viewport: { width: breite, height: breite < 800 ? 780 : 900 },
    hasTouch: breite < 1000,
    isMobile: breite < 1000,
  });
  if (stufe) await ctx.addInitScript((s) => localStorage.setItem('catchup-stufe', s), stufe);
  const page = await ctx.newPage();
  const meldungen = [];
  page.on('console', (m) => m.type() === 'error' && meldungen.push(m.text()));
  page.on('pageerror', (e) => meldungen.push(`Skriptfehler: ${e.message}`));
  await page.addInitScript(() =>
    document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP-Verstoß: ${e.violatedDirective} ${e.blockedURI}`)),
  );
  return { ctx, page, meldungen };
}

// 1. Sicherheits-Header
const antwort = await fetch(BASIS + '/');
for (const h of ['content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'x-frame-options']) {
  if (antwort.headers.get(h)) ok(`Header ${h}`);
  else fehler(`Header fehlt: ${h}`);
}

// 2. Alle internen Links (aus allen Seiten gesammelt) erreichbar, unbekannte Adresse → 404-Seite
const { page: sammler } = await neueSeite(1440);
const offen = ['/'];
const gesehen = new Set();
while (offen.length) {
  const pfad = offen.shift();
  if (gesehen.has(pfad)) continue;
  gesehen.add(pfad);
  const r = await fetch(BASIS + pfad);
  if (r.status !== 200) {
    fehler(`Link ${pfad} → ${r.status}`);
    continue;
  }
  if (!(r.headers.get('content-type') ?? '').includes('html')) continue;
  await sammler.goto(BASIS + pfad);
  const links = await sammler.evaluate(() =>
    [...document.querySelectorAll('a[href], link[href], img[src], source[srcset], script[src]')]
      .map((e) => e.getAttribute('href') ?? e.getAttribute('src') ?? e.getAttribute('srcset'))
      .filter((h) => h && h.startsWith('/') && !h.startsWith('//')),
  );
  for (const l of links) {
    const p = l.split('#')[0].split('?')[0];
    if (p && !gesehen.has(p)) offen.push(p);
  }
}
ok(`${gesehen.size} interne Adressen geprüft`);
const r404 = await fetch(BASIS + '/gibt-es-nicht/');
if (r404.status === 404 && (await r404.text()).includes('<h1')) ok('Unbekannte Adresse zeigt die 404-Seite');
else fehler(`404-Seite: Status ${r404.status}`);

// 3. Konsole und CSP auf allen Seiten, drei Breiten
const seiten = [...gesehen].filter((p) => p.endsWith('/'));
for (const breite of [360, 768, 1440]) {
  const { ctx, page, meldungen } = await neueSeite(breite);
  for (const pfad of seiten) {
    await page.goto(BASIS + pfad);
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
    });
    await page.waitForTimeout(300);
    const ueber = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (ueber) fehler(`${breite}px ${pfad}: seitlicher Überlauf`);
  }
  if (meldungen.length) fehler(`${breite}px Konsole: ${[...new Set(meldungen)].join(' | ')}`);
  else ok(`${breite}px: ${seiten.length} Seiten ohne Konsolenfehler und CSP-Verstöße`);
  await ctx.close();
}

// 4. Abläufe auf dem Handy (360 px)
{
  const { ctx, page, meldungen } = await neueSeite(360);
  await page.goto(BASIS + '/');
  await page.waitForTimeout(1200);
  // Stufen-Hinweis beim ersten Besuch
  if (await page.locator('[data-stufen-banner]').isVisible()) ok('Stufen-Hinweis erscheint beim ersten Besuch');
  else fehler('Stufen-Hinweis fehlt');
  await page.locator('[data-stufen-zu]').tap();
  // Terminbuch
  await page.locator('.header-cta').tap();
  await page.waitForTimeout(2000);
  const monat1 = await page.locator('[data-tb-monat]').textContent();
  await page.locator('[data-tb-weiter]').tap();
  await page.waitForTimeout(1100);
  const monat2 = await page.locator('[data-tb-monat]').textContent();
  if (monat1 !== monat2) ok(`Terminbuch blättert (${monat1} → ${monat2})`);
  else fehler('Terminbuch blättert nicht');
  await page.locator('.tb-spur-seite:not([inert]) .tb-tag:not(:disabled)').first().tap();
  await page.fill('#tb-name', 'Test');
  await page.fill('#tb-kontakt', 'test@example.org');
  await page.locator('.tb-senden').tap();
  await page.waitForTimeout(500);
  const mail = await page.locator('[data-tb-mail]').getAttribute('href');
  if (mail?.startsWith('mailto:') && (await page.locator('[data-tb-danke]').isVisible())) ok('Terminanfrage: Bestätigung und vorbereitete E-Mail');
  else fehler('Terminanfrage ohne Bestätigung');
  await page.keyboard.press('Escape');
  // Tab im Monitor über das Menü
  await page.locator('.main-nav a').first().tap();
  await page.waitForTimeout(1200);
  if ((await page.locator('.bl-tab-aktiv').count()) > 0) ok('Menü öffnet einen Tab im Monitor');
  else fehler('Menü öffnet keinen Tab im Monitor');
  await page.goBack();
  await page.waitForTimeout(800);
  // Kachel-Pfad mit dem Finger (kurzes Wischen über die Pfad-Kacheln)
  await page.evaluate(() => scrollTo(0, 700));
  await page.waitForTimeout(1200);
  const cdp = await ctx.newCDPSession(page);
  // Mittelpunkte der Pfad-Kacheln (Bildschirm-Koordinaten), wie sie die Seite selbst berechnet
  const ziele = await page.evaluate(() => window.kachelPfad.ziele);
  for (const { x, y } of ziele) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i < 5; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 5 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(250);
  }
  const pfad = await page.evaluate(() => [window.kachelPfad.freigeschaltet, window.kachelPfad.ziele.length]);
  if (pfad[0] === pfad[1]) ok(`Kachel-Pfad per Finger freigeschaltet (${pfad[0]}/${pfad[1]})`);
  else fehler(`Kachel-Pfad per Finger nur ${pfad[0]}/${pfad[1]}`);
  // Stufe wechseln
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator('[data-stufe-knopf]').tap();
  await Promise.all([page.waitForNavigation(), page.locator('[data-stufe-menue] [data-stufe-waehlen="leicht"]').tap()]);
  await page.waitForTimeout(800);
  const nachher = await page.evaluate(() => [document.documentElement.dataset.stufe, document.documentElement.classList.contains('monitor-an')]);
  if (nachher[0] === 'leicht' && !nachher[1]) ok('Stufe „Leicht“: ruhige Seite ohne Monitor');
  else fehler(`Stufenwechsel: ${nachher}`);
  if (meldungen.length) fehler(`Abläufe Konsole: ${[...new Set(meldungen)].join(' | ')}`);
  await ctx.close();
}

// 5. Tastatur am Desktop: Fokus sichtbar
{
  const { ctx, page } = await neueSeite(1440, 'mittel');
  await page.goto(BASIS + '/');
  await page.waitForTimeout(800);
  let ohneRahmen = 0;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const sichtbar = await page.evaluate(() => {
      const e = document.activeElement;
      const s = getComputedStyle(e);
      return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 || s.boxShadow !== 'none';
    });
    if (!sichtbar) ohneRahmen++;
  }
  if (ohneRahmen) fehler(`Tastatur: ${ohneRahmen} von 12 Elementen ohne sichtbaren Fokus`);
  else ok('Tastatur: Fokus bei den ersten 12 Elementen sichtbar');
  await ctx.close();
}

await browser.close();
console.log(befunde.length ? `\n${befunde.length} Befunde.` : '\nAlles in Ordnung.');
process.exitCode = befunde.length ? 1 : 0;
