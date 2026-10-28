/**
 * Lichtstrahl der Stufe Mittel: pulsierende Lichtfasern hinter dem Inhalt (Canvas 2D, ein requestAnimationFrame).
 *
 * - Fasern: gemeinsamer Ursprung links oben (außerhalb des Bildes), Bögen nach rechts unten.
 *   Handy 3 (halbe Pulsfrequenz), Tablet 5, Desktop 8. Jede Faser hat eigenen Farbton, Takt und Phase.
 * - Puls: Deckkraft Handy 0,5–0,8, sonst 0,4–0,9; Breite 3–8 px; Frequenz 0,3–0,8 Hz.
 *   Jede Faser besteht aus 5 übereinanderliegenden Strichen (breiter Schein bis heller Kern).
 * - Farbe: die eine Akzentfarbe --akzent (am <html>). Ändert mittel.ts <html data-welt>, wird die neue Farbe
 *   einmal gelesen und hier im Skript in 1,2 s überblendet (wie der CSS-Übergang der übrigen Bausteine).
 * - Lesbarkeit zuerst: Gedämpft wird nur hinter Text (jede Textzeile, Rahmen-Knöpfe, ganze Karten), so weit,
 *   dass gedämpfter Text (#a9a7bd) und Text in Akzentfarbe auch auf einer Karte mindestens 4,5:1 behalten.
 *   In den Lücken leuchtet er voll. Die Textflächen werden einmal vermessen (Seitenkoordinaten) und nur bei
 *   Größenänderungen neu.
 * - Scrollen: Der Ursprung folgt der Bewegung um höchstens 20 px und zieht mit 0,1 s Verzögerung nach.
 *   Beim Scrollen wird die Dämpfung großzügiger, damit sie dem Text nicht hinterherläuft.
 * - „Bewegung reduzieren“: ein stehendes Bild, neu gezeichnet nur bei Scrollen, Farbwechsel oder Größenänderung.
 * - Sparsam: halbe Auflösung (weiche Leuchtlinien verlieren dadurch nichts), Farben werden nur einmal pro
 *   Farbwechsel gelesen, Textstücke einer Zeile zusammengefasst, höchstens 30 Bilder pro Sekunde (für 0,3–0,8 Hz Puls reicht das;
 *   jedes neue Bild zwingt den Browser, die Unschärfe hinter den Glas-Karten neu zu berechnen).
 */
import { ruhig } from './stufe';

type RGB = [number, number, number];
type Faser = { t: number; farbton: number; hell: number; frequenz: number; phase: number };
/** Textfläche in Seitenkoordinaten */
type Flaeche = { x: number; y: number; b: number; h: number };

const WEISS: RGB = [255, 255, 255];
const GEDAEMPFT: RGB = [0xa9, 0xa7, 0xbd];
/** etwas über 4,5:1 als Reserve */
const ZIEL_KONTRAST = 4.6;
/** Was über dem Strahl noch liegt: Kachel-Linie, Schachbrett, Karten-Fläche (Anteile Weiß) */
const UEBERLAGERUNG = [0.035, 0.018, 0.05];
/** Schichten einer Faser: breiter Schein bis heller Kern (Breite × Grundbreite, Anteil der Deckkraft) */
const SCHICHTEN: [number, number][] = [
  [5, 0.08],
  [3.2, 0.14],
  [2.2, 0.24],
  [1.5, 0.45],
  [1, 1],
];
/** Deckkraft im Puls [schwach, stark]. Handy höher am unteren Ende, damit der Strahl auch im Tief sichtbar bleibt. */
const DECKKRAFT_HANDY: [number, number] = [0.5, 0.8];
const DECKKRAFT: [number, number] = [0.4, 0.9];
/** Breite des Kerns im Puls (px) */
const BREITE: [number, number] = [3, 8];
/** Hier wird gedämpft: jeder Text in diesen Bereichen. Karten und Rahmen-Knöpfe als Ganzes (ihr Inhalt zählt nicht extra). */
const BEREICHE = 'main, .site-footer';
const GANZ = '.card, .button-ghost';
/** Rand um jede Textfläche (px), in vier weichen Stufen; deckt auch den Abstand zwischen zwei Zeilen */
const RAND = 18;
const RAND_STUFEN = [1, 0.66, 0.33, 0];
/** Zeichenauflösung im Verhältnis zur Bildschirmgröße */
const AUFLOESUNG = 0.5;
/** Dauer eines Farbwechsels (wie der CSS-Übergang der übrigen Bausteine) */
const WECHSEL_MS = 1200;
/** weich hinein und heraus */
const weich = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

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

