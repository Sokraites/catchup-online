/**
 * Terminbuch: Kalender, Federkreis um den heutigen Tag, Siegel am gewählten Tag, Brief beim Absenden.
 *
 * Umblättern wie in einem echten Buch:
 * - Desktop (Doppelseite): rechte Seite greifen und nach links ziehen → nächster Monat
 *   (die Rückseite des Blatts zeigt ihn schon, sobald das Blatt über die Mitte kommt);
 *   linke Seite nach rechts ziehen → Vormonat (liegt sofort darunter).
 * - Handy (eine Seite): Kalenderseite nach links ziehen → nächster Monat, nach rechts → Vormonat.
 * - Pfeile blättern mit derselben Bewegung automatisch.
 *
 * Grundsatz: Animationen laufen nebenher. Alles ist sofort bedienbar, niemand wartet auf eine Animation.
 */

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

type Regeln = { wochentage: number[]; vorlaufTage: number; monateVoraus: number };

let bereit = false;
let dialog: HTMLDialogElement;
let buch: HTMLElement;
let links: HTMLElement;
let rechts: HTMLElement;
let regeln: Regeln;
let monat: Date; // erster Tag des angezeigten Monats
let gewaehlt: Date | null = null;
const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const einseitig = () => innerWidth < 760;

const heute = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const gleich = (a: Date, b: Date) => a.getTime() === b.getTime();
const langesDatum = (d: Date) => `${TAGE[d.getDay()]}, ${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`;
const plusMonate = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

function frei(d: Date) {
  const frueh = heute();
  frueh.setDate(frueh.getDate() + regeln.vorlaufTage);
  const spaet = heute();
  spaet.setMonth(spaet.getMonth() + regeln.monateVoraus);
  const wochentag = d.getDay() === 0 ? 7 : d.getDay();
  return d >= frueh && d <= spaet && regeln.wochentage.includes(wochentag);
}

/** Darf zu diesem Monat geblättert werden? */
function erlaubt(m: Date) {
  const erster = heute();
  erster.setDate(1);
  return m >= erster && m <= plusMonate(erster, regeln.monateVoraus);
}

function einrichten() {
  dialog = document.querySelector<HTMLDialogElement>('[data-terminbuch]')!;
  buch = dialog.querySelector('.tb-buch')!;
  links = dialog.querySelector('.tb-links')!;
  rechts = dialog.querySelector('.tb-rechts')!;
  regeln = JSON.parse(dialog.dataset.regeln!);
  monat = plusMonate(heute(), 0);

  dialog.querySelector('[data-tb-schliessen]')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => dialog.classList.remove('tb-offen', 'tb-versiegelt'));
  dialog.querySelector('[data-tb-zurueck]')!.addEventListener('click', () => blaettereAutomatisch(-1));
  dialog.querySelector('[data-tb-weiter]')!.addEventListener('click', () => blaettereAutomatisch(1));
  dialog.querySelector('[data-tb-formular]')!.addEventListener('submit', absenden);
  richteZiehenEin();
  bereit = true;
}

export function oeffneTerminbuch() {
  if (!bereit) einrichten();
  dialog.querySelector<HTMLElement>('[data-tb-danke]')!.hidden = true;
  zeigeFormular(Boolean(gewaehlt), false);
  monat = plusMonate(heute(), 0);
  zeichneMonat();
  dialog.showModal();
  // Nächstes Bild: Deckel klappt auf, Blatt blättert, Feder kreist
  requestAnimationFrame(() => {
    dialog.classList.add('tb-offen');
    kreiseHeute(ruhig() ? 0 : 650);
  });
}

/* ---------- Kalender ---------- */

/** Baut das Monatsraster. Interaktiv = Tage als Knöpfe; sonst stille Kopie fürs Umblätter-Blatt. */
function baueRaster(ziel: HTMLElement, m: Date, interaktiv: boolean) {
  ziel.replaceChildren();
  const versatz = (m.getDay() + 6) % 7; // Montag = 0
  for (let i = 0; i < versatz; i++) ziel.append(document.createElement('span'));
  const letzter = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  for (let t = 1; t <= letzter; t++) {
    const d = new Date(m.getFullYear(), m.getMonth(), t);
    const istHeute = gleich(d, heute());
    const istFrei = frei(d);
    const tag = document.createElement(interaktiv ? 'button' : 'span');
    tag.className = 'tb-tag';
    tag.textContent = String(t);
    if (istHeute) tag.classList.add('tb-heute');
    if (!istFrei) tag.classList.add('tb-belegt');
    if (interaktiv) {
      const k = tag as HTMLButtonElement;
      k.type = 'button';
      k.disabled = !istFrei;
      k.setAttribute('aria-label', `${langesDatum(d)}${istHeute ? ', heute' : ''}${istFrei ? '' : ', nicht verfügbar'}`);
      k.addEventListener('click', () => {
        if (gezogen) return; // Klick am Ende einer Ziehbewegung ignorieren
        waehle(d, k);
      });
    }
    if (gewaehlt && gleich(d, gewaehlt)) {
      if (interaktiv) tag.setAttribute('aria-pressed', 'true');
      tag.append(siegel(false));
    }
    ziel.append(tag);
  }
}

