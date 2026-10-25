/**
 * Bilder und Videos der Startseite: die einzige Stelle, an der sie eingestellt werden.
 *
 * Dateien liegen in public/media/ und heißen wie der Eintrag hier:
 *   <name>.webp  Standbild (16:9). Stufe Leicht, ohne JavaScript, und Vorschaubild des Videos
 *   <name>.webm  Video (VP9), wird zuerst angeboten
 *   <name>.mp4   Video (H.264), für Browser ohne webm
 * Beim Bauen wird nachgesehen, welche Dateien es gibt. Fehlt das Standbild, gilt `ersatzBild`.
 * Fehlen beide Videos, bleibt es beim Standbild. Neue Dateien also nur hineinlegen und neu bauen.
 *
 * Videos laufen nur in der Stufe Mittel (src/scripts/medien.ts).
 */
export type Medium = {
  /** Beschreibung des Bildes für Menschen, die es nicht sehen (alt-Text) */
  alt: string;
  /** Geschwindigkeit des Videos: 1 = normal, 0.75 = ruhiger, 0.5 = halb so schnell */
  playbackRate: number;
  /** Welcher Bildteil sichtbar bleibt, wenn der Rahmen beschneidet (CSS object-position), z. B. '50% 50%' = Mitte */
  objectPosition: string;
  /** Statt hart zu springen: am Ende kurz über das Standbild aus- und wieder einblenden (bei sichtbarer Naht) */
  weicherNeustart?: boolean;
  /** Bild, solange es <name>.webp noch nicht gibt */
  ersatzBild?: string;
};

export const medien = {
  '01-neue-webseite': {
    alt: 'Moderner Bildschirm, vor dem die Bausteine einer neuen Webseite schweben: Kopfleiste, große Überschrift, Knopf und Inhaltskarten.',
    playbackRate: 1.0,
    objectPosition: '50% 50%',
    weicherNeustart: true,
  },
  '02-modernisierung': {
    alt: 'Links ein alter Röhrenmonitor mit einer schlichten Webseite von früher, rechts ein moderner Bildschirm mit der erneuerten Seite.',
    playbackRate: 1.0,
    objectPosition: '50% 50%',
  },
  '03-gefunden-werden': {
    alt: 'Kleine Landkarte mit Dorf und Feldern: Eine goldene Ortsmarke zeigt auf einen Betrieb, davor ein Suchfeld.',
    playbackRate: 1.0,
    objectPosition: '50% 50%',
  },
  '04-software-nach-mass': {
    // Noch kein eigenes Medium: bis dahin das bisherige Bild
    alt: 'Tablet mit einer eigenen Anwendung eines Betriebs: Aufträge, Termine und Auslastung auf einen Blick.',
    playbackRate: 1.0,
    objectPosition: '50% 50%',
    ersatzBild: '/bilder/loesung.webp',
  },
  '05-deine-idee': {
    alt: 'Handgeschriebene Zettel und ein Bleistift, aus denen ein Lichtstrom zu drei Schaltflächen für Termine, Aufträge und Anrufe wird.',
    playbackRate: 1.0,
    objectPosition: '50% 50%',
  },
} satisfies Record<string, Medium>;

export type MediumName = keyof typeof medien;

/** Regeln für alle Videos */
export const medienRegeln = {
  /** Ab diesem sichtbaren Anteil wird geladen und abgespielt (0.25 = ein Viertel) */
  sichtbarAb: 0.25,
  /** Höchstens so viele Videos laufen gleichzeitig */
  hoechstensGleichzeitig: 2,
  /** Überblenden zwischen Standbild und Video in Millisekunden */
  ueberblendenMs: 250,
  /** Aus- und Einblenden beim weichen Neustart in Millisekunden */
  neustartMs: 300,
};
