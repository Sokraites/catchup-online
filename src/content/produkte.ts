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

/**
 * Abschnitt „Unsere Zusammenarbeit“ der Startseite: dieselben drei Stufen, aus Sicht der Zusammenarbeit.
 * Texte wörtlich aus dem Auftrag der Gründer (28.10.2026), Entwurf zur Prüfung.
 */
export const zusammenarbeit: { badge: string; titel: string; text: string; href: string; linkText: string }[] = [
  {
    badge: 'Stufe 1 — Der Türöffner',
    titel: 'Next-Gen Web & KI-Sichtbarkeit',
    text: 'Extrem hochwertige, blitzschnelle Webseite mit modernen 3D-Scroll-Effekten als optischem Wow-Faktor. Sauberes Schema.org-Markup (JSON-LD), klare Entitäts-Verknüpfungen und strukturierte FAQ-Matrizen, damit ChatGPT, Perplexity und Google AI dein Unternehmen als Top-Empfehlung ausspielen.',
    href: '/webseiten-erstellen/',
    linkText: 'Mehr erfahren',
  },
  {
    badge: 'Stufe 2 — Das Add-on',
    titel: 'Der 24/7 KI-Vorqualifizierer',
    text: 'Keine nervigen Standard-Chatbots, sondern ein intelligentes Anfrage-System (Voice- oder Text-Agent), das Kundenanfragen sofort qualifiziert, Termine bucht und strukturierte Daten direkt ins Postfach oder CRM legt.',
    href: '/software-nach-mass/',
    linkText: 'Mehr erfahren',
  },
  {
    badge: 'Stufe 3 — Der Retainer',
    titel: 'Prozess-Automatisierung & GEO-Monitoring',
    text: 'Laufende Betreuung für technisches Hosting, monatliches Monitoring der KI-Auffindbarkeit und schrittweise Automatisierung interner Abläufe — z.B. automatisierte Angebotserstellung.',
    href: '/termin/',
    linkText: 'Gespräch vereinbaren',
  },
];
