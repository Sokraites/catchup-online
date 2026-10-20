/**
 * Zentrale Konfiguration der Webseite.
 *
 * Name, Claim, Domain und Kontaktangaben stehen NUR hier.
 * Alles, was mit `PLATZHALTER` markiert ist, muss vor dem Livegang ersetzt werden.
 */

/** Markiert einen Wert als Platzhalter. Wird auf der Seite sichtbar gekennzeichnet. */
export type Wert = { text: string; platzhalter: boolean };
const PLATZHALTER = (text: string): Wert => ({ text, platzhalter: true });

export const site = {
  /** Arbeitsname, nicht endgültig. */
  name: 'Catchup',
  /** Claim aus der Vergleichsseite übernommen, noch nicht final. */
  claim: 'Webseiten, die aufholen.',
  /** Platzhalter-Domain, noch nicht registriert. Ohne Schrägstrich am Ende. */
  url: 'https://catchup-digital.com',
  sprache: 'de',
  region: {
    schwerpunkt: 'Donnersbergkreis',
    land: 'Rheinland-Pfalz',
  },
  kontakt: {
    telefon: {
      anzeige: PLATZHALTER('[Telefonnummer folgt]'),
      /** Format für tel:-Links, z. B. "+49…". Leer = noch keine Nummer. */
      link: '',
    },
    email: PLATZHALTER('kontakt@catchup-digital.com'),
  },
  /** Angaben für Impressum und strukturierte Daten. Nichts davon erfinden. */
  rechtliches: {
    verantwortlich: PLATZHALTER('[Name der verantwortlichen Person]'),
    rechtsform: PLATZHALTER('[Rechtsform]'),
    anschrift: PLATZHALTER('[Straße Hausnummer, PLZ Ort]'),
    ustId: PLATZHALTER('[USt-IdNr., falls vorhanden]'),
  },
  /** Standard-Beschreibung für Suchmaschinen und Vorschauen. */
  beschreibung:
    'Moderne Webseiten, Modernisierung und Auffindbarkeit bei Google und KI-Suchen für Betriebe im Donnersbergkreis und in Rheinland-Pfalz.',
} as const;

/** Hauptnavigation. Reihenfolge = Reihenfolge im Menü. */
export const navigation = [
  { href: '/webseiten-erstellen/', label: 'Neue Webseite' },
  { href: '/webseiten-modernisieren/', label: 'Modernisierung' },
  { href: '/auffindbarkeit/', label: 'Gefunden werden' },
  { href: '/ki-mitarbeiter/', label: 'KI-Mitarbeiter' },
] as const;
