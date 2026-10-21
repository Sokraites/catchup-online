/**
 * Kachel-Hintergrund: Leuchtspur, Freischalt-Pfad, Funkeln auf Touch-Geräten und das Auge.
 *
 * - Eine einzige Zeichenfläche (Canvas) statt Tausender HTML-Elemente.
 * - Das Raster selbst ist ein CSS-Hintergrund; gezeichnet werden nur leuchtende Kacheln.
 * - Gezeichnet wird nur, solange sich etwas bewegt. In Ruhe kostet es nichts.
 * - Bei reduzierter Bewegung: kein Nachleuchten, kein Funkeln, das Auge bleibt ruhig.
 *   Der Pfad lässt sich trotzdem freischalten.
 */
import { kacheln as konfig } from '../config/kacheln';

type Modus = 'maus' | 'touch';
type Funke = { x: number; y: number; vx: number; vy: number; geboren: number; groesse: number };

const LEUCHT_FARBE = '124, 77, 255';
const PFAD_FARBE = '169, 139, 255';
const FUNKEN_DAUER = 650;
const PULS_DAUER = 900;

export function starteKacheln() {
  const canvas = document.querySelector<HTMLCanvasElement>('canvas.kacheln');
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const meldung = document.querySelector<HTMLElement>('.pfad-meldung');
  const pupille = document.querySelector<SVGGElement>('.auge-pupille');
  const auge = document.querySelector<HTMLElement>('.auge');

  let modus: Modus = matchMedia('(pointer: fine)').matches ? 'maus' : 'touch';
  let groesse = 56;
  let spalten = 0;
  let reihen = 0;
  let dpr = 1;
  let breite = 0;
  let hoehe = 0;
  /** Bereich, in dem es leuchtet: der ganze Bildschirm oder (Startseite) nur der Monitor. */
  let bx = 0;
  let by = 0;
  let bb = 0;
  let bh = 0;

  /** Nachleuchtende Kacheln: Schlüssel "reihe,spalte" (ab 0) → Zeitpunkt. */
  const leuchtet = new Map<string, number>();
  const funken: Funke[] = [];
  /** Wie viele Pfad-Kacheln schon freigeschaltet sind (gilt nur, solange die Seite offen ist). */
  let freigeschaltet = 0;
  let pulsSeit = -Infinity;
  let pulsKachel: [number, number] | null = null;
  let welleSeit = -Infinity;
  let letzteKachel: [number, number] | null = null;
  let zeiger: { x: number; y: number } | null = null;
  let rafId = 0;

  const pfad = () => konfig[modus].pfad.map(([r, s]) => [r - 1, s - 1] as [number, number]);

  /** Im Monitor-Modus leuchtet es nur auf dem Bildschirm des Monitors (unterhalb der Browserleiste). */
  const monitorFlaeche = () =>
    document.documentElement.classList.contains('monitor-an') ? document.querySelector<HTMLElement>('.monitor-flaeche') : null;

  function bereich() {
    const f = monitorFlaeche();
    if (f) {
      const r = f.getBoundingClientRect();
      return { x: r.left, y: r.top, b: r.width, h: r.height, monitor: true };
    }
    return { x: 0, y: 0, b: innerWidth, h: innerHeight, monitor: false };
  }

  function messe() {
    modus = matchMedia('(pointer: fine)').matches ? 'maus' : 'touch';
    const k = konfig[modus];
    breite = innerWidth;
    hoehe = innerHeight;
    const be = bereich();
    ({ x: bx, y: by, b: bb, h: bh } = be);
    // Im Monitor wandert die Zeichenfläche in den Bildschirm: Leuchten gibt es nur dort.
    const f = monitorFlaeche();
    if (f && canvas!.parentElement !== f) {
      f.prepend(canvas!);
      canvas!.classList.add('kacheln-im-monitor');
    }
    const min = be.monitor ? 22 : k.minGroesse;
    groesse = Math.round(Math.min(k.maxGroesse, Math.max(min, bh / k.reihen)));
    spalten = Math.ceil(bb / groesse);
    reihen = Math.ceil(bh / groesse);
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas!.width = Math.round(bb * dpr);
    canvas!.height = Math.round(bh * dpr);
    document.documentElement.style.setProperty('--kachel', `${groesse}px`);
    zeichne(performance.now());
  }

  function kachelBei(x: number, y: number): [number, number] | null {
    if (x < bx || y < by || x >= bx + bb || y >= by + bh) return null;
    return [Math.floor((y - by) / groesse), Math.floor((x - bx) / groesse)];
  }

  function mitte([r, s]: [number, number]) {
    return { x: bx + (s + 0.5) * groesse, y: by + (r + 0.5) * groesse };
  }

  /** Alle Kacheln auf der Linie zwischen zwei Kacheln, damit schnelle Bewegungen keine Lücken lassen. */
  function linie(a: [number, number], b: [number, number]) {
    const out: [number, number][] = [];
    let [r0, s0] = a;
    const [r1, s1] = b;
    const dr = Math.abs(r1 - r0);
    const ds = Math.abs(s1 - s0);
    const sr = r0 < r1 ? 1 : -1;
    const ss = s0 < s1 ? 1 : -1;
    let fehler = ds - dr;
    for (let n = 0; n < 200; n++) {
      out.push([r0, s0]);
      if (r0 === r1 && s0 === s1) break;
      const e2 = 2 * fehler;
      if (e2 > -dr) {
        fehler -= dr;
        s0 += ss;
      }
      if (e2 < ds) {
        fehler += ds;
        r0 += sr;
      }
    }
    return out;
  }

  /** Der Pfad zählt erst, wenn alle seine Kacheln ganz auf dem Bildschirm liegen
   *  (auf dem Handy nicht im flachen Querformat zu Beginn, sonst verrutscht das Raster danach). */
  const pfadPasst = () => pfad().every(([r, s]) => r < Math.floor(bh / groesse) && s < Math.floor(bb / groesse));

  function beruehre(kachel: [number, number], jetzt: number) {
    leuchtet.set(`${kachel[0]},${kachel[1]}`, jetzt);
    const ziel = pfadPasst() ? pfad()[freigeschaltet] : undefined;
    if (ziel && ziel[0] === kachel[0] && ziel[1] === kachel[1]) {
      freigeschaltet++;
      pulsSeit = jetzt;
      pulsKachel = kachel;
      if (freigeschaltet === pfad().length) fertig(jetzt);
    }
  }

  function fertig(jetzt: number) {
    welleSeit = jetzt;
    auge?.classList.add('auge-froh');
    if (meldung) {
      meldung.hidden = false;
      meldung.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
    }
  }

  function bewege(x: number, y: number, mitFunken: boolean) {
    const jetzt = performance.now();
    zeiger = { x, y };
    const kachel = kachelBei(x, y);
    if (!kachel) {
      letzteKachel = null;
      schaue();
      plane();
      return;
    }
    if (!letzteKachel || kachel[0] !== letzteKachel[0] || kachel[1] !== letzteKachel[1]) {
      const weg = letzteKachel ? linie(letzteKachel, kachel) : [kachel];
      weg.forEach((k) => beruehre(k, jetzt));
      letzteKachel = kachel;
    }
    if (mitFunken && !ruhig && funken.length < 80) {
      for (let n = 0; n < 3; n++) {
        const winkel = Math.random() * Math.PI * 2;
        const tempo = 0.02 + Math.random() * 0.06;
        funken.push({
          x,
          y,
          vx: Math.cos(winkel) * tempo,
          vy: Math.sin(winkel) * tempo - 0.02,
          geboren: jetzt,
          groesse: 2.5 + Math.random() * 3,
        });
      }
    }
    schaue();
    plane();
  }

  /** Das Auge folgt dem Zeiger, nach der ersten Pfad-Kachel schaut es starr zur nächsten. */
  function schaue() {
    if (!pupille || !auge) return;
    const naechste = freigeschaltet > 0 ? pfad()[freigeschaltet] : undefined;
    const ziel = naechste ? mitte(naechste) : zeiger;
    if (!ziel) return;
    auge.classList.toggle('auge-starr', Boolean(naechste));
    const r = auge.getBoundingClientRect();
    const dx = ziel.x - (r.left + r.width / 2);
    const dy = ziel.y - (r.top + r.height / 2);
    const laenge = Math.hypot(dx, dy) || 1;
    const staerke = Math.min(1, laenge / 200);
    pupille.style.transform = `translate(${((dx / laenge) * 8 * staerke).toFixed(2)}px, ${((dy / laenge) * 4.5 * staerke).toFixed(2)}px)`;
  }

  function plane() {
    if (!rafId) rafId = requestAnimationFrame(schritt);
  }

  function schritt(jetzt: number) {
    rafId = 0;
    const aktiv = zeichne(jetzt);
    if (aktiv) plane();
  }

  function rechteck(r: number, s: number, farbe: string, alpha: number) {
    ctx.fillStyle = `rgba(${farbe}, ${alpha})`;
    ctx.fillRect(s * groesse + 1, r * groesse + 1, groesse - 2, groesse - 2);
  }

  /** Zeichnet alles. Gibt zurück, ob noch etwas in Bewegung ist. */
  function zeichne(jetzt: number) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, bb, bh);
    // Gezeichnet wird in Koordinaten der Zeichenfläche; Zeigerpositionen (Bildschirm) werden umgerechnet.
    let aktiv = false;

    // Nachleuchtende Spur
    const dauer = ruhig ? 1 : konfig.nachleuchten;
    for (const [schluessel, seit] of leuchtet) {
      const alter = jetzt - seit;
      const istAktuell = letzteKachel && schluessel === `${letzteKachel[0]},${letzteKachel[1]}`;
      if (alter > dauer && !istAktuell) {
        leuchtet.delete(schluessel);
        continue;
      }
      const [r, s] = schluessel.split(',').map(Number);
      const rest = istAktuell ? 1 : 1 - alter / dauer;
      rechteck(r, s, LEUCHT_FARBE, 0.32 * rest * rest);
      if (!istAktuell) aktiv = true;
    }

    // Freigeschaltete Pfad-Kacheln: bleiben leuchtend
    const p = pfad();
    for (let i = 0; i < freigeschaltet && i < p.length; i++) {
      const [r, s] = p[i];
      rechteck(r, s, PFAD_FARBE, 0.38);
      ctx.strokeStyle = `rgba(${PFAD_FARBE}, 0.9)`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(s * groesse + 1.5, r * groesse + 1.5, groesse - 3, groesse - 3);
    }

    // Puls beim Freischalten
    const pulsAlter = jetzt - pulsSeit;
    if (pulsKachel && pulsAlter < PULS_DAUER && !ruhig) {
      const t = pulsAlter / PULS_DAUER;
      const m = mitte(pulsKachel);
      const x = m.x - bx;
      const y = m.y - by;
      ctx.strokeStyle = `rgba(${PFAD_FARBE}, ${0.8 * (1 - t)})`;
      ctx.lineWidth = 2;
      const halb = groesse * (0.5 + t * 1.6);
      ctx.strokeRect(x - halb, y - halb, halb * 2, halb * 2);
      aktiv = true;
    }

    // Welle über das ganze Raster, wenn der Pfad vollständig ist
    const welleAlter = jetzt - welleSeit;
    if (welleAlter < 1800 && !ruhig) {
      const ursprung = mitte(p[p.length - 1]);
      const radius = (welleAlter / 1800) * Math.hypot(bb, bh);
      for (let r = 0; r < reihen; r++) {
        for (let s = 0; s < spalten; s++) {
          const m = mitte([r, s]);
          const abstand = Math.abs(Math.hypot(m.x - ursprung.x, m.y - ursprung.y) - radius);
          if (abstand < groesse * 1.5) rechteck(r, s, LEUCHT_FARBE, 0.28 * (1 - abstand / (groesse * 1.5)));
        }
      }
      aktiv = true;
    }

    // Funken (nur Touch)
    for (let i = funken.length - 1; i >= 0; i--) {
      const f = funken[i];
      const alter = jetzt - f.geboren;
      if (alter > FUNKEN_DAUER) {
        funken.splice(i, 1);
        continue;
      }
      const t = alter / FUNKEN_DAUER;
      const x = f.x - bx + f.vx * alter;
      const y = f.y - by + f.vy * alter;
      const g = f.groesse * (1 - t);
      ctx.fillStyle = `rgba(233, 227, 255, ${1 - t})`;
      // kleiner Stern: zwei gekreuzte Rauten
      ctx.beginPath();
      ctx.moveTo(x, y - g * 2);
      ctx.lineTo(x + g * 0.5, y);
      ctx.lineTo(x, y + g * 2);
      ctx.lineTo(x - g * 0.5, y);
      ctx.closePath();
      ctx.moveTo(x - g * 2, y);
      ctx.lineTo(x, y + g * 0.5);
      ctx.lineTo(x + g * 2, y);
      ctx.lineTo(x, y - g * 0.5);
      ctx.closePath();
      ctx.fill();
      aktiv = true;
    }
    return aktiv;
  }

  // Maus: Spur beim Überfahren, ohne Klicken.
  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') bewege(e.clientX, e.clientY, false);
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    letzteKachel = null;
    plane();
  });

  // Touch: Darüberstreichen lässt Kacheln aufleuchten und funkeln. Läuft auch während des Scrollens.
  const beiTouch = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) bewege(t.clientX, t.clientY, true);
  };
  addEventListener('touchstart', beiTouch, { passive: true });
  addEventListener('touchmove', beiTouch, { passive: true });
  addEventListener('touchend', () => {
    letzteKachel = null;
    plane();
  });

  meldung?.querySelector('[data-pfad-schliessen]')?.addEventListener('click', () => {
    meldung.hidden = true;
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && meldung && !meldung.hidden) meldung.hidden = true;
  });

  // Der Monitor kann sich beim Scrollen verschieben (z. B. am Ende der Startseite): Lage nachführen.
  let lageGeplant = false;
  addEventListener(
    'scroll',
    () => {
      if (lageGeplant || !monitorFlaeche()) return;
      lageGeplant = true;
      requestAnimationFrame(() => {
        lageGeplant = false;
        const r = bereich();
        if (r.x !== bx || r.y !== by || r.h !== bh || r.b !== bb) messe();
      });
    },
    { passive: true },
  );

  addEventListener('monitor-gebaut', messe);

  let zeitgeber = 0;
  addEventListener('resize', () => {
    clearTimeout(zeitgeber);
    zeitgeber = window.setTimeout(messe, 120);
  });

  // Zum Testen und für spätere Erweiterungen: aktueller Stand des Pfads.
  (window as unknown as { kachelPfad: object }).kachelPfad = {
    get freigeschaltet() {
      return freigeschaltet;
    },
    get ziele() {
      return pfad().map(mitte);
    },
  };

  messe();
}
