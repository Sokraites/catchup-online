/**
 * Aussicht (nur Stufe „Schwer“, nur Desktop): Hinter dem Monitor liegt ein Fenster mit Blick über Meer,
 * Gebirge und eine Stadt am Hang. Beim Scrollen wandert die Sonne vom hohen Mittag bis zum Untergang,
 * am Seitenende ist es Nacht mit Milchstraße. Wellen bewegen sich immer, über dem Meer stehen Gewitterwolken
 * (Blitz alle 30–65 s), abends fällt alle 10–25 s eine Sternschnuppe.
 * Links auf dem Schreibtisch steht ein Kalender: Klick zoomt ihn heran, ein Tag öffnet das Terminbuch.
 *
 * Technik: ein einziges Grafik-Programm (WebGL 2, keine Bibliothek), mit verringerter Auflösung und
 * höchstens 30 Bildern pro Sekunde. Pausiert, wenn der Tab nicht sichtbar ist.
 * Reine Dekoration (aria-hidden), außer dem Kalender: der ist ein echter Knopf.
 */
import { termine } from '../config/termine';

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];


const VERTEX = `#version 300 es
in vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
out vec4 farbe;
uniform vec2 uRes;
uniform float uZeit;     // Sekunden
uniform float uTag;      // 0 = Mittag … 1 = Nacht (Scrollfortschritt)
uniform vec2 uMaus;      // -1 … 1, für leichte Tiefe (Parallaxe)
uniform float uLinks;    // rechter Rand des linken Fensterteils (0 … 1)
uniform float uRechts;   // linker Rand des rechten Fensterteils (0 … 1)
uniform float uBlitz;    // Helligkeit des Blitzes 0 … 1
uniform vec2 uBolt[8];   // Blitz-Verlauf (Bildschirm-Koordinaten 0 … 1)
uniform vec4 uStern;     // Sternschnuppe: Start xy, Richtung xy
uniform float uSternT;   // Fortschritt 0 … 1 (außerhalb: aus)

const float H = 0.43;    // Horizont

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float rausch(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * rausch(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return s;
}
float grat(float x) { return 1.0 - abs(rausch(vec2(x, 0.5)) * 2.0 - 1.0); }
float gebirge(float x) { return 0.55 * grat(x) + 0.3 * grat(x * 2.1 + 3.0) + 0.15 * grat(x * 4.7 + 7.0); }

float strecke(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Himmelsfarbe ohne Sonne/Sterne (auch für Spiegelungen im Wasser)
vec3 himmel(float hoehe, float e) {
  vec3 zenTag = vec3(0.14, 0.36, 0.78), horTag = vec3(0.60, 0.79, 0.95);
  vec3 zenAbend = vec3(0.16, 0.18, 0.40), horAbend = vec3(1.0, 0.48, 0.22);
  vec3 zenNacht = vec3(0.004, 0.006, 0.02), horNacht = vec3(0.045, 0.055, 0.13);
  vec3 zen = mix(mix(zenNacht, zenAbend, smoothstep(-0.38, 0.0, e)), zenTag, smoothstep(0.08, 0.5, e));
  vec3 hor = mix(mix(horNacht, horAbend, smoothstep(-0.30, 0.0, e)), horTag, smoothstep(0.12, 0.55, e));
  return mix(hor, zen, pow(clamp(hoehe, 0.0, 1.0), 0.55));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float A = uRes.x / uRes.y;
  float t = uZeit;

  // Sonnenstand: hoch am Anfang, unter dem Horizont am Ende
  float k = clamp(uTag, 0.0, 1.0);
  float e = clamp(1.0 - 1.39 * k, -0.5, 1.0);
  float nacht = smoothstep(0.0, -0.36, e);
  float sichtbar = smoothstep(-0.07, 0.02, e);
  vec2 sonne = vec2(uLinks * mix(0.80, 0.66, k), H + e * 0.37);
  vec3 sonnenFarbe = mix(vec3(1.0, 0.42, 0.18), vec3(1.0, 0.97, 0.88), smoothstep(0.0, 0.45, e));

  vec3 col;
  float hoehe = (uv.y - H) / (1.0 - H);

  if (uv.y >= H) {
    // ---------- Himmel ----------
    col = himmel(hoehe, e);
    vec2 d2 = (uv - sonne) * vec2(A, 1.0);
    float d = length(d2);
    col += sonnenFarbe * (0.30 * exp(-d * 5.0) + 0.55 * exp(-d * 22.0)) * sichtbar;
    // Abendrot entlang des Horizonts, dort wo die Sonne untergeht
    float rot = exp(-pow((e - 0.02) / 0.18, 2.0));
    col += vec3(1.0, 0.36, 0.16) * rot * 0.55 * exp(-(uv.y - H) * 9.0) * exp(-abs(uv.x - sonne.x) * 1.6);
    col = mix(col, sonnenFarbe * 1.2, smoothstep(0.034, 0.028, d) * sichtbar);

    // Sterne und Milchstraße
    if (nacht > 0.001) {
      vec2 p = vec2(uv.x * A, uv.y);
      vec2 r = vec2(p.x * 0.80 + p.y * 0.60, -p.x * 0.60 + p.y * 0.80);
      float band = exp(-pow((r.y - 0.55) / 0.13, 2.0));
      float staub = fbm(r * vec2(4.0, 10.0) + 3.0);
      float dunkel = smoothstep(0.52, 0.72, fbm(r * vec2(7.0, 16.0) + 11.0));
      float kern = exp(-pow((r.x - 0.9) / 0.5, 2.0));
      vec3 milch = mix(vec3(0.55, 0.62, 0.95), vec3(1.0, 0.86, 0.68), kern) * band * (0.25 + 0.75 * staub) * (1.0 - 0.75 * dunkel);
      float sterne = 0.0;
      for (int s = 0; s < 2; s++) {
        float skala = s == 0 ? 180.0 : 420.0;
        vec2 z = floor(p * skala);
        float h = hash(z + float(s) * 7.0);
        float schwelle = (s == 0 ? 0.988 : 0.975) - band * 0.03;
        if (h > schwelle) {
          vec2 m = fract(p * skala) - 0.5 - (vec2(hash(z + 1.3), hash(z + 2.7)) - 0.5) * 0.6;
          float funkeln = 0.65 + 0.35 * sin(t * (1.5 + h * 4.0) + h * 40.0);
          sterne += smoothstep(0.24, 0.0, length(m)) * funkeln * (s == 0 ? 1.0 : 0.55);
        }
      }
      float dunst = smoothstep(0.0, 0.25, hoehe);
      col += (milch * 0.85 + vec3(sterne)) * nacht * dunst;
    }

    // Sternschnuppe
    if (uSternT > 0.0 && uSternT < 1.0) {
      vec2 kopf = uStern.xy + uStern.zw * uSternT * 0.22;
      vec2 schwanz = kopf - uStern.zw * 0.07;
      vec2 q = vec2(uv.x * A, uv.y);
      float ds = strecke(q, vec2(schwanz.x * A, schwanz.y), vec2(kopf.x * A, kopf.y));
      float entlang = clamp(dot(q - vec2(schwanz.x * A, schwanz.y), normalize(vec2(uStern.z * A, uStern.w))) / 0.07, 0.0, 1.0);
      col += vec3(0.9, 0.95, 1.0) * exp(-ds * 900.0) * entlang * sin(3.1416 * uSternT) * 1.6 * nacht;
    }

    // Gewitterwolke (Amboss) in der Ferne über dem Meer (linker Fensterteil)
    vec2 wolkeMitte = vec2(uLinks * 0.28, H);
    vec2 q = (uv - wolkeMitte) * vec2(A, 1.0);
    float rand = fbm(q * 18.0 + vec2(t * 0.015, 0.0)) - 0.5;
    float turm = 1.0 - length(vec2(q.x / (0.032 + q.y * 0.18), (q.y - 0.07) / 0.075));
    float amboss = 1.0 - length(vec2((q.x - 0.012) / (0.07 + (q.y - 0.14) * 0.6), (q.y - 0.145) / 0.022));
    float sockel = 1.0 - length(vec2(q.x / 0.06, (q.y - 0.012) / 0.02));
    float dichte = max(max(turm, amboss), sockel) + rand * 0.55;
    float deck = smoothstep(0.0, 0.28, dichte) * smoothstep(0.0, 0.006, q.y);
    if (deck > 0.0) {
      float innen = fbm(q * 22.0 + 4.0);
      float oben = smoothstep(0.0, 0.17, q.y);
      vec3 hell = mix(vec3(0.94, 0.95, 0.98), vec3(1.0, 0.62, 0.42), smoothstep(0.45, 0.05, e));
      vec3 schatten = mix(vec3(0.38, 0.40, 0.47), vec3(0.22, 0.14, 0.22), smoothstep(0.45, 0.05, e));
      vec3 wolke = mix(schatten, hell, clamp(oben * 0.8 + innen * 0.5 - 0.15, 0.0, 1.0));
      wolke = mix(vec3(0.02, 0.025, 0.045) + vec3(0.03) * innen, wolke, smoothstep(-0.3, 0.05, e));
      wolke += vec3(0.75, 0.80, 1.0) * uBlitz * (0.3 + 0.9 * innen) * (1.0 - oben * 0.5);
      col = mix(col, wolke, deck * 0.97);
    }
    // Blitz: Lichtschein und leuchtender Pfad
    if (uBlitz > 0.01) {
      vec2 qq = vec2(uv.x * A, uv.y);
      float db = 1.0;
      for (int i = 0; i < 7; i++) db = min(db, strecke(qq, vec2(uBolt[i].x * A, uBolt[i].y), vec2(uBolt[i + 1].x * A, uBolt[i + 1].y)));
      col += vec3(0.85, 0.9, 1.0) * uBlitz * (exp(-db * 1400.0) * 2.5 + exp(-db * 60.0) * 0.25);
      col += vec3(0.4, 0.45, 0.6) * uBlitz * 0.3 * exp(-length(q) * 5.0);
    }

    // Gebirge und Stadt (rechter Fensterteil), mit leichter Tiefe je nach Mausposition
    float rampe = smoothstep(uRechts - 0.02, uRechts + 0.07, uv.x);
    float xf = uv.x * 3.2 + uMaus.x * 0.02;
    float xn = uv.x * 6.0 + uMaus.x * 0.05;
    float fern = H + rampe * (0.10 + 0.20 * gebirge(xf));
    float nah = H + rampe * (0.03 + 0.09 * gebirge(xn + 5.0));
    vec3 dunstFarbe = himmel(0.05, e);
    vec3 fernFarbe = mix(dunstFarbe, mix(vec3(0.008, 0.01, 0.022), vec3(0.32, 0.38, 0.52), smoothstep(-0.2, 0.4, e)), 0.55 + 0.4 * nacht);
    if (uv.y < fern) {
      vec3 c = fernFarbe;
      float schnee = smoothstep(fern - 0.02, fern - 0.005, uv.y) * smoothstep(H + 0.15, H + 0.21, fern);
      c = mix(c, mix(vec3(0.1, 0.1, 0.14), vec3(0.95, 0.96, 1.0), smoothstep(-0.1, 0.3, e)), schnee * 0.85);
      c += sonnenFarbe * 0.12 * rot;
      col = c;
    }
    if (uv.y < nah) {
      vec3 c = mix(vec3(0.01, 0.012, 0.02), vec3(0.17, 0.23, 0.22), smoothstep(-0.25, 0.45, e));
      c *= 0.85 + 0.3 * fbm(vec2(uv.x * 40.0, uv.y * 60.0));
      col = c;
    }
    // Stadt am Hang zur Küste: helle Häuser mit Schattenseite, abends erleuchtete Fenster
    float stadtX = smoothstep(uRechts + 0.015, uRechts + 0.04, uv.x) * smoothstep(0.995, 0.95, uv.x);
    if (stadtX > 0.0) {
      float breite = 5.0;
      float spalte = floor(uv.x * uRes.x / breite);
      float inSpalte = fract(uv.x * uRes.x / breite);
      float hang = H + 0.003 + (nah - H) * 0.6;
      float hoeheHaus = hang + (0.004 + 0.022 * pow(hash(vec2(spalte, 3.0)), 2.0)) * stadtX;
      if (uv.y < hoeheHaus && uv.y > H) {
        float art = hash(vec2(spalte, 11.0));
        vec3 fassade = mix(vec3(0.93, 0.90, 0.84), vec3(0.86, 0.66, 0.52), step(0.7, art));
        fassade *= inSpalte < 0.35 ? 0.72 : 1.0;
        if (hoeheHaus - uv.y < 0.0025) fassade = mix(vec3(0.62, 0.30, 0.22), vec3(0.45, 0.47, 0.5), step(0.5, art));
        vec3 haus = mix(vec3(0.015, 0.015, 0.03), fassade, smoothstep(-0.2, 0.35, e));
        haus = mix(haus, haus * sonnenFarbe * 1.25, rot * 0.5);
        vec2 fz = vec2(uv.x * uRes.x / 2.5, uv.y * uRes.y / 2.5);
        float an = step(0.6, hash(floor(fz))) * step(fract(fz.y), 0.55) * step(fract(fz.x), 0.55);
        float abend = smoothstep(0.08, -0.12, e);
        haus += vec3(1.0, 0.78, 0.45) * an * abend * (0.8 + 0.2 * sin(t * 0.7 + hash(floor(fz)) * 30.0));
        col = haus;
      }
    }
    // Dunst über dem Horizont
    col = mix(col, dunstFarbe, exp(-(uv.y - H) * 60.0) * 0.35 * (1.0 - nacht * 0.7));
  } else {
    // ---------- Meer ----------
    float tiefe = H - uv.y;
    float z = 0.08 / max(tiefe, 0.002);
    vec2 w = vec2((uv.x - 0.5) * A * z, z);
    vec2 strom = vec2(t * 0.05, t * 0.11);
    float wl = fbm(w * vec2(1.6, 3.0) + strom) * 0.6 + fbm(w * vec2(4.0, 7.0) - strom * 1.7) * 0.4;
    float wr = fbm((w + vec2(0.02, 0.0)) * vec2(1.6, 3.0) + strom) * 0.6 + fbm((w + vec2(0.02, 0.0)) * vec2(4.0, 7.0) - strom * 1.7) * 0.4;
    float wo = fbm((w + vec2(0.0, 0.02)) * vec2(1.6, 3.0) + strom) * 0.6 + fbm((w + vec2(0.0, 0.02)) * vec2(4.0, 7.0) - strom * 1.7) * 0.4;
    vec2 n = vec2(wr - wl, wo - wl) * 12.0;
    float fresnel = pow(1.0 - clamp(tiefe * 2.2, 0.0, 1.0), 4.0);
    vec3 tief = mix(mix(vec3(0.004, 0.008, 0.02), vec3(0.10, 0.06, 0.10), smoothstep(-0.3, 0.0, e)), vec3(0.03, 0.17, 0.28), smoothstep(0.1, 0.5, e));
    vec3 spiegel = himmel(0.15 + n.y * 0.4, e);
    col = mix(tief, spiegel, 0.25 + 0.6 * fresnel);
    col *= 0.85 + 0.3 * wl;
    // Glitzern unter der Sonne
    float spur = exp(-pow((uv.x - sonne.x + n.x * 0.03) * A / (0.012 + tiefe * 0.35), 2.0));
    float glanz = pow(clamp(wl * 1.25, 0.0, 1.0), 6.0);
    col += sonnenFarbe * spur * glanz * 2.2 * sichtbar;
    // Spiegelung der Stadtlichter und des Blitzes
    float abend = smoothstep(0.05, -0.15, e);
    float stadtSpur = smoothstep(uRechts + 0.015, uRechts + 0.04, uv.x) * smoothstep(0.99, 0.95, uv.x);
    float lichtSaeule = step(0.7, hash(vec2(floor(uv.x * uRes.x / 5.0), 5.0)));
    col += vec3(1.0, 0.75, 0.4) * stadtSpur * lichtSaeule * abend * exp(-tiefe * 18.0) * (0.25 + 0.5 * glanz);
    col += vec3(0.6, 0.65, 0.9) * uBlitz * 0.25 * exp(-abs(uv.x - uLinks * 0.28) * A * 6.0) * exp(-tiefe * 6.0);
    // Schaumkronen
    col += vec3(0.8) * smoothstep(0.82, 0.92, wl) * (1.0 - fresnel) * smoothstep(-0.2, 0.3, e) * 0.35;
  }

  farbe = vec4(pow(col, vec3(0.95)), 1.0);
}`;

