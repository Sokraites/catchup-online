/**
 * Regeln für das Terminbuch. Platzhalter, bis die Gründer echte Zeiten festlegen
 * und ein Kalender angebunden ist (dann kommen belegte Termine von dort).
 */
export const termine = {
  /** Wochentage mit Terminen: 1 = Montag … 7 = Sonntag. */
  wochentage: [1, 2, 3, 4, 5],
  /** Uhrzeiten, die zur Auswahl stehen. */
  zeiten: ['09:00', '10:30', '13:00', '14:30', '16:00'],
  /** Frühester Termin: so viele Tage ab heute. */
  vorlaufTage: 1,
  /** Wie viele Monate im Voraus gebucht werden kann. */
  monateVoraus: 3,
  gespraechsarten: ['Telefon', 'Video', 'Persönlich vor Ort'],
} as const;
