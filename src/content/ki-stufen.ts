/**
 * KI-Mitarbeiter-Stufen. Entwürfe zur Prüfung durch die Gründer.
 * Keine Zeit- oder Preisangaben, Aufwand nur als Einschätzung in Worten.
 */
export const kiStufen = [
  {
    id: 'praktikant',
    titel: 'Praktikant',
    motto: 'Fragt nach, bevor er etwas falsch macht.',
    kann: 'Beantwortet einfache, häufige Fragen deiner Kunden, zum Beispiel zu Öffnungszeiten, Leistungen oder Anfahrt. Alles andere gibt er sauber an dich weiter.',
    aufwand: 'Gering',
    aufwandStufe: 1,
    unterlagen: ['Deine Webseite', 'Eine Liste häufiger Kundenfragen', 'Öffnungszeiten und Kontaktwege'],
  },
  {
    id: 'azubi',
    titel: 'Azubi',
    motto: 'Kennt den Betrieb und lernt jeden Tag dazu.',
    kann: 'Kennt dein Angebot im Detail, sortiert eingehende Anfragen vor und schreibt Antwortentwürfe, die du nur noch prüfst und abschickst.',
    aufwand: 'Überschaubar',
    aufwandStufe: 2,
    unterlagen: [
      'Alles vom Praktikanten',
      'Beschreibungen deiner Leistungen oder Produkte',
      'Ein paar gute Beispiel-Antworten aus deinem Alltag',
    ],
  },
  {
    id: 'mitarbeiter',
    titel: 'Mitarbeiter',
    motto: 'Erledigt feste Abläufe selbstständig.',
    kann: 'Übernimmt wiederkehrende Abläufe von Anfang bis Ende, zum Beispiel Terminvorschläge, Rückfragen oder das Eintragen von Anfragen in deine Programme. Bei Ausnahmen meldet er sich.',
    aufwand: 'Mittel',
    aufwandStufe: 3,
    unterlagen: [
      'Alles vom Azubi',
      'Beschreibung der Abläufe, die er übernehmen soll',
      'Zugang zu den Programmen, mit denen er arbeiten soll',
      'Klare Regeln, wann er dich fragen muss',
    ],
  },
  {
    id: 'teamleiter',
    titel: 'Teamleiter-Niveau',
    motto: 'Behält den Überblick, damit du es nicht musst.',
    kann: 'Koordiniert mehrere Aufgaben und Abläufe, fasst zusammen, was passiert ist, und meldet dir, wo du gebraucht wirst.',
    aufwand: 'Hoch, Schritt für Schritt',
    aufwandStufe: 4,
    unterlagen: [
      'Alles vom Mitarbeiter',
      'Deine Ziele und Prioritäten',
      'Wer im Betrieb wofür zuständig ist',
      'Was er freigeben darf und was nicht',
    ],
  },
] as const;
