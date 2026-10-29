/**
 * Stufe Mittel: Akzentfarbe je Abschnitt, Überschriften Wort für Wort mit Akzent-Wort, Schimmer auf der Kategorie-Zeile, Scroll-Hinweis.
 * Ersatz für die Monitor-Dramaturgie der Stufe Schwer. Farben und Übergänge: src/styles/farbwelten.css.
 *
 * - Der Inhalt bleibt echter Text. Ohne JavaScript bleibt die Grundfarbe stehen, alles ist sofort sichtbar.
 * - Bei „Bewegung reduzieren“ wechseln die Farben ohne Übergang; nichts blendet ein, nichts schimmert.
 * - Gespeichert wird nur, ob der Scroll-Hinweis in dieser Sitzung schon zu sehen war (sessionStorage, endet mit dem Tab).
 */
import { abschnittsWelten, type Welt } from '../config/farbwelten';
import { ruhig } from './stufe';

const HINWEIS_GEZEIGT = 'scroll-hinweis-gezeigt';

let gestartet = false;

export function starteMittel() {
  if (gestartet) return;
  gestartet = true;
  starteFarbwelten();
  starteTippen();
  ladeBilderVor();
  if (!ruhig()) starteWortweise();
  markiereAkzentWorte();
  if (ruhig()) return;
  starteSchimmer();
  starteScrollHinweis();
}

/**
 * Der Abschnitt, der gerade die Bildschirmmitte kreuzt, bestimmt die eine Akzentfarbe der Seite:
 * <html data-welt="…"> setzt --akzent (farbwelten.css), Knöpfe, Karten, Überschriften und Hintergrund lesen sie.
 */
function starteFarbwelten() {
  const html = document.documentElement;
  const main = document.querySelector<HTMLElement>('main');
  if (!main) return;
  const seitenWelt = (main.dataset.welt as Welt) || 'hero';
  // Steht schon im HTML; in eingebetteten Vorschauen kann das <html>-Element fehlen
  html.dataset.welt ||= seitenWelt;
  // nur äußere Abschnitte (verschachtelte gehören zu ihrem Abschnitt)
  const abschnitte = [...main.querySelectorAll<HTMLElement>('section')].filter((s) => !s.parentElement?.closest('section'));
  const weltVon = (s: HTMLElement): Welt => ((abschnittsWelten as string[]).includes(s.id) ? (s.id as Welt) : seitenWelt);

  const beobachter = new IntersectionObserver(
    (meldungen) => {
      for (const m of meldungen) {
        if (!m.isIntersecting) continue;
        html.dataset.welt = weltVon(m.target as HTMLElement);
      }
    },
    // schmales Band in der Bildschirmmitte
    { rootMargin: '-45% 0px -50% 0px' },
  );
  abschnitte.forEach((s) => beobachter.observe(s));
}

/**
 * Überschriften (h2) blenden Wort für Wort ein (80 ms Abstand, ab dem 7. Wort gemeinsam, 0,45 s, 12 px von unten),
 * schon kurz bevor sie ins Bild kommen.
 * Reines CSS mit einem Beobachter: Es muss keine Bibliothek nachgeladen werden, bevor eine Überschrift erscheint.
 * Vorgelesen wird weiter der ganze Satz (aria-label), die Wort-Teile sind für Hilfstechnik ausgeblendet.
 */
function starteWortweise() {
  const ueberschriften = [...document.querySelectorAll<HTMLElement>('main h2')].filter(
    (h) => h.textContent?.trim() && [...h.childNodes].every((n) => n.nodeType === Node.TEXT_NODE),
  );
  if (!ueberschriften.length) return;

  const beobachter = new IntersectionObserver(
    (meldungen) => {
      for (const m of meldungen) {
        if (!m.isIntersecting) continue;
        m.target.classList.add('wortweise-an');
        beobachter.unobserve(m.target);
      }
    },
    // schon kurz bevor sie ins Bild kommt: Niemand soll auf eine Überschrift warten
    { rootMargin: '0px 0px 15% 0px' },
  );
  for (const h of ueberschriften) {
    const text = h.textContent!.trim().replace(/\s+/g, ' ');
    h.setAttribute('aria-label', text);
    h.textContent = '';
    text.split(' ').forEach((wort, i) => {
      if (i) h.append(' ');
      const s = document.createElement('span');
      s.className = 'wort';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', String(Math.min(i, 6)));
      s.textContent = wort;
      h.append(s);
    });
    h.classList.add('wortweise');
    beobachter.observe(h);
  }
}

