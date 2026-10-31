/**
 * Binärcode-Strom: Hintergrund der Stufe Mittel (Baustein: Binaerstrom.astro, Aussehen: farbwelten.css).
 *
 * - Ein Strom aus 0 und 1 fließt fast waagerecht von links nach rechts (20–40 px/s je Bahn), mit leichter Welle.
 *   Die Bahnen sind zu Strömen gebündelt: In zufällig verteilten Bändern sind sie voller, schneller und tragen längere
 *   Zeichengruppen; dazwischen liegen ruhige Zonen. Im Mittel bleibt die Dichte 30 % (Handy: halb so viel).
 * - Glimmer: einzelne Zeichen leuchten kurz auf (0,5–0,7, 400–800 ms, ease-out) und ziehen dabei mit.
 * - Farbwelle: Wechselt der Abschnitt (<html data-welt>), zieht die neue Farbe als Welle durch den Strom (2 s, Handy
 *   1,6 s): beim Herunterscrollen von unten nach oben, beim Hochscrollen von oben nach unten, links etwas früher als
 *   rechts. Im Saum der Welle gleitet jedes Zeichen in sechs Stufen von der alten zur neuen Farbe (vorgezeichnet beim
 *   Wechsel); ein fester Zufallswert je Zeichen verwischt die Stufengrenzen. Jedes Zeichen geht nur vorwärts: kein Flackern.
 *   Anfangs- und Zielfarbe kommen aus der Akzentfarbe (--akzent / --a). Das gleichzeitige 1,2-s-Gleiten von --a übernimmt
 *   im Strom die Welle: Sonst wäre die neue Farbe in der ersten halben Sekunde noch fast die alte, die Welle unsichtbar.
 * - Nachglühen: Glimmernde Zeichen ziehen eine weiche Spur hinter sich her (drei blasser werdende Abbilder auf ihrer Bahn).
 *   Ausprobiert war zuerst, die Fläche je Bild nur zu 10 % zu übermalen: Dann verschmieren die Ziffern zu Streifen, werden
 *   3- bis 4-mal so deckend wie gewollt und hinterlassen dunkle Rundungsreste. Darum wird jedes Bild gelöscht.
 * - Farbe: --a der Zeichenfläche, also die Akzentfarbe samt ihrem 1,2-s-Gleitwechsel aus farbwelten.css.
 * - Karten-Synergie (Karten mit data-fluss-ziel): Bahnen, die auf eine Karte treffen, weichen vor ihr nach oben oder
 *   unten aus, drängen sich in einem dichten, helleren Band am Rand entlang und kehren hinter ihr zurück (Umlenkung statt
 *   Verdecken); tiefere Bahnen tauchen weich ab. Ein dichtes, helles Band aus Randzeichen fließt genau auf der
 *   Kartenkante jeder Karte: Mitte des Zeichens auf der Kante (halb außen, halb im textfreien Innenrand), entlang der
 *   Kante gedreht, in den Ecken auf dem Bogen des border-radius. Die Kanten werden in jedem Bild neu gemessen
 *   (getBoundingClientRect). Das Band liegt auf einer eigenen Fläche über den Karten, die im Dokument liegt und darum
 *   beim Scrollen ohne Verzug mitläuft. Der Kartenrand leuchtet (reines CSS, atmet als Welle) und blitzt beim
 *   Scroll-Impuls auf. Über und hinter Kartentext kommt kein Zeichen.
 * - Scroll-Impuls: Beim Scrollen wandert ein waagerechtes Lichtband aus aufglimmenden Zeichen in Scrollrichtung über
 *   den Strom und klingt in 0,8 s aus; schnelleres Scrollen macht es breiter und heller, Kartenränder leuchten mit.
 * - Lesbarkeit: Hinter Text höchstens 0,06 und kein Glimmer oder Impuls; Karteninneres frei.
 * - Sparsam: Canvas 2D, ~30 Bilder/s, höchstens doppelte Pixeldichte, Pause bei verstecktem Tab oder unsichtbarer
 *   Fläche (z. B. nach Wechsel auf Leicht). „Bewegung reduzieren“: ein stehendes Muster ohne Anziehung, Randzeichen
 *   und Impulse, neu gezeichnet nur beim Scrollen, bei Größen- und Farbwechsel.
 */

const SCHRIFT = 14;
const ZEILE = 22;
const ZEICHEN = 11;
const RAND = 40;
const NEIGUNG = 0.03;
const WELLE = { hoehe: 4, laenge: 420, tempo: 0.45 };
const DECKKRAFT = [0.22, 0.34];
const HINTER_TEXT = 0.06;
/** Ströme: Abstand und Breite der Bänder (px), Grunddichte der ruhigen Zonen (Anteil), Tempo in Bändern und dazwischen */
const STROM = { abstand: [170, 260], breite: [40, 80], ruhe: 0.06, tempo: [32, 40], ruhigTempo: [20, 26] };
const GLIMMER = { deckkraft: [0.5, 0.7], dauer: [0.4, 0.8], proSekunde: 6, handyProSekunde: 2.25 };
/** Farbwelle: Dauer (s), Breite des Mischsaums und Vorsprung der linken Seite (Anteile der Bildhöhe) */
const FARBWELLE = { dauer: 2, handyDauer: 1.6, saum: 0.35, quer: 0.15, stufen: 6 };
/** Spur hinter glimmernden Zeichen: Abstand in px und Anteil der Leuchtkraft */
const NACHGLUEHEN = [
  [6, 0.45],
  [12, 0.25],
  [18, 0.12],
];
/** Karten-Synergie (Karten mit data-fluss-ziel):
 *  Umlenkung: Bahnen, die auf eine Karte treffen, weichen ab `vorlauf` px vor der Karte nach oben oder unten aus,
 *  laufen in einem Band (`band` px, `luecke` px Abstand) am Rand entlang und kehren hinter der Karte zurück. Bahnen bis
 *  `tiefe` px innerhalb der Karte werden so in das Band gedrückt (dort dichter, bis `saum` Deckkraft); tiefere tauchen weich ab.
 *  Randzeichen: fließen auf Schienen `schienen` px vom Kartenrand (0 = genau auf der Kante) um die Karte, gezeichnet
 *  auf einer eigenen Fläche ÜBER den Karten (.binaerstrom-rand): Das Band liegt sichtbar auf der Kante.
 *  Rand-Glow: reines CSS (farbwelten.css); das Skript setzt nur beim Scroll-Impuls kurz die Klasse .fluss-impuls. */