/** Höchste Deckkraft einer Faser über dem Grund, bei der Text in der Farbe `text` noch lesbar bleibt. */
function hoechsteDeckkraft(grund: RGB, farbe: RGB, text: RGB) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 12; i++) {
    const a = (lo + hi) / 2;
    let c = mische(mische(grund, farbe, a), farbe, 0.05); // 5 % Akzent-Tönung oben im Abschnitt
    for (const w of UEBERLAGERUNG) c = mische(c, WEISS, w);
    if (kontrast(text, c) >= ZIEL_KONTRAST) lo = a;
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
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  gestartet = true;
  const still = ruhig();

  let b = 0;
  let h = 0;
  let handy = false;
  let fasern: Faser[] = [];
  let spalte = { links: 0, rechts: 0 };
  let flaechen: Flaeche[] = [];
  let breiteBisher = -1;
  let deckkraft = DECKKRAFT;
  let farben: { kern: RGB; rand: RGB }[] = [];
  let akzent: RGB = [169, 139, 255];
  let von: RGB = akzent;
  let ziel: RGB = akzent;
  let wechselStart = -1e9;
  let innen = 1;
  let spitze = false;
  let scrollt = false;
  let pauseBis = 0;
  let versatz = 0;
  let geschw = 0;
  let letztesY = scrollY;
  let zuletzt = performance.now();
  let gezeichnet = 0;
  let mindestAbstand = 0;
  let grund: RGB = [13, 13, 19];
  // Dämpfung hinter Text als eigenes Bild: Es ändert sich nur beim Scrollen, sonst wird es wiederverwendet
  const maske = document.createElement('canvas');
  const mctx = maske.getContext('2d')!;
  let maskeFuer = '';
  let stand = 0;

  function messe() {
    b = innerWidth;
    h = innerHeight;
    maske.width = canvas!.width = Math.round(b * AUFLOESUNG);
    maske.height = canvas!.height = Math.round(h * AUFLOESUNG);
    ctx!.setTransform(AUFLOESUNG, 0, 0, AUFLOESUNG, 0, 0);
    mctx.setTransform(AUFLOESUNG, 0, 0, AUFLOESUNG, 0, 0);
    maskeFuer = '';
    handy = b < 768;
    deckkraft = handy ? DECKKRAFT_HANDY : DECKKRAFT;
    mindestAbstand = 1000 / 30 - 2;
    const anzahl = b < 768 ? 3 : b <= 1024 ? 5 : 8;
    fasern = Array.from({ length: anzahl }, (_, i) => {
      const t = i / (anzahl - 1);
      return { t, farbton: (t - 0.5) * 40, hell: Math.sin(i * 2.1) * 0.06, frequenz: 0.3 + ((i * 0.618) % 1) * 0.5, phase: i * 1.7 };
    });
    // Nur die Höhe geändert (z. B. Adressleiste am Handy): Textflächen bleiben, wo sie sind
    if (b !== breiteBisher) vermesse();
    breiteBisher = b;
    palette();
  }

  /** Textflächen in Seitenkoordinaten (ein Lesedurchgang, nichts wird geschrieben) */
  function vermesse() {
    const r = document.querySelector<HTMLElement>('main .wrap')?.getBoundingClientRect();
    spalte = r ? { links: r.left, rechts: r.right } : { links: 0, rechts: b };
    const y0 = scrollY;
    flaechen = [];
    const bereich = document.createRange();
    const merke = (q: DOMRect) => {
      if (q.width >= 1 && q.height >= 1) flaechen.push({ x: q.left, y: q.top + y0, b: q.width, h: q.height });
    };
    document.querySelectorAll<HTMLElement>(BEREICHE).forEach((wurzel) => {
      wurzel.querySelectorAll<HTMLElement>(GANZ).forEach((el) => merke(el.getBoundingClientRect()));
      // Nur die tatsächlichen Zeilen jedes Textes, nicht ganze Blöcke: So bleibt neben kurzen Zeilen Licht übrig
      const gang = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) =>
          n.textContent?.trim() && !n.parentElement?.closest(GANZ) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
      });
      for (let n = gang.nextNode(); n; n = gang.nextNode()) {
        bereich.selectNodeContents(n);
        for (const q of bereich.getClientRects()) merke(q);
      }
    });
    // Stücke derselben Zeile zu einer Fläche zusammenfassen (weniger zu zeichnen)
    flaechen.sort((p, q) => p.y - q.y || p.x - q.x);
    const zusammen: Flaeche[] = [];
    for (const f of flaechen) {
      const l = zusammen[zusammen.length - 1];
      if (l && Math.abs(l.y - f.y) < 3 && Math.abs(l.h - f.h) < 3 && f.x <= l.x + l.b + RAND && f.x >= l.x) {
        l.b = Math.max(l.b, f.x + f.b - l.x);
        l.h = Math.max(l.h, f.h);
      } else zusammen.push({ ...f });
    }
    flaechen = zusammen;
    stand++;
  }

  /** Zielfarbe lesen (einmal pro Weltwechsel; der Browser muss dafür nicht in jedem Bild neu rechnen) */
  function liesZiel() {
    return liesFarbe(getComputedStyle(document.documentElement).getPropertyValue('--akzent')) ?? ziel;
  }

  /** Farbtöne der Fasern aus der aktuellen Strahlfarbe, dazu die Dämpfung hinter Text */
  function palette() {
    const [hu, sa, li] = zuHsl(akzent);
    farben = fasern.map((f) => {
      const rand = vonHsl([(hu + f.farbton + 360) % 360, sa, Math.min(0.85, Math.max(0.35, li + f.hell))]);
      return { rand, kern: mische(rand, WEISS, 0.35) };
    });
    // Gedämpfter Text und Text in Akzentfarbe (Überschriften, Links) müssen lesbar bleiben
    const grenze = Math.min(...farben.flatMap((f) => [GEDAEMPFT, akzent].map((t) => hoechsteDeckkraft(grund, f.kern, t))));
    innen = Math.min(1, grenze / gestapelt(deckkraft[1]));
  }

  function zeichne(zeit: number) {
    // Während eines Farbwechsels gleitet die Farbe hier im Skript (ohne Bewegung: sofort am Ziel)
    const t = still ? 1 : Math.min(1, (performance.now() - wechselStart) / WECHSEL_MS);
    if (t < 1 || akzent !== ziel) {
      akzent = t < 1 ? mische(von, ziel, weich(t)) : ziel;
      palette();
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
      const alpha = deckkraft[0] + (deckkraft[1] - deckkraft[0]) * welle;
      const breite = BREITE[0] + (BREITE[1] - BREITE[0]) * welle;
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
        ctx!.strokeStyle = rgba(anteil === 1 ? kern : rand, alpha * anteil);
        ctx!.lineWidth = breite * mal;
        ctx!.stroke();
      }
    });

    // Hinter Text dämpfen (Lesbarkeit), in den Lücken voll leuchten lassen.
    ctx!.globalCompositeOperation = 'destination-out';
    ctx!.drawImage(maskeZeichnen(), 0, 0, b, h);
    ctx!.globalCompositeOperation = 'source-over';
  }

  /**
   * Bild der Dämpfung: deckend, wo Text liegt. Vier Stufen mit abnehmendem Rand ergeben eine weiche Kante;
   * übereinander bleibt vom Strahl genau „innen“ übrig. Beim Scrollen wächst der Rand mit der Geschwindigkeit,
   * damit die Dämpfung dem Text nie hinterherläuft. Neu gezeichnet nur, wenn sich etwas davon geändert hat.
   */
  function maskeZeichnen() {
    const y0 = Math.round(scrollY);
    const extra = Math.round(Math.min(80, Math.abs(geschw) * 0.05));
    const schluessel = `${y0} ${extra} ${innen.toFixed(3)} ${stand} ${b} ${h}`;
    if (schluessel === maskeFuer) return maske;
    maskeFuer = schluessel;
    const schritt = 1 - innen ** (1 / RAND_STUFEN.length);
    mctx.clearRect(0, 0, b, h);
    mctx.fillStyle = `rgba(0,0,0,${schritt.toFixed(4)})`;
    const sichtbar = flaechen.filter((f) => f.y - y0 + f.h + RAND + extra > 0 && f.y - y0 - RAND - extra < h);
    for (const anteil of RAND_STUFEN) {
      const rx = RAND * anteil;
      const ry = RAND * anteil + extra;
      mctx.beginPath();
      for (const f of sichtbar) mctx.rect(f.x - rx, f.y - y0 - ry, f.b + 2 * rx, f.h + 2 * ry);
      // nonzero: überlappende Flächen zählen innerhalb einer Stufe nur einmal
      mctx.fill('nonzero');
    }
    return maske;
  }

  function bild(jetzt: number) {
    requestAnimationFrame(bild);
    // Kurz nach einer Eingabe Pause: Die Antwort auf das Tippen hat Vorrang (der Puls ist so langsam, dass es nicht auffällt)
    if (jetzt < pauseBis) return;
    scrollt = scrollY !== letztesY || Math.abs(geschw) > 5;
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

  grund = liesFarbe(getComputedStyle(document.body).backgroundColor) ?? grund;
  akzent = von = ziel = liesZiel();
  messe();
  addEventListener('resize', () => {
    messe();
    if (still) zeichne(0);
  });
  // Neu vermessen, wenn sich Text bewegt haben kann: Inhalt ändert seine Höhe (Schriften, Frage aufgeklappt,
  // Bild geladen), Hauptpunkte sind fertig eingeblendet (gleiten 16 px), nach dem Scrollen (Überschriften
  // gleiten Wort für Wort, bis gut 1 s). Gesammelt, damit es höchstens einmal pro Ruhepause passiert.
  let warte = 0;
  const jetztVermessen = () => {
    vermesse();
    if (still) zeichne(0);
  };
  const bald = (ms: number) => {
    clearTimeout(warte);
    // erst wenn der Browser Luft hat, damit es nie einer Eingabe im Weg steht (Safari: kurz warten)
    warte = window.setTimeout(() => {
      if ('requestIdleCallback' in window) requestIdleCallback(jetztVermessen, { timeout: 500 });
      else jetztVermessen();
    }, ms);
  };
  new ResizeObserver(() => bald(100)).observe(document.body);
  addEventListener('transitionend', () => bald(100), { passive: true });
  addEventListener('animationend', () => bald(100), { passive: true });
  addEventListener('scroll', () => bald(1300), { passive: true });
  void document.fonts?.ready.then(() => bald(0));
  const pause = () => (pauseBis = performance.now() + 250);
  addEventListener('pointerdown', pause, { capture: true, passive: true });
  addEventListener('keydown', pause, { capture: true, passive: true });
  // Stehendes Bild: Die Dämpfung hängt an der Textposition, also beim Scrollen neu zeichnen
  if (still) {
    let geplant = false;
    addEventListener(
      'scroll',
      () => {
        if (geplant) return;
        geplant = true;
        requestAnimationFrame(() => {
          geplant = false;
          zeichne(0);
        });
      },
      { passive: true },
    );
  }
  // Nur für Prüfungen: alle Fasern in voller Stärke (ungünstigster Fall für die Lesbarkeit)
  (window as unknown as { lichtstrahl: object }).lichtstrahl = {
    spitze(an: boolean) {
      spitze = an;
      if (still) zeichne(0);
    },
    stand: () => ({ fasern: fasern.length, innen, spalte, textflaechen: flaechen.length, deckkraft, scrollt }),
    /** mittlere Zeit für ein Bild in ms (inklusive Rastern) */
    zeit(n = 20) {
      const start = performance.now();
      for (let i = 0; i < n; i++) {
        zeichne(start + i * 40);
        ctx!.getImageData(0, 0, 1, 1);
      }
      return (performance.now() - start) / n;
    },
  };

  // Neue Welt: von der aktuellen Farbe zur neuen gleiten
  new MutationObserver(() => {
    von = akzent;
    ziel = liesZiel();
    wechselStart = performance.now();
    // ohne Bewegung springt die Farbe: dann ein neues stehendes Bild
    if (still) requestAnimationFrame(() => zeichne(0));
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-welt'] });

  if (still) {
    zeichne(0);
  } else {
    requestAnimationFrame(bild);
  }
}
