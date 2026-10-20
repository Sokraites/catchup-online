/**
 * Kachelraster und Freischalt-Pfad.
 *
 * Positionen werden wie besprochen gezählt: [Reihe, Spalte], ab 1, von oben links.
 * „Maus“ gilt für Geräte mit Mauszeiger, „Touch“ für Handy und Tablet.
 * Das Raster hat eine feste Anzahl Reihen, damit die Pfad-Kacheln auf jedem Bildschirm existieren.
 */
export const kacheln = {
  maus: {
    reihen: 16,
    /** Kleinste und größte Kachelgröße in Pixeln. */
    minGroesse: 40,
    maxGroesse: 72,
    pfad: [
      [7, 7],
      [14, 14],
      [4, 18],
      [11, 20],
      [3, 10],
    ],
  },
  touch: {
    reihen: 18,
    minGroesse: 36,
    maxGroesse: 72,
    pfad: [
      [7, 7],
      [13, 2],
      [4, 3],
      [16, 6],
      [10, 4],
    ],
  },
  /** Wie lange eine überfahrene Kachel nachleuchtet (Millisekunden). */
  nachleuchten: 700,
} as const;
