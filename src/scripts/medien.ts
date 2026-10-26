/**
 * Videos in den Stufen Mittel und Schwer (Einstellungen: src/config/medien.ts, Bausteine: Medium.astro).
 *
 * - Im HTML steht nur das Standbild. Das Video entsteht erst, wenn ein Viertel davon zu sehen ist,
 *   und hält an, sobald es den Bildschirm verlässt. Höchstens zwei laufen gleichzeitig.
 * - Das Standbild bleibt immer darunter liegen: Bis das Video läuft (oder wenn es nicht darf), sieht man das Bild.
 * - Kein Video bei Stufe Leicht, „Bewegung reduzieren“, Datensparmodus oder gesperrtem Autoplay.
 * - Ändert sich die Stufe, blendet das Video aus und wird freigegeben.
 */
import { medien, medienRegeln, type Medium, type MediumName } from '../config/medien';
import { stufe } from './stufe';

type Quelle = { src: string; type: string };
type Eintrag = {
  box: HTMLElement;
  name: MediumName;
  quellen: Quelle[];
  video: HTMLVideoElement | null;
  anteil: number;
  /** Autoplay gesperrt oder Video defekt: bleibt beim Standbild */
  gesperrt: boolean;
  neustart: number;
};

const html = document.documentElement;
const reduziert = matchMedia('(prefers-reduced-motion: reduce)');
const verbindung = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;

const erlaubt = () => ['mittel', 'schwer'].includes(stufe()) && !reduziert.matches && !verbindung?.saveData;

let gestartet = false;

export function starteMedien() {
  if (gestartet) return;
  gestartet = true;

  const eintraege: Eintrag[] = [...document.querySelectorAll<HTMLElement>('[data-medium]')].map((box) => ({
    box,
    name: box.dataset.medium as MediumName,
    quellen: JSON.parse(box.dataset.quellen ?? '[]'),
    video: null,
    anteil: 0,
    gesperrt: false,
    neustart: 0,
  }));
  if (!eintraege.length) return;

  /** Im Monitor liegen alle Abschnitte übereinander: Nur der vorne liegende zählt als sichtbar. */
  const vorne = (e: Eintrag) => !html.classList.contains('monitor-an') || !!e.box.closest('.monitor-aktiv');

  function verteile() {
    const ok = erlaubt();
    const dran = ok
      ? eintraege
          .filter((e) => !e.gesperrt && e.anteil >= medienRegeln.sichtbarAb && vorne(e))
          .sort((a, b) => b.anteil - a.anteil)
          .slice(0, medienRegeln.hoechstensGleichzeitig)
      : [];
    for (const e of eintraege) {
      if (dran.includes(e)) spiele(e);
      else if (ok && !e.gesperrt) e.video?.pause();
      else freigeben(e);
    }
  }

  function baueVideo(e: Eintrag) {
    const k: Medium = medien[e.name];
    const v = document.createElement('video');
    v.className = 'medium-video';
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.loop = !k.weicherNeustart;
    v.preload = 'none';
    v.poster = e.box.querySelector('img')?.currentSrc || '';
    v.disablePictureInPicture = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('aria-hidden', 'true');
    v.tabIndex = -1;
    for (const q of e.quellen) {
      const s = document.createElement('source');
      s.src = q.src;
      s.type = q.type;
      v.append(s);
    }
    // Keine Quelle spielbar: beim Standbild bleiben
    v.lastElementChild?.addEventListener('error', () => sperre(e));
    v.addEventListener('playing', () => {
      v.playbackRate = k.playbackRate;
      e.box.classList.add('medium-laeuft');
      e.box.classList.remove('medium-blende');
      plane(e);
    });
    v.addEventListener('pause', () => clearTimeout(e.neustart));
    v.addEventListener('ratechange', () => plane(e));
    v.addEventListener('ended', () => {
      // Weicher Neustart: Das Bild ist gerade ausgeblendet, von vorn beginnen und wieder einblenden
      v.currentTime = 0;
      void v.play().catch(() => {});
    });
    v.defaultPlaybackRate = k.playbackRate;
    e.box.append(v);
    e.video = v;
    return v;
  }

  /** Weicher Neustart: kurz vor dem Ende über das Standbild ausblenden. */
  function plane(e: Eintrag) {
    const v = e.video;
    clearTimeout(e.neustart);
    if (!v || v.loop || v.paused || !Number.isFinite(v.duration)) return;
    const rest = ((v.duration - v.currentTime) / (v.playbackRate || 1)) * 1000 - medienRegeln.neustartMs;
    e.neustart = window.setTimeout(() => e.box.classList.add('medium-blende'), Math.max(0, rest));
  }

  function spiele(e: Eintrag) {
    const v = e.video ?? baueVideo(e);
    if (!v.paused) return;
    v.play().catch((fehler: DOMException) => {
      // Autoplay vom Browser gesperrt (z. B. Stromsparmodus): Standbild bleibt stehen
      if (fehler.name === 'NotAllowedError' || fehler.name === 'NotSupportedError') sperre(e);
    });
  }

  function sperre(e: Eintrag) {
    e.gesperrt = true;
    freigeben(e);
  }

  /** Video ausblenden, anhalten und den Speicher freigeben. Das Standbild liegt darunter. */
  function freigeben(e: Eintrag) {
    const v = e.video;
    if (!v) return;
    e.video = null;
    clearTimeout(e.neustart);
    e.box.classList.remove('medium-laeuft', 'medium-blende');
    v.pause();
    setTimeout(() => {
      v.querySelectorAll('source').forEach((s) => s.remove());
      v.removeAttribute('src');
      v.load();
      v.remove();
    }, medienRegeln.ueberblendenMs + 50);
  }

  const beobachter = new IntersectionObserver(
    (meldungen) => {
      for (const m of meldungen) {
        const e = eintraege.find((x) => x.box === m.target);
        if (e) e.anteil = m.isIntersecting ? m.intersectionRatio : 0;
      }
      verteile();
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  eintraege.forEach((e) => beobachter.observe(e.box));

  // Monitor: anderer Abschnitt vorne. Stufe gewechselt: Videos aus- oder einblenden.
  const aenderung = new MutationObserver(verteile);
  aenderung.observe(html, { attributes: true, attributeFilter: ['data-stufe', 'class'] });
  new Set(eintraege.map((e) => e.box.closest('section'))).forEach(
    (s) => s && aenderung.observe(s, { attributes: true, attributeFilter: ['class'] }),
  );
  reduziert.addEventListener('change', verteile);
  verbindung?.addEventListener?.('change', verteile);
  // Tab im Hintergrund: Browser halten selbst an; beim Zurückkommen neu verteilen
  document.addEventListener('visibilitychange', () => (document.hidden ? eintraege.forEach((e) => e.video?.pause()) : verteile()));
}