/**
 * Überschriften (h1, h2): Das letzte Wort bekommt die Klasse „akzent-wort“ (Verlauf von Weiß in die Akzentfarbe,
 * farbwelten.css). Der Text bleibt gleich. Bei Wort-für-Wort-Überschriften ist es das letzte Wort-Teil,
 * sonst wird das letzte Wort in einen <span> gelegt. Die h1 markiert beim Laden schon AkzentWort.astro;
 * hier wird sie nur nachgezogen, wenn von Leicht auf Mittel gewechselt wird.
 */
function markiereAkzentWorte() {
  for (const h of document.querySelectorAll<HTMLElement>('main h1, main h2')) {
    if (h.querySelector('.akzent-wort')) continue;
    const woerter = h.querySelectorAll('.wort');
    if (woerter.length) {
      woerter[woerter.length - 1].classList.add('akzent-wort');
      continue;
    }
    if (!h.textContent?.trim() || ![...h.childNodes].every((n) => n.nodeType === Node.TEXT_NODE)) continue;
    const text = h.textContent.trimEnd();
    const i = text.lastIndexOf(' ');
    const s = document.createElement('span');
    s.className = 'akzent-wort';
    s.textContent = text.slice(i + 1);
    h.textContent = text.slice(0, i + 1);
    h.append(s);
  }
}

/** Kategorie-Zeile: einmaliger Schimmer, wenn ihr Abschnitt zum ersten Mal ins Bild kommt. */
function starteSchimmer() {
  const zeilen = document.querySelectorAll<HTMLElement>('main .eyebrow');
  const beobachter = new IntersectionObserver(
    (meldungen) => {
      for (const m of meldungen) {
        if (!m.isIntersecting) continue;
        const el = m.target as HTMLElement;
        beobachter.unobserve(el);
        el.addEventListener('animationend', () => el.classList.remove('eyebrow-schimmer'), { once: true });
        el.classList.add('eyebrow-schimmer');
      }
    },
    { threshold: 1, rootMargin: '0px 0px -10% 0px' },
  );
  zeilen.forEach((z) => beobachter.observe(z));
}

/** Dezenter Pfeil am unteren Rand der ersten Ansicht: nur Startseite, nur ganz oben, einmal pro Sitzung. */
function starteScrollHinweis() {
  if (!document.getElementById('leistungen') || !document.querySelector('main .hero') || scrollY > 40) return;
  try {
    if (sessionStorage.getItem(HINWEIS_GEZEIGT)) return;
    sessionStorage.setItem(HINWEIS_GEZEIGT, '1');
  } catch {
    // Speicher gesperrt: Hinweis trotzdem zeigen
  }
  const hinweis = document.createElement('div');
  hinweis.className = 'scroll-hinweis';
  hinweis.setAttribute('aria-hidden', 'true');
  document.body.append(hinweis);

  let weg = false;
  const ausblenden = () => {
    if (weg) return;
    weg = true;
    removeEventListener('scroll', ausblenden);
    hinweis.classList.add('scroll-hinweis-weg');
    setTimeout(() => hinweis.remove(), 900);
  };
  addEventListener('scroll', ausblenden, { passive: true });
  setTimeout(ausblenden, 5000);
}

/**
 * Tipp-Feedback am Handy: Knöpfe und Karten leuchten beim Antippen auf (Safari setzt :active nur unzuverlässig).
 * Wird aus dem Tippen ein Wischen (Scrollen), meldet der Browser „pointercancel“: Dann erlischt es sofort.
 */
function starteTippen() {
  const ZIEL = 'main .card, main .button, .site-header .button';
  let aktiv: Element | null = null;
  let aus = 0;
  const loesche = () => {
    aktiv?.classList.remove('getippt');
    aktiv = null;
  };
  addEventListener(
    'pointerdown',
    (e) => {
      if (e.pointerType === 'mouse') return;
      clearTimeout(aus);
      loesche();
      aktiv = (e.target as Element).closest(ZIEL);
      aktiv?.classList.add('getippt');
    },
    { passive: true },
  );
  addEventListener('pointercancel', loesche, { passive: true });
  addEventListener(
    'pointerup',
    () => {
      aus = window.setTimeout(loesche, 350);
    },
    { passive: true },
  );
}

/**
 * Bilder weiter unten schon laden, sobald die Seite steht (statt erst beim Hinscrollen):
 * Sonst sieht man beim Scrollen kurz leere Flächen. Nicht im Datensparmodus.
 */
function ladeBilderVor() {
  const sparen = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (sparen) return;
  const los = () => document.querySelectorAll<HTMLImageElement>('main img[loading="lazy"]').forEach((b) => (b.loading = 'eager'));
  const spaeter = () => ('requestIdleCallback' in window ? requestIdleCallback(los, { timeout: 3000 }) : setTimeout(los, 1500));
  if (document.readyState === 'complete') spaeter();
  else addEventListener('load', spaeter, { once: true });
}
