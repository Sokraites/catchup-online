/**
 * Hauptpunkte sanft einblenden (Stufen Mittel und Schwer, ohne „Bewegung reduzieren“).
 * Ohne JavaScript oder in der Stufe Leicht ist alles sofort sichtbar. Jeder Punkt blendet nur einmal ein.
 */
import { ruhig } from './stufe';

const ZIELE = '.card, .benefits > li, .steps > li, .idee-chips li';

export function starteHervor() {
  if (ruhig()) return;
  const elemente = [...document.querySelectorAll<HTMLElement>(ZIELE)];
  if (!elemente.length) return;

  const beobachter = new IntersectionObserver(
    (meldungen) => {
      for (const m of meldungen) {
        if (!m.isIntersecting) continue;
        m.target.classList.add('hervor-an');
        beobachter.unobserve(m.target);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );
  for (const el of elemente) {
    el.classList.add('hervor');
    beobachter.observe(el);
  }
}