const KARTE = {
  vorlauf: 90,
  handyVorlauf: 40,
  tiefe: 70,
  handyTiefe: 50,
  band: 56,
  luecke: 8,
  saum: 0.55,
  /** Eine Schiene genau auf der Kante (Abstand 0): Die Zeichen liegen halb außen, halb im textfreien Innenrand */
  schienen: [0],
  handySchienen: [0],
  dichte: 0.85,
  deckkraft: [0.78, 0.95],
  tempo: 30,
  /** Ersatz, falls der Eckenradius der Karte nicht lesbar ist (sonst: border-radius der Karte) */
  ecke: 20,
  /** Prüfpunkt nach innen (px): Liegt dort Text, entfällt das Randzeichen */
  innen: 7,
};
/** Scroll-Impuls: Lebensdauer (s), Abstand zwischen Impulsen beim Scrollen (s), Breite (px) und Leuchtkraft je nach
 *  Scroll-Tempo (px/s; ab `vollesTempo` volle Stärke, unter `minTempo` kein Impuls), Karten leuchten dabei stärker */
const IMPULS = { leben: 0.8, abstand: 0.3, handyAbstand: 0.45, breite: [50, 160], handyBreite: 0.8, leuchten: [0.45, 0.7], vollesTempo: 2400, minTempo: 60, karte: 1.25 };
const BILD_MS = 1000 / 30;
const TEXT =
  'main :is(h1, h2, h3, p, li:not([data-fluss-ziel]), dt, dd, summary, .actions, .kontakt-wege, .eyebrow, .breadcrumb, .card:not([data-fluss-ziel])), .site-footer :is(p, li, dd)';
const FREI = '[data-fluss-ziel]';
/** Randband-Fläche: liegt im Dokument (scrollt ohne Verzug mit den Karten) und reicht so viele px über und unter das
 *  Bild hinaus. Zwischen zwei Bildern (30/s) bewegt sie sich beim Scrollen nativ mit, das Skript rückt sie nur nach. */
const PUFFER = 140;
const ZELLE = 8;

/** r: fester Zufallswert, ab welchem Stand der Farbwelle das Zeichen die neue Farbe zeigt */
type Zeichen = { bahn: number; s: number; bit: number; a: number; r: number; gStart: number; gDauer: number; gSpitze: number };
type Bahn = { y: number; tempo: number; phase: number };
type Rechteck = { x: number; y: number; b: number; h: number };
const glatt = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
/** Randzeichen: fließt auf einer Schiene (Abstand o vom Kartenrand) um die obere oder untere Hälfte der Karte.
 *  Gedreht entlang der Kante gezeichnet: an den Ecken folgt es dem Bogen des border-radius. */
type Randzeichen = { o: number; unten: boolean; s: number; bit: number; a: number; r: number };
/** Maske je 8-px-Zelle: 0 frei, 1 nahe an Text (kein Glimmer), 2 hinter Text (gedämpft), 3 Karte (kein Zeichen) */
type Flaeche = { x: number; y: number; b: number; h: number; art: 1 | 2 | 3 };

const zufall = (a: number, b: number) => a + Math.random() * (b - a);
let gestartet = false;

