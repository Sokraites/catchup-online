/**
 * Lichtstrahl der Stufe Mittel: pulsierende Lichtfasern hinter dem Inhalt (Canvas 2D, ein requestAnimationFrame).
 *
 * - Fasern: gemeinsamer Ursprung links oben (außerhalb des Bildes), Bögen nach rechts unten.
 *   Handy 3 (halbe Pulsfrequenz), Tablet 5, Desktop 8. Jede Faser hat eigenen Farbton, Takt und Phase.
 * - Puls: Deckkraft 0,15–0,6 und Breite 2–5 px, Frequenz 0,3–0,8 Hz.
 * - Farbe: CSS-Variable --strahl-farbe am Canvas (mit @property registriert). Sie wechselt per CSS-Übergang,
 *   synchron zur Farbwelt (mittel.ts setzt data-welt an beiden). Hier wird sie nur gelesen.
 * - Lesbarkeit zuerst: Über der Inhaltsspalte wird der Strahl so weit gedämpft, dass gedämpfter Text (#a9a7bd)
 *   auch auf einer Karte mindestens 4,5:1 behält. Daneben (am breiten Bildschirm) leuchtet er voll.
 * - Scrollen: Der Ursprung folgt der Bewegung um höchstens 20 px und zieht mit 0,1 s Verzögerung nach.
 * - „Bewegung reduzieren“: ein stehendes Bild, neu gezeichnet nur bei Farbwechsel oder Größenänderung.
 * - Sparsam: halbe Auflösung (weiche Leuchtlinien verlieren dadurch nichts), Farben werden nur während eines
 *   Farbwechsels neu gelesen, höchstens 30 Bilder pro Sekunde (für 0,3–0,8 Hz Puls reicht das; jedes neue Bild
 *   zwingt den Browser, die Unschärfe hinter den Glas-Karten neu zu berechnen).
 */
import { ruhig } from './stufe';

type RGB = [number, number, number];
type Faser = { t: number; farbton: number; hell: number; frequenz: number; phase: number };

const WEISS: RGB = [255, 255, 255];
const GEDAEMPFT: RGB = [0xa9, 0xa7, 0xbd];
/** etwas über 4,5:1 als Reserve */
const ZIEL_KONTRAST = 4.6;
/** Was über dem Strahl noch liegt: Kachel-Linie, Schachbrett, Karten-Fläche (Anteile Weiß) */
const UEBERLAGERUNG = [0.035, 0.018, 0.05];
/** Schichten einer Faser: breiter Schein, Mitte, heller Kern (Breite × Grundbreite, Anteil der Deckkraft) */
const SCHICHTEN: [number, number][] = [
  [4, 0.18],
  [2, 0.35],
  [1, 1],
];
const SPITZE = 0.6;
/** Zeichenauflösung im Verhältnis zur Bildschirmgröße */
const AUFLOESUNG = 0.5;
/** So lange nach einem Farbwechsel werden Farben in jedem Bild neu gelesen (CSS-Übergang 1,2 s) */
const WECHSEL_MS = 1500;

const kanal = (c: number) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const helligkeit = ([r, g, b]: RGB) => 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
const kontrast = (a: RGB, b: RGB) => {
  const x = helligkeit(a);
  const y = helligkeit(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const mische = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** Deckkraft, die mehrere übereinanderliegende Schichten zusammen erreichen */
const gestapelt = (a: number) => 1 - SCHICHTEN.reduce((p, [, anteil]) => p * (1 - a * anteil), 1);

/** Höchste Deckkraft einer Faser über dem Grund, bei der gedämpfter Text noch lesbar bleibt. */
function hoechsteDeckkraft(grund: RGB, farbe: RGB) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 12; i++) {
    const a = (lo + hi) / 2;
    let c = mische(mische(grund, farbe, a), farbe, 0.05); // 5 % Akzent-Tönung oben im Abschnitt
    for (const w of UEBERLAGERUNG) c = mische(c, WEISS, w);
    if (kontrast(GEDAEMPFT, c) >= ZIEL_KONTRAST) lo = a;
    else hi = a;
  }
  return lo;
}

