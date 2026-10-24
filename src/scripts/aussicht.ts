/**
 * Aussicht (nur Stufe „Schwer“, nur Desktop): hinter dem Monitor das Fenster mit Blick über Meer, Küste und
 * Gebirge (Foto public/aussicht/fenster.webp). Darüber legt ein Grafik-Programm die Bewegung:
 * - Sonne: hoch am Anfang, im dritten Fenster von rechts, beim Scrollen bis zum Untergang.
 * - Nacht am Seitenende: Himmel mit Sternen und Milchstraße, Stadtlichter am Hang.
 * - Wellen bewegen sich dauerhaft. Gewitter über dem Meer: Blitz etwa alle 30–65 s, abends Sternschnuppe alle 10–25 s.
 * Auf dem Foto liegt der Tischkalender: Er wird genau darüber gesetzt und ist ein echter Knopf.
 *
 * Technik: WebGL 2, ohne Bibliothek. Höchstens 30 Bilder pro Sekunde, pausiert bei verstecktem Tab,
 * offenem Kalender und ausgeblendeter Ansicht.
 */
import { termine } from '../config/termine';

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];


const VERTEX = `#version 300 es
in vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

/* Koordinaten im Bild (0…1, von oben links). Horizont und Linien sind aus dem Foto abgelesen. */
const FRAGMENT = `#version 300 es
precision highp float;
out vec4 farbe;
uniform sampler2D uFoto;
uniform vec2 uRes;       // Zeichenfläche in Pixeln
uniform vec4 uAbb;       // Lage des Fotos auf dem Bildschirm: x,y oben links, Breite, Höhe (0…1 des Bildschirms)
uniform float uZeit;     // Sekunden
uniform float uTag;      // 0 = Mittag … 1 = Nacht (Scrollfortschritt)
uniform vec2 uMaus;      // -1 … 1, für leichte Tiefe
uniform float uBlitz;    // Helligkeit des Blitzes 0 … 1
uniform vec2 uBolt[8];   // Blitz-Verlauf (Bildkoordinaten)
uniform vec4 uStern;     // Sternschnuppe: Start xy, Richtung xy (Bildkoordinaten)
uniform float uSternT;   // Fortschritt 0 … 1, außerhalb: aus

