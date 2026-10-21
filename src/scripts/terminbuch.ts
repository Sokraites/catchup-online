/**
 * Terminbuch: Kalender, Federkreis um den heutigen Tag, Siegel am gewählten Tag, Brief beim Absenden.
 * Grundsatz: Animationen laufen nebenher. Alles ist sofort bedienbar, niemand wartet auf eine Animation.
 */

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

type Regeln = { wochentage: number[]; vorlaufTage: number; monateVoraus: number };

let bereit = false;
let dialog: HTMLDialogElement;
let regeln: Regeln;
let monat: Date; // erster Tag des angezeigten Monats
let gewaehlt: Date | null = null;
const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const heute = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const gleich = (a: Date, b: Date) => a.getTime() === b.getTime();
const langesDatum = (d: Date) => `${TAGE[d.getDay()]}, ${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`;

function frei(d: Date) {
  const frueh = heute();
  frueh.setDate(frueh.getDate() + regeln.vorlaufTage);
  const spaet = heute();
  spaet.setMonth(spaet.getMonth() + regeln.monateVoraus);
  const wochentag = d.getDay() === 0 ? 7 : d.getDay();
  return d >= frueh && d <= spaet && regeln.wochentage.includes(wochentag);
}

function einrichten() {
  dialog = document.querySelector<HTMLDialogElement>('[data-terminbuch]')!;
  regeln = JSON.parse(dialog.dataset.regeln!);
  monat = heute();
  monat.setDate(1);

  dialog.querySelector('[data-tb-schliessen]')!.addEventListener('click', () => dialog.close());
  // Klick neben das Buch schließt
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => dialog.classList.remove('tb-offen', 'tb-versiegelt'));
  dialog.querySelector('[data-tb-zurueck]')!.addEventListener('click', () => blaettere(-1));
  dialog.querySelector('[data-tb-weiter]')!.addEventListener('click', () => blaettere(1));
  dialog.querySelector('[data-tb-formular]')!.addEventListener('submit', absenden);
  bereit = true;
}

export function oeffneTerminbuch() {
  if (!bereit) einrichten();
  dialog.querySelector<HTMLElement>('[data-tb-danke]')!.hidden = true;
  dialog.querySelector<HTMLElement>('[data-tb-formular]')!.hidden = false;
  monat = heute();
  monat.setDate(1);
  zeichneMonat();
  dialog.showModal();
  // Nächstes Bild: Animationen starten (Deckel klappt auf, Seite blättert, Feder kreist)
  requestAnimationFrame(() => {
    dialog.classList.add('tb-offen');
    kreiseHeute(ruhig() ? 0 : 650);
  });
}

function blaettere(richtung: number) {
  const ziel = new Date(monat);
  ziel.setMonth(ziel.getMonth() + richtung);
  const grenzeVorn = heute();
  grenzeVorn.setDate(1);
  const grenzeHinten = new Date(grenzeVorn);
  grenzeHinten.setMonth(grenzeHinten.getMonth() + regeln.monateVoraus);
  if (ziel < grenzeVorn || ziel > grenzeHinten) return;
  monat = ziel;
  // Ein Blatt dreht sich über die Seite, darunter steht schon der neue Monat.
  const blatt = dialog.querySelector<HTMLElement>('.tb-blatt')!;
  blatt.classList.remove('tb-blatt-vor', 'tb-blatt-zurueck');
  void blatt.offsetWidth;
  if (!ruhig()) blatt.classList.add(richtung > 0 ? 'tb-blatt-vor' : 'tb-blatt-zurueck');
  zeichneMonat();
  kreiseHeute(ruhig() ? 0 : 350);
}

