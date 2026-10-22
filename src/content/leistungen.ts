/**
 * Die Leistungen. Texte sind Entwürfe zur Prüfung durch die Gründer.
 * Wird auf der Startseite, in den Unterseiten und in den strukturierten Daten genutzt.
 */
export const leistungen = [
  {
    href: '/webseiten-erstellen/',
    nummer: '01',
    titel: 'Neue Webseite',
    kurz: 'Von Grund auf gebaut: schnell, klar und auf dem Handy zu Hause. Damit Besucher sofort verstehen, was du anbietest, und dich direkt erreichen.',
    schemaName: 'Webseiten erstellen',
    bild: '/bilder/neue-webseite.webp',
    bildText: 'Moderner Bildschirm und Handy zeigen dieselbe neue Webseite eines Betriebs.',
  },
  {
    href: '/webseiten-modernisieren/',
    nummer: '02',
    titel: 'Modernisierung',
    kurz: 'Deine Seite ist in die Jahre gekommen? Wir behalten, was funktioniert, und machen Gestaltung und Aufbau fit für heute.',
    schemaName: 'Webseiten modernisieren',
    bild: '/bilder/modernisierung.webp',
    bildText: 'Alter Röhrenmonitor mit einer Webseite von früher, daneben ein moderner Bildschirm mit der erneuerten Seite.',
  },
  {
    href: '/auffindbarkeit/',
    nummer: '03',
    titel: 'Gefunden werden',
    kurz: 'Suchmaschinenoptimierung (SEO) für Google und Auffindbarkeit bei KI-Suchsystemen wie ChatGPT und Claude. Damit Kunden aus der Region bei dir landen.',
    schemaName: 'Suchmaschinenoptimierung und Sichtbarkeit in KI-Suchen',
    bild: '/bilder/gefunden.webp',
    bildText: 'Handy mit einer Suche nach einer Schreinerei in der Nähe: Der eigene Betrieb steht oben, ein KI-Assistent empfiehlt ihn.',
  },
  {
    href: '/software-nach-mass/',
    nummer: '04',
    titel: 'Software nach Maß',
    kurz: 'Wenn es keine fertige Lösung gibt, die wirklich passt: Wir bauen genau das Werkzeug, das deinem Betrieb Arbeit abnimmt.',
    schemaName: 'Individuelle Software für Betriebe',
    bild: '/bilder/loesung.webp',
    bildText: 'Tablet mit einer eigenen Anwendung eines Betriebs: Aufträge, Termine und Auslastung auf einen Blick.',
  },
] as const;

/** Kurze Zusatzzeile zu KI-Agenten (mehr wird bewusst nicht beworben). */
export const kiZusatz =
  'Auf Wunsch binden wir auch KI-Agenten ein, die wiederkehrende Aufgaben übernehmen, zum Beispiel Anfragen vorsortieren.';

/** Ablauf einer Zusammenarbeit. */
export const ablauf = [
  {
    titel: 'Gespräch',
    text: 'Du erzählst, was deinen Betrieb ausmacht und wen du erreichen willst. Wir hören zu und stellen die richtigen Fragen.',
  },
  {
    titel: 'Entwurf',
    text: 'Du siehst früh, wie deine Seite aussehen wird, und sagst uns, was passt und was nicht.',
  },
  {
    titel: 'Umsetzung',
    text: 'Wir bauen die Seite, schreiben die Texte mit dir zusammen und sorgen dafür, dass sie gefunden wird.',
  },
  {
    titel: 'Start',
    text: 'Deine Seite geht online. Wir bleiben dein Ansprechpartner, wenn sich etwas ändert.',
  },
] as const;
