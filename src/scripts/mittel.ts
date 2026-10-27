/**
 * Stufe Mittel: Farbwelten je Abschnitt, Überschriften Wort für Wort, Scroll-Hinweis.
 * Ersatz für die Monitor-Dramaturgie der Stufe Schwer. Farben und Übergänge: src/styles/farbwelten.css.
 *
 * - Der Inhalt bleibt echter Text. Ohne JavaScript bleibt die Grundfarbe stehen, alles ist sofort sichtbar.
 * - Bei „Bewegung reduzieren“ wechseln die Farben ohne Übergang; Überschriften und Hinweis bleiben ruhig.
 * - Nichts wird auf dem Gerät gespeichert.
 */
import { abschnittsWelten, type Welt } from '../config/farbwelten';
import { ruhig } from './stufe';

export function starteMittel() {
  starteFarbwelten();
  if (ruhig()) return;
  starteWortweise();
  starteScrollHinweis();
}

/** Der Abschnitt, der gerade die Bildschirmmitte kreuzt, bestimmt die Farbe der Hintergrund-Ebene. */
function starteFarbwelten() {
  const ebene = document.querySelector<HTMLElement>('.farbwelt');
  const main = document.querySelector<HTMLElement>('main');
  if (!ebene || !main) return;
  const seitenWelt = (main.dataset.welt as Welt) || 'hero';
  // nur äußere Abschnitte (verschachtelte gehören zu ihrem Abschnitt)
  const abschnitte = [...main.querySelectorAll<HTMLElement>('section')].filter((s) => !s.parentElement?.closest('section'));
  const weltVon = (s: HTMLElement): Welt => ((abschnittsWelten as string[]).includes(s.id) ? (s.id as Welt) : seitenWelt);

  const beobachter = new IntersectionObserver(
    (meldungen) => {
      for (const m of meldungen) if (m.isIntersecting) ebene.dataset.welt = weltVon(m.target as HTMLElement);
    },
    // schmales Band in der Bildschirmmitte
    { rootMargin: '-45% 0px -50% 0px' },
  );
  abschnitte.forEach((s) => beobachter.observe(s));
}

/** Überschriften (h2) blenden Wort für Wort ein. Vorgelesen wird weiter der ganze Satz. */
function starteWortweise() {
  const ueberschriften = [...document.querySelectorAll<HTMLElement>('main h2')].filter(
    (h) => h.textContent?.trim() && [...h.childNodes].every((n) => n.nodeType === Node.TEXT_NODE),
  );
  if (!ueberschriften.length) return;

  const beobachter = new IntersectionObserver(
    (meldungen) => {
      for (const m of meldungen) {
        if (!m.isIntersecting) continue;
        m.target.classList.add('worte-an');
        beobachter.unobserve(m.target);
      }
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
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
      s.style.setProperty('--i', String(i));
      s.textContent = wort;
      h.append(s);
    });
    h.classList.add('wortweise');
    beobachter.observe(h);
  }
}

/** Dezenter Pfeil am unteren Rand der ersten Ansicht (nur Startseite, nur ganz oben). */
function starteScrollHinweis() {
  if (!document.getElementById('leistungen') || !document.querySelector('main .hero') || scrollY > 40) return;
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
