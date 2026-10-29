/**
 * Binärcode-Strom: Hintergrund der Stufe Mittel (Baustein: Binaerstrom.astro, Aussehen: farbwelten.css).
 *
 * - Ein ruhiger Strom aus 0 und 1 zieht leicht schräg von links nach rechts (20–40 px/s je Bahn), mit sanfter Welle.
 *   Die Zeichen stehen in kleinen Gruppen („Bytes“), rund 30 % der möglichen Plätze sind belegt (Handy: halb so viele).
 * - Glimmer: einzelne Zeichen leuchten kurz auf (0,5–0,7, 400–800 ms, ease-out) und ziehen dabei mit.
 * - Nachglühen: Glimmernde Zeichen ziehen eine weiche Spur hinter sich her (drei blasser werdende Abbilder auf ihrer Bahn).
 *   Ausprobiert war zuerst, die Fläche je Bild nur zu 10 % zu übermalen: Dann verschmieren die Ziffern zu Streifen, werden
 *   3- bis 4-mal so deckend wie gewollt und hinterlassen dunkle Rundungsreste. Darum wird jedes Bild gelöscht.
 * - Farbe: --a der Zeichenfläche, also die Akzentfarbe samt ihrem 1,2-s-Gleitwechsel aus farbwelten.css.
 * - Lesbarkeit: Hinter Text höchstens 0,06 und kein Glimmer; hinter den Karten mit data-fluss-ziel kein Zeichen.
 * - Sparsam: Canvas 2D, ~30 Bilder/s, höchstens doppelte Pixeldichte, Pause bei verstecktem Tab oder unsichtbarer
 *   Fläche (z. B. nach Wechsel auf Leicht). „Bewegung reduzieren“: ein stehendes Muster, neu gezeichnet nur beim
 *   Scrollen, bei Größen- und Farbwechsel.
 */

const SCHRIFT = 14;
const ZEILE = 22;
const ZEICHEN = 11;
const RAND = 40;
const NEIGUNG = 0.18;
const WELLE = { hoehe: 7, laenge: 340, tempo: 0.5 };
const DECKKRAFT = [0.1, 0.18];
const HINTER_TEXT = 0.06;
const GLIMMER = { deckkraft: [0.5, 0.7], dauer: [0.4, 0.8] };
/** Spur hinter glimmernden Zeichen: Abstand in px und Anteil der Leuchtkraft */
const NACHGLUEHEN = [
  [6, 0.45],
  [12, 0.25],
  [18, 0.12],
];
const BILD_MS = 1000 / 30;
const TEXT = 'main :is(h1, h2, h3, p, li, dt, dd, summary, .actions, .kontakt-wege, .eyebrow, .breadcrumb, .card), .site-footer :is(p, li, dd)';
const FREI = '[data-fluss-ziel]';
const ZELLE = 8;

type Zeichen = { bahn: number; s: number; bit: number; a: number; gStart: number; gDauer: number; gSpitze: number };
type Bahn = { y: number; tempo: number; phase: number };
/** Maske je 8-px-Zelle: 0 frei, 1 nahe an Text (kein Glimmer), 2 hinter Text (gedämpft), 3 Karte (kein Zeichen) */
type Flaeche = { x: number; y: number; b: number; h: number; art: 1 | 2 | 3 };

const zufall = (a: number, b: number) => a + Math.random() * (b - a);
let gestartet = false;

