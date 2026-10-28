/**
 * Lebendiger Hintergrund der Stufe Mittel („Aurora“, Bausteine: Aurora.astro, Aussehen: farbwelten.css).
 *
 * - Das Atmen (Deckkraft und Lage, 0,3–0,4 Hz) und das langsame Wandern sind reine CSS-Animationen:
 *   Sie laufen auf der Grafikkarte weiter, auch wenn die Seite gerade rechnet. Hier passiert nur:
 * - Farbe: Ändert mittel.ts <html data-welt>, wird die neue Akzentfarbe (--akzent) einmal gelesen. Die zweite Ebene
 *   bekommt sie und wächst als weiche Welle in 1,2 s von unten (beim Hochscrollen von oben) über die alte.
 * - Stärke: 0,5 (Lime 0,45), die Wolken atmen zwischen 70 und 100 % davon. Lesbar bleibt Text durch einen weichen
 *   Schein in der Grundfarbe direkt um die Schrift (--halo in farbwelten.css), nicht durch einen schwachen Hintergrund.
 * - Bewegung: Beim Scrollen gleitet der Hintergrund ein paar Pixel mit (Parallaxe), beim Wischen am Handy folgt er
 *   dem Finger um wenige Pixel und rastet danach weich wieder ein. Nur transform, nichts muss neu gezeichnet werden.
 * - „Bewegung reduzieren“: alles steht, die Farbe wechselt ohne Welle.
 */
import { ruhig } from './stufe';

type RGB = [number, number, number];

const MORPH_MS = 1200;

const kanal = (c: number) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const helligkeit = ([r, g, b]: RGB) => 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);

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

/** Stärke der Wolken: kräftig (Lesbarkeit sichert der Schein um die Schrift). Sehr helle Farben (Lime) etwas weniger. */
const staerke = (farbe: RGB) => (helligkeit(farbe) > 0.5 ? 0.45 : 0.5);

const rgb = (c: RGB) => `rgb(${c.map(Math.round).join(' ')})`;
const begrenze = (x: number, g: number) => Math.max(-g, Math.min(g, x));

let gestartet = false;

export function starteAurora() {
  const aurora = document.querySelector<HTMLElement>('.aurora');
  if (gestartet || !aurora) return;
  gestartet = true;
  const html = document.documentElement;
  const ebenen = [...aurora.querySelectorAll<HTMLElement>('.aurora-ebene')];
  const still = ruhig();
  let aktiv = 0;
  let farbe: RGB = [0, 0, 0];
  let ende = 0;

  const liesAkzent = () => liesFarbe(getComputedStyle(html).getPropertyValue('--akzent')) ?? farbe;
  const faerbe = (ebene: HTMLElement, f: RGB) => {
    ebene.style.setProperty('--farbe', rgb(f));
    ebene.style.setProperty('--staerke', String(staerke(f)));
  };

  // ---------- Farbe und fließender Wechsel ----------
  let richtung = 1;
  function wechsel() {
    const neu = liesAkzent();
    if (neu.join() === farbe.join()) return;
    farbe = neu;
    if (still) return faerbe(ebenen[aktiv], neu);
    const alt = ebenen[aktiv];
    aktiv = 1 - aktiv;
    const ebene = ebenen[aktiv];
    clearTimeout(ende);
    faerbe(ebene, neu);
    ebene.style.setProperty('--morph-y', richtung > 0 ? '115%' : '-15%');
    ebene.style.zIndex = '2';
    alt.style.zIndex = '1';
    // Welle beginnt klein (ohne Übergang), wächst im nächsten Bild über die ganze Fläche
    ebene.classList.remove('morph', 'weg');
    ebene.classList.add('morph-start');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        ebene.classList.replace('morph-start', 'morph');
        alt.classList.add('weg');
      }),
    );
    // Danach die Maske ablegen: Ohne sie muss der Browser weniger rechnen
    ende = window.setTimeout(() => ebene.classList.remove('morph'), MORPH_MS + 100);
  }
  farbe = liesAkzent();
  faerbe(ebenen[0], farbe);
  new MutationObserver(wechsel).observe(html, { attributes: true, attributeFilter: ['data-welt'] });

  // ---------- Parallaxe: Scrollen und Wischen ----------
  let x = 0;
  let y = 0;
  let zielX = 0;
  let geschw = 0;
  let letztesY = scrollY;
  let letzteZeit = performance.now();
  let laeuft = false;
  let startX: number | null = null;

  function bild() {
    const hoehe = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    // langsames Absinken über die ganze Seite plus ein kleiner Nachlauf beim schnellen Scrollen
    const zielY = -(scrollY / hoehe) * 36 + begrenze(-geschw * 0.012, 14);
    geschw *= 0.88;
    x += (zielX - x) * 0.1;
    y += (zielY - y) * 0.1;
    aurora!.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    // Ruhe: Schleife anhalten, bis sich wieder etwas bewegt
    if (Math.abs(zielX - x) < 0.05 && Math.abs(zielY - y) < 0.05 && Math.abs(geschw) < 1) {
      laeuft = false;
      return;
    }
    requestAnimationFrame(bild);
  }
  const anstossen = () => {
    if (still || laeuft) return;
    laeuft = true;
    requestAnimationFrame(bild);
  };
  addEventListener(
    'scroll',
    () => {
      const jetzt = performance.now();
      const dy = scrollY - letztesY;
      richtung = dy >= 0 ? 1 : -1;
      const dt = Math.max(8, jetzt - letzteZeit);
      geschw = geschw * 0.5 + ((dy / dt) * 1000) * 0.5;
      letztesY = scrollY;
      letzteZeit = jetzt;
      anstossen();
    },
    { passive: true },
  );
  addEventListener('touchstart', (e) => (startX = e.touches[0]?.clientX ?? null), { passive: true });
  addEventListener(
    'touchmove',
    (e) => {
      if (startX === null) return;
      zielX = begrenze(((e.touches[0]?.clientX ?? startX) - startX) * 0.06, 10);
      anstossen();
    },
    { passive: true },
  );
  const loslassen = () => {
    startX = null;
    zielX = 0;
    anstossen();
  };
  addEventListener('touchend', loslassen, { passive: true });
  addEventListener('touchcancel', loslassen, { passive: true });
  anstossen();

  // Nur für Prüfungen
  (window as unknown as { aurora: object }).aurora = {
    stand: () => {
      const e = ebenen[aktiv];
      const r = e.getBoundingClientRect();
      return {
        ebenen: ebenen.length,
        wolken: [...e.querySelectorAll('i')].filter((w) => getComputedStyle(w).display !== 'none' && getComputedStyle(w.parentElement!).display !== 'none').length,
        farbe: getComputedStyle(e).getPropertyValue('--farbe'),
        deckkraft: +getComputedStyle(e).opacity,
        staerke: +getComputedStyle(e.querySelector('.aurora-wolken')!).opacity,
        groesse: [Math.round(r.width), Math.round(r.height)],
        animiert: getComputedStyle(e.querySelector('i')!).animationName,
      };
    },
  };
}