function zeichneMonat() {
  dialog.querySelector('[data-tb-monat]')!.textContent = `${MONATE[monat.getMonth()]} ${monat.getFullYear()}`;
  baueRaster(dialog.querySelector<HTMLElement>('[data-tb-tage]')!, monat, true);
  dialog.querySelector<HTMLButtonElement>('[data-tb-zurueck]')!.disabled = !erlaubt(plusMonate(monat, -1));
  dialog.querySelector<HTMLButtonElement>('[data-tb-weiter]')!.disabled = !erlaubt(plusMonate(monat, 1));
}

/** Stille Kopie einer Kalenderseite für das Blatt. */
function kalenderKopie(m: Date) {
  const seite = document.createElement('div');
  seite.className = 'tb-kopie';
  const kopf = document.createElement('div');
  kopf.className = 'tb-monat';
  kopf.innerHTML = `<span></span><h2>${MONATE[m.getMonth()]} ${m.getFullYear()}</h2><span></span>`;
  const woche = document.createElement('div');
  woche.className = 'tb-wochentage';
  woche.innerHTML = KURZ.map((k) => `<span>${k}</span>`).join('');
  const raster = document.createElement('div');
  raster.className = 'tb-tage';
  baueRaster(raster, m, false);
  // Heute bleibt auch auf der Kopie umkreist
  const heuteZelle = raster.querySelector('.tb-heute');
  const kreis = links.querySelector('.tb-kreis svg');
  if (heuteZelle && kreis) {
    const k = document.createElement('span');
    k.className = 'tb-kreis';
    const svg = kreis.cloneNode(true) as SVGElement;
    svg.querySelector('path')!.style.strokeDashoffset = '0';
    k.append(svg);
    heuteZelle.append(k);
  }
  seite.append(kopf, woche, raster);
  return seite;
}

/** Leere rechte Buchseite für das Blatt. */
function leereKopie() {
  const seite = document.createElement('div');
  seite.className = 'tb-kopie tb-kopie-leer';
  return seite;
}

/* ---------- Umblättern ---------- */

type Blaettern = {
  richtung: 1 | -1;
  ziel: Date;
  /** Winkel am Anfang und Ende (Grad). */
  von: number;
  bis: number;
  /** Fortschritt 0…1 */
  p: number;
};

let aktuell: Blaettern | null = null;
let gezogen = false;
const leaf = () => dialog.querySelector<HTMLElement>('.tb-leaf')!;
const schatten = () => dialog.querySelector<HTMLElement>('.tb-leaf-schatten')!;

/** Legt das Blatt bereit: über welche Seite, an welcher Kante es hängt, was vorn und hinten steht. */
function beginne(richtung: 1 | -1): Blaettern | null {
  const ziel = plusMonate(monat, richtung);
  if (!erlaubt(ziel) || aktuell) return null;
  const blatt = leaf();
  const vorn = blatt.querySelector<HTMLElement>('.tb-leaf-vorn')!;
  const hinten = blatt.querySelector<HTMLElement>('.tb-leaf-hinten')!;
  let host: HTMLElement;
  let kante: 'links' | 'rechts';
  let von = 0;
  let bis: number;

  if (!einseitig()) {
    if (richtung > 0) {
      // Rechte Seite hebt sich an der Bindung, Rückseite zeigt den neuen Monat
      host = rechts;
      kante = 'links';
      bis = -180;
      vorn.replaceChildren(leereKopie());
      hinten.replaceChildren(kalenderKopie(ziel));
    } else {
      // Linke Seite hebt sich, darunter liegt sofort der Vormonat
      host = links;
      kante = 'rechts';
      bis = 180;
      vorn.replaceChildren(kalenderKopie(monat));
      hinten.replaceChildren(leereKopie());
      monat = ziel;
      zeichneMonat();
      kreiseHeute(0);
    }
  } else {
    host = links;
    kante = 'links';
    if (richtung > 0) {
      // Kalenderseite blättert nach links weg, darunter der nächste Monat
      vorn.replaceChildren(kalenderKopie(monat));
      hinten.replaceChildren(leereKopie());
      bis = -180;
      monat = ziel;
      zeichneMonat();
      kreiseHeute(0);
    } else {
      // Vormonat kommt von links herein
      vorn.replaceChildren(kalenderKopie(ziel));
      hinten.replaceChildren(leereKopie());
      von = -180;
      bis = 0;
    }
  }
  blatt.style.left = `${host.offsetLeft}px`;
  blatt.style.top = `${host.offsetTop}px`;
  blatt.style.width = `${host.offsetWidth}px`;
  blatt.style.height = `${host.offsetHeight}px`;
  blatt.style.transformOrigin = kante === 'links' ? 'left center' : 'right center';
  blatt.dataset.kante = kante;
  const sch = schatten();
  sch.style.left = blatt.style.left;
  sch.style.top = blatt.style.top;
  sch.style.width = blatt.style.width;
  sch.style.height = blatt.style.height;
  blatt.hidden = false;
  sch.hidden = false;
  aktuell = { richtung, ziel, von, bis, p: 0 };
  setze(0);
  return aktuell;
}

