// Erzeugt public/og.png (Vorschaubild für geteilte Links) und public/logo.png
// aus Name und Claim in src/config/site.ts. Nach Namens- oder Claim-Änderung erneut ausführen:
//   npm run bilder
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { site } from '../src/config/site.ts';

const logo = (farbe) => `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M6 9h52L32 55z" fill="none" stroke="${farbe}" stroke-width="4.5" stroke-linejoin="round"/><path d="M32 37c-9-6-12-10.5-10.6-14.6 1.3-3.6 6.4-4.3 8.7-.9L32 23.6l1.9-2.1c2.3-3.4 7.4-2.7 8.7.9C44 26.5 41 31 32 37z" fill="${farbe}"/></svg>`;
const schrift = (name) => `data:font/woff2;base64,${readFileSync(`public/fonts/${name}.woff2`).toString('base64')}`;
const fonts = `
@font-face{font-family:SG;src:url(${schrift('space-grotesk')})}
@font-face{font-family:IN;src:url(${schrift('inter')})}`;

const og = `<html><style>${fonts}
body{margin:0;width:1200px;height:630px;background:#0D0D13;color:#EDECF6;font-family:IN;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box;
background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px),radial-gradient(ellipse at 80% 20%,rgba(124,77,255,.35),transparent 60%);background-size:56px 56px,56px 56px,100% 100%}
.b{display:flex;align-items:center;gap:20px;font-family:SG;font-weight:700;font-size:44px}.l{width:72px;height:72px}
h1{font-family:SG;font-size:96px;line-height:1.02;letter-spacing:-.035em;margin:48px 0 28px;max-width:900px}
p{font-size:30px;color:#A9A7BD;margin:0}</style><body>
<div class="b"><div class="l">${logo('#A98BFF')}</div>${site.name}</div>
<h1>${site.claim}</h1><p>Webseiten für Betriebe</p></body></html>`;

const logoSeite = `<html><body style="margin:0;background:#0D0D13;width:512px;height:512px;display:grid;place-items:center"><div style="width:400px;height:400px">${logo('#A98BFF')}</div></body></html>`;

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(og, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });
await page.setViewportSize({ width: 512, height: 512 });
await page.setContent(logoSeite);
await page.screenshot({ path: 'public/logo.png' });
await browser.close();
console.log('public/og.png und public/logo.png erstellt.');