export function starteBinaerstrom() {
  const leinwand = document.querySelector<HTMLCanvasElement>('.binaerstrom');
  const ctx = leinwand?.getContext('2d');
  // Fläche über den Karten nur für das Randband (Binaerstrom.astro); fehlt sie, entfallen die Randzeichen
  const randLeinwand = document.querySelector<HTMLCanvasElement>('.binaerstrom-rand');
  const rctx = randLeinwand?.getContext('2d');
  let randGezeichnet = 0;
  /** Lage der Randband-Fläche im Dokument (px von oben) */
  let randOben = NaN;
  if (gestartet || !leinwand || !ctx) return;
  gestartet = true;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const schrift = `${SCHRIFT}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace'}`;

  let b = 0;
  let h = 0;
  let dpr = 1;
  let handy = false;
  let bahnen: Bahn[] = [];
  let zeichen: Zeichen[] = [];
  let t = 0;

  // ---------- Bahnen und Zeichen ----------
  function aufbauen() {
    const r = leinwand!.getBoundingClientRect();
    b = Math.round(r.width);
    h = Math.round(r.height);
    dpr = Math.min(2, devicePixelRatio || 1);
    leinwand!.width = Math.round(b * dpr);
    leinwand!.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (randLeinwand && rctx) {
      randLeinwand.width = leinwand!.width;
      randLeinwand.height = Math.round((h + 2 * PUFFER) * dpr);
      randLeinwand.style.height = `${h + 2 * PUFFER}px`;
      randOben = NaN;
      randGezeichnet = 0;
    }
    handy = b < 768;
    const laenge = b + 2 * RAND;
    const plaetze = Math.floor(laenge / ZEICHEN);
    const anzahlBahnen = Math.ceil((h + b * NEIGUNG + 2 * ZEILE) / ZEILE);
    // Dichte im Mittel: 30 % (Handy 15 %), gedeckelt
    const deckel = handy ? 360 : 2600;
    const dichte = Math.min(handy ? 0.15 : 0.3, deckel / (anzahlBahnen * plaetze));
    // Ströme: Bänder über die Bildhöhe; je Bahn ein Anteil 0 (ruhige Zone) bis 1 (Mitte eines Stroms)
    const baender: { y: number; breite: number; tempo: number }[] = [];
    for (let y = zufall(-40, 60); y < h + 80; y += zufall(STROM.abstand[0], STROM.abstand[1])) {
      baender.push({ y, breite: zufall(STROM.breite[0], STROM.breite[1]), tempo: zufall(STROM.tempo[0], STROM.tempo[1]) });
    }
    bahnen = [];
    const anteile: number[] = [];
    for (let i = 0; i < anzahlBahnen; i++) {
      const y = -b * NEIGUNG - ZEILE + i * ZEILE;
      const mitte = y + (b / 2) * NEIGUNG + ZEILE / 2;
      let anteil = 0;
      let tempo = zufall(STROM.ruhigTempo[0], STROM.ruhigTempo[1]);
      for (const band of baender) {
        const nah = Math.exp(-(((mitte - band.y) / band.breite) ** 2));
        if (nah > anteil) [anteil, tempo] = [nah, tempo + (band.tempo - tempo) * nah];
      }
      anteile.push(anteil);
      bahnen.push({ y, tempo, phase: zufall(0, Math.PI * 2) });
    }
    // Gewicht je Bahn so verteilen, dass der Mittelwert der Dichte gleich bleibt
    const gewichte = anteile.map((a) => STROM.ruhe + (1 - STROM.ruhe) * a);
    const mittel = gewichte.reduce((x, y) => x + y, 0) / gewichte.length;
    zeichen = [];
    bahnen.forEach((_, i) => {
      const d = Math.min(0.8, (dichte * gewichte[i]) / mittel);
      const imStrom = anteile[i] > 0.5;
      let p = Math.floor(zufall(0, 12));
      while (p < plaetze) {
        const gruppe = Math.round(imStrom ? zufall(8, 16) : zufall(2, 4));
        for (let k = 0; k < gruppe && p < plaetze; k++, p++) {
          zeichen.push({ bahn: i, s: p * ZEICHEN, bit: Math.random() < 0.5 ? 0 : 1, a: zufall(DECKKRAFT[0], DECKKRAFT[1]), r: Math.random(), gStart: -1, gDauer: 0, gSpitze: 0 });
        }
        p += Math.max(1, Math.round((gruppe * (1 - d)) / d * zufall(0.5, 1.5)));
      }
    });
    // Obergrenze hart einhalten (der Zufall kann sie knapp überschreiten)
    while (zeichen.length > deckel) zeichen.splice(Math.floor(Math.random() * zeichen.length), 1);
    flaechenDa = false;
  }

  // ---------- Vorgezeichnete Zeichen je Farbe (drawImage ist viel schneller als fillText) ----------
  let farbe = '';
  // Die Farbe gleitet 1,2 s (CSS); nur in dieser Zeit wird sie in jedem Bild gelesen, sonst nie (spart Stil-Berechnungen)
  let farbeLesenBis = Infinity;
  let bilder: HTMLCanvasElement[] = [];
  let leuchten: HTMLCanvasElement[] = [];
  // Farbwelle: vorgezeichnete Zeichen in Stufen von der alten zur neuen Farbe
  let welle: { start: number; dauer: number; vonUnten: boolean; bilder: HTMLCanvasElement[][]; leuchten: HTMLCanvasElement[][] } | null = null;
  let zielFarbe = '';
  let scrollVorher = scrollY;
  const pruefer = document.createElement('canvas').getContext('2d')!;
  /** Farbe als [r, g, b] (der Browser übersetzt jede CSS-Farbe in #rrggbb) */
  const rgb = (text: string) => {
    pruefer.fillStyle = '#000';
    pruefer.fillStyle = text;
    const hex = String(pruefer.fillStyle);
    return /^#[0-9a-f]{6}$/i.test(hex) ? [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) : null;
  };
  function starteWelle() {
    if (still || !farbe) return;
    const von = rgb(zielFarbe || farbe);
    const nachText = getComputedStyle(document.documentElement).getPropertyValue('--akzent').trim();
    const nach = rgb(nachText);
    if (!von || !nach) return;
    zielFarbe = nachText;
    const stufen = Array.from({ length: FARBWELLE.stufen }, (_, i) => {
      const f = i / (FARBWELLE.stufen - 1);
      return `rgb(${von.map((v, k) => Math.round(v + (nach[k] - v) * f)).join(',')})`;
    });
    welle = {
      start: performance.now(),
      dauer: (handy ? FARBWELLE.handyDauer : FARBWELLE.dauer) * 1000,
      vonUnten: scrollY >= scrollVorher,
      bilder: stufen.map((f) => [male('0', 0, f), male('1', 0, f)]),
      leuchten: stufen.map((f) => [male('0', 8, f), male('1', 8, f)]),
    };
  }
  function male(text: string, glanz: number, farbe: string) {
    const c = document.createElement('canvas');
    const rand = glanz ? 8 : 0;
    c.width = Math.ceil((ZEICHEN + 2 * rand) * dpr);
    c.height = Math.ceil((ZEILE + 2 * rand) * dpr);
    const x = c.getContext('2d')!;
    x.scale(dpr, dpr);
    x.font = schrift;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = farbe;
    if (glanz) {
      x.shadowColor = farbe;
      x.shadowBlur = glanz;
    }
    x.fillText(text, rand + ZEICHEN / 2, rand + ZEILE / 2);
    return c;
  }
  /** Um ±90° gedrehte Kopien eines vorgezeichneten Zeichens (Seitenkanten der Karten). Ungedrehtes Zeichnen ist für den
   *  Browser viel billiger als eine Drehung in jedem Bild: Gedreht wird nur noch in den Eckbögen. */
  const gedreht = new WeakMap<HTMLCanvasElement, [HTMLCanvasElement, HTMLCanvasElement]>();
  function drehe(quelle: HTMLCanvasElement, runter: boolean) {
    let paar = gedreht.get(quelle);
    if (!paar) {
      paar = [true, false].map((r) => {
        const c = document.createElement('canvas');
        c.width = quelle.height;
        c.height = quelle.width;
        const x = c.getContext('2d')!;
        x.translate(c.width / 2, c.height / 2);
        x.rotate(r ? Math.PI / 2 : -Math.PI / 2);
        x.drawImage(quelle, -quelle.width / 2, -quelle.height / 2);
        return c;
      }) as [HTMLCanvasElement, HTMLCanvasElement];
      gedreht.set(quelle, paar);
    }
    return paar[runter ? 0 : 1];
  }
  function pruefeFarbe() {
    if (performance.now() > farbeLesenBis && farbe) return false;
    const neu = getComputedStyle(leinwand!).getPropertyValue('--a').trim();
    if (!neu || neu === farbe) return false;
    farbe = neu;
    bilder = [male('0', 0, farbe), male('1', 0, farbe)];
    leuchten = [male('0', 8, farbe), male('1', 8, farbe)];
    return true;
  }

  // ---------- Lesbarkeit: wo Text steht (gedämpft) und wo Karten liegen (frei) ----------
  let flaechen: Flaeche[] = [];
  let flaechenDa = false;
  let gesammelt = 0;
  let spalten = 0;
  let maske = new Uint8Array(0);
  let maskeFuer = NaN;
  // Karten (Koordinaten im Bild, in jedem Bild neu gemessen: getBoundingClientRect) und ihre Randzeichen;
  // die Randzeichen werden nur neu angelegt, wenn sich eine Karte in der Größe ändert
  type Karte = Rechteck & { rand: Randzeichen[]; el: HTMLElement; ecke: number };
  let karten: Karte[] = [];
  function sammle() {
    const y0 = scrollY;
    const liste: Flaeche[] = [];
    const nimm = (el: Element, art: 1 | 2 | 3, rand: number) => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) liste.push({ x: r.left - rand, y: r.top + y0 - rand, b: r.width + 2 * rand, h: r.height + 2 * rand, art });
    };
    document.querySelectorAll(TEXT).forEach((el) => {
      nimm(el, 1, 20);
      nimm(el, 2, 6);
    });
    document.querySelectorAll(FREI).forEach((el) => nimm(el, 3, 2));
    karten = [...document.querySelectorAll<HTMLElement>(FREI)].map((el, i) => {
      const r = el.getBoundingClientRect();
      const alt = karten[i];
      const ecke = parseFloat(getComputedStyle(el).borderTopLeftRadius) || KARTE.ecke;
      const k = { x: r.left, y: r.top, b: r.width, h: r.height, ecke };
      const gleich = alt && alt.el === el && Math.abs(alt.b - k.b) < 1 && Math.abs(alt.h - k.h) < 1 && alt.ecke === ecke;
      return { ...k, el, rand: gleich ? alt.rand : still ? [] : randzeichen(k) };
    });
    flaechen = liste;
    flaechenDa = true;
    gesammelt = performance.now();
    maskeFuer = NaN;
  }
  function baueMaske() {
    // reicht PUFFER px über und unter das Bild (dort liegt die Randband-Fläche auch)
    spalten = Math.ceil(b / ZELLE);
    const zeilen = Math.ceil((h + 2 * PUFFER) / ZELLE);
    if (maske.length !== spalten * zeilen) maske = new Uint8Array(spalten * zeilen);
    else maske.fill(0);
    for (const f of flaechen) {
      const oben = f.y - scrollY + PUFFER;
      if (oben > h + 2 * PUFFER || oben + f.h < 0) continue;
      const x0 = Math.max(0, Math.floor(f.x / ZELLE));
      const x1 = Math.min(spalten - 1, Math.floor((f.x + f.b) / ZELLE));
      const z0 = Math.max(0, Math.floor(oben / ZELLE));
      const z1 = Math.min(zeilen - 1, Math.floor((oben + f.h) / ZELLE));
      for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (maske[z * spalten + x] < f.art) maske[z * spalten + x] = f.art;
    }
    maskeFuer = scrollY;
  }
  const maskeBei = (x: number, y: number) => {
    const sp = Math.floor(x / ZELLE);
    if (sp < 0 || sp >= spalten || y < -PUFFER) return 0;
    return maske[Math.floor((y + PUFFER) / ZELLE) * spalten + sp] ?? 0;
  };

  /** Kartenkanten jetzt: jede Karte in jedem Bild neu messen (folgt Scrollen, Größenänderung, Einblenden und Anheben
   *  ohne Verzug). Wenige Karten, das Layout ist zu diesem Zeitpunkt aktuell: kostet kaum etwas. */
  function kartenMessen() {
    for (const kt of karten) {
      const r = kt.el.getBoundingClientRect();
      if (Math.abs(r.width - kt.b) >= 1 || Math.abs(r.height - kt.h) >= 1) {
        kt.b = r.width;
        kt.h = r.height;
        kt.rand = still ? [] : randzeichen(kt);
      }
      kt.x = r.left;
      kt.y = r.top;
    }
  }

  // ---------- Karten-Synergie: Weg um die Karte ----------
  /** Länge einer Hälfte des Wegs um die Karte (Rechteck um o vergrößert, Ecken mit dem border-radius der Karte) */
  const haelfte = (k: Rechteck & { ecke: number }, o: number) => {
    const w = k.b + 2 * o;
    const hh = k.h + 2 * o;
    const r = Math.max(2, Math.min(k.ecke + o, w / 2, hh / 2));
    return { w, hh, r, laenge: hh - 2 * r + Math.PI * r + w - 2 * r };
  };
  /** Punkt auf dem Weg: von der Mitte der linken Kante über die obere (oder untere) Hälfte zur Mitte der rechten */
  function aufRand(k: Rechteck & { ecke: number }, o: number, unten: boolean, s: number): [number, number] {
    const { w, hh, r } = haelfte(k, o);
    const x0 = k.x - o;
    let x: number;
    let y: number; // gerechnet für die obere Hälfte, Abstand von der Oberkante
    const kante = hh / 2 - r;
    const bogen = (Math.PI * r) / 2;
    if (s < kante) [x, y] = [x0, hh / 2 - s];
    else if ((s -= kante) < bogen) [x, y] = [x0 + r - r * Math.cos(s / r), r - r * Math.sin(s / r)];
    else if ((s -= bogen) < w - 2 * r) [x, y] = [x0 + r + s, 0];
    else if ((s -= w - 2 * r) < bogen) [x, y] = [x0 + w - r + r * Math.sin(s / r), r - r * Math.cos(s / r)];
    else [x, y] = [x0 + w, r + (s - bogen)];
    return [x, unten ? k.y + k.h + o - y : k.y - o + y];
  }
  function randzeichen(k: Rechteck & { ecke: number }): Randzeichen[] {
    const liste: Randzeichen[] = [];
    for (const o of handy ? KARTE.handySchienen : KARTE.schienen) {
      for (const unten of [false, true]) {
        const { laenge } = haelfte(k, o);
        let s = zufall(0, 30);
        while (s < laenge) {
          const kette = Math.round(zufall(3, 7));
          for (let i = 0; i < kette && s < laenge; i++, s += ZEICHEN + 2) {
            liste.push({ o, unten, s, bit: Math.random() < 0.5 ? 0 : 1, a: zufall(KARTE.deckkraft[0], KARTE.deckkraft[1]), r: Math.random() });
          }
          s += ((kette * (ZEICHEN + 2)) * (1 - KARTE.dichte)) / KARTE.dichte * zufall(0.5, 1.5);
        }
      }
    }
    return liste;
  }

  // ---------- Scroll-Impuls ----------
  let impulse: { start: number; richtung: number; staerke: number }[] = [];
  let scrollTempo = 0;
  let letzterImpuls = -Infinity;
  /** Nur für Prüfungen: wie viele Zeichen im letzten Bild vom Impuls leuchteten */
  let impulsZeichen = 0;

  // ---------- Ein Bild ----------
  function zeichne(dt: number) {
    if (!flaechenDa || performance.now() - gesammelt > 1500) sammle();
    if (maskeFuer !== scrollY) baueMaske();
    kartenMessen();
    pruefeFarbe();
    ctx!.clearRect(0, 0, b, h);
    if (!still) {
      // Glimmer starten (Handy seltener) und selten ein Bit kippen
      let neue = (handy ? GLIMMER.handyProSekunde : GLIMMER.proSekunde) * dt;
      while (neue > 0) {
        if (Math.random() < neue) {
          const z = zeichen[Math.floor(Math.random() * zeichen.length)];
          if (z && z.gStart < 0) Object.assign(z, { gStart: t, gDauer: zufall(GLIMMER.dauer[0], GLIMMER.dauer[1]), gSpitze: zufall(GLIMMER.deckkraft[0], GLIMMER.deckkraft[1]) });
        }
        neue -= 1;
      }
      if (Math.random() < dt * 6) {
        const z = zeichen[Math.floor(Math.random() * zeichen.length)];
        if (z) z.bit ^= 1;
      }
    }
    const laenge = b + 2 * RAND;
    const k = (Math.PI * 2) / WELLE.laenge;
    const yAuf = (bahn: Bahn, x: number) => bahn.y + x * NEIGUNG + WELLE.hoehe * Math.sin(x * k + t * WELLE.tempo + bahn.phase);
    // Stand der Farbwelle: Front wandert von 0 bis 1 + Saum über die Bildhöhe
    let front = Infinity;
    if (welle) {
      const p = (performance.now() - welle.start) / welle.dauer;
      if (p >= 1) welle = null;
      else front = p * (1 + FARBWELLE.saum);
    }

    // Scroll-Impuls: Tempo messen; beim Scrollen alle 0,3 s (Handy 0,45 s) ein Impuls, Stärke nach Tempo
    if (!still && dt) {
      scrollTempo = scrollTempo * 0.6 + ((scrollY - scrollVorher) / dt) * 0.4;
      if (Math.abs(scrollTempo) > IMPULS.minTempo && t - letzterImpuls > (handy ? IMPULS.handyAbstand : IMPULS.abstand)) {
        letzterImpuls = t;
        impulse.push({ start: t, richtung: Math.sign(scrollTempo), staerke: Math.min(1, Math.max(0.15, Math.abs(scrollTempo) / IMPULS.vollesTempo)) });
      }
    }
    scrollVorher = scrollY;
    // Jeder Impuls: waagerechtes Lichtband, wandert in Scrollrichtung über die Bildhöhe und klingt in 0,8 s aus
    impulse = impulse.filter((i) => t - i.start < IMPULS.leben);
    const baender = impulse.map((i) => {
      const p = (t - i.start) / IMPULS.leben;
      const breite = (IMPULS.breite[0] + (IMPULS.breite[1] - IMPULS.breite[0]) * i.staerke) * (handy ? IMPULS.handyBreite : 1);
      const weg = -breite + p * (h + 2 * breite);
      return {
        y: i.richtung > 0 ? weg : h - weg,
        breite,
        spitze: (IMPULS.leuchten[0] + (IMPULS.leuchten[1] - IMPULS.leuchten[0]) * i.staerke) * (p < 0.1 ? p / 0.1 : (1 - p) ** 1.2),
      };
    });
    impulsZeichen = 0;
    const impulsBei = (y: number) => {
      let g = 0;
      for (const band of baender) {
        const d = Math.abs(y - band.y);
        if (d < band.breite) g = Math.max(g, band.spitze * (1 - d / band.breite) ** 2);
      }
      return g;
    };

    // Karten im Bild (mit Umlenk-Bereich); nur Zeichen in deren Nähe werden für Umlenkung und Rand gerechnet
    const vorlauf = handy ? KARTE.handyVorlauf : KARTE.vorlauf;
    const imBild = karten.filter((kt) => kt.y < h + KARTE.band && kt.y + kt.h > -KARTE.band && kt.x < b + vorlauf && kt.x + kt.b > -vorlauf);
    const nahe = still ? [] : imBild;
    // Kreuzt ein Scroll-Impuls eine Karte, blitzt ihr Rand auf (CSS-Animation über die Klasse .fluss-impuls, 0,7 s)
    for (const kt of nahe) {
      if (kt.el.classList.contains('fluss-impuls')) continue;
      if (baender.some((band) => band.spitze > 0.25 && band.y > kt.y - band.breite && band.y < kt.y + kt.h + band.breite)) {
        kt.el.classList.add('fluss-impuls');
        setTimeout(() => kt.el.classList.remove('fluss-impuls'), 700);
      }
    }
    /** Berührt das Zeichen (sichtbarer Teil des Kästchens) eine Karte? Dann wird es nicht gezeichnet: Karten bleiben frei */
    const inKarte = (x: number, y: number) =>
      imBild.some((kt) => x + ZEICHEN - 1 > kt.x && x + 1 < kt.x + kt.b && y + ZEILE - 5 > kt.y && y + 5 < kt.y + kt.h);

    /** Vorgezeichnete Zeichen für diese Stelle: Farbwelle (Abstand vom Startrand 0–1, links etwas früher; Stufe nach
     *  Abstand zur Front, leicht verwischt) */
    function saetze(x: number, y: number, r: number): [HTMLCanvasElement[], HTMLCanvasElement[]] {
      if (!welle) return [bilder, leuchten];
      const weg = (welle.vonUnten ? 1 - (y + ZEILE / 2) / h : (y + ZEILE / 2) / h) * (1 - FARBWELLE.quer) + FARBWELLE.quer * (x / b);
      const q = Math.min(1, Math.max(0, (front - weg) / FARBWELLE.saum + (r - 0.5) * 0.3));
      const stufe = Math.round(q * (FARBWELLE.stufen - 1));
      return [welle.bilder[stufe], welle.leuchten[stufe]];
    }

    /** Ein Zeichen des Stroms setzen: Farbwelle, Dämpfung hinter Text, Glimmer/Impuls mit Spur. spur(d) = Punkt d px
     *  weiter hinten. Karten bleiben frei (dort liegt das Randband auf der eigenen Fläche). */
    function setze(x: number, y: number, bit: number, r: number, a: number, glanz: number, spur: (d: number) => [number, number]) {
      const m = maskeBei(x + ZEICHEN / 2, y + ZEILE / 2);
      if (m === 3 || inKarte(x, y)) return;
      if (m) glanz = 0;
      if (m === 2) a = Math.min(a, HINTER_TEXT);
      const c = ctx!;
      const [satz, glanzSatz] = saetze(x, y, r);
      if (glanz > a && baender.length) impulsZeichen++;
      if (glanz > a) {
        // Spur hinter dem Zeichen, darüber das leuchtende Zeichen
        for (const [abstand, anteil] of NACHGLUEHEN) {
          const [sx, sy] = spur(abstand);
          c.globalAlpha = Math.max(a, glanz * anteil);
          c.drawImage(satz[bit], sx, sy, ZEICHEN, ZEILE);
        }
        c.globalAlpha = glanz;
        c.drawImage(glanzSatz[bit], x - 8, y - 8, ZEICHEN + 16, ZEILE + 16);
      } else {
        c.globalAlpha = a;
        c.drawImage(satz[bit], x, y, ZEICHEN, ZEILE);
      }
    }

    // ---------- Strom ----------
    for (const z of zeichen) {
      const bahn = bahnen[z.bahn];
      z.s = (z.s + bahn.tempo * dt) % laenge;
      let x = z.s - RAND;
      let y = yAuf(bahn, x);
      if (y < -ZEILE || y > h || x < -ZEICHEN || x > b) continue;
      let a = z.a;
      let glanz = 0;
      if (z.gStart >= 0) {
        const p = (t - z.gStart) / z.gDauer;
        if (p >= 1) z.gStart = -1;
        else glanz = z.gSpitze * (p < 0.12 ? p / 0.12 : (1 - (p - 0.12) / 0.88) ** 2);
      }
      // Umlenkung: trifft die Bahn eine Karte, weicht das Zeichen vor ihr nach oben oder unten in das Band am Rand aus
      // und kehrt hinter ihr zurück (bei mehreren Karten zählt die stärkste Umlenkung). Tiefere Bahnen tauchen weich ab.
      let dy = 0;
      let f = 0;
      const mx = x + ZEICHEN / 2;
      const my = y + ZEILE / 2;
      for (const kt of nahe) {
        if (mx < kt.x - vorlauf || mx > kt.x + kt.b + vorlauf || my < kt.y - KARTE.band || my > kt.y + kt.h + KARTE.band) continue;
        const fk = mx < kt.x ? glatt((mx - kt.x + vorlauf) / vorlauf) : mx > kt.x + kt.b ? glatt(1 - (mx - kt.x - kt.b) / vorlauf) : 1;
        if (fk <= f) continue;
        f = fk;
        const tiefe = Math.min(handy ? KARTE.handyTiefe : KARTE.tiefe, kt.h / 2);
        const enge = (KARTE.band - KARTE.luecke) / (KARTE.band + tiefe);
        const oben = kt.y;
        const unten = kt.y + kt.h;
        let ziel: number;
        let rand: number;
        if (my <= oben + tiefe && my < oben + kt.h / 2) [ziel, rand] = [oben - KARTE.band + (my - oben + KARTE.band) * enge, oben];
        else if (my >= unten - tiefe) [ziel, rand] = [unten + KARTE.band - (unten + KARTE.band - my) * enge, unten];
        else {
          // mitten in der Karte: abtauchen statt umlenken
          dy = 0;
          a *= 1 - fk;
          glanz *= 1 - fk;
          continue;
        }
        dy = (ziel - my) * fk;
        // im Band am Rand dichter und heller
        const nah = 1 - Math.min(1, Math.abs(ziel - rand) / KARTE.band);
        a = Math.max(a, a + (KARTE.saum - a) * fk * nah);
      }
      y += dy;
      glanz = Math.max(glanz, impulsBei(y + ZEILE / 2));
      setze(x, y, z.bit, z.r, a, glanz, (d) => [x - d, yAuf(bahn, x - d) + dy]);
    }

    // ---------- Randband: auf der Fläche über den Karten, genau auf der Kartenkante ----------
    // Jedes Zeichen liegt mit seiner Mitte auf der Kante (halb außen, halb im textfreien Innenrand) und ist entlang der
    // Kante gedreht: An den Ecken folgt das Band dem Bogen des border-radius. Leuchtende Zeichen (vorgezeichnet mit
    // Lichthof) machen das Band hell. Liegt Text in der Nähe (Prüfpunkt 7 px nach innen), entfällt das Zeichen.
    // Fläche nachrücken: PUFFER über dem Bild beginnen, nie über das Seitenende hinaus (sonst würde die Seite länger)
    const hoeheRand = h + 2 * PUFFER;
    if (rctx && !still) {
      const oben = Math.max(0, Math.min(Math.round(scrollY - PUFFER), document.documentElement.scrollHeight - hoeheRand));
      if (oben !== randOben) {
        randOben = oben;
        randLeinwand!.style.transform = `translate3d(0, ${oben}px, 0)`;
      }
    }
    // obere Kante der Fläche im Bild; gezeichnet wird weiter in Bild-Koordinaten (Verschiebung im Grund-Transform)
    const versatz = randOben - scrollY;
    const grund = () => rctx!.setTransform(dpr, 0, 0, dpr, 0, Math.round(-versatz * dpr));
    if (randGezeichnet) {
      rctx!.setTransform(1, 0, 0, 1, 0, 0);
      rctx!.clearRect(0, 0, randLeinwand!.width, randLeinwand!.height);
    }
    randGezeichnet = 0;
    if (rctx) grund();
    const amRand = still || !rctx ? [] : karten.filter((kt) => kt.y < versatz + hoeheRand + ZEILE && kt.y + kt.h > versatz - ZEILE && kt.x < b && kt.x + kt.b > 0);
    for (const kt of amRand) {
      for (const z of kt.rand) {
        const { laenge: weg } = haelfte(kt, z.o);
        z.s = (z.s + KARTE.tempo * dt) % weg;
        const [mx, my] = aufRand(kt, z.o, z.unten, z.s);
        if (my < versatz - ZEILE || my > versatz + hoeheRand + ZEILE || mx < -ZEICHEN || mx > b + ZEICHEN) continue;
        // Richtung der Kante an dieser Stelle (für die Drehung) und Richtung nach innen (für den Text-Prüfpunkt)
        const s0 = Math.min(z.s, weg - 1);
        const [ux, uy] = aufRand(kt, z.o, z.unten, s0);
        const [vx, vy] = aufRand(kt, z.o, z.unten, s0 + 1);
        let tx = vx - ux;
        let ty = vy - uy;
        const n = Math.hypot(tx, ty) || 1;
        tx /= n;
        ty /= n;
        const [ix, iy] = z.unten ? [ty, -tx] : [-ty, tx];
        if (maskeBei(mx + ix * KARTE.innen, my + iy * KARTE.innen) === 2 || maskeBei(mx, my) === 2) continue;
        // an den Enden (Mitte der Seitenkanten) weich ineinander übergehen
        const ende = Math.min(1, z.s / 24, (weg - z.s) / 24);
        const glanz = Math.min(1, impulsBei(my) * IMPULS.karte);
        const a = Math.min(1, Math.max(z.a, z.a * 0.6 + glanz)) * (0.35 + 0.65 * ende);
        if (glanz > 0.25 && baender.length) impulsZeichen++;
        const [, glanzSatz] = saetze(mx - ZEICHEN / 2, my - ZEILE / 2, z.r);
        const bild = glanzSatz[z.bit];
        const [w, hb] = [ZEICHEN + 16, ZEILE + 16];
        const pix = (v: number) => Math.round(v * dpr) / dpr;
        rctx!.globalAlpha = a;
        if (Math.abs(tx) > 0.999) rctx!.drawImage(bild, pix(mx - w / 2), pix(my - hb / 2), w, hb);
        else if (Math.abs(ty) > 0.999) rctx!.drawImage(drehe(bild, ty > 0), pix(mx - hb / 2), pix(my - w / 2), hb, w);
        else {
          // im Eckbogen: entlang des Bogens gedreht
          rctx!.setTransform(dpr * tx, dpr * ty, -dpr * ty, dpr * tx, mx * dpr, (my - versatz) * dpr);
          rctx!.drawImage(bild, -w / 2, -hb / 2, w, hb);
          grund();
        }
        randGezeichnet++;
      }
    }
  }

  // ---------- Takt, Pausen ----------
  let sichtbar = true;
  let laeuft = false;
  let letztes = 0;
  /** Nur für Prüfungen: gezeichnete Bilder seit dem Start (Bildrate messen) */
  let bilderGezaehlt = 0;
  function bild(jetzt: number) {
    if (!laeuft) return;
    requestAnimationFrame(bild);
    if (jetzt - letztes < BILD_MS - 2) return;
    const dt = letztes ? Math.min(0.1, (jetzt - letztes) / 1000) : 0;
    letztes = jetzt;
    t += dt;
    bilderGezaehlt++;
    zeichne(dt);
  }
  let neuZeichnen = 0;
  function auffrischen() {
    if (still) {
      if (!sichtbar || neuZeichnen) return;
      neuZeichnen = requestAnimationFrame(() => {
        neuZeichnen = 0;
        zeichne(0);
      });
      return;
    }
    const soll = sichtbar && !document.hidden;
    if (soll === laeuft) return;
    laeuft = soll;
    letztes = 0;
    if (laeuft) requestAnimationFrame(bild);
  }

  aufbauen();
  // Schrift (selbst ausgeliefert) laden; ist sie da, die vorgezeichneten Zeichen neu anlegen
  document.fonts?.load(schrift).then(() => {
    farbe = '';
    if (still) auffrischen();
  });
  new IntersectionObserver(([e]) => {
    sichtbar = e.isIntersecting;
    auffrischen();
  }).observe(leinwand);
  document.addEventListener('visibilitychange', auffrischen);
  // Größe: nur bei echter Änderung neu aufbauen (die Höhe ist 100lvh, die Adressleiste am Handy ändert sie nicht)
  new ResizeObserver(() => {
    const r = leinwand.getBoundingClientRect();
    if (Math.round(r.width) === b && Math.round(r.height) === h) return;
    aufbauen();
    farbe = '';
    if (still) auffrischen();
  }).observe(leinwand);
  new MutationObserver((aenderungen) => {
    farbeLesenBis = performance.now() + 1400;
    if (aenderungen.some((a) => a.attributeName === 'data-welt')) starteWelle();
    if (still) auffrischen();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-welt', 'data-stufe'] });
  if (still) addEventListener('scroll', auffrischen, { passive: true });
  // Nach dem Start einmal 1,4 s lang lesen (falls gerade ein Wechsel läuft), danach nur noch bei Wechseln
  farbeLesenBis = performance.now() + 1400;
  auffrischen();

  // Nur für Prüfungen
  (window as unknown as { binaerstrom: object }).binaerstrom = {
    stand: () => ({
      zeichen: zeichen.length,
      bahnen: bahnen.length,
      groesse: [leinwand.width, leinwand.height],
      farbe,
      laeuft,
      still,
      welle: welle && { fortschritt: Math.min(1, (performance.now() - welle.start) / welle.dauer), vonUnten: welle.vonUnten },
      impulse: impulse.length,
      impulsZeichen,
      karten: karten.length,
      randFlaeche: randLeinwand ? [randLeinwand.width, randLeinwand.height] : null,
      randGezeichnet,
      bilder: bilderGezaehlt,
      randzeichen: karten.reduce((n, kt) => n + kt.rand.length, 0),
    }),
  };
}