const float IA = 2000.0 / 1068.0; // Seitenverhältnis des Fotos

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float rausch(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * rausch(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s / 0.9375;
}
float strecke(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

/* Horizont: Meerlinie links, Bergkamm rechts. */
float horizont(float x) {
  float links = 0.400 - 0.004 * smoothstep(0.45, 0.6, x);
  float rechts = mix(0.385, 0.250, smoothstep(0.60, 1.00, x));
  return mix(links, rechts, smoothstep(0.55, 0.72, x));
}
/* 1 am Himmel, 0 an Land und Meer (weich, damit keine Treppen entstehen). */
float himmelMaske(vec2 b) { return smoothstep(horizont(b.x) + 0.003, horizont(b.x) - 0.003, b.y); }
/* Meer links vor der Küste: dort bewegen sich die Wellen. */
float meerMaske(vec2 b) {
  float unten = smoothstep(0.398, 0.41, b.y) * smoothstep(0.97, 0.9, b.y);
  return unten * smoothstep(0.35, 0.33, b.x);
}
/* Gewitterwolke links oben (dunkel). */
float gewitterMaske(vec2 b, float lum) {
  return smoothstep(0.62, 0.38, lum) * smoothstep(0.58, 0.5, b.x) * smoothstep(0.42, 0.34, b.y);
}
/* Stadt am Hang (für nächtliche Lichter). */
float stadtMaske(vec2 b) {
  return smoothstep(0.36, 0.40, b.x) * smoothstep(0.66, 0.62, b.x) * smoothstep(0.44, 0.48, b.y) * smoothstep(0.82, 0.78, b.y);
}

void main() {
  /* Bildschirm → Foto (Foto deckt den Bildschirm ab, das Ausschnitt-Verhältnis ist fest). */
  vec2 bs = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
  vec2 b = (bs - uAbb.xy) / uAbb.zw;
  b += uMaus * vec2(0.0035, 0.0025);

  float t = uZeit;
  float k = clamp(uTag, 0.0, 1.0);
  float nacht = smoothstep(0.66, 0.97, k);
  float tagAnteil = 1.0 - smoothstep(0.55, 0.82, k);

  /* Wellen: das Meer wird leicht verzerrt und bekommt wandernde Glanzpunkte. */
  float meer = meerMaske(b);
  vec2 wb = b;
  if (meer > 0.0) {
    wb += meer * vec2(sin(t * 0.9 + b.y * 90.0) * 0.0009 + sin(t * 0.37 + b.x * 40.0) * 0.0006,
                     cos(t * 0.7 + b.x * 60.0) * 0.0011);
  }
  vec3 col = texture(uFoto, wb).rgb;
  float lum = dot(col, vec3(0.3, 0.59, 0.11));

  /* Glanzpunkte auf den Wellen (wandern nach links, funkeln) */
  if (meer > 0.01) {
    vec2 g = vec2(b.x * IA * 110.0 + t * 1.6, b.y * 260.0);
    float punkt = step(0.985, hash(floor(g))) * (0.5 + 0.5 * sin(t * 4.0 + hash(floor(g)) * 30.0));
    col += vec3(1.0, 0.97, 0.9) * punkt * meer * 0.35 * (1.0 - nacht * 0.7);
  }

  /* Himmel: am Tag warme Abendtöne neutralisieren, damit der Sonnenlauf ruhig beginnt. */
  float himmel = himmelMaske(b);
  float warm = smoothstep(0.05, 0.22, col.r - col.b);
  // in Blau statt in Grün umfärben: die Helligkeit bleibt, nur der Farbton kippt
  vec3 tagesblau = vec3(lum * 0.62, lum * 0.82, lum * 1.18) + vec3(0.02, 0.03, 0.07);
  col = mix(col, tagesblau, warm * himmel * (1.0 - k) * 0.85);

  /* Sonne: im dritten Fenster von rechts (Mitte 58,5 % der Breite), sinkt beim Scrollen zum Horizont. */
  vec2 sonne = vec2(0.585, mix(0.14, 0.405, smoothstep(0.0, 0.72, k)));
  float sd = length((b - sonne) * vec2(IA, 1.0));
  vec3 sonnenFarbe = mix(vec3(1.0, 0.97, 0.9), vec3(1.0, 0.52, 0.22), smoothstep(0.3, 0.75, k));
  col += sonnenFarbe * (0.55 * exp(-sd * 6.5) + 1.2 * exp(-sd * 34.0)) * himmel * (1.0 - nacht);

  /* Nachthimmel: Verlauf, Sterne und Milchstraße über dem Himmel. */
  if (nacht > 0.001 && himmel > 0.001) {
    vec2 p = vec2(b.x * IA, b.y);
    float hz = horizont(b.x);
    float hoehe = clamp((hz - b.y) / (hz + 0.02), 0.0, 1.0);
    vec3 nachtHimmel = mix(vec3(0.02, 0.03, 0.08), vec3(0.002, 0.004, 0.015), pow(hoehe, 0.6));
    nachtHimmel += vec3(0.06, 0.05, 0.1) * exp(-(hz - b.y) * 14.0) * (0.5 + 0.5 * (1.0 - nacht));
    /* Milchstraße: schräges Band */
    float band = exp(-pow((b.y - (0.36 - 0.30 * b.x)) / 0.075, 2.0));
    float staub = fbm(p * vec2(3.0, 9.0) + 3.0);
    float dunkel = smoothstep(0.55, 0.75, fbm(p * vec2(6.0, 15.0) + 11.0));
    nachtHimmel += vec3(0.5, 0.52, 0.85) * band * (0.4 + 1.0 * staub) * (1.0 - 0.6 * dunkel) * 1.5;
    /* Sterne: zwei Größen, funkeln */
    float sterne = 0.0;
    for (int s = 0; s < 2; s++) {
      float skala = s == 0 ? 190.0 : 460.0;
      vec2 z = floor(p * skala);
      float h = hash(z + float(s) * 7.0);
      if (h > (s == 0 ? 0.986 : 0.972) - band * 0.03) {
        vec2 m = fract(p * skala) - 0.5 - (vec2(hash(z + 1.3), hash(z + 2.7)) - 0.5) * 0.6;
        float funkeln = 0.7 + 0.3 * sin(t * (1.5 + h * 4.0) + h * 40.0);
        sterne += smoothstep(0.24, 0.0, length(m)) * funkeln * (s == 0 ? 1.0 : 0.6);
      }
    }
    nachtHimmel += vec3(sterne) * 1.2;
    col = mix(col, nachtHimmel, himmel * nacht);
  }

  /* Gewitterwolke: Blitz beleuchtet sie von innen. */
  float gw = gewitterMaske(b, lum);
  col = mix(col, col * 1.7 + vec3(0.24, 0.28, 0.42), uBlitz * gw);

  /* Nacht am Land: Foto dunkler und kühler, Stadt bekommt warme Lichter. */
  vec3 nachtLand = col * vec3(0.22, 0.28, 0.46) + vec3(0.01, 0.012, 0.03);
  col = mix(col, nachtLand, nacht * (1.0 - himmel));
  float stadt = stadtMaske(b) * nacht;
  vec2 lg = vec2(b.x * IA * 230.0, b.y * 230.0);
  float licht = step(0.82, hash(floor(lg))) * smoothstep(0.42, 0.2, length(fract(lg) - 0.5));
  col += vec3(1.0, 0.72, 0.36) * licht * stadt * (0.7 + 0.3 * sin(t * 0.8 + hash(floor(lg)) * 40.0));

  /* Blitz-Pfad vom Wolkenrand ins Meer */
  if (uBlitz > 0.01) {
    vec2 q = vec2(b.x * IA, b.y);
    float db = 1.0;
    for (int i = 0; i < 7; i++) db = min(db, strecke(q, vec2(uBolt[i].x * IA, uBolt[i].y), vec2(uBolt[i + 1].x * IA, uBolt[i + 1].y)));
    col = mix(col, vec3(0.9, 0.94, 1.0), clamp(exp(-db * 900.0) * uBlitz * 1.6, 0.0, 1.0));
    col += vec3(0.45, 0.5, 0.75) * uBlitz * exp(-db * 45.0) * 0.25;
  }

  /* Sternschnuppe: heller Kopf mit kurzem Schweif */
  if (uSternT > 0.0 && uSternT < 1.0 && nacht > 0.2) {
    vec2 kopf = uStern.xy + uStern.zw * uSternT * 0.22;
    vec2 schwanz = kopf - uStern.zw * 0.07;
    vec2 q = vec2(b.x * IA, b.y);
    float ds = strecke(q, vec2(schwanz.x * IA, schwanz.y), vec2(kopf.x * IA, kopf.y));
    float entlang = clamp(dot(q - vec2(schwanz.x * IA, schwanz.y), normalize(vec2(uStern.z * IA, uStern.w))) / 0.07, 0.0, 1.0);
    col += vec3(0.9, 0.95, 1.0) * exp(-ds * 900.0) * entlang * sin(3.1416 * uSternT) * 1.6;
  }

  /* Leichte Vignette: das Auge bleibt in der Mitte */
  vec2 v = bs - 0.5;
  col *= 1.0 - dot(v, v) * 0.35;

  farbe = vec4(pow(max(col, 0.0), vec3(0.98)), 1.0);
}`;


/* ---------- Kalender auf dem Schreibtisch ---------- */

const heute = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
function frei(d: Date) {
  const frueh = heute();
  frueh.setDate(frueh.getDate() + termine.vorlaufTage);
  const spaet = heute();
  spaet.setMonth(spaet.getMonth() + termine.monateVoraus);
  const wt = d.getDay() === 0 ? 7 : d.getDay();
  return d >= frueh && d <= spaet && (termine.wochentage as readonly number[]).includes(wt);
}

function raster(ziel: HTMLElement, monat: Date, mitKnoepfen: boolean, waehle?: (d: Date) => void) {
  ziel.replaceChildren();
  for (const k of ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']) {
    const s = document.createElement('span');
    s.className = 'ak-wt';
    s.textContent = k;
    ziel.append(s);
  }
  const versatz = (monat.getDay() + 6) % 7;
  for (let i = 0; i < versatz; i++) ziel.append(document.createElement('span'));
  const letzter = new Date(monat.getFullYear(), monat.getMonth() + 1, 0).getDate();
  for (let t = 1; t <= letzter; t++) {
    const d = new Date(monat.getFullYear(), monat.getMonth(), t);
    const istFrei = frei(d);
    const el = document.createElement(mitKnoepfen ? 'button' : 'span');
    el.className = 'ak-tag';
    el.textContent = String(t);
    if (d.getTime() === heute().getTime()) el.classList.add('ak-heute');
    if (!istFrei) el.classList.add('ak-belegt');
    if (mitKnoepfen) {
      const k = el as HTMLButtonElement;
      k.type = 'button';
      k.disabled = !istFrei;
      k.setAttribute('aria-label', `${TAGE[d.getDay()]}, ${t}. ${MONATE[d.getMonth()]}${istFrei ? '' : ', nicht verfügbar'}`);
      k.addEventListener('click', () => waehle?.(d));
    }
    ziel.append(el);
  }
}

function baueKalender(wurzel: HTMLElement) {
  const monat = new Date(heute().getFullYear(), heute().getMonth(), 1);

  // kleiner Tischkalender (Knopf)
  const knopf = document.createElement('button');
  knopf.type = 'button';
  knopf.className = 'ak-tisch';
  knopf.setAttribute('aria-label', 'Tischkalender: Termin auswählen');
  knopf.innerHTML = `<span class="ak-ring" aria-hidden="true"></span><span class="ak-kopf" aria-hidden="true">${MONATE[monat.getMonth()]}</span><span class="ak-raster" aria-hidden="true"></span>`;
  raster(knopf.querySelector('.ak-raster')!, monat, false);
  wurzel.append(knopf);

  // großer Kalender (nach dem Heranzoomen)
  const gross = document.createElement('div');
  gross.className = 'ak-gross';
  gross.setAttribute('role', 'dialog');
  gross.setAttribute('aria-modal', 'true');
  gross.setAttribute('aria-labelledby', 'ak-titel');
  gross.hidden = true;
  gross.innerHTML = `
    <div class="ak-blatt">
      <div class="ak-ring" aria-hidden="true"></div>
      <div class="ak-monat">
        <button type="button" class="ak-pfeil" data-ak-zurueck aria-label="Vorheriger Monat">‹</button>
        <h2 id="ak-titel"></h2>
        <button type="button" class="ak-pfeil" data-ak-weiter aria-label="Nächster Monat">›</button>
      </div>
      <div class="ak-raster ak-raster-gross"></div>
      <p class="ak-hinweis">Tippe auf einen freien Tag. Dann geht es mit Uhrzeit und Kontakt weiter.</p>
    </div>
    <button type="button" class="ak-schliessen" data-ak-schliessen>← Zurück zum Schreibtisch</button>`;
  document.body.append(gross);
  const hintergrund = document.createElement('div');
  hintergrund.className = 'ak-hintergrund';
  hintergrund.hidden = true;
  document.body.append(hintergrund);

  let gezeigt = monat;
  const erster = monat;
  const letzter = new Date(monat.getFullYear(), monat.getMonth() + termine.monateVoraus, 1);
  const zeichne = () => {
    gross.querySelector('#ak-titel')!.textContent = `${MONATE[gezeigt.getMonth()]} ${gezeigt.getFullYear()}`;
    raster(gross.querySelector('.ak-raster-gross')!, gezeigt, true, waehle);
    gross.querySelector<HTMLButtonElement>('[data-ak-zurueck]')!.disabled = gezeigt <= erster;
    gross.querySelector<HTMLButtonElement>('[data-ak-weiter]')!.disabled = gezeigt >= letzter;
  };
  gross.querySelector('[data-ak-zurueck]')!.addEventListener('click', () => {
    gezeigt = new Date(gezeigt.getFullYear(), gezeigt.getMonth() - 1, 1);
    zeichne();
  });
  gross.querySelector('[data-ak-weiter]')!.addEventListener('click', () => {
    gezeigt = new Date(gezeigt.getFullYear(), gezeigt.getMonth() + 1, 1);
    zeichne();
  });

  /** Zoom: Das große Blatt wächst aus dem kleinen Kalender heraus (und zurück). */
  function zoom(rein: boolean) {
    const von = knopf.getBoundingClientRect();
    const blatt = gross.querySelector<HTMLElement>('.ak-blatt')!;
    const ziel = blatt.getBoundingClientRect();
    const sx = von.width / ziel.width;
    const sy = von.height / ziel.height;
    const dx = von.left + von.width / 2 - (ziel.left + ziel.width / 2);
    const dy = von.top + von.height / 2 - (ziel.top + ziel.height / 2);
    const klein = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    const frames = [{ transform: klein, opacity: 0.6 }, { transform: 'none', opacity: 1 }];
    return blatt.animate(rein ? frames : frames.reverse(), { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.catch(() => {});
  }

  /** Solange der Kalender groß ist, bleibt der Rest der Seite für Tastatur und Vorlesehilfen unerreichbar. */
  const rest = () => [...document.querySelectorAll<HTMLElement>('.site-header, main, .site-footer')];
  function oeffne() {
    rest().forEach((el) => (el.inert = true));
    gezeigt = monat;
    zeichne();
    gross.hidden = false;
    hintergrund.hidden = false;
    document.documentElement.classList.add('ak-offen');
    zoom(true);
    hintergrund.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
    gross.querySelector<HTMLElement>('.ak-tag:not(:disabled)')?.focus({ preventScroll: true });
  }
  async function schliesse(fokus = true) {
    if (gross.hidden) return;
    hintergrund.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350 });
    await zoom(false);
    gross.hidden = true;
    hintergrund.hidden = true;
    document.documentElement.classList.remove('ak-offen');
    rest().forEach((el) => (el.inert = false));
    if (fokus) knopf.focus({ preventScroll: true });
  }
  async function waehle(d: Date) {
    await schliesse(false);
    const { oeffneTerminbuch } = await import('./terminbuch');
    oeffneTerminbuch(d);
  }

  knopf.addEventListener('click', oeffne);
  gross.querySelector('[data-ak-schliessen]')!.addEventListener('click', () => schliesse());
  hintergrund.addEventListener('click', () => schliesse());
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !gross.hidden) schliesse();
  });
  return knopf;
}

/* ---------- Start ---------- */

const MEDIEN = '(min-width: 1280px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
/** Foto: Originalgröße und Lage des Tischkalenders im Bild (Anteile 0…1, von oben links). */
const FOTO = { b: 2000, h: 1068, kal: { x: 0.098, y: 0.691, w: 0.078 } };

type Uniform = Record<string, WebGLUniformLocation | null>;

function kompiliere(gl: WebGL2RenderingContext): Uniform | null {
  const shader = (typ: number, quelle: string) => {
    const s = gl.createShader(typ)!;
    gl.shaderSource(s, quelle);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'Shader');
    return s;
  };
  try {
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'Programm');
    gl.useProgram(prog);
    const puffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, puffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const ort = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(ort);
    gl.vertexAttribPointer(ort, 2, gl.FLOAT, false, 0, 0);
    const u: Uniform = {};
    for (const name of ['uFoto', 'uRes', 'uAbb', 'uZeit', 'uTag', 'uMaus', 'uBlitz', 'uBolt', 'uStern', 'uSternT']) {
      u[name] = gl.getUniformLocation(prog, name);
    }
    return u;
  } catch (fehler) {
    console.warn('Aussicht: Grafik nicht verfügbar', fehler);
    return null;
  }
}

/**
 * Startet die Aussicht. Gibt false zurück, wenn das gar nicht geht (ohne WebGL 2).
 * Scheitert das Laden des Fotos später, wird `onFehler` aufgerufen, damit die Seite wieder in voller Breite steht.
 */
export function starteAussicht(onFehler: () => void): boolean {
  const geraet = document.querySelector<HTMLElement>('.monitor-geraet');
  if (!geraet) return false;

  const wurzel = document.createElement('div');
  wurzel.className = 'aussicht';
  wurzel.innerHTML = '<canvas class="aussicht-szene" aria-hidden="true"></canvas>';
  const canvas = wurzel.querySelector<HTMLCanvasElement>('canvas')!;
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
  const u = gl ? kompiliere(gl) : null;
  if (!gl || !u) return false;

  const foto = new Image();
  foto.decoding = 'async';
  foto.src = '/aussicht/fenster.webp';
  foto.onerror = () => {
    wurzel.remove();
    kalenderEl.remove();
    onFehler();
  };
  foto.onload = () => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, foto);
    gl.uniform1i(u.uFoto, 0);
    document.body.prepend(wurzel);
    starteSzene();
  };

  const kalenderEl = document.createElement('div');
  kalenderEl.className = 'aussicht-kalender';
  document.body.append(kalenderEl);
  baueKalender(kalenderEl);

  const html = document.documentElement;
  const medien = matchMedia(MEDIEN);
  const maus = { x: 0, y: 0, zx: 0, zy: 0 };
  let blitz = 0;
  const bolt = new Float32Array(16);
  let sternStart = -1;
  const stern = new Float32Array(4);
  let tag = 0;
  let tagZiel = 0;
  let letztes = 0;
  let schleife = 0;
  let t0 = 0;
  /** Foto-Lage auf dem Bildschirm (Deckung „cover“): x, y, Breite, Höhe als Anteile des Bildschirms. */
  const abb = new Float32Array(4);

  function groesse() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    const s = Math.max(innerWidth / FOTO.b, innerHeight / FOTO.h);
    const sw = FOTO.b * s;
    const sh = FOTO.h * s;
    const ox = (innerWidth - sw) / 2;
    const oy = (innerHeight - sh) / 2;
    abb.set([ox / innerWidth, oy / innerHeight, sw / innerWidth, sh / innerHeight]);
    // Tischkalender genau auf den Kalender im Foto legen
    kalenderEl.style.setProperty('--ak-x', `${Math.round(ox + FOTO.kal.x * sw)}px`);
    kalenderEl.style.setProperty('--ak-y', `${Math.round(oy + FOTO.kal.y * sh)}px`);
    kalenderEl.style.setProperty('--ak-w', `${Math.round(FOTO.kal.w * sw)}px`);
  }
  groesse();
  addEventListener('resize', groesse);
  addEventListener(
    'pointermove',
    (e) => {
      maus.zx = (e.clientX / innerWidth) * 2 - 1;
      maus.zy = (e.clientY / innerHeight) * 2 - 1;
    },
    { passive: true },
  );

  // Blitz: aus der Gewitterwolke links oben ins Meer, etwa alle 30–65 Sekunden
  function schlage() {
    let x = 0.3 + (Math.random() - 0.5) * 0.06;
    let y = 0.36;
    for (let i = 0; i < 8; i++) {
      bolt[i * 2] = x;
      bolt[i * 2 + 1] = y;
      x += (Math.random() - 0.5) * 0.012;
      y += 0.02 + Math.random() * 0.012;
    }
    const start = performance.now();
    const flackern = (jetzt: number) => {
      const s = (jetzt - start) / 1000;
      blitz = s < 0.08 ? 1 : s < 0.16 ? 0.25 : s < 0.24 ? 0.85 : Math.max(0, 0.85 - (s - 0.24) * 2.5);
      if (blitz > 0) requestAnimationFrame(flackern);
    };
    requestAnimationFrame(flackern);
  }
  function naechsterBlitz() {
    setTimeout(() => {
      schlage();
      naechsterBlitz();
    }, 30000 + Math.random() * 35000);
  }
  naechsterBlitz();

  // Sternschnuppe: nur am Abend, alle 10–25 Sekunden, im oberen Himmelsbereich
  function schnuppe() {
    stern[0] = 0.15 + Math.random() * 0.6;
    stern[1] = 0.06 + Math.random() * 0.12;
    const w = -0.55 - Math.random() * 0.5;
    stern[2] = Math.cos(w) * 0.8;
    stern[3] = Math.sin(w) * 0.8;
    sternStart = performance.now();
  }
  function naechsteSchnuppe() {
    setTimeout(() => {
      if (tag > 0.8) schnuppe();
      naechsteSchnuppe();
    }, 10000 + Math.random() * 15000);
  }
  naechsteSchnuppe();

  const fortschritt = () => {
    const weg = document.documentElement.scrollHeight - innerHeight;
    return weg > 0 ? Math.min(1, Math.max(0, scrollY / weg)) : 0;
  };
  tag = tagZiel = fortschritt();
  addEventListener('scroll', () => (tagZiel = fortschritt()), { passive: true });

  const starte = () => {
    cancelAnimationFrame(schleife);
    schleife = requestAnimationFrame(bild);
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(schleife);
    else starte();
  });

  function bild(jetzt: number) {
    schleife = requestAnimationFrame(bild);
    if (jetzt - letztes < 32) return; // höchstens ~30 Bilder pro Sekunde
    if (!medien.matches || html.classList.contains('ak-offen') || document.querySelector('dialog[open]')) return;
    const dt = Math.min(0.5, (jetzt - (letztes || jetzt)) / 1000);
    letztes = jetzt;
    tag += (tagZiel - tag) * (1 - Math.exp(-dt / 0.25));
    if (Math.abs(tagZiel - tag) < 0.001) tag = tagZiel;
    maus.x += (maus.zx - maus.x) * (1 - Math.exp(-dt / 0.6));
    maus.y += (maus.zy - maus.y) * (1 - Math.exp(-dt / 0.6));
    const st = sternStart < 0 ? -1 : (jetzt - sternStart) / 900;
    if (st > 1) sternStart = -1;
    const g = gl!;
    g.uniform2f(u.uRes, canvas.width, canvas.height);
    g.uniform4fv(u.uAbb, abb);
    g.uniform1f(u.uZeit, (jetzt - t0) / 1000);
    g.uniform1f(u.uTag, tag);
    g.uniform2f(u.uMaus, maus.x, maus.y);
    g.uniform1f(u.uBlitz, blitz);
    g.uniform2fv(u.uBolt, bolt);
    g.uniform4fv(u.uStern, stern);
    g.uniform1f(u.uSternT, st);
    g.drawArrays(g.TRIANGLES, 0, 3);
  }

  function starteSzene() {
    t0 = performance.now();
    letztes = 0;
    starte();
  }

  // Für Prüfungen: aktueller Stand
  (window as unknown as { aussicht: object }).aussicht = {
    get tag() {
      return tag;
    },
    get blitz() {
      return blitz;
    },
    get sternschnuppe() {
      return sternStart >= 0;
    },
    /** Nur für Tests: sofort einen Blitz bzw. eine Sternschnuppe auslösen. */
    testBlitz: schlage,
    testSternschnuppe: schnuppe,
  };
  return true;
}
