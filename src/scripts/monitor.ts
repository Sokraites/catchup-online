/**
 * Monitor-Zeitreise (Entwurf).
 *
 * Idee: Die Abschnitte der Startseite laufen über einen Monitor. Innerhalb eines Abschnitts
 * scrollt der Inhalt ganz normal (1:1 mit dem Finger bzw. Mausrad). Am Ende eines Abschnitts
 * dreht sich der Bildschirm wie ein Rad zum nächsten, und der Monitor wird eine Epoche moderner.
 * Auf dem Handy wird der Bildschirm beim Wechsel kurz zum Querformat: Dann sieht man das ganze Gerät.
 *
 * Grundsätze:
 * - Der Inhalt bleibt normales HTML. Ohne JavaScript oder bei reduzierter Bewegung passiert nichts.
 * - Gescrollt wird mit dem normalen Seiten-Scroll, nichts wird festgehalten.
 * - Bewegt werden fast nur transform und opacity; die Gehäuse sind fertige Bilder.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import konfig from '../config/monitore.json';
import bilder from '../config/monitore-bilder.json';

gsap.registerPlugin(ScrollTrigger);

const EPOCHEN = konfig.epochen;
const FUSS = bilder as Record<string, { b: number; h: number }>;

/** Anteil der Bildschirmhöhe, den eine Raddrehung an Scrollweg braucht. */
const DREH_WEG = 0.8;
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
  const gehaeuse = new Map([...buehne.querySelectorAll<HTMLElement>('.mg')].map((el) => [Number(el.dataset.mg), el]));

  html.classList.add('monitor-an');

  let tl: gsap.core.Timeline | null = null;
  let starts: number[] = []; // Scrollposition (relativ), an der Abschnitt i zu lesen beginnt
  let innen: number[] = []; // Scrollweg innerhalb von Abschnitt i
  let breiteZuletzt = 0;
  let aktiv = 0;
  let massstab = 0.62;

  /** Scrollposition, an der das Rad beginnt (Bühne stößt an die Kopfleiste). */
  const buehnenStart = () => buehne!.getBoundingClientRect().top + scrollY - kopf.offsetHeight;
  const handy = () => innerWidth < 600;

  function setzeAktiv(i: number) {
    aktiv = i;
    // Nur der sichtbare Abschnitt nimmt Klicks an (die anderen liegen unsichtbar darüber oder darunter).
    seiten.forEach((s, n) => s.classList.toggle('monitor-aktiv', n === i));
    const n = Math.min(i, EPOCHEN.length - 1);
    const e = String(n);
    if (geraet.dataset.epoche !== e) {
      geraet.dataset.epoche = e;
      // Bildschirmecken passend zum Loch im Gehäuse
      geraet.style.setProperty('--schirm-radius', `${(EPOCHEN[n].radiusLoch ?? 20) * massstab}px`);
    }
  }

  /** Platz, den Gehäuse (Rahmen oben/unten, Deckel, Fuß) bei Maßstab m höchstens braucht. */
  function gehaeuseHoehe(m: number) {
    return Math.max(
      ...EPOCHEN.map((e, i) => {
        const fuss = FUSS[`fuss-${i}`]?.h ?? 0;
        return (e.oben + e.rand + e.kinn + fuss + (e.deckel ?? 0) * 64) * m;
      }),
    );
  }

  function baue() {
    const relVorher = scrollY - buehnenStart();
    const abschnittVorher = aktiv;
    const versatzVorher = relVorher - (starts[abschnittVorher] ?? 0);

    tl?.scrollTrigger?.kill();
    tl?.kill();

    const kopfH = kopf.offsetHeight;
    html.style.setProperty('--kopf', `${kopfH}px`);
    const verfuegbarH = innerHeight - kopfH;

    // Maßstab des Gehäuses und Größe des Bildschirms
    const m = handy() ? 0.34 : innerWidth < 1000 ? 0.5 : 0.62;
    const randMax = Math.max(...EPOCHEN.map((e) => e.rand)) * m;
    const luft = handy() ? 6 : 40;
    const b = Math.min(1100, innerWidth - 2 * (randMax + luft), handy() ? Infinity : (verfuegbarH - gehaeuseHoehe(m)) * 1.7);
    const hLesen = Math.max(260, verfuegbarH - gehaeuseHoehe(m) - (handy() ? 10 : 24));
    // Querformat wie ein echter Monitor (nur Handy, zum Auftakt)
    const hQuer = Math.min(hLesen, Math.round(b * 0.78));
    const mitQuer = handy() && hQuer < hLesen - 40;

    massstab = m;
    // Platz über und unter dem Bildschirm, damit das ganze Gerät (mit Deckel und Fuß) mittig steht
    const oben = Math.max(...EPOCHEN.map((e) => e.oben + (e.deckel ?? 0) * 64)) * m;
    const unten = Math.max(...EPOCHEN.map((e, i) => e.rand + e.kinn + (FUSS[`fuss-${i}`]?.h ?? 0))) * m;
    geraet.style.marginTop = `${oben}px`;
    geraet.style.marginBottom = `${unten}px`;
    delete geraet.dataset.epoche;
    geraet.style.setProperty('--m', String(m));
    geraet.style.setProperty('--schirm-b', `${b}px`);
    gsap.set(geraet, { '--schirm-h': `${hLesen}px`, scale: 1, '--woelbung': EPOCHEN[0].woelbung, '--leuchten': 0 });
    gehaeuse.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0 }));

    // Sichtbare Höhe für den Inhalt im Lesezustand: Bildschirm minus Browserleiste.
    const hInhalt = flaeche.clientHeight || hLesen;
    const dreh = Math.round(hInhalt * DREH_WEG);
    starts = [];
    innen = [];
    let pos = 0;

    tl = gsap.timeline({ defaults: { ease: 'none' } });

    // Auftakt auf dem Handy: erst der ganze Monitor im Querformat, beim ersten Scrollen wird er zum Lesebildschirm.
    if (mitQuer) {
      const auftakt = Math.round(hLesen * 0.35);
      tl.fromTo(geraet, { '--schirm-h': `${hQuer}px` }, { '--schirm-h': `${hLesen}px`, duration: auftakt, ease: 'power1.inOut' }, 0);
      pos += auftakt;
    }

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
        const e = Math.min(i + 1, EPOCHEN.length - 1);
        tl!.to(seite, { rotateX: DREH_WINKEL, opacity: 0, duration: dreh }, pos);
        tl!.fromTo(naechste, { rotateX: -DREH_WINKEL, opacity: 0 }, { rotateX: 0, opacity: 1, duration: dreh }, pos);
        // Gehäuse überblenden
        const alt = gehaeuse.get(Math.min(i, EPOCHEN.length - 1));
        const neu = gehaeuse.get(e);
        if (alt && alt !== neu) tl!.to(alt, { opacity: 0, duration: dreh * 0.5 }, pos + dreh * 0.25);
        if (neu && alt !== neu) tl!.to(neu, { opacity: 1, duration: dreh * 0.5 }, pos + dreh * 0.25);
        tl!.to(geraet, { '--woelbung': EPOCHEN[e].woelbung ?? 0, '--leuchten': e === EPOCHEN.length - 1 ? 1 : 0, duration: dreh }, pos);
        // Der Monitor selbst steht ruhig: Es dreht sich nur der Inhalt, das Gehäuse blendet über.
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

    // Bereiche, in denen nicht gelesen wird (Auftakt und Drehungen): dort nie stehen bleiben.
    const zwischen: [number, number][] = [];
    if (mitQuer) zwischen.push([0, starts[0]]);
    for (let n = 1; n < starts.length; n++) zwischen.push([starts[n] - dreh, starts[n]]);

    ScrollTrigger.create({
      animation: tl,
      trigger: buehne,
      start: () => `top ${kopfH}px`,
      end: () => `+=${gesamt}`,
      scrub: true,
      onUpdate: (st) => setzeAktiv(abschnittBei(st.progress * gesamt)),
      snap: {
        // GSAP übergibt eine aus der Wischgeschwindigkeit hochgerechnete Zielposition.
        // Wir rechnen bewusst mit der echten Position, damit es nie weit springt.
        snapTo: (p, st) => {
          const echt = st ? st.progress : p;
          const rel = echt * gesamt;
          for (const [anfang, ende] of zwischen) {
            if (rel > anfang && rel < ende) {
              const laenge = ende - anfang;
              const richtung = st?.direction ?? 1;
              const ziel = richtung > 0 ? (rel - anfang > laenge * 0.15 ? ende : anfang) : (ende - rel > laenge * 0.15 ? anfang : ende);
              return ziel / gesamt;
            }
          }
          return echt;
        },
        duration: { min: 0.2, max: 0.5 },
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
    let versatz = 0;
    if (element) {
      const inhalt = seiten[i].firstElementChild as HTMLElement;
      const oben = element.getBoundingClientRect().top - inhalt.getBoundingClientRect().top;
      versatz = Math.min(Math.max(0, oben - 80), innen[i]);
    }
    scrollTo({ top: buehnenStart() + starts[i] + versatz, behavior: 'instant' as ScrollBehavior });
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
    // Nur bei Tastatur-Fokus springen, nicht wenn jemand mit Maus oder Finger klickt
    if (!el.matches(':focus-visible')) return;
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
