/**
 * Das 3-Stufen-Angebot: die Karten im Abschnitt „Leistungen“ der Startseite und der Angebotskatalog
 * in den strukturierten Daten (src/lib/schema.ts). Texte sind Entwürfe zur Prüfung durch die Gründer.
 * Menü und Unterseiten folgen weiter den Leistungen in src/content/leistungen.ts.
 */
import type { MediumName } from '../config/medien';

export const produkte: {
  nummer: string;
  stufe: string;
  titel: string;
  kurz: string;
  href: string;
  medium: MediumName;
}[] = [
  {
    nummer: '01',
    stufe: 'Fundament',
    titel: 'Next-Gen Web & KI-Sichtbarkeit (GEO)',
    kurz: 'Eine hochmoderne, blitzschnelle Webseite mit sauber ausgezeichneten Daten. So verstehen Google, ChatGPT und andere KI-Assistenten, was du anbietest, und können dich in deiner Region empfehlen.',
    href: '/webseiten-erstellen/',
    medium: '01-neue-webseite',
  },
  {
    nummer: '02',
    stufe: 'Konversion',
    titel: '24/7 KI-Vorqualifizierer',
    kurz: 'Prüft Kunden- und Bewerberanfragen rund um die Uhr vor: filtert, beantwortet Standardfragen und legt passende Termine direkt in deinen Kalender.',
    href: '/software-nach-mass/',
    medium: 'ki-vorqualifizierer',
  },
  {
    nummer: '03',
    stufe: 'Laufender Vorsprung',
    titel: 'Prozess-Automatisierung & GEO-Monitoring',
    kurz: 'Wir bleiben an deiner Seite: Jeden Monat prüfen wir, wie gut KI-Assistenten dich finden, und automatisieren Schritt für Schritt Büroabläufe, die dich heute Zeit kosten.',
    href: '/auffindbarkeit/',
    medium: '03-gefunden-werden',
  },
];
