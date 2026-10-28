/**
 * Stufe Mittel: Akzentfarbe je Abschnitt, Überschriften Wort für Wort, Schimmer auf der Kategorie-Zeile, Scroll-Hinweis.
 * Ersatz für die Monitor-Dramaturgie der Stufe Schwer. Farben und Übergänge: src/styles/farbwelten.css.
 *
 * - Der Inhalt bleibt echter Text. Ohne JavaScript bleibt die Grundfarbe stehen, alles ist sofort sichtbar.
 * - Bei „Bewegung reduzieren“ wechseln die Farben ohne Übergang; nichts blendet ein, nichts schimmert.
 * - Gespeichert wird nur, ob der Scroll-Hinweis in dieser Sitzung schon zu sehen war (sessionStorage, endet mit dem Tab).
 */
import { abschnittsWelten, farbeDerWelt, type Welt } from '../config/farbwelten';
import { ruhig } from './stufe';

const HINWEIS_GEZEIGT = 'scroll-hinweis-gezeigt';

let gestartet = false;

export function starteMittel() {
  // Text-Hüllen (Wörter, Verlauf, Streifen, Spotlight): auch nach einem Wechsel Leicht → Mittel wieder anlegen
  baueTextHuellen();
  if (gestartet) return;
  gestartet = true;
  starteFarbwelten();
  starteTippen();
  ladeBilderVor();
  if (ruhig()) return;
  starteSchimmer();
  starteScrollHinweis();
}

let huellen = false;

/**
 * Lesbarkeit gilt immer, auch bei „Bewegung reduzieren“: Überschriften in Wörter teilen (eingeblendet wird nur mit
 * Bewegung), Verlauf im Titel, dann die Streifen hinter den Textblöcken; dazu das Spotlight.
 */
function baueTextHuellen() {
  if (huellen) return;
  huellen = true;
  starteWortweise();
  verlaufImTitel();
  dimmeHinterText();
  starteSpotlight();
}

/**
 * Wechsel Mittel → Leicht ohne Neuladen: alle Hüllen wieder entfernen, damit der Text genau wie vorher aufgebaut ist
 * (sonst könnte sich ein Zeilenumbruch minimal verschieben).
 */