/** Stellt das Blatt auf Fortschritt p (0…1) – mit Licht und Schatten, damit es wie Papier wirkt. */
function setze(p: number) {
  if (!aktuell) return;
  aktuell.p = p;
  const winkel = aktuell.von + (aktuell.bis - aktuell.von) * p;
  const blatt = leaf();
  // Leichte Wölbung: Papier biegt sich in der Mitte der Bewegung etwas
  const biegung = Math.sin((Math.abs(winkel) / 180) * Math.PI);
  blatt.style.transform = `rotateY(${winkel}deg) skewY(${(blatt.dataset.kante === 'links' ? -1 : 1) * biegung * 1.5}deg)`;
  blatt.style.setProperty('--licht', String(biegung));
  schatten().style.opacity = String(biegung * 0.6);
}

function beende(ganz: boolean, dauer = 280) {
  const b = aktuell;
  if (!b) return;
  const start = b.p;
  const ziel = ganz ? 1 : 0;
  const t0 = performance.now();
  const d = ruhig() ? 0 : Math.max(120, dauer * Math.abs(ziel - start));
  const schritt = (jetzt: number) => {
    const t = d ? Math.min(1, (jetzt - t0) / d) : 1;
    const e = 1 - (1 - t) ** 3;
    setze(start + (ziel - start) * e);
    if (t < 1) requestAnimationFrame(schritt);
    else abschliessen(ganz);
  };
  requestAnimationFrame(schritt);
}

function abschliessen(ganz: boolean) {
  const b = aktuell!;
  aktuell = null;
  leaf().hidden = true;
  schatten().hidden = true;
  const vorwaerts = b.richtung > 0;
  const dopp = !einseitig();
  if (ganz) {
    // Monat, der jetzt aufgeschlagen sein soll
    monat = b.ziel;
  } else {
    // Abgebrochen: zurück zum Monat vor dem Ziehen
    monat = plusMonate(b.ziel, -b.richtung);
  }
  // Nur neu zeichnen, wenn der sichtbare Monat nicht schon stimmt
  if ((dopp && vorwaerts) || (!dopp && !vorwaerts) || !ganz) zeichneMonat();
  kreiseHeute(ruhig() || !ganz ? 0 : 60);
}

function blaettereAutomatisch(richtung: 1 | -1) {
  if (ruhig()) {
    const ziel = plusMonate(monat, richtung);
    if (!erlaubt(ziel)) return;
    monat = ziel;
    zeichneMonat();
    kreiseHeute(0);
    return;
  }
  if (beginne(richtung)) beende(true, 520);
}

/** Greifen und Ziehen mit Maus oder Finger. */
function richteZiehenEin() {
  let start: { x: number; y: number; seite: 'links' | 'rechts' } | null = null;
  let breite = 1;

  const greifbar = (el: Element) => !el.closest('input, textarea, select, label, fieldset, a, .tb-blaettern, .tb-danke');

  buch.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || aktuell) return;
    const ziel = e.target as Element;
    const seite = ziel.closest('.tb-rechts') ? 'rechts' : ziel.closest('.tb-links') ? 'links' : null;
    if (!seite || !greifbar(ziel)) return;
    if (!einseitig() && seite === 'rechts' && !dialog.querySelector<HTMLElement>('[data-tb-formular]')!.hidden && !ziel.closest('.tb-ecke')) {
      // Rechts liegt das Formular: dort nur am Eselsohr greifen
      if (!ziel.classList.contains('tb-seite')) return;
    }
    start = { x: e.clientX, y: e.clientY, seite };
    gezogen = false;
    breite = (einseitig() ? links.offsetWidth : buch.offsetWidth) * 0.85;
  });

  addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!aktuell) {
      // Erst ab einer deutlichen waagerechten Bewegung blättern (sonst ist es ein Klick oder Scrollen)
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) {
        if (Math.abs(dy) > 14) start = null;
        return;
      }
      let richtung: 1 | -1;
      if (!einseitig()) {
        if (start.seite === 'rechts' && dx < 0) richtung = 1;
        else if (start.seite === 'links' && dx > 0) richtung = -1;
        else return;
      } else {
        richtung = dx < 0 ? 1 : -1;
      }
      if (!beginne(richtung)) {
        start = null;
        return;
      }
      gezogen = true;
    }
    setze(Math.max(0, Math.min(1, Math.abs(dx) / breite)));
  });

  const loslassen = (e: PointerEvent) => {
    if (!start) return;
    const s = start;
    start = null;
    if (!aktuell) return;
    void e;
    void s;
    // Über ein gutes Drittel gezogen: Seite fällt um. Sonst legt sie sich zurück.
    beende(aktuell.p > 0.35);
    // Der Klick, der auf das Loslassen folgt, soll keinen Tag auswählen
    setTimeout(() => (gezogen = false), 0);
  };
  addEventListener('pointerup', loslassen);
  addEventListener('pointercancel', loslassen);
}