export function starteBinaerstrom() {
  const leinwand = document.querySelector<HTMLCanvasElement>('.binaerstrom');
  const ctx = leinwand?.getContext('2d');
  if (gestartet || !leinwand || !ctx) return;
  gestartet = true;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const schrift = `${SCHRIFT}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace'}`;

  let b = 0;
  let h = 0;
  let dpr = 1;
  let handy = false;
  let bahnen: Bahn[] = [];
  let zeichen: Zeichen[] = [];
  let t = 0;

  // ---------- Bahnen und Zeichen ----------
  function aufbauen() {
    const r = leinwand!.getBoundingClientRect();
    b = Math.round(r.width);
    h = Math.round(r.height);
    dpr = Math.min(2, devicePixelRatio || 1);
    leinwand!.width = Math.round(b * dpr);
    leinwand!.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    handy = b < 768;
    const laenge = b + 2 * RAND;
    const plaetze = Math.floor(laenge / ZEICHEN);
    const anzahlBahnen = Math.ceil((h + b * NEIGUNG + 2 * ZEILE) / ZEILE);
    // Dichte: 30 % (Handy 15 %), gedeckelt
    const deckel = handy ? 360 : 2600;
    const dichte = Math.min(handy ? 0.15 : 0.3, deckel / (anzahlBahnen * plaetze));
    bahnen = [];
    zeichen = [];
    for (let i = 0; i < anzahlBahnen; i++) {
      bahnen.push({ y: -b * NEIGUNG - ZEILE + i * ZEILE, tempo: zufall(20, 40), phase: zufall(0, Math.PI * 2) });
      let p = Math.floor(zufall(0, 12));
      while (p < plaetze) {
        const gruppe = Math.round(zufall(3, 8));
        for (let k = 0; k < gruppe && p < plaetze; k++, p++) {
          zeichen.push({ bahn: i, s: p * ZEICHEN, bit: Math.random() < 0.5 ? 0 : 1, a: zufall(DECKKRAFT[0], DECKKRAFT[1]), gStart: -1, gDauer: 0, gSpitze: 0 });
        }
        p += Math.max(1, Math.round((gruppe * (1 - dichte)) / dichte * zufall(0.5, 1.5)));
      }
    }
    flaechenDa = false;
  }

  // ---------- Vorgezeichnete Zeichen je Farbe (drawImage ist viel schneller als fillText) ----------
  let farbe = '';
  // Die Farbe gleitet 1,2 s (CSS); nur in dieser Zeit wird sie in jedem Bild gelesen, sonst nie (spart Stil-Berechnungen)
  let farbeLesenBis = Infinity;
  let bilder: HTMLCanvasElement[] = [];
  let leuchten: HTMLCanvasElement[] = [];
  function male(text: string, glanz: number) {
    const c = document.createElement('canvas');
    const rand = glanz ? 8 : 0;
    c.width = Math.ceil((ZEICHEN + 2 * rand) * dpr);
    c.height = Math.ceil((ZEILE + 2 * rand) * dpr);
    const x = c.getContext('2d')!;
    x.scale(dpr, dpr);
    x.font = schrift;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = farbe;
    if (glanz) {
      x.shadowColor = farbe;
      x.shadowBlur = glanz;
    }
    x.fillText(text, rand + ZEICHEN / 2, rand + ZEILE / 2);
    return c;
  }
  function pruefeFarbe() {
    if (performance.now() > farbeLesenBis && farbe) return false;
    const neu = getComputedStyle(leinwand!).getPropertyValue('--a').trim();
    if (!neu || neu === farbe) return false;
    farbe = neu;
    bilder = [male('0', 0), male('1', 0)];
    leuchten = [male('0', 8), male('1', 8)];
    return true;
  }

  // ---------- Lesbarkeit: wo Text steht (gedämpft) und wo Karten liegen (frei) ----------
  let flaechen: Flaeche[] = [];
  let flaechenDa = false;
  let gesammelt = 0;
  let spalten = 0;
  let maske = new Uint8Array(0);
  let maskeFuer = NaN;
  function sammle() {
    const y0 = scrollY;
    const liste: Flaeche[] = [];
    const nimm = (el: Element, art: 1 | 2 | 3, rand: number) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) liste.push({ x: r.left - rand, y: r.top + y0 - rand, b: r.width + 2 * rand, h: r.height + 2 * rand, art });
    };
    document.querySelectorAll(TEXT).forEach((el) => {
      nimm(el, 1, 20);
      nimm(el, 2, 6);
    });
    document.querySelectorAll(FREI).forEach((el) => nimm(el, 3, 2));
    flaechen = liste;
    flaechenDa = true;
    gesammelt = performance.now();
    maskeFuer = NaN;
  }
  function baueMaske() {
    spalten = Math.ceil(b / ZELLE);
    const zeilen = Math.ceil(h / ZELLE);
    if (maske.length !== spalten * zeilen) maske = new Uint8Array(spalten * zeilen);
    else maske.fill(0);
    for (const f of flaechen) {
      const oben = f.y - scrollY;
      if (oben > h || oben + f.h < 0) continue;
      const x0 = Math.max(0, Math.floor(f.x / ZELLE));
      const x1 = Math.min(spalten - 1, Math.floor((f.x + f.b) / ZELLE));
      const z0 = Math.max(0, Math.floor(oben / ZELLE));
      const z1 = Math.min(zeilen - 1, Math.floor((oben + f.h) / ZELLE));
      for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (maske[z * spalten + x] < f.art) maske[z * spalten + x] = f.art;
    }
    maskeFuer = scrollY;
  }
  const maskeBei = (x: number, y: number) => {
    const sp = Math.floor(x / ZELLE);
    if (sp < 0 || sp >= spalten || y < 0) return 0;
    return maske[Math.floor(y / ZELLE) * spalten + sp] ?? 0;
  };

  // ---------- Ein Bild ----------
  function zeichne(dt: number) {
    if (!flaechenDa || performance.now() - gesammelt > 1500) sammle();
    if (maskeFuer !== scrollY) baueMaske();
    pruefeFarbe();
    ctx!.clearRect(0, 0, b, h);
    if (!still) {
      // Glimmer starten (Handy seltener) und selten ein Bit kippen
      let neue = (handy ? 1.5 : 4) * dt;
      while (neue > 0) {
        if (Math.random() < neue) {
          const z = zeichen[Math.floor(Math.random() * zeichen.length)];
          if (z && z.gStart < 0) Object.assign(z, { gStart: t, gDauer: zufall(GLIMMER.dauer[0], GLIMMER.dauer[1]), gSpitze: zufall(GLIMMER.deckkraft[0], GLIMMER.deckkraft[1]) });
        }
        neue -= 1;
      }
      if (Math.random() < dt * 6) {
        const z = zeichen[Math.floor(Math.random() * zeichen.length)];
        if (z) z.bit ^= 1;
      }
    }
    const laenge = b + 2 * RAND;
    const k = (Math.PI * 2) / WELLE.laenge;
    const yAuf = (bahn: Bahn, x: number) => bahn.y + x * NEIGUNG + WELLE.hoehe * Math.sin(x * k + t * WELLE.tempo + bahn.phase);
    for (const z of zeichen) {
      const bahn = bahnen[z.bahn];
      z.s = (z.s + bahn.tempo * dt) % laenge;
      const x = z.s - RAND;
      const y = yAuf(bahn, x);
      if (y < -ZEILE || y > h || x < -ZEICHEN || x > b) continue;
      const m = maskeBei(x + ZEICHEN / 2, y + ZEILE / 2);
      if (m === 3) continue;
      let a = z.a;
      let glanz = 0;
      if (z.gStart >= 0) {
        const p = (t - z.gStart) / z.gDauer;
        if (p >= 1) z.gStart = -1;
        else glanz = z.gSpitze * (p < 0.12 ? p / 0.12 : (1 - (p - 0.12) / 0.88) ** 2);
      }
      if (m) glanz = 0;
      if (m === 2) a = Math.min(a, HINTER_TEXT);
      if (glanz > a) {
        // Spur auf der eigenen Bahn, dahinter das leuchtende Zeichen
        for (const [abstand, anteil] of NACHGLUEHEN) {
          ctx!.globalAlpha = Math.max(a, glanz * anteil);
          ctx!.drawImage(bilder[z.bit], x - abstand, yAuf(bahn, x - abstand), ZEICHEN, ZEILE);
        }
        ctx!.globalAlpha = glanz;
        ctx!.drawImage(leuchten[z.bit], x - 8, y - 8, ZEICHEN + 16, ZEILE + 16);
      } else {
        ctx!.globalAlpha = a;
        ctx!.drawImage(bilder[z.bit], x, y, ZEICHEN, ZEILE);
      }
    }
  }

  // ---------- Takt, Pausen ----------
  let sichtbar = true;
  let laeuft = false;
  let letztes = 0;
  function bild(jetzt: number) {
    if (!laeuft) return;
    requestAnimationFrame(bild);
    if (jetzt - letztes < BILD_MS - 2) return;
    const dt = letztes ? Math.min(0.1, (jetzt - letztes) / 1000) : 0;
    letztes = jetzt;
    t += dt;
    zeichne(dt);
  }
  let neuZeichnen = 0;
  function auffrischen() {
    if (still) {
      if (!sichtbar || neuZeichnen) return;
      neuZeichnen = requestAnimationFrame(() => {
        neuZeichnen = 0;
        zeichne(0);
      });
      return;
    }
    const soll = sichtbar && !document.hidden;
    if (soll === laeuft) return;
    laeuft = soll;
    letztes = 0;
    if (laeuft) requestAnimationFrame(bild);
  }

  aufbauen();
  // Schrift (selbst ausgeliefert) laden; ist sie da, die vorgezeichneten Zeichen neu anlegen
  document.fonts?.load(schrift).then(() => {
    farbe = '';
    if (still) auffrischen();
  });
  new IntersectionObserver(([e]) => {
    sichtbar = e.isIntersecting;
    auffrischen();
  }).observe(leinwand);
  document.addEventListener('visibilitychange', auffrischen);
  // Größe: nur bei echter Änderung neu aufbauen (die Höhe ist 100lvh, die Adressleiste am Handy ändert sie nicht)
  new ResizeObserver(() => {
    const r = leinwand.getBoundingClientRect();
    if (Math.round(r.width) === b && Math.round(r.height) === h) return;
    aufbauen();
    farbe = '';
    if (still) auffrischen();
  }).observe(leinwand);
  new MutationObserver(() => {
    farbeLesenBis = performance.now() + 1400;
    if (still) auffrischen();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-welt', 'data-stufe'] });
  if (still) addEventListener('scroll', auffrischen, { passive: true });
  // Nach dem Start einmal 1,4 s lang lesen (falls gerade ein Wechsel läuft), danach nur noch bei Wechseln
  farbeLesenBis = performance.now() + 1400;
  auffrischen();

  // Nur für Prüfungen
  (window as unknown as { binaerstrom: object }).binaerstrom = {
    stand: () => ({ zeichen: zeichen.length, bahnen: bahnen.length, groesse: [leinwand.width, leinwand.height], farbe, laeuft, still }),
  };
}
