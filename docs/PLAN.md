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

- [x] Platzhaltertexte für alle Abschnitte geschrieben
- [x] neu: Texte der Unterseiten geschrieben (inkl. KI-Stufen: Praktikant, Azubi, Mitarbeiter, Teamleiter-Niveau mit Aufwand und benötigten Unterlagen)
- [x] neu: Abschnitt „Ablauf in vier Schritten“ (Idee aus der Vergleichsseite)
- [x] neu: `llms.txt` für KI-Systeme
- [x] neu: Schriften selbst ausgeliefert (Space Grotesk, Inter, JetBrains Mono)
- [x] Reine Textversion auf Smartphone-Breite gestaltet
- [x] Reine Textversion auf Tablet- und Desktop-Breite gestaltet
- [x] SEO-Grundlage gesetzt (Titel, Beschreibung, Open Graph, `sitemap.xml`, `robots.txt`)
- [x] Strukturierte Daten mit Platzhaltern eingebaut
- [x] FAQ-Abschnitt geschrieben

## Phase C: Kachel-Hintergrund

- [x] Kachelraster statisch sichtbar auf Smartphone, Tablet und Desktop
- [x] Aufleuchten beim Mauszeiger auf dem Desktop (Spur wie bei einem Spiel, ohne Klicken)
- [x] Touch-Variante des Aufleuchtens auf Smartphone und Tablet (Funkeln beim Darüberstreichen)
- [x] Erste festgelegte Kachel bleibt nach Aktivierung dauerhaft leuchtend (Vorschlag: Reihe 7, Spalte 7)
- [x] Zweite Kachel wird dadurch freigeschaltet (Vorschlag: Reihe 14, Spalte 14)
- [x] Gesamte Kette aller festgelegten Kacheln umgesetzt
- [x] neu: Auge, das Mauszeiger bzw. Finger folgt, mit Kacheln verbunden
- [ ] Wirkung der Freischaltung vorgeschlagen, entschieden und umgesetzt (vorläufig: Welle über das Raster plus Meldung mit Termin-Knopf)
- [x] Ruhige Variante bei reduzierter Bewegung umgesetzt

## Phase D: Monitor und Scroll-Erlebnis

- [x] Monitor zentral dargestellt (zunächst statisch, alle Geräte)
- [x] Seiteninhalt im Monitor ist echter, lesbarer Text
- [x] Scrollgesteuerter Inhaltswechsel im Monitor
- [x] Zusammenspiel von Kacheln und Monitor abgestimmt
- [x] Idee „Monitor durch die Geschichte des Digitalen“ bewertet und entschieden
  - [x] Entwurf gebaut: `/entwurf/monitor/` (Rad-Wechsel, Epochen 1995 bis heute, normaler Scroll, Tastatur, ruhige Variante)
  - [x] Gründer hat den Entwurf auf Handy und Desktop angesehen und entschieden (beibehalten, ist jetzt Startseite)

## Phase D2 (neu): KI-Mitarbeiter-Unterseite

- [x] Vier Stufen als Karten mit echtem Text (Praktikant, Azubi, Mitarbeiter, Teamleiter-Niveau)
- [x] Handy: seitliches Durchwischen wie bei Bildergalerien
- [x] Desktop: beim Scrollen kommen die Stufen von rechts herein
- [x] 3D-Figuren pro Stufe, unterschiedlich professionell, mit einladenden Animationen (Three.js, nur auf dieser Seite geladen)
- [x] Ruhige Variante bei reduzierter Bewegung, Bedienung per Tastatur

## Phase D3 (neu): Terminbuch

- [x] „Termin buchen“ öffnet ein aufschlagendes Buch (Handy und Desktop)
- [ ] Kalender mit Terminvorschlag, belegte Tage sind sichtbar (Kalender steht; belegte Tage erst mit Kalender-Anbindung)
- [x] neu: Blättern auf den aktuellen Monat, heutiger Tag wird von einer Feder rot umkreist
- [x] neu: Seiten mit Finger oder Maus umblättern (Blatt folgt der Hand), rechte Seite leer bis zur Tageswahl
- [x] Siegelstempel auf dem gewählten Tag
- [x] Beim Absenden faltet sich ein Brief und wird mit dem Logo gesiegelt
- [x] Animationen bremsen die Eingabe nie aus (genauso schnell wie ein schlichter Kalender)
- [x] Ohne JavaScript: schlichte Terminanfrage-Seite
- [ ] Anbindung: Versand der Anfrage und belegte Tage (abhängig vom Hosting). Bis dahin: vorbereitete E-Mail, ehrlich beschriftet

## Phase E: Qualität

- [x] Test auf Smartphone-Breite, Tablet-Breite und Desktop
- [x] Leistungsmessung (Lighthouse mobil sowie Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift)
- [x] Barrierefreiheit geprüft (Tastatur, Kontrast, Alternativtexte)
- [x] Seite ohne JavaScript lesbar
- [x] Abgleich mit Zielbild (Abschnitte 1 und 4) und Liste der Lücken
- [x] Abschlussbericht: Was fehlt noch vor dem Livegang (siehe `docs/QUALITAET.md`)

## Phase E2: Darstellungs-Stufen und Software nach Maß (22.10.2026)

