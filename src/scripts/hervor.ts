/**
 * Hauptpunkte sanft einblenden (Stufen Mittel und Schwer, ohne „Bewegung reduzieren“).
 * Ohne JavaScript oder in der Stufe Leicht ist alles sofort sichtbar. Jeder Punkt blendet nur einmal ein.
 *
 * Stufe Mittel: zusätzlich Kategorie-Zeilen und Absätze; es geht schon los, kurz bevor ein Punkt ins Bild kommt
 * (niemand wartet auf leere Flächen), und was gemeinsam erscheint, folgt im Abstand von 80 ms aufeinander
 * (höchstens 4 Schritte, damit nach einem Sprung nichts lange fehlt).
 */
import { ruhig, stufe } from './stufe';

const ZIELE = '.card, .benefits > li, .steps > li, .idee-chips li';
const ZIELE_MITTEL = `${ZIELE}, .section .eyebrow, .section .wrap > p, .faq > details`;
const ABSTAND_MS = 80;
/** Höchstens so viele Schritte Verzögerung: Auch wenn viel gleichzeitig ins Bild kommt, steht nach gut 0,8 s alles */
const HOECHSTENS = 4;

let gestartet = false;

export function starteHervor() {
  if (gestartet || ruhig()) return;
  gestartet = true;
  const mittel = stufe() === 'mittel';
  const elemente = [...document.querySelectorAll<HTMLElement>(mittel ? ZIELE_MITTEL : ZIELE)];
  if (!elemente.length) return;

  const beobachter = new IntersectionObserver(
    (meldungen) => {
      let n = 0;
      for (const m of meldungen) {
        if (!m.isIntersecting) continue;
        const el = m.target as HTMLElement;
        beobachter.unobserve(el);
        const schritt = Math.min(n, HOECHSTENS);
        if (mittel && schritt) {
          // nacheinander statt alle auf einmal; danach die Verzögerung wieder entfernen (sonst bremst sie das Anheben)
          el.style.transitionDelay = `${schritt * ABSTAND_MS}ms`;
          setTimeout(() => (el.style.transitionDelay = ''), schritt * ABSTAND_MS + 700);
        }
        if (mittel) n++;
        el.classList.add('hervor-an');
      }
    },
    mittel ? { rootMargin: '0px 0px 15% 0px' } : { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );
  for (const el of elemente) {
    el.classList.add('hervor');
    beobachter.observe(el);
  }
}
