/**
 * Zentrale Konfiguration der Webseite.
 *
 * Name, Claim, Domain und Kontaktangaben stehen NUR hier.
 * Alles, was mit `PLATZHALTER` markiert ist, muss vor dem Livegang ersetzt werden (siehe VERÖFFENTLICHUNG.md).
 */

/** Ein Wert für die Seite. Platzhalter werden sichtbar markiert und in VERÖFFENTLICHUNG.md aufgelistet. */
export type Wert = { text: string; platzhalter: boolean };
const PLATZHALTER = (was: string): Wert => ({ text: `<<HIER ANGABE EINTRAGEN: ${was}>>`, platzhalter: true });
const ECHT = (text: string): Wert => ({ text, platzhalter: false });

/**
 * Schalter INDEXIERUNG.
 * false (Standard): Suchmaschinen sollen die Seite nicht aufnehmen (noindex, nofollow auf jeder Seite,
 *   robots.txt sperrt alles, kein Verweis auf die Sitemap).
 * true: alles erlaubt, robots.txt verweist auf die Sitemap. Erst einschalten, wenn Impressum und
 *   Datenschutz vollständig und rechtlich geprüft sind.
 */
export const INDEXIERUNG = false;

/**
 * Schalter REFERENZEN: Projekt „Ottos Werkstatt“ zeigen.
 * false (Standard), bis die schriftliche Freigabe des Kunden für Nennung, Fotos und Kontaktdaten vorliegt.
 * Bei false fehlt der Abschnitt „Projekte“, und die Projektseite wird nicht mit ausgeliefert.
 */
export const REFERENZEN = false;

export const site = {
  /** Arbeitsname. */
  name: 'Catch up',
  claim: 'Webseiten, die aufholen.',
  /** Domain, noch nicht registriert (Platzhalter). Ohne Schrägstrich am Ende. Wirkt auf Canonical, Sitemap, Open Graph, JSON-LD. */
  url: 'https://catchup-digital.com',
  sprache: 'de',
  region: {
    schwerpunkt: 'Donnersbergkreis',
    land: 'Rheinland-Pfalz',
  },
  kontakt: {
    /** Wird später durch eine Adresse auf der eigenen Domain ersetzt: nur hier ändern. */
    email: ECHT('catchup-digital@protonmail.com'),
    telefon: {
      /** So wird die Nummer angezeigt. */
      anzeige: ECHT('+49 176 84607083'),
      /** Für tel:-Links, ohne Leerzeichen. */
      link: '+4917684607083',
    },
  },
  /** Angaben für Impressum und Datenschutz. Nichts davon erfinden. */
  rechtliches: {
    firma: PLATZHALTER('Firmenname und Rechtsform'),
    anschrift: PLATZHALTER('ladungsfähige Anschrift (Straße, Hausnummer, PLZ, Ort)'),
    vertretung: PLATZHALTER('vertretungsberechtigte Person(en)'),
    register: PLATZHALTER('Registergericht und Registernummer, falls im Handelsregister eingetragen, sonst Zeile entfernen'),
    ustId: PLATZHALTER('Umsatzsteuer-Identifikationsnummer nach § 27a UStG, falls vorhanden, sonst Zeile entfernen'),
    inhaltlichVerantwortlich: PLATZHALTER('Name und Anschrift der inhaltlich verantwortlichen Person'),
    hosting: PLATZHALTER('Hosting-Anbieter mit Anschrift'),
  },
  /** Standard-Beschreibung für Suchmaschinen und Vorschauen. */
  beschreibung:
    'Neue Webseiten, Modernisierung, Suchmaschinenoptimierung und Auffindbarkeit bei KI-Suchsystemen für Betriebe im Donnersbergkreis und in Rheinland-Pfalz.',
} as const;

/** Hauptnavigation. Reihenfolge = Reihenfolge im Menü. */
export const navigation = [
  { href: '/webseiten-erstellen/', label: 'Neue Webseite' },
  { href: '/webseiten-modernisieren/', label: 'Modernisierung' },
  { href: '/auffindbarkeit/', label: 'Gefunden werden' },
  { href: '/software-nach-mass/', label: 'Software nach Maß' },
] as const;