export function entferneTextHuellen() {
  if (!huellen) return;
  huellen = false;
  document.querySelectorAll('.zeile-text').forEach((t) => {
    const echt = t.querySelector(':scope > .zeile');
    t.replaceWith(...(echt ? echt.childNodes : []));
  });
  document.querySelectorAll<HTMLElement>('main h1 .verlauf').forEach((v) => v.replaceWith(v.textContent ?? ''));
  document.querySelectorAll<HTMLElement>('main h2.wortweise').forEach((h) => {
    h.textContent = h.getAttribute('aria-label');
    h.removeAttribute('aria-label');
    h.classList.remove('wortweise', 'wortweise-an');
  });
  document.querySelectorAll('.spot-rahmen').forEach((r) => r.remove());
  document.querySelectorAll('main h1, main h2').forEach((h) => h.normalize());
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
  html.dataset.farbe ||= farbeDerWelt[seitenWelt];
  // nur äußere Abschnitte (verschachtelte gehören zu ihrem Abschnitt)
  const abschnitte = [...main.querySelectorAll<HTMLElement>('section')].filter((s) => !s.parentElement?.closest('section'));
  const weltVon = (s: HTMLElement): Welt => ((abschnittsWelten as string[]).includes(s.id) ? (s.id as Welt) : seitenWelt);
  // Lichtband am Übergang: oben die Farbe des Abschnitts davor, unten die eigene (farbwelten.css)
  abschnitte.forEach((s, i) => {
    s.dataset.farbe = farbeDerWelt[weltVon(s)];
    s.dataset.vorher = farbeDerWelt[i ? weltVon(abschnitte[i - 1]) : seitenWelt];
  });

  const beobachter = new IntersectionObserver(
    (meldungen) => {
      for (const m of meldungen) {
        if (!m.isIntersecting) continue;
        const welt = weltVon(m.target as HTMLElement);
        html.dataset.welt = welt;
        html.dataset.farbe = farbeDerWelt[welt];
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
    // das letzte Wort im Verlauf Weiß → Akzentfarbe (farbwelten.css)
    h.lastElementChild?.classList.add('verlauf');
    h.classList.add('wortweise');
    if (ruhig()) h.classList.add('wortweise-an');
    else beobachter.observe(h);
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

/**
 * Lesbarkeit über dem kräftigen Hintergrund: Hinter jeder Textzeile liegt ein weich auslaufender Streifen in der
 * Grundfarbe (farbwelten.css). Gedimmt wird nur genau hinter Text, in den Lücken leuchtet der Hintergrund voll.
 *
 * Die Streifen liegen auf einer Kopie des Textes („Decke“), die genau deckungsgleich unter dem echten Text liegt:
 * gleiche Breite, gleiche Schrift, also gleiche Zeilenumbrüche. So kann der Streifen einer Zeile nie über der Schrift
 * einer anderen liegen. Die Kopie ist unsichtbar, für Hilfstechnik ausgeblendet und nicht bedienbar (inert);
 * im HTML der Seite steht der Text weiterhin genau einmal.
 * Große helle Überschriften (h1, h3) brauchen das nicht (große Schrift: 3:1 genügt).
 * Nur Blöcke, die ausschließlich Zeilen-Inhalt haben (Text, Links, Hervorhebungen); Blöcke mit Absätzen,
 * Listen oder Bildern darin werden übersprungen, ihre inneren Textblöcke bekommen den Streifen einzeln.
 */
const TEXTBLOECKE =
  'main :is(h2, p, li, dt, dd, summary, figcaption, blockquote, address, nav.breadcrumb, a:not(.button, .card-link), .card-more, .card-nr), .site-footer :is(p, li, address, a)';
const NICHT_ZEILE = 'p, ul, ol, li, div, section, h1, h2, h3, h4, details, figure, picture, img, video, svg, button, .button, .medium';

function dimmeHinterText() {
  document.querySelectorAll<HTMLElement>(TEXTBLOECKE).forEach((el) => {
    if (!el.textContent?.trim() || el.closest('.zeile-text, .button, .stufe-badge') || el.querySelector(NICHT_ZEILE)) return;
    // Listenpunkt nur mit einem Link darin: den Link selbst einfassen (er kann eine eigene, höhere Box haben)
    const eigenerText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim());
    if (el.matches('li') && !eigenerText) return;

    // echter Text in einen Block, der die Zeilenbreite vorgibt; darunter die Decke mit derselben Breite
    // Beide Fassungen haben genau denselben Aufbau (Block > Zeilen-Hülle > Inhalt), damit sie gleich umbrechen
    const echt = document.createElement('span');
    echt.className = 'zeile';
    echt.append(...el.childNodes);
    const kopie = echt.cloneNode(true) as HTMLElement;
    kopie.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
    const decke = document.createElement('span');
    decke.className = 'zeilen-decke';
    decke.setAttribute('aria-hidden', 'true');
    decke.inert = true;
    decke.append(kopie);
    const text = document.createElement('span');
    text.className = 'zeile-text';
    text.append(decke, echt);
    el.append(text);
  });
}

/** Hauptüberschrift (h1): das letzte Wort im Verlauf Weiß → Akzentfarbe, z. B. „aufholen.“ (farbwelten.css) */
function verlaufImTitel() {
  const h1 = document.querySelector<HTMLElement>('main h1');
  const letzter = h1?.lastChild;
  if (!h1 || h1.children.length || letzter?.nodeType !== Node.TEXT_NODE) return;
  const text = letzter.textContent!.replace(/\s+$/, '');
  const ab = text.lastIndexOf(' ') + 1;
  if (ab <= 0) return;
  const wort = document.createElement('span');
  wort.className = 'verlauf';
  wort.textContent = text.slice(ab);
  letzter.textContent = text.slice(0, ab);
  h1.append(wort);
}

/**
 * Spotlight in Einstieg und Kontakt: ein weicher Lichtschein (600 px) in der Akzentfarbe hinter dem Inhalt.
 * Am Computer folgt er der Maus (nur transform, höchstens ein Bild pro Bildschirm-Auffrischung, gleitet weich nach)
 * und kehrt beim Verlassen in die Mitte oben zurück. Am Handy und bei „Bewegung reduzieren“ steht er mittig oben.
 */
function starteSpotlight() {
  const maus = matchMedia('(hover: hover) and (pointer: fine)').matches && !ruhig();
  document.querySelectorAll<HTMLElement>('main :is(.hero, #kontakt)').forEach((abschnitt) => {
    const rahmen = document.createElement('div');
    rahmen.className = 'spot-rahmen';
    rahmen.setAttribute('aria-hidden', 'true');
    const spot = document.createElement('div');
    spot.className = 'spot';
    rahmen.append(spot);
    abschnitt.prepend(rahmen);

    const ruhe = () => {
      const r = abschnitt.getBoundingClientRect();
      return [r.width / 2, Math.min(220, r.height * 0.25)];
    };
    let [x, y] = ruhe();
    let [zx, zy] = [x, y];
    let drin = false;
    let laeuft = false;
    const setze = () => (spot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`);
    setze();
    addEventListener('resize', () => {
      if (drin) return;
      [zx, zy] = ruhe();
      [x, y] = [zx, zy];
      setze();
    });
    if (!maus) return;

    const bild = () => {
      x += (zx - x) * 0.14;
      y += (zy - y) * 0.14;
      setze();
      if (Math.abs(zx - x) + Math.abs(zy - y) > 0.5) requestAnimationFrame(bild);
      else laeuft = false;
    };
    const los = () => {
      if (laeuft) return;
      laeuft = true;
      requestAnimationFrame(bild);
    };
    abschnitt.addEventListener(
      'pointermove',
      (e) => {
        const r = abschnitt.getBoundingClientRect();
        drin = true;
        zx = e.clientX - r.left;
        zy = e.clientY - r.top;
        los();
      },
      { passive: true },
    );
    abschnitt.addEventListener('pointerleave', () => {
      drin = false;
      [zx, zy] = ruhe();
      los();
    });
  });
}