type Uniforms = Record<string, WebGLUniformLocation | null>;

function kompiliere(gl: WebGL2RenderingContext) {
  const shader = (typ: number, quelle: string) => {
    const s = gl.createShader(typ)!;
    gl.shaderSource(s, quelle);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'Shader');
    return s;
  };
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
  const u: Uniforms = {};
  for (const name of ['uRes', 'uZeit', 'uTag', 'uMaus', 'uLinks', 'uRechts', 'uBlitz', 'uBolt', 'uStern', 'uSternT']) {
    u[name] = gl.getUniformLocation(prog, name);
  }
  return u;
}

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

  function oeffne() {
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

export function starteAussicht(): boolean {
  const geraet = document.querySelector<HTMLElement>('.monitor-geraet');
  if (!geraet) return false;

  const wurzel = document.createElement('div');
  wurzel.className = 'aussicht';
  wurzel.innerHTML = `
    <canvas class="aussicht-szene" aria-hidden="true"></canvas>
    <div class="aussicht-raum" aria-hidden="true">
      <div class="aussicht-wand"></div>
      <div class="aussicht-rahmen"><span class="aussicht-sprosse aussicht-sprosse-l"></span><span class="aussicht-sprosse aussicht-sprosse-r"></span><span class="aussicht-kaempfer"></span></div>
      <div class="aussicht-glas"></div>
      <div class="aussicht-tisch"></div>
    </div>`;
  const canvas = wurzel.querySelector<HTMLCanvasElement>('canvas')!;
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return false;
  let u: Uniforms;
  try {
    u = kompiliere(gl);
  } catch (fehler) {
    console.warn('Aussicht: Grafik nicht verfügbar', fehler);
    return false;
  }
  document.body.prepend(wurzel);
  // Der Kalender liegt über dem Seiteninhalt (sonst nicht anklickbar), die Szene darunter.
  const kalender = document.createElement('div');
  kalender.className = 'aussicht-kalender';
  document.body.append(kalender);
  baueKalender(kalender);

  const html = document.documentElement;
  const MASSSTAB = 0.6; // Auflösung der Szene (weich, schnell)
  let links = 0.2;
  let rechts = 0.8;
  let tag = 0;
  let tagZiel = 0;
  const maus = { x: 0, y: 0, zx: 0, zy: 0 };
  let blitz = 0;
  const bolt = new Float32Array(16);
  let sternStart = -1;
  const stern = new Float32Array(4);

  function groesse() {
    canvas.width = Math.round(innerWidth * MASSSTAB);
    canvas.height = Math.round(innerHeight * MASSSTAB);
    gl!.viewport(0, 0, canvas.width, canvas.height);
  }
  groesse();
  addEventListener('resize', groesse);
  addEventListener('pointermove', (e) => {
    maus.zx = (e.clientX / innerWidth) * 2 - 1;
    maus.zy = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  /** Lage von Monitor und Schreibtisch, damit Fenster, Tisch und Kalender dazu passen. */
  function messe() {
    const r = geraet!.getBoundingClientRect();
    const rand = 70; // Gehäuse links/rechts (ungefähr)
    links = Math.max(0.05, (r.left - rand) / innerWidth);
    rechts = Math.min(0.95, (r.right + rand) / innerWidth);
    let fuss = r.bottom + 40;
    document.querySelectorAll<HTMLElement>('.mg-fuss').forEach((f) => {
      const b = f.getBoundingClientRect();
      if (b.height) fuss = Math.max(fuss, b.bottom);
    });
    html.style.setProperty('--tisch-y', `${Math.round(Math.min(innerHeight - 30, fuss - 6))}px`);
    html.style.setProperty('--monitor-l', `${Math.round(r.left - rand)}px`);
    html.style.setProperty('--monitor-r', `${Math.round(innerWidth - r.right - rand)}px`);
  }

  // Blitze: alle 30–65 Sekunden, mit kurzem Nachflackern
  function schlage() {
      const x0 = links * 0.28 + (Math.random() - 0.5) * 0.015;
      let x = x0;
      let y = 0.43 + 0.05;
      for (let i = 0; i < 8; i++) {
        bolt[i * 2] = x;
        bolt[i * 2 + 1] = y;
        x += (Math.random() - 0.5) * 0.012;
        y -= 0.05 / 7;
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

  // Sternschnuppen: abends alle 10–25 Sekunden
  function naechsteSchnuppe() {
    setTimeout(() => {
      if (tag > 0.8) {
        stern[0] = links * (0.25 + Math.random() * 0.5);
        stern[1] = 0.78 + Math.random() * 0.15;
        const w = -0.6 - Math.random() * 0.5;
        stern[2] = Math.cos(w) * (Math.random() < 0.5 ? 1 : -1) * 0.7;
        stern[3] = Math.sin(w);
        if (Math.random() < 0.5) stern[0] = rechts + (1 - rechts) * (0.2 + Math.random() * 0.6);
        sternStart = performance.now();
      }
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

  const t0 = performance.now();
  let letztes = 0;
  let laeuft = true;
  document.addEventListener('visibilitychange', () => {
    laeuft = !document.hidden;
    if (laeuft) requestAnimationFrame(bild);
  });

  function bild(jetzt: number) {
    if (!laeuft) return;
    requestAnimationFrame(bild);
    if (jetzt - letztes < 32) return; // höchstens ~30 Bilder pro Sekunde
    // Kalender herangezoomt oder Terminbuch offen: Szene ist nur verschwommen zu sehen, also anhalten
    if (html.classList.contains('ak-offen') || document.querySelector('dialog[open]')) return;
    // Glättung nach echter Zeit (nicht pro Bild): auch auf langsamen Geräten nach ~1 s am Ziel
    const dt = Math.min(0.5, (jetzt - (letztes || jetzt)) / 1000);
    letztes = jetzt;
    messe();
    tag += (tagZiel - tag) * (1 - Math.exp(-dt / 0.25));
    if (Math.abs(tagZiel - tag) < 0.001) tag = tagZiel;
    maus.x += (maus.zx - maus.x) * (1 - Math.exp(-dt / 0.6));
    maus.y += (maus.zy - maus.y) * (1 - Math.exp(-dt / 0.6));
    // Licht im Zimmer folgt der Tageszeit
    html.style.setProperty('--licht', String(Math.min(1, Math.max(0.12, 1 - (tag - 0.5) / 0.45)).toFixed(3)));
    const st = sternStart < 0 ? -1 : (jetzt - sternStart) / 900;
    if (st > 1) sternStart = -1;
    const g = gl!;
    g.uniform2f(u.uRes, canvas.width, canvas.height);
    g.uniform1f(u.uZeit, (jetzt - t0) / 1000);
    g.uniform1f(u.uTag, tag);
    g.uniform2f(u.uMaus, maus.x, maus.y);
    g.uniform1f(u.uLinks, links);
    g.uniform1f(u.uRechts, rechts);
    g.uniform1f(u.uBlitz, blitz);
    g.uniform2fv(u.uBolt, bolt);
    g.uniform4fv(u.uStern, stern);
    g.uniform1f(u.uSternT, st);
    g.drawArrays(g.TRIANGLES, 0, 3);
  }
  requestAnimationFrame(bild);

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
    testSternschnuppe() {
      stern.set([links * 0.5, 0.88, -0.55, -0.83]);
      sternStart = performance.now();
    },
  };
  return true;
}
