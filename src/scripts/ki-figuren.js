/**
 * KI-Mitarbeiter als kleine 3D-Figuren, eine pro Stufe.
 * Freundliche Roboter-Kollegen: je höher die Stufe, desto professioneller das Auftreten.
 * Wird auf der KI-Seite live gezeigt und vom Render-Werkzeug als Standbild genutzt.
 * Bewusst einfaches JavaScript, damit beide es ohne Umweg laden können.
 */
import * as THREE from 'three';

const LILA = 0x7c4dff;
const LILA_HELL = 0xa98bff;

function stoff(farbe, { rauheit = 0.45, metall = 0, glanz = 0.4 } = {}) {
  return new THREE.MeshPhysicalMaterial({ color: farbe, roughness: rauheit, metalness: metall, clearcoat: glanz, clearcoatRoughness: 0.3 });
}
function leuchte(farbe, staerke = 2.2) {
  return new THREE.MeshStandardMaterial({ color: farbe, emissive: farbe, emissiveIntensity: staerke });
}

/** Aussehen je Stufe (0 = Praktikant … 3 = Teamleiter-Niveau). */
const STUFEN = [
  { koerper: 0xe9e7f2, kopf: 0xf6f5fb, groesse: 0.86, augen: 0x7ce7ff },
  { koerper: 0xc9b8ff, kopf: 0xf3f0ff, groesse: 0.94, augen: 0x9dffcf },
  { koerper: 0x2a2f4a, kopf: 0xeceaf6, groesse: 1.0, augen: LILA_HELL },
  { koerper: 0x16161d, kopf: 0xe9e7f2, groesse: 1.08, augen: 0xffd166 },
];

/**
 * Baut die Figur einer Stufe. Gibt die Gruppe und Teile zurück, die animiert werden.
 * @param {number} stufe
 */
export function baueFigur(stufe) {
  const s = STUFEN[stufe];
  const figur = new THREE.Group();
  const koerperMat = stoff(s.koerper, stufe >= 2 ? { rauheit: 0.35, glanz: 0.8 } : {});
  const kopfMat = stoff(s.kopf, { rauheit: 0.25, glanz: 1 });

  // Körper (schwebt, keine Beine)
  const koerper = new THREE.Mesh(new THREE.CapsuleGeometry(0.52, 0.55, 8, 24), koerperMat);
  koerper.scale.set(1, 1, 0.82);
  figur.add(koerper);

  // Kopf mit dunklem Visier und leuchtenden Augen
  const kopf = new THREE.Group();
  kopf.position.y = 1.05;
  const schaedel = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 32), kopfMat);
  schaedel.scale.set(1.08, 0.94, 0.98);
  kopf.add(schaedel);
  const visier = new THREE.Mesh(
    new THREE.SphereGeometry(0.47, 40, 24, -Math.PI * 0.32, Math.PI * 0.64, Math.PI * 0.32, Math.PI * 0.36),
    new THREE.MeshPhysicalMaterial({ color: 0x0b0b12, roughness: 0.08, clearcoat: 1, metalness: 0.2 }),
  );
  visier.scale.set(1.1, 1, 1.03);
  visier.rotation.y = Math.PI / 2;
  visier.position.z = 0.03;
  kopf.add(visier);
  const augen = [];
  for (const x of [-0.16, 0.16]) {
    const auge = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.08, 4, 12), leuchte(s.augen, 3));
    auge.position.set(x, 0.02, 0.5);
    kopf.add(auge);
    augen.push(auge);
  }
  figur.add(kopf);

  // Arme mit Drehpunkt an der Schulter
  const arme = [];
  for (const seite of [-1, 1]) {
    const schulter = new THREE.Group();
    schulter.position.set(seite * 0.6, 0.32, 0);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.42, 6, 16), koerperMat);
    arm.position.y = -0.3;
    schulter.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 16), kopfMat);
    hand.position.y = -0.6;
    schulter.add(hand);
    schulter.rotation.z = seite * 0.18;
    figur.add(schulter);
    arme.push(schulter);
  }
  const [armLinks, armRechts] = arme;

  // Leuchtring unter der Figur
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 12, 64), leuchte(LILA, 1.6));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -1.0;
  figur.add(ring);

  // Ausstattung je Stufe
  if (stufe === 0) {
    // Praktikant: Namensschild am Band, kleine Antenne
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 8, 40, Math.PI), stoff(LILA));
    band.rotation.z = Math.PI;
    band.position.set(0, 0.62, 0.38);
    figur.add(band);
    const schild = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.17, 0.03), stoff(0xffffff, { rauheit: 0.3 }));
    schild.position.set(0, 0.25, 0.47);
    figur.add(schild);
    const streifen = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.035), stoff(LILA));
    streifen.position.set(0, 0.31, 0.47);
    figur.add(streifen);
    const antenne = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2), stoff(0x999999));
    antenne.position.set(0, 0.55, 0);
    kopf.add(antenne);
    const kugel = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), leuchte(s.augen, 2));
    kugel.position.set(0, 0.67, 0);
    kopf.add(kugel);
  }
  if (stufe === 1) {
    // Azubi: Ordner unter dem Arm, Kappe
    const ordner = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.32), stoff(LILA, { rauheit: 0.5 }));
    ordner.position.set(0.04, -0.52, 0.12);
    ordner.rotation.z = -0.15;
    armLinks.add(ordner);
    const kappe = new THREE.Mesh(new THREE.SphereGeometry(0.52, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.4), stoff(LILA, { rauheit: 0.6 }));
    kappe.position.y = 0.08;
    kopf.add(kappe);
    const schirm = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 32, 1, false, -Math.PI / 2, Math.PI), stoff(LILA, { rauheit: 0.6 }));
    schirm.position.set(0, 0.25, 0.32);
    schirm.rotation.x = 0.12;
    kopf.add(schirm);
  }
  if (stufe >= 2) {
    // Mitarbeiter und Teamleiter: Krawatte
    const krawatte = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.42, 4), stoff(stufe === 3 ? LILA : LILA_HELL, { glanz: 0.9 }));
    krawatte.rotation.x = Math.PI;
    krawatte.rotation.y = Math.PI / 4;
    krawatte.scale.z = 0.4;
    krawatte.position.set(0, 0.28, 0.45);
    figur.add(krawatte);
    const knoten = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), krawatte.material);
    knoten.position.set(0, 0.5, 0.44);
    figur.add(knoten);
  }
  if (stufe === 2) {
    // Mitarbeiter: Headset
    const buegel = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.025, 8, 48, Math.PI), stoff(0x222228, { glanz: 0.8 }));
    buegel.position.y = 0.05;
    kopf.add(buegel);
    const mikro = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.3, 4, 8), stoff(0x222228));
    mikro.position.set(0.42, -0.2, 0.25);
    mikro.rotation.set(0.2, 0, 1.0);
    kopf.add(mikro);
    const muschel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 24), stoff(0x222228));
    muschel.rotation.z = Math.PI / 2;
    muschel.position.set(0.55, 0, 0);
    kopf.add(muschel);
  }
  if (stufe === 3) {
    // Teamleiter: Revers, leuchtendes Tablet, Heiligenschein-Ring
    for (const seite of [-1, 1]) {
      const revers = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.04), stoff(0x2c2c38, { glanz: 0.9 }));
      revers.position.set(seite * 0.17, 0.3, 0.42);
      revers.rotation.z = seite * 0.35;
      figur.add(revers);
    }
    const tablet = new THREE.Group();
    const rahmen = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.03), stoff(0x111116, { glanz: 1 }));
    tablet.add(rahmen);
    const schirm = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.44), leuchte(LILA_HELL, 1.2));
    schirm.position.z = 0.017;
    tablet.add(schirm);
    tablet.position.set(0.1, -0.55, 0.18);
    tablet.rotation.set(-0.5, 0.4, 0.2);
    armLinks.add(tablet);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 12, 64), leuchte(0xffd166, 1.8));
    halo.rotation.x = Math.PI / 2 - 0.45;
    halo.position.y = 0.74;
    kopf.add(halo);
  }

  figur.scale.setScalar(s.groesse);
  return { figur, kopf, armRechts, armLinks, augen, ring };
}

