# Plan und Etappen

Übernommen aus `UEBERGABE.md`, Abschnitt 8. Ergänzt um die Entscheidungen vom 20.10.2026 (mit „neu“ markiert).
Nach jeder Etappe abhaken. Jede Etappe wird auf 390 px (Handy), 820 px (Tablet) und 1440 px (Desktop) geprüft.

## Phase A: Fundament

- [x] Dokument gelesen, Zielbild in eigenen Worten zurückgespielt und bestätigt
- [x] `CLAUDE.md` angelegt
- [x] Technikvorschlag (Aufbau, Animation, Hosting) vorgelegt und freigegeben
- [x] Projektgerüst und Git angelegt, läuft lokal
- [x] Zentrale Konfigurationsdatei angelegt (Name, Claim, Domain, Kontaktangaben als Platzhalter)
- [x] Semantisches Seitengerüst steht (Kopfbereich, Hauptteil, Abschnitte, Fußbereich)
- [x] Platzhalterseiten für Impressum und Datenschutz angelegt
- [x] neu: Unterseiten pro Leistung angelegt (neue Webseite, Modernisierung, Gefunden werden, KI-Mitarbeiter, Termin)
- [x] neu: Vorladen von Links beim Überfahren (Desktop) bzw. Antippen (Handy) aktiv
- [x] neu: Logo-Platzhalter (Herz im umgedrehten Dreieck) und Favicon

## Phase B: Inhalt ohne Effekte

- [ ] Platzhaltertexte für alle Abschnitte geschrieben
- [ ] neu: Texte der Unterseiten geschrieben (inkl. KI-Stufen: Praktikant, Azubi, Mitarbeiter, Teamleiter-Niveau mit Aufwand und benötigten Unterlagen)
- [ ] neu: Schriften selbst ausgeliefert (Space Grotesk, Inter, JetBrains Mono)
- [ ] Reine Textversion auf Smartphone-Breite gestaltet
- [ ] Reine Textversion auf Tablet- und Desktop-Breite gestaltet
- [ ] SEO-Grundlage gesetzt (Titel, Beschreibung, Open Graph, `sitemap.xml`, `robots.txt`)
- [ ] Strukturierte Daten mit Platzhaltern eingebaut
- [ ] FAQ-Abschnitt geschrieben

## Phase C: Kachel-Hintergrund

- [ ] Kachelraster statisch sichtbar auf Smartphone, Tablet und Desktop
- [ ] Aufleuchten beim Mauszeiger auf dem Desktop (Spur wie bei einem Spiel, ohne Klicken)
- [ ] Touch-Variante des Aufleuchtens auf Smartphone und Tablet (Funkeln beim Darüberstreichen)
- [ ] Erste festgelegte Kachel bleibt nach Aktivierung dauerhaft leuchtend (Vorschlag: Reihe 7, Spalte 7)
- [ ] Zweite Kachel wird dadurch freigeschaltet (Vorschlag: Reihe 14, Spalte 14)
- [ ] Gesamte Kette aller festgelegten Kacheln umgesetzt
- [ ] neu: Auge, das Mauszeiger bzw. Finger folgt, mit Kacheln verbunden
- [ ] Wirkung der Freischaltung vorgeschlagen, entschieden und umgesetzt
- [ ] Ruhige Variante bei reduzierter Bewegung umgesetzt

## Phase D: Monitor und Scroll-Erlebnis

- [ ] Monitor zentral dargestellt (zunächst statisch, alle Geräte)
- [ ] Seiteninhalt im Monitor ist echter, lesbarer Text
- [ ] Scrollgesteuerter Inhaltswechsel im Monitor
- [ ] Zusammenspiel von Kacheln und Monitor abgestimmt
- [ ] Idee „Monitor durch die Geschichte des Digitalen“ bewertet und entschieden (Gründer möchte sie sehen: als Entwurf zeigen)

## Phase D2 (neu): KI-Mitarbeiter-Unterseite

- [ ] Vier Stufen als Karten mit echtem Text (Praktikant, Azubi, Mitarbeiter, Teamleiter-Niveau)
- [ ] Handy: seitliches Durchwischen wie bei Bildergalerien
- [ ] Desktop: beim Scrollen kommen die Stufen von rechts herein
- [ ] 3D-Figuren pro Stufe, unterschiedlich professionell, mit einladenden Animationen (Three.js, nur auf dieser Seite geladen)
- [ ] Ruhige Variante bei reduzierter Bewegung, Bedienung per Tastatur

## Phase D3 (neu): Terminbuch

- [ ] „Termin buchen“ öffnet ein aufschlagendes Buch (Handy und Desktop)
- [ ] Kalender mit Terminvorschlag, belegte Tage sind sichtbar
- [ ] Siegelstempel auf dem gewählten Tag
- [ ] Beim Absenden faltet sich ein Brief und wird mit dem Logo gesiegelt
- [ ] Animationen bremsen die Eingabe nie aus (genauso schnell wie ein schlichter Kalender)
- [ ] Ohne JavaScript: schlichte Terminanfrage-Seite
- [ ] Anbindung: Versand der Anfrage und belegte Tage (abhängig vom Hosting)

## Phase E: Qualität

- [ ] Test auf Smartphone-Breite, Tablet-Breite und Desktop
- [ ] Leistungsmessung (Lighthouse mobil sowie Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift)
- [ ] Barrierefreiheit geprüft (Tastatur, Kontrast, Alternativtexte)
- [ ] Seite ohne JavaScript lesbar
- [ ] Abgleich mit Zielbild (Abschnitte 1 und 4) und Liste der Lücken
- [ ] Abschlussbericht: Was fehlt noch vor dem Livegang

## Phase F: Vor dem Livegang (liegt bei den Gründern)

- [ ] Name und Domain final entschieden
- [ ] Impressum und Datenschutzerklärung mit echten Angaben gefüllt und rechtlich geprüft
- [ ] Hosting gebucht und Domain verbunden
- [ ] Eigene Telefonnummer und E-Mail-Adresse eingerichtet und in `src/config/site.ts` eingetragen
- [ ] Messung der Anfragen datenschutzfreundlich eingerichtet

## Bekannte Lücken (laufend)

- Links in Menü und Fußbereich sind auf dem Handy noch kleiner als 24 px hoch (Antippen schwierig). Wird mit der Gestaltung in Phase B behoben.
- Schriften sind noch Systemschriften. Eigene Schriften folgen in Phase B.
