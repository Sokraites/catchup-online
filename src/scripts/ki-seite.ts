/**
 * KI-Mitarbeiter-Seite: Stufen-Spur und lebendige 3D-Figuren.
 *
 * - Handy und Tablet: Die Spur wird seitlich gewischt (normales Scrollen mit Einrasten, geht auch ohne Skript).
 * - Desktop mit Maus: Beim normalen Scrollen nach unten laufen die Stufen von rechts herein.
 * - Pfeile und Punkte springen zu einer Stufe, auch per Tastatur.
 * - Die 3D-Figuren (Three.js) werden erst geladen, wenn die Stufen in Sichtweite kommen.
 *   Bis dahin, ohne 3D-Unterstützung oder bei reduzierter Bewegung bleibt das Standbild stehen.
 */
import type { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * @param wurzel Wo die Stufen liegen (Standard: ganze Seite).
 * @param eingebettet true, wenn die Seite in einem Tab im Monitor steckt: dann immer wischen/blättern, nie anheften.
 */
export function starteKiSeite(wurzel: ParentNode = document, eingebettet = false) {
  const bereich = wurzel.querySelector<HTMLElement>('[data-stufen]');
  if (!bereich) return;
  const spur = bereich.querySelector<HTMLElement>('.stufen-spur')!;
  const stufen = [...spur.querySelectorAll<HTMLElement>('.stufe')];
  const punkte = [...bereich.querySelectorAll<HTMLButtonElement>('[data-stufe-punkt]')];
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gekoppelt = !eingebettet && !ruhig && matchMedia('(pointer: fine) and (min-width: 960px)').matches;
  let aktiv = 0;
  let st: ScrollTrigger | null = null;

  function markiere(i: number) {
    aktiv = Math.max(0, Math.min(stufen.length - 1, i));
    punkte.forEach((p, n) => p.setAttribute('aria-current', String(n === aktiv)));
  }

  function gehe(i: number) {
    i = Math.max(0, Math.min(stufen.length - 1, i));
    if (st) {
      scrollTo({
        top: st.start + (st.end - st.start) * (i / (stufen.length - 1)),
        behavior: ruhig ? 'auto' : 'smooth',
      });
    } else {
      const ziel = stufen[i];
      spur.scrollTo({
        left: ziel.offsetLeft - (spur.clientWidth - ziel.clientWidth) / 2,
        behavior: ruhig ? 'auto' : 'smooth',
      });
    }
    markiere(i);
  }

  punkte.forEach((p, i) => p.addEventListener('click', () => gehe(i)));
  bereich.querySelector('[data-stufe-zurueck]')?.addEventListener('click', () => gehe(aktiv - 1));
  bereich.querySelector('[data-stufe-weiter]')?.addEventListener('click', () => gehe(aktiv + 1));

  if (gekoppelt) {
    // Desktop: Seiten-Scroll schiebt die Spur seitlich, solange der Bereich oben angeheftet ist.
    // Die Scroll-Bibliothek wird nur am Desktop geladen, wo sie gebraucht wird.
    bereich.classList.add('stufen-gekoppelt');
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      const weg = () => Math.max(0, spur.scrollWidth - spur.clientWidth);
      const tween = gsap.to(spur, { x: () => -weg(), ease: 'none' });
      st = ScrollTrigger.create({
        animation: tween,
        trigger: bereich,
        // Passt der Bereich nicht ganz auf den Bildschirm, wird erst angeheftet, wenn sein Ende sichtbar ist.
        start: () => (bereich.offsetHeight > innerHeight ? 'bottom bottom' : 'top top'),
        end: () => `+=${weg()}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (s) => markiere(Math.round(s.progress * (stufen.length - 1))),
        snap: {
          snapTo: 1 / (stufen.length - 1),
          duration: { min: 0.2, max: 0.5 },
          delay: 0.1,
          ease: 'power2.out',
        },
      });
    });
  } else {
    // Handy und Tablet: Wischen; aktive Stufe aus der Scrollposition der Spur.
    let geplant = false;
    spur.addEventListener(
      'scroll',
      () => {
        if (geplant) return;
        geplant = true;
        requestAnimationFrame(() => {
          geplant = false;
          const mitte = spur.scrollLeft + spur.clientWidth / 2;
          let beste = 0;
          stufen.forEach((s, i) => {
            if (
              Math.abs(s.offsetLeft + s.clientWidth / 2 - mitte) <
              Math.abs(stufen[beste].offsetLeft + stufen[beste].clientWidth / 2 - mitte)
            )
              beste = i;
          });
          markiere(beste);
        });
      },
      { passive: true },
    );
  }
  // Tastatur: Fokus in einer Stufe holt sie ins Bild.
  spur.addEventListener('focusin', (e) => {
    const i = stufen.findIndex((s) => s.contains(e.target as Node));
    if (i >= 0 && i !== aktiv) gehe(i);
  });
  markiere(0);

  if (!ruhig) starteFiguren(bereich, stufen);
}

/** Lädt Three.js erst, wenn die Stufen in die Nähe kommen, und lässt die Figuren leben. */
function starteFiguren(bereich: HTMLElement, stufen: HTMLElement[]) {
  const vorab = new IntersectionObserver(
    async (eintraege) => {
      if (!eintraege.some((e) => e.isIntersecting)) return;
      vorab.disconnect();
      try {
        const [THREE, figuren] = await Promise.all([import('three'), import('./ki-figuren.js')]);
        belebe(THREE, figuren, stufen);
      } catch {
        // Ohne 3D bleibt das Standbild stehen.
      }
    },
    // Erst laden, wenn die Stufen wirklich ins Bild kommen – das 3D-Programm ist der größte Brocken der Seite.
    { rootMargin: '0px' },
  );
  // Beobachtet wird die erste Figur: Erst wenn sie ins Bild kommt, lohnt sich das Laden.
  vorab.observe(stufen[0].querySelector('.figur') ?? bereich);
}

type Figuren = typeof import('./ki-figuren.js');
type Belebt = {
  renderer: import('three').WebGLRenderer;
  buehne: ReturnType<Figuren['baueBuehne']>;
  canvas: HTMLCanvasElement;
  sichtbar: boolean;
  winkSeit: number;
};

function belebe(THREE: typeof import('three'), figuren: Figuren, stufen: HTMLElement[]) {
  const belebt = new Map<HTMLElement, Belebt>();
  const blick = { x: 0, y: 0 };
  let laeuft = false;
  const uhr = new THREE.Timer();

  addEventListener(
    'pointermove',
    (e) => {
      blick.x = (e.clientX / innerWidth) * 2 - 1;
      blick.y = (e.clientY / innerHeight) * 2 - 1;
    },
    { passive: true },
  );

  function bereite(stufe: HTMLElement, i: number) {
    if (belebt.has(stufe)) return belebt.get(stufe)!;
    const canvas = stufe.querySelector<HTMLCanvasElement>('canvas[data-figur]')!;
    let renderer: import('three').WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch {
      return null;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const buehne = figuren.baueBuehne(i, renderer);
    const eintrag: Belebt = {
      renderer,
      buehne,
      canvas,
      sichtbar: false,
      winkSeit: -10,
    };
    belebt.set(stufe, eintrag);
    passeAn(eintrag);
    return eintrag;
  }

  function passeAn(e: Belebt) {
    const groesse = e.canvas.clientWidth || 300;
    e.renderer.setSize(groesse, groesse, false);
  }

  function schleife() {
    uhr.update();
    const t = uhr.getElapsed();
    let jemand = false;
    for (const e of belebt.values()) {
      if (!e.sichtbar) continue;
      jemand = true;
      const seit = t - e.winkSeit;
      // Winken: schnell hoch, gut zwei Sekunden, dann sanft runter
      const winken = seit < 0 ? 0 : seit < 0.3 ? seit / 0.3 : seit < 2.4 ? 1 : Math.max(0, 1 - (seit - 2.4) / 0.5);
      figuren.bewege(e.buehne, t, winken, blick);
      e.renderer.render(e.buehne.szene, e.buehne.kamera);
    }
    if (jemand) requestAnimationFrame(schleife);
    else laeuft = false;
  }

  const beobachter = new IntersectionObserver(
    (eintraege) => {
      uhr.update();
      for (const ein of eintraege) {
        // Beobachtet wird die Figur selbst (eine Stufe kann höher als der Bildschirm sein).
        const stufe = (ein.target as HTMLElement).closest<HTMLElement>('.stufe')!;
        const e = bereite(stufe, stufen.indexOf(stufe));
        if (!e) continue;
        const warSichtbar = e.sichtbar;
        e.sichtbar = ein.isIntersecting;
        if (e.sichtbar && !warSichtbar) {
          e.winkSeit = uhr.getElapsed() + 0.2;
          e.canvas.parentElement?.classList.add('figur-live');
        }
      }
      if (!laeuft) {
        laeuft = true;
        requestAnimationFrame(schleife);
      }
    },
    { threshold: 0.5 },
  );
  stufen.forEach((s) => beobachter.observe(s.querySelector('.figur')!));
  addEventListener('resize', () => belebt.forEach(passeAn));
}