/** Bühne mit Licht für eine Figur. */
export function baueBuehne(stufe, renderer) {
  const szene = new THREE.Scene();
  const hemi = new THREE.HemisphereLight(0xffffff, 0x302650, 1.6);
  szene.add(hemi);
  const haupt = new THREE.DirectionalLight(0xffffff, 2.4);
  haupt.position.set(-2, 3, 4);
  szene.add(haupt);
  const kante = new THREE.DirectionalLight(LILA_HELL, 2.2);
  kante.position.set(3, 1.5, -2);
  szene.add(kante);
  const teile = baueFigur(stufe);
  szene.add(teile.figur);
  const kamera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  kamera.position.set(0, 0.35, 6.2);
  kamera.lookAt(0, 0.15, 0);
  if (renderer) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  return { szene, kamera, ...teile };
}

/**
 * Bewegt die Figur. t = Zeit in Sekunden, winken = 0…1 (Stärke des Winkens),
 * blick = {x, y} von −1 bis 1 (wohin der Kopf schaut).
 */
export function bewege(teile, t, winken, blick) {
  const { figur, kopf, armRechts, armLinks, augen, ring } = teile;
  figur.position.y = Math.sin(t * 1.6) * 0.06;
  figur.rotation.y = Math.sin(t * 0.5) * 0.12 + blick.x * 0.25;
  kopf.rotation.y = blick.x * 0.35;
  kopf.rotation.x = -blick.y * 0.2;
  // Winken: Arm hoch, Hand schwingt
  armRechts.rotation.z = 0.18 + winken * (2.4 + Math.sin(t * 9) * 0.35);
  armLinks.rotation.z = -0.18 - Math.sin(t * 1.6) * 0.05;
  // Blinzeln alle paar Sekunden
  const blinzeln = (t % 3.7) < 0.12 ? 0.15 : 1;
  augen.forEach((a) => (a.scale.y = blinzeln));
  ring.scale.setScalar(1 + Math.sin(t * 2) * 0.04);
}
