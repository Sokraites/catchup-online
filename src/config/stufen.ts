/**
 * Darstellungs-Stufen („Schwierigkeitsgrad“). Der Inhalt ist in allen Stufen derselbe,
 * nur die Darstellung ändert sich. Die Wahl wird nur auf dem Gerät gemerkt (ein Eintrag,
 * kein Cookie) und kann oben rechts jederzeit geändert werden.
 *
 * - leicht: ruhige Seite, große Bilder, keine Effekte
 * - mittel: das Zielbild: Monitor-Zeitreise, Kachel-Pfad mit Auge, Terminbuch mit Animation
 * - schwer: wie mittel, Effekte aufgedreht (längeres Nachleuchten, Funkeln auch mit der Maus);
 *   am Desktop zusätzlich der Blick aus dem Fenster (src/scripts/aussicht.ts)
 */
export type StufeId = 'leicht' | 'mittel' | 'schwer';

export const stufen: { id: StufeId; titel: string; kurz: string; text: string }[] = [
  {
    id: 'leicht',
    titel: 'Leicht',
    kurz: 'Ruhig und klar',
    text: 'Das Wichtigste auf einen Blick, große Bilder, keine Effekte. Ideal fürs Handy.',
  },
  {
    id: 'mittel',
    titel: 'Mittel',
    kurz: 'Mit Bewegung',
    text: 'Eine Zeitreise durch die Monitore der letzten Jahrzehnte, ein verstecktes Kachel-Rätsel und ein Terminbuch zum Blättern.',
  },
  {
    id: 'schwer',
    titel: 'Schwer',
    kurz: 'Volles Programm',
    text: 'Wie Mittel, dazu am Computer ein Fenster mit Blick aufs Meer, die Sonne geht beim Scrollen unter.',
  },
];

/** Gilt, solange noch nichts gewählt ist (bei „Bewegung reduzieren“ im System: leicht). */
export const standardStufe: StufeId = 'mittel';

/** Name des Eintrags im Gerätespeicher. */
export const stufenSchluessel = 'catchup-stufe';