- [x] Drei Stufen (Leicht, Mittel, Schwer): Hinweis beim ersten Besuch, Schalter oben rechts, Wechsel lädt neu
- [x] Leicht: ruhige Seite mit großen, selbst gerenderten Bildern, nur das Nötigste
- [x] Mittel: Monitor-Zeitreise und Terminbuch; Schwer: zusätzlich Kachel-Rätsel und lebendige 3D-Figuren
- [x] Abschnitt „Welche digitale Lösung würde dir wirklich weiterhelfen?“ und Unterseite „Software nach Maß“
- [x] Tabs in der Vorschau stabil (vorher Fehler nach einigen Tabs)
- [x] Terminbuch Handy: Eselsohr zum Antippen, eigene Blätter-Animation für die Pfeile
- [x] Datenschutz-Entwurf: lokaler Eintrag für die gewählte Stufe beschrieben

## Auftrag Livegang-Vorbereitung (22.10.2026)

Regeln: nichts veröffentlichen (kein Push, kein Deployment), nichts erfinden, Platzhalter als `<<HIER ANGABE EINTRAGEN: …>>`.

Stufe 1: Seite überarbeiten
- [x] 1.1 Bauen, in 360, 768 und 1440 px ansehen, Befunde (Muss, Soll, Kann) notieren
- [x] 1.2 KI-Mitarbeiter-Stufenmodell entfernen (nur noch Zusatzzeile zu KI-Agenten), ungenutzte Bibliotheken raus
- [x] 1.2 Kachel-Pfad gehört zur Standard-Darstellung (Zielbild), Touch-Variante vollwertig
- [x] 1.2 Muss- und Soll-Punkte beheben (Überlauf 360 px, Konsolenfehler, Tastatur, Kontrast)
- [x] 1.3 Texte prüfen, feste Kontaktdaten aus der Konfiguration, Kontaktbereich
- [x] 1.4 Kurzbericht Stufe 1

Stufe 2: Veröffentlichungsreife
- [x] 2.1 Zentrale Konfiguration vollständig (inkl. Schalter INDEXIERUNG, Standard aus)
- [x] 2.2 Schalter INDEXIERUNG wirkt auf Meta-Robots, robots.txt, Sitemap-Verweis
- [x] 2.3 Impressum nach § 5 DDG mit Platzhaltern und Entwurfs-Vermerk
- [x] 2.4 Datenschutzerklärung als Entwurf, nur was wirklich stattfindet
- [x] 2.5 Keine Verbindungen zu fremden Servern; Cookies und lokaler Speicher geprüft
- [x] 2.6 Title, Description, Canonical, Open Graph, Sitemap, JSON-LD, FAQ
- [x] 2.7 404, Favicon, Manifest
- [x] 2.8 `_headers` für Cloudflare Pages inkl. getesteter Content-Security-Policy
- [x] 2.9 Statischer Build, Dateizahl, größte Datei, `catchup-seite.zip`
- [x] 2.10 Prüfungen a) bis g)
- [x] 2.11 `VERÖFFENTLICHUNG.md`

## Phase F: Vor dem Livegang (liegt bei den Gründern)

- [ ] Name und Domain final entschieden
- [ ] Impressum und Datenschutzerklärung mit echten Angaben gefüllt und rechtlich geprüft
- [ ] Hosting gebucht und Domain verbunden
- [ ] Eigene Telefonnummer und E-Mail-Adresse eingerichtet und in `src/config/site.ts` eingetragen
- [ ] Messung der Anfragen datenschutzfreundlich eingerichtet

## Prüfwerkzeuge

- `npm run build`, dann `npm run preview` und in einem zweiten Fenster `npm run pruefen`: prüft alle Seiten auf Handy, Tablet und Desktop, jeweils mit und ohne JavaScript (eine Hauptüberschrift, kein seitlicher Überlauf, Tippflächen, automatische Barrierefreiheitsprüfung).
- `npm run vorschau`: baut aus `dist/` eine Fassung mit relativen Links in `.vorschau/` (für die private Vorschau).
- `npm run ansehen`: zeigt den Build lokal an (http://localhost:4321) mit den Sicherheits-Headern aus `_headers`.
- `node scripts/funktionstest.mjs`: klickt die wichtigen Abläufe mit aktiver Content-Security-Policy durch und prüft alle Links.
- `npm run paket`: packt `dist/` als `catchup-seite.zip`.
- `npm run monitore`: rendert Monitor-Gehäuse und die großen Bilder (`public/bilder/`) aus den 3D-Modellen neu. Nur die großen Bilder: `node scripts/monitore-rendern.mjs szenen`.
- `npm run komprimieren`: komprimierte Fassungen für schnellere Auslieferung (nach dem Bauen).
- `sh scripts/messen.sh`: Lighthouse-Messung im Handy-Modus; `node scripts/reaktion.mjs`: Reaktionszeit auf Eingaben.
- `npm run bilder`: erzeugt Vorschaubild (`public/og.png`) und Logo-Bild neu, z. B. nach Namensänderung.

## Bekannte Lücken (laufend)

- Kacheln auf dem Handy: Funkeln beim Wischen nur nachgestellt getestet, nicht auf echten Geräten.
- Pfad-Kacheln hinter dem Kopfbereich oder außerhalb kleiner Bildschirme (z. B. Handy quer) sind nicht erreichbar.

- Monitor-Entwurf: lange Abschnitte scrollen im Monitor, die Drehung rastet am Ende ein. Auf echten Handys noch nicht getestet (nur nachgestellt).

- Alle Texte sind Entwürfe und müssen vom Gründer geprüft werden.
- Terminseite ist bis Phase D3 nur ein Hinweis mit Telefon und E-Mail.
- Strukturierte Daten lassen Telefon, E-Mail und Adresse weg, solange es Platzhalter sind (werden automatisch ergänzt, sobald echt eingetragen).
- Das Vorschaubild für geteilte Links wurde noch nicht in echten Messengern getestet (geht erst mit veröffentlichter Seite).
