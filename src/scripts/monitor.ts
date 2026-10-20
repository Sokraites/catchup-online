/**
 * Monitor-Zeitreise (Entwurf).
 *
 * Idee: Die Abschnitte der Startseite laufen über einen Monitor. Innerhalb eines Abschnitts
 * scrollt der Inhalt ganz normal (1:1 mit dem Finger bzw. Mausrad). Am Ende eines Abschnitts
 * dreht sich der Bildschirm wie ein Rad zum nächsten, und der Monitor wird eine Epoche moderner.
 *
 * Grundsätze:
 * - Der Inhalt bleibt normales HTML. Ohne JavaScript oder bei reduzierter Bewegung passiert nichts.
 * - Gescrollt wird mit dem normalen Seiten-Scroll, nichts wird festgehalten.
 * - Bewegt werden nur transform und opacity.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Epoche = {
  /** Nur zur Orientierung im Code, wird nicht angezeigt. */
  name: string;
  /** Rahmenbreite, Kinn (untere Gehäusekante), Deckel (Gehäusetiefe), Hals und Sockel in Pixeln (Desktop). */
  rand: number;
  kinn: number;
  deckel: number;
  halsH: number;
  halsB: string;
  sockelB: string;
  sockelH: number;
  randFarbe: string;
  fussFarbe: string;
  schirmRadius: number;
  /** 0 bis 1: Knöpfe, Betriebslämpchen, Glaswölbung mit Bildzeilen, Schattentiefe, lila Leuchten. */
  knoepfe: number;
  led: number;
  woelbung: number;
  tiefe: number;
  leuchten: number;
};

/** Eine Epoche pro Abschnitt. Der letzte Wert gilt für alle weiteren. Die Browserleiste wechselt mit (data-epoche). */
const EPOCHEN: Epoche[] = [
  { name: 'Großer Röhrenmonitor', rand: 46, kinn: 34, deckel: 30, halsH: 0, halsB: '0%', sockelB: '55%', sockelH: 18, randFarbe: '#d6cdb4', fussFarbe: '#c4bba2', schirmRadius: 34, knoepfe: 1, led: 1, woelbung: 1, tiefe: 1, leuchten: 0 },
  { name: 'Kleinerer Röhrenmonitor', rand: 34, kinn: 26, deckel: 20, halsH: 0, halsB: '0%', sockelB: '42%', sockelH: 14, randFarbe: '#cbc7bd', fussFarbe: '#b9b5aa', schirmRadius: 22, knoepfe: 1, led: 1, woelbung: 0.75, tiefe: 0.8, leuchten: 0 },
  { name: 'Flachbildschirm', rand: 24, kinn: 20, deckel: 5, halsH: 34, halsB: '9%', sockelB: '34%', sockelH: 10, randFarbe: '#a9adb5', fussFarbe: '#9ba0a8', schirmRadius: 3, knoepfe: 0.6, led: 1, woelbung: 0.12, tiefe: 0.4, leuchten: 0 },
  { name: 'Breitbild', rand: 18, kinn: 14, deckel: 3, halsH: 44, halsB: '7%', sockelB: '30%', sockelH: 8, randFarbe: '#121216', fussFarbe: '#1d1d23', schirmRadius: 2, knoepfe: 0, led: 1, woelbung: 0.06, tiefe: 0.3, leuchten: 0 },
  { name: 'Schmaler Rand', rand: 8, kinn: 12, deckel: 0, halsH: 52, halsB: '6%', sockelB: '26%', sockelH: 6, randFarbe: '#1c1c22', fussFarbe: '#b8bcc4', schirmRadius: 4, knoepfe: 0, led: 0.6, woelbung: 0.03, tiefe: 0.2, leuchten: 0.2 },
  { name: 'Heute, randlos', rand: 0, kinn: 0, deckel: 0, halsH: 0, halsB: '0%', sockelB: '0%', sockelH: 0, randFarbe: '#1c1c22', fussFarbe: '#b8bcc4', schirmRadius: 16, knoepfe: 0, led: 0, woelbung: 0, tiefe: 0, leuchten: 1 },
];

/** Anteil der Bildschirmhöhe, den eine Raddrehung an Scrollweg braucht. */
const DREH_WEG = 0.7;
const DREH_WINKEL = 72;

