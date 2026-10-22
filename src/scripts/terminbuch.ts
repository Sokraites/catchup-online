/**
 * Terminbuch: Kalender, Federkreis um den heutigen Tag, Siegel am gewählten Tag, Brief beim Absenden.
 *
 * Umblättern wie in einem echten Buch:
 * - Desktop (Doppelseite): rechte Seite greifen und nach links ziehen → nächster Monat
 *   (die Rückseite des Blatts zeigt ihn schon, sobald das Blatt über die Mitte kommt);
 *   linke Seite nach rechts ziehen → Vormonat (liegt sofort darunter).
 * - Handy (eine Seite): Die Monate liegen in einer Wisch-Spur (normales seitliches Scrollen mit Einrasten,
 *   wie bei den KI-Stufen). Das Wischen steuert das Blatt: Die obere Seite wölbt sich und blättert um,
 *   darunter liegt schon der nächste Monat. Weil der Browser das Wischen selbst übernimmt, hakt nichts.
 * - Pfeile blättern mit derselben Bewegung automatisch.
 *
 * Grundsatz: Animationen laufen nebenher. Alles ist sofort bedienbar, niemand wartet auf eine Animation.
 */

import { ruhig } from './stufe';

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
  addEventListener('resize', () => {
    if (!dialog.open) return;
    if (einseitig() !== mitSpur()) {
      richteAnsichtEin();
      zeichneMonat();
      kreiseHeute(0);
    }
    if (mitSpur()) zeigeSpurSeite(spurMonate.findIndex((m) => gleich(m, monat)), false);
  });
  bereit = true;
}