/** Liest rgb(), rgba(), #rrggbb und color(srgb …). */
function liesFarbe(text: string): RGB | null {
  const t = text.trim();
  let m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(t);
  if (m) return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(t);
  if (m) return [+m[1], +m[2], +m[3]];
  m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i.exec(t);
  if (m) return [+m[1] * 255, +m[2] * 255, +m[3] * 255];
  return null;
}

function zuHsl([r, g, b]: RGB): RGB {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function vonHsl([h, s, l]: RGB): RGB {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

const rgba = (c: RGB, a: number) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a.toFixed(3)})`;

let gestartet = false;

export function starteLichtstrahl() {
  if (gestartet) return;
  const canvas = document.querySelector<HTMLCanvasElement>('canvas.lichtstrahl');
  const ebene = document.querySelector<HTMLElement>('.farbwelt');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  gestartet = true;
  const still = ruhig();

  let b = 0;
  let h = 0;
  let handy = false;
  let fasern: Faser[] = [];
  let spalte = { links: 0, rechts: 0 };
  let farbText = '';
  let farben: { kern: RGB; rand: RGB }[] = [];
  let innen = 1;
  let spitze = false;
  let versatz = 0;
  let geschw = 0;
  let letztesY = scrollY;
  let zuletzt = performance.now();
  let gezeichnet = 0;
  let mindestAbstand = 0;
  let wechselBis = performance.now() + WECHSEL_MS;
  let grund: RGB = [13, 13, 19];

  function messe() {
    b = innerWidth;
    h = innerHeight;
    canvas!.width = Math.round(b * AUFLOESUNG);
    canvas!.height = Math.round(h * AUFLOESUNG);
    ctx!.setTransform(AUFLOESUNG, 0, 0, AUFLOESUNG, 0, 0);
    handy = b < 768;
    mindestAbstand = 1000 / 30 - 2;
    const anzahl = b < 768 ? 3 : b <= 1024 ? 5 : 8;
    fasern = Array.from({ length: anzahl }, (_, i) => {
      const t = i / (anzahl - 1);
      return { t, farbton: (t - 0.5) * 40, hell: Math.sin(i * 2.1) * 0.06, frequenz: 0.3 + ((i * 0.618) % 1) * 0.5, phase: i * 1.7 };
    });
    const r = document.querySelector<HTMLElement>('main .wrap')?.getBoundingClientRect();
    spalte = r ? { links: r.left, rechts: r.right } : { links: 0, rechts: b };
    farbText = '';
    wechselBis = performance.now() + WECHSEL_MS;
  }

  /** Farbtöne der Fasern aus der aktuellen Strahlfarbe (nur neu, wenn sie sich geändert hat) */
  function palette() {
    const text = getComputedStyle(canvas!).getPropertyValue('--strahl-farbe');
    if (text === farbText) return;
    farbText = text;
    const [hu, sa, li] = zuHsl(liesFarbe(text) ?? [195, 245, 60]);
    farben = fasern.map((f) => {
      const rand = vonHsl([(hu + f.farbton + 360) % 360, sa, Math.min(0.85, Math.max(0.35, li + f.hell))]);
      return { rand, kern: mische(rand, WEISS, 0.35) };
    });
  }

  function zeichne(zeit: number) {
    // Farben nur lesen, solange ein Farbwechsel läuft (sonst bleibt alles gleich)
    if (zeit === 0 || performance.now() < wechselBis) {
      palette();
      grund = liesFarbe(getComputedStyle(ebene ?? document.body).backgroundColor) ?? grund;
      const grenze = Math.min(...farben.map((f) => hoechsteDeckkraft(grund, f.kern)));
      innen = Math.min(1, grenze / gestapelt(SPITZE));
    }

    ctx!.globalCompositeOperation = 'source-over';
    ctx!.clearRect(0, 0, b, h);
    ctx!.lineCap = 'round';
    const ox = -(handy ? 0.25 : 0.12) * b;
    const oy = (handy ? 0.08 : 0.14) * h + versatz;
    const sek = zeit / 1000;

    fasern.forEach((f, i) => {
      const takt = handy ? f.frequenz / 2 : f.frequenz;
      const welle = spitze ? 1 : still ? 0.5 : 0.5 + 0.5 * Math.sin(2 * Math.PI * takt * sek + f.phase);
      const deckkraft = 0.15 + (SPITZE - 0.15) * welle;
      const breite = 2 + 3 * welle;
      const ex = b * (0.45 + 0.65 * f.t);
      const ey = h * (1.15 - 0.55 * f.t);
      const c1x = ox + b * 0.32;
      const c1y = oy + h * (0.04 - 0.22 * f.t);
      const c2x = ex - b * 0.2;
      const c2y = ey - h * (0.42 - 0.18 * f.t);
      const { kern, rand } = farben[i];
      for (const [mal, anteil] of SCHICHTEN) {
        ctx!.beginPath();
        ctx!.moveTo(ox, oy);
        ctx!.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
        ctx!.strokeStyle = rgba(anteil === 1 ? kern : rand, deckkraft * anteil);
        ctx!.lineWidth = breite * mal;
        ctx!.stroke();
      }
    });

    // Über der Inhaltsspalte dämpfen (Lesbarkeit), außerhalb mit weichem Übergang voll leuchten lassen
    const weich = 48;
    const l = Math.max(0, spalte.links - weich);
    const r = Math.min(b, spalte.rechts + weich);
    const maske = ctx!.createLinearGradient(0, 0, b, 0);
    const voll = 'rgba(0,0,0,1)';
    const gedaempft = `rgba(0,0,0,${innen.toFixed(3)})`;
    if (l > 0) {
      maske.addColorStop(0, voll);
      maske.addColorStop(l / b, voll);
    }
    maske.addColorStop(Math.max(0, spalte.links) / b, gedaempft);
    maske.addColorStop(Math.min(b, spalte.rechts) / b, gedaempft);
    if (r < b) {
      maske.addColorStop(r / b, voll);
      maske.addColorStop(1, voll);
    }
    ctx!.globalCompositeOperation = 'destination-in';
    ctx!.fillStyle = maske;
    ctx!.fillRect(0, 0, b, h);
    ctx!.globalCompositeOperation = 'source-over';
  }

  function bild(jetzt: number) {
    requestAnimationFrame(bild);
    if (jetzt - gezeichnet < mindestAbstand) return;
    gezeichnet = jetzt;
    const dt = Math.min(0.1, Math.max(0, (jetzt - zuletzt) / 1000));
    zuletzt = jetzt;
    const y = scrollY;
    const v = dt > 0 ? (y - letztesY) / dt : 0;
    letztesY = y;
    // Geschwindigkeit und Versatz folgen mit etwa 0,1 s Verzögerung
    const folge = Math.min(1, dt / 0.1);
    geschw += (v - geschw) * folge;
    const ziel = Math.max(-20, Math.min(20, -geschw * 0.02));
    versatz += (ziel - versatz) * folge;
    zeichne(jetzt);
  }

  messe();
  addEventListener('resize', () => {
    messe();
    if (still) zeichne(0);
  });
  // Nur für Prüfungen: alle Fasern in voller Stärke (ungünstigster Fall für die Lesbarkeit)
  (window as unknown as { lichtstrahl: object }).lichtstrahl = {
    spitze(an: boolean) {
      spitze = an;
      if (still) zeichne(0);
    },
    stand: () => ({ fasern: fasern.length, innen, spalte }),
  };

  // Neue Welt: Farben während des Übergangs wieder in jedem Bild lesen
  new MutationObserver(() => {
    wechselBis = performance.now() + WECHSEL_MS;
    // ohne Bewegung springt die Farbe: dann ein neues stehendes Bild
    if (still) requestAnimationFrame(() => zeichne(0));
  }).observe(canvas, { attributes: true, attributeFilter: ['data-welt'] });

  if (still) {
    zeichne(0);
  } else {
    requestAnimationFrame(bild);
  }
}
