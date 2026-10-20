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
  },
  {
    href: '/webseiten-modernisieren/',
    nummer: '02',
    titel: 'Modernisierung',
    kurz: 'Deine Seite ist in die Jahre gekommen? Wir behalten, was funktioniert, und machen Gestaltung und Aufbau fit für heute.',
    schemaName: 'Webseiten modernisieren',
  },
  {
    href: '/auffindbarkeit/',
    nummer: '03',
    titel: 'Gefunden werden',
    kurz: 'Bei Google und bei KI-Assistenten wie ChatGPT und Claude. Damit Kunden aus der Region bei dir landen und nicht beim Mitbewerber.',
    schemaName: 'Suchmaschinenoptimierung und Sichtbarkeit in KI-Suchen',
  },
  {
    href: '/ki-mitarbeiter/',
    nummer: '04',
    titel: 'KI-Mitarbeiter',
    kurz: 'Ein digitaler Kollege für wiederkehrende Aufgaben. Vom Praktikanten bis zur Teamleitung, so viel Verantwortung, wie du ihm gibst.',
    schemaName: 'KI-Mitarbeiter für Betriebe',
  },
] as const;

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
