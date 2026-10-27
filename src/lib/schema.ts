/**
 * Strukturierte Daten (Schema.org) für Suchmaschinen und KI-Systeme.
 * Platzhalter werden bewusst weggelassen statt erfunden: Felder erscheinen erst,
 * wenn sie in src/config/site.ts echt eingetragen sind.
 */
import { site } from '../config/site';
import type { Frage } from '../content/faq';

export const orgId = `${site.url}/#organisation`;

export function organisation() {
  const { telefon, email } = site.kontakt;
  return {
    '@type': 'ProfessionalService',
    '@id': orgId,
    name: site.name,
    slogan: site.claim,
    description: site.beschreibung,
    url: `${site.url}/`,
    logo: `${site.url}/logo.png`,
    image: `${site.url}/og.png`,
    knowsLanguage: 'de',
    areaServed: [
      { '@type': 'State', name: site.einsatzgebiet.bundesland, containedInPlace: { '@type': 'Country', name: site.einsatzgebiet.land } },
      { '@type': 'Country', name: site.einsatzgebiet.land },
    ],
    ...(telefon.link && !telefon.anzeige.platzhalter ? { telephone: telefon.link } : {}),
    ...(!email.platzhalter ? { email: email.text } : {}),
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: `${site.url}/`,
    name: site.name,
    inLanguage: 'de',
    publisher: { '@id': orgId },
  };
}

export function leistung(name: string, beschreibung: string, pfad: string) {
  return {
    '@type': 'Service',
    name,
    description: beschreibung,
    url: new URL(pfad, site.url).href,
    provider: { '@id': orgId },
  };
}

/** Das 3-Stufen-Angebot als Katalog der Organisation (ohne Preise). */
export function angebote(liste: { nummer: string; stufe: string; titel: string; kurz: string; href: string }[]) {
  return {
    '@type': 'ProfessionalService',
    '@id': orgId,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Leistungen von ${site.name}`,
      itemListElement: liste.map((p, i) => ({
        '@type': 'Offer',
        position: i + 1,
        itemOffered: {
          '@type': 'Service',
          name: p.titel,
          description: p.kurz,
          category: `${p.nummer} · ${p.stufe}`,
          url: new URL(p.href, site.url).href,
          provider: { '@id': orgId },
          areaServed: [
            { '@type': 'State', name: site.einsatzgebiet.bundesland },
            { '@type': 'Country', name: site.einsatzgebiet.land },
          ],
        },
      })),
    },
  };
}

export function faqSeite(fragen: Frage[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: fragen.map((f) => ({
      '@type': 'Question',
      name: f.frage,
      acceptedAnswer: { '@type': 'Answer', text: f.antwort },
    })),
  };
}

export function brotkrumen(titel: string, pfad: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Start', item: `${site.url}/` },
      { '@type': 'ListItem', position: 2, name: titel, item: new URL(pfad, site.url).href },
    ],
  };
}

/** Bündelt mehrere Einträge in einem @graph. */
export function graph(...eintraege: object[]) {
  return { '@context': 'https://schema.org', '@graph': eintraege };
}