/* ---------- Feder, Siegel, Formular ---------- */

/** Rote Tinte: Kreis um den heutigen Tag, die Feder fährt mit. */
function kreiseHeute(verzoegerung: number) {
  const zelle = links.querySelector<HTMLElement>('.tb-heute');
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
  zelle.append(huelle);
  const laenge = linie.getTotalLength();
  linie.style.strokeDasharray = `${laenge}`;
  if (ruhig() || verzoegerung === 0) {
    linie.style.strokeDashoffset = '0';
    return;
  }
  linie.style.strokeDashoffset = `${laenge}`;
  const feder = document.createElement('span');
  feder.className = 'tb-feder';
  feder.style.offsetPath = `path('${pfad}')`;
  feder.innerHTML =
    '<svg viewBox="0 0 40 40" width="34" height="34"><path d="M37 3C24 5 12 14 7 27l-3 9 4-3c3-6 7-10 12-13-4 4-7 8-9 13 12-4 22-15 26-30z" fill="#f6efe0" stroke="#5a4636" stroke-width="1.2"/><path d="M4 36 20 20" stroke="#5a4636" stroke-width="1.2"/></svg>';
  huelle.append(feder);
  const dauer = 900;
  linie
    .animate([{ strokeDashoffset: laenge }, { strokeDashoffset: 0 }], { duration: dauer, delay: verzoegerung, easing: 'ease-in-out', fill: 'forwards' })
    .finished.then(() => (linie.style.strokeDashoffset = '0'))
    .catch(() => {});
  feder
    .animate(
      [
        { offsetDistance: '0%', opacity: 0 },
        { offsetDistance: '3%', opacity: 1 },
        { offsetDistance: '97%', opacity: 1 },
        { offsetDistance: '100%', opacity: 0 },
      ],
      { duration: dauer, delay: verzoegerung, easing: 'ease-in-out', fill: 'both' },
    )
    .finished.then(() => feder.remove())
    .catch(() => {});
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

/** Rechte Seite: leer, bis ein Tag gewählt ist; dann „schreiben“ sich die Felder hinein. */
function zeigeFormular(an: boolean, schreiben: boolean) {
  const form = dialog.querySelector<HTMLFormElement>('[data-tb-formular]')!;
  const leer = dialog.querySelector<HTMLElement>('[data-tb-leer]')!;
  const war = !form.hidden;
  form.hidden = !an;
  leer.hidden = an;
  if (an && !war && schreiben && !ruhig()) {
    form.classList.remove('tb-schreibt');
    void form.offsetWidth;
    form.classList.add('tb-schreibt');
  }
}

function waehle(d: Date, knopf: HTMLButtonElement) {
  gewaehlt = d;
  dialog.querySelectorAll('.tb-links .tb-tag[aria-pressed]').forEach((k) => {
    k.removeAttribute('aria-pressed');
    k.querySelector('.tb-tagsiegel')?.remove();
  });
  knopf.setAttribute('aria-pressed', 'true');
  knopf.append(siegel(true));
  dialog.querySelector('[data-tb-gewaehlt]')!.textContent = `Gewählt: ${langesDatum(d)}`;
  dialog.querySelector('[data-tb-fehler]')!.textContent = '';
  zeigeFormular(true, true);
  // Auf dem Handy liegt das Formular unter dem Kalender: dorthin weiterführen.
  if (einseitig()) rechts.scrollIntoView({ behavior: ruhig() ? 'auto' : 'smooth', block: 'start' });
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
    dialog.querySelector<HTMLButtonElement>('.tb-links .tb-tag:not(:disabled)')?.focus();
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