export function oeffneTerminbuch() {
  if (!bereit) einrichten();
  dialog.querySelector<HTMLElement>('[data-tb-danke]')!.hidden = true;
  zeigeFormular(Boolean(gewaehlt), false);
  monat = plusMonate(heute(), 0);
  richteAnsichtEin();
  zeichneMonat();
  dialog.showModal();
  if (mitSpur()) {
    stelleSpur();
    // nach dem Federkreis
    lupfeEcke(1900);
  }
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
  if (!mitSpur()) baueRaster(dialog.querySelector<HTMLElement>('[data-tb-tage]')!, monat, true);
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
  let vorn: HTMLElement;
  let hinten: HTMLElement;
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
      vorn = leereKopie();
      hinten = kalenderKopie(ziel);
    } else {
      // Linke Seite hebt sich, darunter liegt sofort der Vormonat
      host = links;
      kante = 'rechts';
      bis = 180;
      vorn = kalenderKopie(monat);
      hinten = leereKopie();
      monat = ziel;
      zeichneMonat();
      kreiseHeute(0);
    }
  } else {
    host = links;
    kante = 'links';
    if (richtung > 0) {
      // Kalenderseite blättert nach links weg, darunter der nächste Monat
      vorn = kalenderKopie(monat);
      hinten = leereKopie();
      bis = -180;
      monat = ziel;
      zeichneMonat();
      kreiseHeute(0);
    } else {
      // Vormonat kommt von links herein
      vorn = kalenderKopie(ziel);
      hinten = leereKopie();
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
  baueStreifen(blatt, host.offsetWidth, host.offsetHeight, kante, vorn, hinten);
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

/** Wohin die Hand greift (0 = oben, 1 = unten): Je weiter außen, desto stärker hebt sich die Ecke. */
let griffY = 0.6;

/**
 * Das Blatt besteht aus schmalen Streifen, die aneinanderhängen wie Glieder.
 * Jeder Streifen dreht sich etwas weiter als der vorige: So wölbt sich das Papier,
 * die freie Kante läuft voraus, und jeder Streifen bekommt sein eigenes Licht.
 */
let streifen: HTMLElement[] = [];
function baueStreifen(blatt: HTMLElement, b: number, h: number, kante: 'links' | 'rechts', vorn: HTMLElement, hinten: HTMLElement) {
  blatt.replaceChildren();
  streifen = [];
  const n = einseitig() ? 8 : 12;
  const sb = b / n;
  let eltern: HTMLElement = blatt;
  for (let i = 0; i < n; i++) {
    const st = document.createElement('div');
    st.className = 'tb-streifen';
    st.style.width = `${sb + 0.6}px`; // winzige Überlappung, damit keine Lichtspalte entstehen
    st.style.height = `${h}px`;
    st.style.transformOrigin = kante === 'links' ? 'left center' : 'right center';
    if (i === 0) st.style.left = kante === 'links' ? '0px' : `${b - sb}px`;
    else st.style.left = kante === 'links' ? `${sb}px` : `${-sb}px`;
    // Ausschnitt der Vorderseite (von der Bindung aus gezählt) und der Rückseite (gespiegelt)
    const vx = kante === 'links' ? i * sb : b - (i + 1) * sb;
    const hx = kante === 'links' ? b - (i + 1) * sb : i * sb;
    for (const [klasse, quelle, x] of [
      ['tb-leaf-vorn', vorn, vx],
      ['tb-leaf-hinten', hinten, hx],
    ] as const) {
      const flaeche = document.createElement('div');
      flaeche.className = `tb-leaf-seite ${klasse}`;
      const kopie = quelle.cloneNode(true) as HTMLElement;
      kopie.style.width = `${b}px`;
      kopie.style.height = `${h}px`;
      kopie.style.left = `${-x}px`;
      flaeche.append(kopie);
      const licht = document.createElement('span');
      licht.className = 'tb-licht';
      flaeche.append(licht);
      st.append(flaeche);
    }
    eltern.append(st);
    streifen.push(st);
    eltern = st;
  }
}

/** Stellt das Blatt auf Fortschritt p (0…1) – mit Wölbung, Licht und Schatten, damit es wie Papier wirkt. */
function setze(p: number) {
  if (!aktuell) return;
  aktuell.p = p;
  stelleBlatt(aktuell.von + (aktuell.bis - aktuell.von) * p);
}

/** Stellt das Blatt auf einen Winkel (0 flach … -180 ganz umgeblättert). */
function stelleBlatt(winkel: number) {
  const blatt = leaf();
  const hub = Math.sin((Math.abs(winkel) / 180) * Math.PI); // 0 flach … 1 senkrecht
  const n = streifen.length;
  // Wölbung: die Bindungsseite bleibt zurück, die freie Kante eilt voraus
  const woelbung = 0.42 * hub;
  let bisher = 0;
  streifen.forEach((st, i) => {
    const anteil = n > 1 ? i / (n - 1) : 1;
    const ziel = winkel * (1 - woelbung * (1 - anteil) ** 1.6);
    const relativ = ziel - bisher;
    bisher = ziel;
    st.style.transform = `rotateY(${relativ.toFixed(2)}deg)`;
    // Licht: Flächen, die sich zum Betrachter neigen, werden heller, abgewandte dunkler
    const neigung = Math.sin((ziel / 180) * Math.PI);
    st.style.setProperty('--hell', (Math.max(0, -neigung * (blatt.dataset.kante === 'links' ? 1 : -1)) * 0.22).toFixed(3));
    st.style.setProperty('--dunkel', (Math.abs(neigung) * 0.28 + hub * 0.06).toFixed(3));
  });
  // Ecke hebt sich etwas, je nachdem wo man greift
  const kippen = (griffY - 0.5) * 7 * hub * (blatt.dataset.kante === 'links' ? 1 : -1);
  blatt.style.transform = `rotateZ(${kippen.toFixed(2)}deg) translateZ(1px)`;
  const sch = schatten();
  sch.style.opacity = String(hub * 0.75);
  sch.style.setProperty('--breite', `${30 + hub * 50}%`);
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
  if (mitSpur()) {
    const i = spurMonate.findIndex((m) => gleich(m, monat)) + richtung;
    if (i >= 0 && i < spurMonate.length) zeigeSpurSeite(i, !ruhig());
    return;
  }
  if (ruhig()) {
    const ziel = plusMonate(monat, richtung);
    if (!erlaubt(ziel)) return;
    monat = ziel;
    zeichneMonat();
    kreiseHeute(0);
    return;
  }
  griffY = 0.8; // wie mit der Hand an der unteren Ecke gegriffen
  if (beginne(richtung)) beende(true, 650);
}

/** Greifen und Ziehen mit Maus oder Finger. */
function richteZiehenEin() {
  let start: { x: number; y: number; seite: 'links' | 'rechts' } | null = null;
  let breite = 1;

  const greifbar = (el: Element) => !el.closest('input, textarea, select, label, fieldset, a, .tb-blaettern, .tb-danke');

  buch.addEventListener('pointerdown', (e) => {
    // Handy: Blättern übernimmt die Wisch-Spur
    if (e.button !== 0 || aktuell || mitSpur()) return;
    const ziel = e.target as Element;
    const seite = ziel.closest('.tb-rechts') ? 'rechts' : ziel.closest('.tb-links') ? 'links' : null;
    if (!seite || !greifbar(ziel)) return;
    if (!einseitig() && seite === 'rechts' && !dialog.querySelector<HTMLElement>('[data-tb-formular]')!.hidden && !ziel.closest('.tb-ecke')) {
      // Rechts liegt das Formular: dort nur am Eselsohr greifen
      if (!ziel.classList.contains('tb-seite')) return;
    }
    start = { x: e.clientX, y: e.clientY, seite };
    const r = buch.getBoundingClientRect();
    griffY = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
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

/* ---------- Handy: Monate seitlich wischen ---------- */

let spur: HTMLElement | null = null;
let spurSeiten: HTMLElement[] = [];
let spurMonate: Date[] = [];
/** Aus welcher Seite das Blatt gerade gebaut ist (-1 = keins) */
let spurBlatt = -1;
let spurGeplant = false;
let hinweisText = '';
const mitSpur = () => Boolean(spur && !spur.hidden);

/** Handy: Wisch-Spur mit allen buchbaren Monaten. Desktop: Doppelseite mit Ziehen. */
function richteAnsichtEin() {
  const tage = links.querySelector<HTMLElement>('[data-tb-tage]')!;
  const woche = links.querySelector<HTMLElement>('.tb-wochentage')!;
  const hinweis = links.querySelector<HTMLElement>('.tb-hinweis')!;
  const leer = dialog.querySelector<HTMLElement>('[data-tb-leer] p')!;
  hinweisText ||= hinweis.textContent ?? '';
  leer.textContent = einseitig() ? 'Wähle oben einen Tag.' : 'Wähle links einen Tag.';
  if (!einseitig()) {
    if (spur) spur.hidden = true;
    tage.hidden = false;
    woche.hidden = false;
    dialog.classList.remove('tb-mit-spur');
    hinweis.textContent = hinweisText;
    return;
  }
  if (!spur) {
    const huelle = document.createElement('div');
    huelle.className = 'tb-spur-huelle';
    spur = document.createElement('div');
    spur.className = 'tb-spur';
    spur.addEventListener('scroll', () => {
      if (spurGeplant) return;
      spurGeplant = true;
      requestAnimationFrame(stelleSpur);
    }, { passive: true });
    // Wer selbst anfasst, übernimmt: laufendes Blättern sofort abbrechen
    for (const typ of ['pointerdown', 'touchstart', 'wheel'] as const) {
      spur.addEventListener(typ, () => stoppeSpurLauf(), { passive: true });
    }
    // Eselsohr: Antippen blättert um (funktioniert auch dort, wo seitliches Wischen abgefangen wird)
    const ecke = document.createElement('span');
    ecke.className = 'tb-ecke tb-ecke-spur';
    ecke.setAttribute('aria-hidden', 'true');
    ecke.addEventListener('click', () => blaettereAutomatisch(1));
    huelle.append(spur, ecke);
    tage.after(huelle);
  }
  spur.hidden = false;
  tage.hidden = true;
  tage.replaceChildren();
  woche.hidden = true;
  dialog.classList.add('tb-mit-spur');
  hinweis.textContent = 'Rot umkreist: heute. Wähle einen freien Tag. Zum Blättern die Ecke antippen oder seitlich wischen.';
  const erster = heute();
  erster.setDate(1);
  spurMonate = [];
  for (let m = erster; erlaubt(m); m = plusMonate(m, 1)) spurMonate.push(m);
  // Platzhalter rasten ein (bleiben unbewegt), die Seite darin liegt still wie in einem Buch.
  const plaetze = spurMonate.map((m, i) => {
    const platz = document.createElement('div');
    platz.className = 'tb-spur-platz';
    const seite = document.createElement('div');
    seite.className = 'tb-spur-seite';
    seite.setAttribute('role', 'group');
    seite.setAttribute('aria-label', `${MONATE[m.getMonth()]} ${m.getFullYear()}`);
    seite.style.zIndex = String(spurMonate.length - i);
    const w = woche.cloneNode(true) as HTMLElement;
    w.hidden = false;
    const raster = document.createElement('div');
    raster.className = 'tb-tage';
    baueRaster(raster, m, true);
    seite.append(w, raster);
    platz.append(seite);
    return platz;
  });
  spurSeiten = plaetze.map((p) => p.firstElementChild as HTMLElement);
  spur.replaceChildren(...plaetze);
  spurBlatt = -1;
  const i = Math.max(0, spurMonate.findIndex((m) => gleich(m, monat)));
  spur.scrollLeft = i * spur.clientWidth;
}

let spurLauf = 0;
function stoppeSpurLauf() {
  if (!spurLauf || !spur) return;
  cancelAnimationFrame(spurLauf);
  spurLauf = 0;
  spur.style.scrollSnapType = '';
}

/**
 * Blättert zu Seite i. Sanft: eigene Animation (nicht die des Browsers), damit das Blatt
 * auf jedem Handy gleich schön umschlägt – auch dort, wo „smooth“ fehlt oder springt.
 */
function zeigeSpurSeite(i: number, sanft: boolean) {
  if (!spur || i < 0) return;
  stoppeSpurLauf();
  const ziel = i * spur.clientWidth;
  if (!sanft) {
    spur.scrollLeft = ziel;
    return;
  }
  const s = spur;
  const start = s.scrollLeft;
  const t0 = performance.now();
  const dauer = 750;
  s.style.scrollSnapType = 'none'; // Einrasten würde die Zwischenschritte zurückziehen
  const schritt = (jetzt: number) => {
    const t = Math.min(1, (jetzt - t0) / dauer);
    const e = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    s.scrollLeft = start + (ziel - start) * e;
    if (t < 1) spurLauf = requestAnimationFrame(schritt);
    else {
      spurLauf = 0;
      s.style.scrollSnapType = '';
    }
  };
  spurLauf = requestAnimationFrame(schritt);
}

/** Nach dem Öffnen hebt sich die Ecke kurz an: So sieht man, dass sich die Seite umblättern lässt. */
function lupfeEcke(verzoegerung: number) {
  if (!mitSpur() || ruhig() || spurSeiten.length < 2) return;
  setTimeout(() => {
    if (!dialog.open || !spur || spur.scrollLeft > 1 || spurLauf) return;
    baueSpurBlatt(0);
    spurSeiten[0].style.visibility = 'hidden';
    spurSeiten[1].style.visibility = '';
    spurSeiten[1].style.transform = `translateX(${spur.clientWidth}px)`;
    leaf().hidden = false;
    schatten().hidden = false;
    const t0 = performance.now();
    const schritt = (jetzt: number) => {
      const t = Math.min(1, (jetzt - t0) / 900);
      // hoch und wieder zurück
      stelleBlatt(-34 * Math.sin(Math.PI * t));
      if (t < 1 && spur!.scrollLeft < 1) requestAnimationFrame(schritt);
      else stelleSpur();
    };
    requestAnimationFrame(schritt);
  }, verzoegerung);
}

/**
 * Folgt der Wisch-Spur: Die Seiten bleiben übereinander liegen wie in einem Buch.
 * Die gerade umgeblätterte Seite wird durch das gewölbte Blatt ersetzt, das sich mit dem Finger dreht.
 */
function stelleSpur() {
  spurGeplant = false;
  if (!spur || !mitSpur()) return;
  const b = spur.clientWidth || 1;
  const pos = Math.max(0, Math.min(spurSeiten.length - 1, spur.scrollLeft / b));
  let i = Math.floor(pos);
  let p = pos - i;
  if (p < 0.004) p = 0;
  if (p > 0.996) {
    i += 1;
    p = 0;
  }
  const still = ruhig();
  spurSeiten.forEach((s, n) => {
    const q = Math.max(-1, Math.min(1, pos - n));
    // Seite bleibt an ihrem Platz liegen (die Spur schiebt sie sonst weg)
    s.style.transform = still ? '' : `translateX(${(q * b).toFixed(1)}px)`;
    s.style.visibility = still || (q > -1 && q <= 0) || (n === i && p === 0) ? '' : 'hidden';
    s.inert = n !== Math.round(pos);
  });
  // Monat im Kopf und Pfeile folgen der Seite, die gerade oben liegt
  const sichtbar = spurMonate[Math.round(pos)];
  if (sichtbar && !gleich(sichtbar, monat)) {
    monat = sichtbar;
    zeichneMonat();
  }
  if (still) return;
  const blatt = leaf();
  if (p > 0) {
    if (spurBlatt !== i) baueSpurBlatt(i);
    blatt.hidden = false;
    schatten().hidden = false;
    stelleBlatt(-180 * p);
  } else if (spurBlatt !== -1) {
    blatt.hidden = true;
    schatten().hidden = true;
    spurBlatt = -1;
  }
}

/** Baut das gewölbte Blatt aus einer Monatsseite der Spur. */
function baueSpurBlatt(i: number) {
  const r = spur!.getBoundingClientRect();
  const rb = buch.getBoundingClientRect();
  const b = r.width;
  const h = r.height;
  const vorn = document.createElement('div');
  vorn.className = 'tb-kopie tb-kopie-spur';
  const kopie = spurSeiten[i].cloneNode(true) as HTMLElement;
  kopie.querySelectorAll('.tb-feder').forEach((f) => f.remove());
  kopie.querySelectorAll<SVGPathElement>('.tb-kreis path').forEach((pfad) => (pfad.style.strokeDashoffset = '0'));
  vorn.append(...kopie.childNodes);
  const blatt = leaf();
  const sch = schatten();
  for (const el of [blatt, sch]) {
    el.style.left = `${r.left - rb.left}px`;
    el.style.top = `${r.top - rb.top}px`;
    el.style.width = `${b}px`;
    el.style.height = `${h}px`;
  }
  blatt.style.transformOrigin = 'left center';
  blatt.dataset.kante = 'links';
  griffY = 0.85; // wie mit dem Daumen unten an der Ecke
  baueStreifen(blatt, b, h, 'links', vorn, leereKopie());
  spurBlatt = i;
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