function zeichneMonat() {
  dialog.querySelector('[data-tb-monat]')!.textContent = `${MONATE[monat.getMonth()]} ${monat.getFullYear()}`;
  const tage = dialog.querySelector<HTMLElement>('[data-tb-tage]')!;
  tage.replaceChildren();
  const versatz = (monat.getDay() + 6) % 7; // Montag = 0
  for (let i = 0; i < versatz; i++) tage.append(document.createElement('span'));
  const letzter = new Date(monat.getFullYear(), monat.getMonth() + 1, 0).getDate();
  for (let t = 1; t <= letzter; t++) {
    const d = new Date(monat.getFullYear(), monat.getMonth(), t);
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'tb-tag';
    knopf.textContent = String(t);
    const istHeute = gleich(d, heute());
    const istFrei = frei(d);
    knopf.disabled = !istFrei;
    knopf.setAttribute('aria-label', `${langesDatum(d)}${istHeute ? ', heute' : ''}${istFrei ? '' : ', nicht verfügbar'}`);
    if (istHeute) knopf.classList.add('tb-heute');
    if (gewaehlt && gleich(d, gewaehlt)) {
      knopf.setAttribute('aria-pressed', 'true');
      knopf.append(siegel(false));
    }
    knopf.addEventListener('click', () => waehle(d, knopf));
    tage.append(knopf);
  }
}

/** Rote Tinte: Kreis um den heutigen Tag, die Feder fährt mit. */
function kreiseHeute(verzoegerung: number) {
  const zelle = dialog.querySelector<HTMLElement>('.tb-heute');
  if (!zelle) return;
  zelle.querySelector('.tb-kreis')?.remove();
  const b = zelle.clientWidth;
  const h = zelle.clientHeight;
  // Von Hand gezogener Kreis: etwas schief, Ende überlappt den Anfang
  const rx = b * 0.5;
  const ry = h * 0.46;
  const cx = b / 2;
  const cy = h / 2;
  const punkte: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const w = -Math.PI * 0.6 + (i / 40) * Math.PI * 2.15;
    const wackeln = 1 + Math.sin(i * 1.7) * 0.03 + i * 0.002;
    punkte.push(`${(cx + Math.cos(w) * rx * wackeln).toFixed(1)} ${(cy + Math.sin(w) * ry * wackeln).toFixed(1)}`);
  }
  const pfad = `M ${punkte.join(' L ')}`;
  const svgNs = 'http://www.w3.org/2000/svg';
  const huelle = document.createElement('span');
  huelle.className = 'tb-kreis';
  huelle.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('viewBox', `0 0 ${b} ${h}`);
  const linie = document.createElementNS(svgNs, 'path');
  linie.setAttribute('d', pfad);
  svg.append(linie);
  huelle.append(svg);
  const feder = document.createElement('span');
  feder.className = 'tb-feder';
  feder.style.offsetPath = `path('${pfad}')`;
  feder.innerHTML =
    '<svg viewBox="0 0 40 40" width="34" height="34"><path d="M37 3C24 5 12 14 7 27l-3 9 4-3c3-6 7-10 12-13-4 4-7 8-9 13 12-4 22-15 26-30z" fill="#f6efe0" stroke="#5a4636" stroke-width="1.2"/><path d="M4 36 20 20" stroke="#5a4636" stroke-width="1.2"/></svg>';
  huelle.append(feder);
  zelle.append(huelle);
  const laenge = linie.getTotalLength();
  linie.style.strokeDasharray = `${laenge}`;
  linie.style.strokeDashoffset = ruhig() ? '0' : `${laenge}`;
  if (ruhig()) {
    feder.remove();
    return;
  }
  const dauer = 900;
  linie.animate([{ strokeDashoffset: laenge }, { strokeDashoffset: 0 }], { duration: dauer, delay: verzoegerung, easing: 'ease-in-out', fill: 'forwards' });
  feder.animate(
    [
      { offsetDistance: '0%', opacity: 0 },
      { offsetDistance: '3%', opacity: 1 },
      { offsetDistance: '97%', opacity: 1 },
      { offsetDistance: '100%', opacity: 0 },
    ],
    { duration: dauer, delay: verzoegerung, easing: 'ease-in-out', fill: 'both' },
  );
}

