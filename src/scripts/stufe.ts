/**
 * Darstellungs-Stufe (leicht, mittel, schwer).
 *
 * Gesetzt wird sie schon im <head> (Base.astro), bevor die Seite gezeichnet wird: <html data-stufe="…">.
 * Hier: Abfragen für die anderen Skripte und die Bedienung (Hinweis beim ersten Besuch, Schalter oben rechts).
 * Eine Änderung lädt die Seite neu, damit jede Stufe sauber von vorn startet.
 */
import { stufen, stufenSchluessel, type StufeId } from '../config/stufen';

const html = document.documentElement;
const reduziert = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const stufe = (): StufeId => (html.dataset.stufe as StufeId) || 'mittel';
/** Ruhige Darstellung: keine Bewegung (Stufe leicht oder „Bewegung reduzieren“ im System). */
export const ruhig = () => stufe() === 'leicht' || reduziert();

function merke(id: StufeId) {
  try {
    localStorage.setItem(stufenSchluessel, id);
    return true;
  } catch {
    return false;
  }
}

function waehle(id: StufeId) {
  // Speicher gesperrt (z. B. privates Fenster, eingebettete Vorschau): Wahl nur für diesen Tab merken.
  // window.name übersteht das Neuladen, ohne die Adresse zu ändern.
  if (!merke(id)) window.name = `${stufenSchluessel}:${id}`;
  if (id === stufe()) {
    delete html.dataset.stufeOffen;
    zeigeStand();
    return;
  }
  location.reload();
}

function zeigeStand() {
  const id = stufe();
  const nr = stufen.findIndex((s) => s.id === id) + 1;
  document.querySelectorAll<HTMLElement>('[data-stufe-name]').forEach((el) => (el.textContent = stufen[nr - 1]?.titel ?? ''));
  document.querySelectorAll<HTMLElement>('[data-stufe-knopf] .stufen-balken').forEach((el) => (el.dataset.grad = String(nr)));
  document.querySelectorAll<HTMLElement>('[data-stufe-waehlen]').forEach((k) => {
    const aktiv = k.dataset.stufeWaehlen === id;
    if (k.closest('[data-stufe-menue]')) k.setAttribute('aria-pressed', String(aktiv));
    k.classList.toggle('ist-aktiv', aktiv);
  });
  const banner = document.querySelector<HTMLElement>('[data-stufen-banner]');
  if (banner) banner.hidden = !('stufeOffen' in html.dataset);
}

export function starteStufenWahl() {
  const schalter = document.querySelector<HTMLElement>('[data-stufe-schalter]');
  const knopf = document.querySelector<HTMLButtonElement>('[data-stufe-knopf]');
  const menue = document.querySelector<HTMLElement>('[data-stufe-menue]');
  if (schalter) schalter.hidden = false;

  const menueZu = (fokus = false) => {
    if (!menue || menue.hidden) return;
    menue.hidden = true;
    knopf?.setAttribute('aria-expanded', 'false');
    if (fokus) knopf?.focus();
  };
  knopf?.addEventListener('click', () => {
    const auf = menue!.hidden;
    menue!.hidden = !auf;
    knopf.setAttribute('aria-expanded', String(auf));
    if (auf) {
      // Nie über den Bildschirmrand hinaus (z. B. wenn die Kopfleiste bei großer Schrift umbricht)
      menue!.style.right = '';
      const links = menue!.getBoundingClientRect().left;
      if (links < 8) menue!.style.right = `${links - 8}px`;
      menue!.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (schalter && !schalter.contains(e.target as Node)) menueZu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') menueZu(true);
  });

  document.querySelectorAll<HTMLElement>('[data-stufe-waehlen]').forEach((k) =>
    k.addEventListener('click', () => waehle(k.dataset.stufeWaehlen as StufeId)),
  );
  // Schließen ohne Wahl: Darstellung bleibt, der Hinweis kommt nicht wieder
  document.querySelector('[data-stufen-zu]')?.addEventListener('click', () => waehle(stufe()));

  zeigeStand();
}
