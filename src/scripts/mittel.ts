/**
 * Stufe Mittel: Farbwelten je Abschnitt, Überschriften Wort für Wort, Schimmer auf der Kategorie-Zeile, Scroll-Hinweis.
 * Ersatz für die Monitor-Dramaturgie der Stufe Schwer. Farben und Übergänge: src/styles/farbwelten.css.
 *
 * - Der Inhalt bleibt echter Text. Ohne JavaScript bleibt die Grundfarbe stehen, alles ist sofort sichtbar.
 * - Bei „Bewegung reduzieren“ wechseln die Farben ohne Übergang; nichts blendet ein, nichts schimmert.
 * - Gespeichert wird nur, ob der Scroll-Hinweis in dieser Sitzung schon zu sehen war (sessionStorage, endet mit dem Tab).
 */
import { abschnittsWelten, type Welt } from '../config/farbwelten';
import { ruhig } from './stufe';

const HINWEIS_GEZEIGT = 'scroll-hinweis-gezeigt';

export function starteMittel() {
  starteFarbwelten();
  if (ruhig()) return;
  void starteWortweise();
  starteSchimmer();
  starteScrollHinweis();
}

/** Der Abschnitt, der gerade die Bildschirmmitte kreuzt, bestimmt die Farbe von Hintergrund-Ebene und Lichtstrahl. */
function starteFarbwelten() {
  const ebene = document.querySelector<HTMLElement>('.farbwelt');
  const strahl = document.querySelector<HTMLElement>('.lichtstrahl');
  const main = document.querySelector<HTMLElement>('main');
  if (!ebene || !main) return;
  const seitenWelt = (main.dataset.welt as Welt) || 'hero';
  // nur äußere Abschnitte (verschachtelte gehören zu ihrem Abschnitt)
  const abschnitte = [...main.querySelectorAll<HTMLElement>('section')].filter((s) => !s.parentElement?.closest('section'));
  const weltVon = (s: HTMLElement): Welt => ((abschnittsWelten as string[]).includes(s.id) ? (s.id as Welt) : seitenWelt);

  const beobachter = new IntersectionObserver(
    (meldungen) => {
      for (const m of meldungen) {
        if (!m.isIntersecting) continue;
        const welt = weltVon(m.target as HTMLElement);
        ebene.dataset.welt = welt;
        if (strahl) strahl.dataset.welt = welt;
      }
    },
    // schmales Band in der Bildschirmmitte
    { rootMargin: '-45% 0px -50% 0px' },
  );
  abschnitte.forEach((s) => beobachter.observe(s));
}

/**
 * Überschriften (h2) blenden Wort für Wort ein (GSAP ScrollTrigger: 60 ms Abstand, 0,5 s, 12 px).
 * „power1.out“ ist dieselbe Kurve wie cubic-bezier(0.25, 0.46, 0.45, 0.94) der übrigen Übergänge.
 * Vorgelesen wird weiter der ganze Satz (aria-label), die Wort-Teile sind für Hilfstechnik ausgeblendet.
 */
async function starteWortweise() {
  const ueberschriften = [...document.querySelectorAll<HTMLElement>('main h2')].filter(
    (h) => h.textContent?.trim() && [...h.childNodes].every((n) => n.nodeType === Node.TEXT_NODE),
  );
  if (!ueberschriften.length) return;

  for (const h of ueberschriften) {
    const text = h.textContent!.trim().replace(/\s+/g, ' ');
    h.setAttribute('aria-label', text);
    h.textContent = '';
    text.split(' ').forEach((wort, i) => {
      if (i) h.append(' ');
      const s = document.createElement('span');
      s.className = 'wort';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = wort;
      h.append(s);
    });
    h.classList.add('wortweise');
  }

  try {
    // Auf der Startseite ist GSAP schon geladen (Monitor-Code), sonst wird es hier nachgeladen
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
    gsap.registerPlugin(ScrollTrigger);
    for (const h of ueberschriften) {
      gsap.fromTo(
        h.querySelectorAll('.wort'),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power1.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } },
      );
    }
  } catch {
    // GSAP nicht ladbar: Überschriften sofort zeigen
    ueberschriften.forEach((h) => h.classList.remove('wortweise'));
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