function siegel(animiert: boolean) {
  const s = document.createElement('span');
  s.className = 'tb-tagsiegel';
  s.setAttribute('aria-hidden', 'true');
  s.innerHTML = document.querySelector('.tb-siegel')!.innerHTML;
  if (animiert && !ruhig()) {
    s.animate(
      [
        { transform: 'scale(2.2) rotate(-25deg)', opacity: 0 },
        { transform: 'scale(0.9) rotate(-8deg)', opacity: 1, offset: 0.6 },
        { transform: 'scale(1) rotate(-10deg)', opacity: 1 },
      ],
      { duration: 380, easing: 'cubic-bezier(.3,1.4,.6,1)' },
    );
  }
  return s;
}

function waehle(d: Date, knopf: HTMLButtonElement) {
  gewaehlt = d;
  dialog.querySelectorAll('.tb-tag[aria-pressed]').forEach((k) => {
    k.removeAttribute('aria-pressed');
    k.querySelector('.tb-tagsiegel')?.remove();
  });
  knopf.setAttribute('aria-pressed', 'true');
  knopf.append(siegel(true));
  dialog.querySelector('[data-tb-gewaehlt]')!.textContent = `Gewählt: ${langesDatum(d)}`;
  dialog.querySelector('[data-tb-fehler]')!.textContent = '';
  // Auf dem Handy liegt das Formular unter dem Kalender: dorthin weiterführen.
  if (innerWidth < 760) dialog.querySelector('.tb-rechts')!.scrollIntoView({ behavior: ruhig() ? 'auto' : 'smooth', block: 'start' });
}

function absenden(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const fehler = dialog.querySelector('[data-tb-fehler]')!;
  const daten = new FormData(form);
  const name = String(daten.get('name') ?? '').trim();
  const kontakt = String(daten.get('kontakt') ?? '').trim();
  if (!gewaehlt) {
    fehler.textContent = 'Bitte wähle zuerst einen Tag im Kalender.';
    dialog.querySelector<HTMLButtonElement>('.tb-tag:not(:disabled)')?.focus();
    return;
  }
  if (!name || !kontakt) {
    fehler.textContent = 'Bitte gib deinen Namen und eine Telefonnummer oder E-Mail-Adresse an.';
    form.querySelector<HTMLInputElement>(name ? '#tb-kontakt' : '#tb-name')!.focus();
    return;
  }
  const zusammenfassung = `${langesDatum(gewaehlt)}, ${daten.get('zeit')} Uhr, ${daten.get('art')}`;
  const text = [
    `Terminanfrage: ${zusammenfassung}`,
    `Name: ${name}`,
    `Kontakt: ${kontakt}`,
    daten.get('nachricht') ? `Nachricht: ${daten.get('nachricht')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // Brief falten und versiegeln (läuft nebenher)
  dialog.querySelector('[data-tb-brieftext]')!.textContent = text;
  dialog.classList.remove('tb-versiegelt');
  void dialog.offsetWidth;
  if (!ruhig()) dialog.classList.add('tb-versiegelt');

  // Bestätigung sofort zeigen
  form.hidden = true;
  const danke = dialog.querySelector<HTMLElement>('[data-tb-danke]')!;
  danke.hidden = false;
  dialog.querySelector('[data-tb-zusammenfassung]')!.textContent = zusammenfassung;
  const mail = dialog.querySelector<HTMLAnchorElement>('[data-tb-mail]')!;
  mail.href = `mailto:${dialog.dataset.mail}?subject=${encodeURIComponent('Terminanfrage')}&body=${encodeURIComponent(text)}`;
  danke.querySelector('h3')?.setAttribute('tabindex', '-1');
  danke.querySelector<HTMLElement>('h3')?.focus();
}
