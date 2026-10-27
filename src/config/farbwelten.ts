/**
 * Farbwelten der Stufe Mittel: Jeder Themenbereich hat eine eigene dunkle Grundfarbe und eine Akzentfarbe.
 * Die Farbwerte stehen als CSS-Variablen in src/styles/farbwelten.css. Hier steht nur, welche Welt wohin gehört.
 *
 * - Startseite: Ein Abschnitt, dessen id eine Welt ist (z. B. #nutzen), bekommt diese Welt.
 * - Unterseiten: Die ganze Seite steht in der Welt ihres Themas; Abschnitte wie #faq oder #kontakt behalten ihre eigene.
 * - Alles andere (Einstieg, Impressum, Datenschutz, Fehlerseite): Grundfarbe „hero“.
 */
export type Welt = 'hero' | 'leistungen' | 'nutzen' | 'auffindbarkeit' | 'software' | 'idee' | 'ablauf' | 'faq' | 'kontakt';

/** Abschnitte mit eigener Welt (id des Abschnitts = Name der Welt) */
export const abschnittsWelten: Welt[] = ['leistungen', 'nutzen', 'auffindbarkeit', 'idee', 'ablauf', 'faq', 'kontakt'];

/** Unterseiten und ihre Welt */
export const seitenWelten: Record<string, Welt> = {
  '/webseiten-erstellen/': 'leistungen',
  '/webseiten-modernisieren/': 'leistungen',
  '/auffindbarkeit/': 'auffindbarkeit',
  '/software-nach-mass/': 'software',
  '/termin/': 'kontakt',
};