export function starteMonitor() {
  const buehne = document.querySelector<HTMLElement>('[data-monitor]');
  if (!buehne) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const html = document.documentElement;
  const kopf = document.querySelector<HTMLElement>('.site-header')!;
  const geraet = buehne.querySelector<HTMLElement>('.monitor-geraet')!;
  const schirm = buehne.querySelector<HTMLElement>('.monitor-schirm')!;
  const monitor = buehne.querySelector<HTMLElement>('.monitor')!;
  const flaeche = buehne.querySelector<HTMLElement>('.monitor-flaeche')!;
  const seiten = [...flaeche.children].filter((e): e is HTMLElement => e.tagName === 'SECTION');

  html.classList.add('monitor-an');

  let tl: gsap.core.Timeline | null = null;
  let starts: number[] = []; // Scrollposition (relativ), an der Abschnitt i beginnt
  let innen: number[] = []; // Scrollweg innerhalb von Abschnitt i
  let breiteZuletzt = 0;
  let aktiv = 0;

  /** Scrollposition, an der das Rad beginnt (Bühne stößt an die Kopfleiste). */
  const buehnenStart = () => buehne!.getBoundingClientRect().top + scrollY - kopf.offsetHeight;

  const randFaktor = () => (innerWidth < 600 ? 0.35 : innerWidth < 1000 ? 0.7 : 1);
  const kinnFaktor = () => (innerWidth < 600 ? 0.6 : innerWidth < 1000 ? 0.8 : 1);
  /** Auf dem Handy kein Standfuß (siehe monitor.css). */
  const mitFuss = () => innerWidth >= 600;

  function epoche(i: number) {
    const e = EPOCHEN[Math.min(i, EPOCHEN.length - 1)];
    const f = randFaktor();
    const k = kinnFaktor();
    return {
      '--rand': `${e.rand * f}px`,
      '--kinn': `${e.kinn * k}px`,
      '--hals-h': `${e.halsH * k}px`,
      '--hals-b': e.halsB,
      '--sockel-b': e.sockelB,
      '--sockel-h': `${e.sockelH * k}px`,
      '--deckel': `${e.deckel * k}px`,
      '--rand-farbe': e.randFarbe,
      '--fuss-farbe': e.fussFarbe,
      '--schirm-radius': `${e.schirmRadius * Math.max(f, 0.5)}px`,
      '--knoepfe': e.knoepfe,
      '--led': e.led,
      '--woelbung': e.woelbung,
      '--tiefe': e.tiefe,
      '--leuchten': e.leuchten,
    };
  }

  function setzeAktiv(i: number) {
    aktiv = i;
    const e = String(Math.min(i, EPOCHEN.length - 1));
    if (geraet.dataset.epoche !== e) geraet.dataset.epoche = e;
  }

  function baue() {
    const relVorher = scrollY - buehnenStart();
    const abschnittVorher = aktiv;
    const versatzVorher = relVorher - (starts[abschnittVorher] ?? 0);

    tl?.scrollTrigger?.kill();
    tl?.kill();

    const kopfH = kopf.offsetHeight;
    html.style.setProperty('--kopf', `${kopfH}px`);

    // Größe des Bildschirms: so groß wie möglich, mit Platz für den dicksten Rand.
    const f = randFaktor();
    const maxRand = Math.max(...EPOCHEN.map((e) => e.rand)) * f;
    const maxKinn = Math.max(...EPOCHEN.map((e) => e.kinn)) * kinnFaktor();
    const maxFuss = mitFuss() ? Math.max(...EPOCHEN.map((e) => e.halsH + e.sockelH)) * kinnFaktor() : 0;
    const maxDeckel = Math.max(...EPOCHEN.map((e) => e.deckel)) * kinnFaktor();
    const luft = innerWidth < 600 ? 10 : 40;
    const verfuegbarH = innerHeight - kopfH;
    const b = Math.min(1200, innerWidth - 2 * (maxRand + luft));
    const h = verfuegbarH - 2 * maxRand - maxKinn - maxFuss - maxDeckel - (innerWidth < 600 ? 24 : 48);
    geraet.style.setProperty('--kinn-max', `${maxKinn}px`);
    geraet.style.setProperty('--deckel-max', `${maxDeckel}px`);
    geraet.style.setProperty('--fuss-max', `${maxFuss}px`);
    geraet.style.setProperty('--schirm-b', `${b}px`);
    geraet.style.setProperty('--schirm-h', `${h}px`);
    gsap.set(geraet, epoche(0));

    // Sichtbare Höhe für den Inhalt: Bildschirm minus Browserleiste.
    const hInhalt = flaeche.clientHeight || h;
    const dreh = Math.round(hInhalt * DREH_WEG);
    starts = [];
    innen = [];
    let pos = 0;

    tl = gsap.timeline({ defaults: { ease: 'none' } });
    seiten.forEach((seite, i) => {
      const inhalt = seite.firstElementChild as HTMLElement;
      gsap.set(seite, { transformOrigin: `50% 50% ${-hInhalt / 2}px`, rotateX: 0, opacity: i === 0 ? 1 : 0 });
      gsap.set(inhalt, { y: 0 });
      const weg = Math.max(0, inhalt.offsetHeight - hInhalt);
      starts.push(pos);
      innen.push(weg);
      if (weg > 0) tl!.to(inhalt, { y: -weg, duration: weg }, pos);
      pos += weg;
      const naechste = seiten[i + 1];
      if (naechste) {
        tl!.to(seite, { rotateX: DREH_WINKEL, opacity: 0, duration: dreh }, pos);
        tl!.fromTo(naechste, { rotateX: -DREH_WINKEL, opacity: 0 }, { rotateX: 0, opacity: 1, duration: dreh }, pos);
        tl!.to(geraet, { ...epoche(i + 1), duration: dreh }, pos);
        pos += dreh;
      }
    });
    tl.fromTo(monitor, { '--tipp': 1 }, { '--tipp': 0, duration: Math.min(200, pos) }, 0);

    const gesamt = pos;
    buehne!.style.height = `${gesamt + verfuegbarH}px`;

    // Abschnitt, der bei einer Scrollposition zu sehen ist (Hälfte der Drehung entscheidet).
    const abschnittBei = (rel: number) => {
      let i = 0;
      for (let n = 1; n < starts.length; n++) if (rel >= starts[n] - dreh / 2) i = n;
      return i;
    };

    ScrollTrigger.create({
      animation: tl,
      trigger: buehne,
      start: () => `top ${kopfH}px`,
      end: () => `+=${gesamt}`,
      scrub: true,
      onUpdate: (st) => setzeAktiv(abschnittBei(st.progress * gesamt)),
      // Nie mitten in einer Drehung stehen bleiben, beim Lesen aber nie springen.
      snap: {
        // GSAP übergibt eine aus der Wischgeschwindigkeit hochgerechnete Zielposition.
        // Wir rechnen bewusst mit der echten Position, damit es nie weit springt.
        snapTo: (p, st) => {
          const echt = st ? st.progress : p;
          const rel = echt * gesamt;
          for (let n = 1; n < starts.length; n++) {
            const ende = starts[n];
            const anfang = ende - dreh;
            if (rel > anfang && rel < ende) {
              const richtung = st?.direction ?? 1;
              const ziel = richtung > 0 ? (rel - anfang > dreh * 0.15 ? ende : anfang) : (ende - rel > dreh * 0.15 ? anfang : ende);
              return ziel / gesamt;
            }
          }
          return echt;
        },
        duration: { min: 0.2, max: 0.45 },
        delay: 0.08,
        ease: 'power2.out',
      },
    });

    setzeAktiv(abschnittBei(Math.max(0, relVorher)));

    // Nach einem Neuaufbau (z. B. Frage aufgeklappt) an derselben Stelle bleiben.
    if (relVorher > 0 && starts.length) {
      const ziel = buehnenStart() + starts[abschnittVorher] + Math.min(Math.max(0, versatzVorher), innen[abschnittVorher]);
      scrollTo({ top: ziel, behavior: 'instant' as ScrollBehavior });
    }
    ScrollTrigger.refresh();
    // Die Kacheln richten ihr Raster am Bildschirm des Monitors aus.
    dispatchEvent(new Event('monitor-gebaut'));
  }

  /** Scrollt so, dass ein Abschnitt (und optional ein Element darin) sichtbar ist. */
  function zeige(i: number, element?: HTMLElement) {
    const start = buehnenStart();
    let versatz = 0;
    if (element) {
      const inhalt = seiten[i].firstElementChild as HTMLElement;
      const oben = element.getBoundingClientRect().top - inhalt.getBoundingClientRect().top;
      versatz = Math.min(Math.max(0, oben - 80), innen[i]);
    }
    scrollTo({ top: start + starts[i] + versatz, behavior: 'instant' as ScrollBehavior });
  }

  // Interne Sprungmarken (#leistungen usw.) führen zur passenden Stelle im Rad.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const ziel = document.getElementById(a.hash.slice(1));
    const i = seiten.findIndex((s) => s === ziel || s.contains(ziel));
    if (i < 0) return;
    e.preventDefault();
    zeige(i);
    history.replaceState(null, '', a.hash);
  });

  // Tastatur: Fokus in einem anderen Abschnitt holt diesen Abschnitt nach vorne.
  schirm.addEventListener('focusin', (e) => {
    const el = e.target as HTMLElement;
    const i = seiten.findIndex((s) => s.contains(el));
    if (i >= 0) zeige(i, el);
  });

  // Aufgeklappte Fragen verändern die Länge: neu berechnen.
  schirm.addEventListener('toggle', () => baue(), true);

  // Nur bei Breitenänderung neu bauen (die Adressleiste auf dem Handy ändert nur die Höhe).
  let zeitgeber = 0;
  addEventListener('resize', () => {
    if (innerWidth === breiteZuletzt) return;
    clearTimeout(zeitgeber);
    zeitgeber = window.setTimeout(() => {
      breiteZuletzt = innerWidth;
      baue();
    }, 150);
  });

  breiteZuletzt = innerWidth;
  // Erst bauen, wenn die Schriften da sind, sonst stimmen die Höhen nicht.
  document.fonts.ready.then(baue);
  baue();
}
