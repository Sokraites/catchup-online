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
  jahr: string;
  rand: number;
  randFarbe: string;
  randRadius: number;
  schirmRadius: number;
  scan: number;
  leuchten: number;
  jahrSichtbar: number;
  jahrFarbe: string;
};

/** Eine Epoche pro Abschnitt. Der letzte Wert gilt für alle weiteren. */
const EPOCHEN: Epoche[] = [
  { jahr: '1995 · Röhrenmonitor', rand: 40, randFarbe: '#cfc6b0', randRadius: 22, schirmRadius: 26, scan: 0.35, leuchten: 0, jahrSichtbar: 1, jahrFarbe: '#3a3528' },
  { jahr: '2003 · Flachbildschirm', rand: 30, randFarbe: '#bdb8ad', randRadius: 10, schirmRadius: 3, scan: 0.08, leuchten: 0, jahrSichtbar: 1, jahrFarbe: '#37342d' },
  { jahr: '2009 · Breitbild', rand: 24, randFarbe: '#18181d', randRadius: 14, schirmRadius: 2, scan: 0, leuchten: 0, jahrSichtbar: 1, jahrFarbe: '#b4b2c6' },
  { jahr: '2015 · Schmaler Rand', rand: 14, randFarbe: '#2b2b35', randRadius: 10, schirmRadius: 2, scan: 0, leuchten: 0, jahrSichtbar: 1, jahrFarbe: '#b4b2c6' },
  { jahr: '2020 · Fast randlos', rand: 6, randFarbe: '#22222c', randRadius: 12, schirmRadius: 10, scan: 0, leuchten: 0.3, jahrSichtbar: 0, jahrFarbe: '#b4b2c6' },
  { jahr: 'Heute', rand: 0, randFarbe: '#22222c', randRadius: 16, schirmRadius: 16, scan: 0, leuchten: 1, jahrSichtbar: 0, jahrFarbe: '#b4b2c6' },
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
  const jahr = buehne.querySelector<HTMLElement>('.monitor-jahr')!;
  const monitor = buehne.querySelector<HTMLElement>('.monitor')!;
  const seiten = [...schirm.children].filter((e): e is HTMLElement => e.tagName === 'SECTION');

  html.classList.add('monitor-an');

  let tl: gsap.core.Timeline | null = null;
  let starts: number[] = []; // Scrollposition (relativ), an der Abschnitt i beginnt
  let innen: number[] = []; // Scrollweg innerhalb von Abschnitt i
  let breiteZuletzt = 0;
  let aktiv = 0;

  /** Scrollposition, an der das Rad beginnt (Bühne stößt an die Kopfleiste). */
  const buehnenStart = () => buehne!.getBoundingClientRect().top + scrollY - kopf.offsetHeight;

  const randFaktor = () => (innerWidth < 600 ? 0.35 : innerWidth < 1000 ? 0.7 : 1);

  function epoche(i: number) {
    const e = EPOCHEN[Math.min(i, EPOCHEN.length - 1)];
    const f = randFaktor();
    return {
      '--rand': `${e.rand * f}px`,
      '--rand-farbe': e.randFarbe,
      '--rand-radius': `${e.randRadius}px`,
      '--schirm-radius': `${e.schirmRadius * Math.max(f, 0.5)}px`,
      '--scan': e.scan,
      '--leuchten': e.leuchten,
      '--jahr-sichtbar': e.jahrSichtbar,
      '--jahr-farbe': e.jahrFarbe,
    };
  }

  function setzeAktiv(i: number) {
    if (i === aktiv && jahr.textContent) return;
    aktiv = i;
    jahr.textContent = EPOCHEN[Math.min(i, EPOCHEN.length - 1)].jahr;
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
    const maxRand = EPOCHEN[0].rand * f;
    const luft = innerWidth < 600 ? 10 : 40;
    const verfuegbarH = innerHeight - kopfH;
    const b = Math.min(1200, innerWidth - 2 * (maxRand + luft));
    const h = verfuegbarH - 2 * maxRand - (innerWidth < 600 ? 34 : 70);
    geraet.style.setProperty('--schirm-b', `${b}px`);
    geraet.style.setProperty('--schirm-h', `${h}px`);
    gsap.set(geraet, epoche(0));

    const dreh = Math.round(h * DREH_WEG);
    starts = [];
    innen = [];
    let pos = 0;

    tl = gsap.timeline({ defaults: { ease: 'none' } });
    seiten.forEach((seite, i) => {
      const inhalt = seite.firstElementChild as HTMLElement;
      gsap.set(seite, { transformOrigin: `50% 50% ${-h / 2}px`, rotateX: 0, opacity: i === 0 ? 1 : 0 });
      gsap.set(inhalt, { y: 0 });
      const weg = Math.max(0, inhalt.offsetHeight - h);
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
