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

## Aussicht durchs Fenster (23.10.2026)

- [x] WebGL-Szene: Meer mit Wellen, Gebirge, Stadt am Hang, Himmel, Sonne, Milchstraße
- [x] Sonnenlauf an den Scrollfortschritt gekoppelt, Nacht am Seitenende
- [x] Gewitterwolke mit Blitzen (30–65 s), Sternschnuppen abends (10–25 s)
- [x] Fensterrahmen, Wand, Schreibtisch; Monitor macht Platz
- [x] Tischkalender mit Zoom, Stift-Cursor, Zurück-Knopf, Übergabe an das Terminbuch
- [x] Nur Desktop und Stufe Schwer; Szene pausiert bei offenem Kalender, Terminbuch oder verstecktem Tab
- [x] Funktionstest erweitert
- [x] Prüf-Agent: Befunde ausgewertet und behoben (Zimmerlicht, Wolke, Stadt, Kontrast Fußbereich, Zeichenschleife, Fokus im Kalender, weiche Kanten, Blitz am Tag)
- [x] Nach GitHub pushen

## Foto-Aussicht, Gestaltung, Region entfernt (24.10.2026)

- [x] Foto als Aussicht (Stufe Schwer, Desktop) mit Sonnenlauf, Wellen, Gewitter, Nachthimmel, Sternschnuppen, Stadtlichtern
- [x] Tischkalender sitzt auf dem Kalender im Foto
- [x] Region „Donnersbergkreis“ und „Rheinland-Pfalz“ entfernt
- [x] Gestaltung hochwertiger (Goldlinien, Karten, Muster; Leicht mit stärkeren Akzenten)
- [ ] Sonne im dritten Fenster von rechts: hinter dem Monitor, Entscheidung offen
- [ ] Version 2 erstellen (nur auf Wunsch)

## Versionen und Einsteiger-Doku (23.10.2026)

Nur Paketierung und Dokumentation, nichts an Inhalt, Design oder Verhalten der Seite.

- [x] 1 Grund für die fehlende ZIP geprüft (`.gitignore` Zeile 7 und 2), Ausnahme `!releases/` ergänzt
- [x] 2 Ordner `releases/` mit `README.md`, `AKTUELL.md` und `v1/` (ZIP, Prüfsumme, Inhalt, Version)
- [x] 3 `scripts/release.mjs` und `npm run release -- <Version>`, Probelauf in einem temporären Ordner
- [x] 4 `START-HIER.md` für Einsteiger
- [x] 5 `VERÖFFENTLICHUNG.md`: Abschnitt „Was ich als Nächstes tun muss“ oben
- [x] 6 Version 1 bauen, committen, Tag `v1`, Branch und Tag pushen

## Bilder und Videos in den Karten (25.10.2026)

- [x] 1. Code gelesen, Stufenlogik erklärt (Wechsel lädt die Seite neu, siehe Abweichungen im Bericht)
- [x] 2. Medien unverändert nach `public/media/` kopiert (12 Dateien, Prüfsummen gleich)
- [x] 3. Zentrale Liste `src/config/medien.ts` (Geschwindigkeit, Bildausschnitt, weicher Neustart); Karte 04 mit bisherigem Bild, neue Dateien `04-software-nach-mass.webp/.mp4/.webm` greifen beim nächsten Bauen automatisch
- [x] 4. Stufe Leicht: Standbilder 16:9 in Karte 01–03 und „Deine Idee“, kein Video
- [x] 5. Stufe Mittel: Videos ab 25 % Sichtbarkeit, Pause beim Verlassen, höchstens zwei gleichzeitig; Standbild bei reduzierter Bewegung, Datensparmodus, gesperrtem Autoplay
- [x] 6. Video 01: weicher Neustart (Ausblenden über das Standbild statt hartem Sprung)
- [x] 7. Handy: Stufen-Schalter rutschte bei 417–439 px Breite in eine zweite Zeile, Menü lag links außerhalb des Bildschirms. Behoben (Kopfzeile bleibt einzeilig, Menü wird notfalls in den Bildschirm geschoben)
- [x] 8. Build ohne Warnungen, Funktionstest und Barrierefreiheit ohne Befund
- [x] 9. Screenshots 390 und 1440 px, Stufe Leicht und Mittel
- [ ] Karte 04: eigenes Bild und Video liefern
- [ ] Stufe Schwer zeigt die Videos noch nicht (bewusst unverändert); auf Wunsch freischalten
- [ ] Stufenwechsel ohne Neuladen (größerer Umbau, siehe Bericht)

## Stufe Mittel: Farbwelten und Politur (27.10.2026)

- [x] Monitor nur in Stufe Schwer; Mittel ist eine normale Seite mit Kachel-Raster im Hintergrund
- [x] Farbwelt je Abschnitt (`src/styles/farbwelten.css`, Zuordnung `src/config/farbwelten.ts`), Wechsel 1,2 s in der Bildschirmmitte
- [x] Akzentfarbe für Kategorie-Zeile, Überschrift, Links, Hover; Trennlinie in der Akzentfarbe des beginnenden Abschnitts
- [x] Überschriften Wort für Wort (ohne Zusatz-Bibliothek), Karten heben sich bei Maus und Tastatur-Fokus, eine Bewegungskurve für alle Übergänge
- [x] Scroll-Hinweis auf der Startseite (verschwindet nach 5 s oder beim Scrollen, speichert nichts)
- [x] Kontraste geprüft (docs/ENTSCHEIDUNGEN.md), Leicht und Schwer bildpunktgleich zum vorigen Stand
- [ ] Terminbuch auf dem Handy: Wisch-Leiste ist per Tastatur nicht erreichbar (bestand schon vorher, auch in Schwer)

## Stufe Mittel: Akzente, Politur, 3-Stufen-Angebot, GEO-Schema (27.10.2026)

- [x] Akzentfarbe auch beim Überfahren der Kartentitel; Trennlinie 0,25; Schatten 0 8px 32px; eine Bewegungskurve auch für den Farbwechsel
- [x] Überschriften Wort für Wort mit GSAP ScrollTrigger (60 ms, 0,5 s, 12 px), vorgelesen wird der ganze Satz
- [x] Einmaliger Schimmer auf der Kategorie-Zeile, Scroll-Hinweis mit zwei Pulsen, einmal pro Sitzung
- [x] Drei Produktkarten (01 Fundament, 02 Konversion, 03 Laufender Vorsprung), am breiten Bildschirm nebeneinander
- [x] Angebotskatalog und Einsatzgebiet in den strukturierten Daten der Startseite
- [ ] Datenschutzerklärung: Eintrag `scroll-hinweis-gezeigt` (sessionStorage) ergänzen und rechtlich prüfen lassen
- [ ] Eigene Unterseiten für KI-Vorqualifizierer und Automatisierung & Monitoring (Karten verlinken vorerst auf „Software nach Maß“ und „Gefunden werden“)
- [ ] Bild/Video für Karte 02: `public/media/ki-vorqualifizierer.webp`, `.mp4`, `.webm` (bis dahin das Tablet-Bild)
- [ ] Einstiegstext, Seitenbeschreibung und FAQ nennen noch die bisherigen vier Leistungen: an das 3-Stufen-Angebot anpassen?

## Stufe Mittel: Lichtstrahl, 3D-UI, Zusammenarbeit (28.10.2026)

- [x] Lichtstrahl (`src/components/Lichtstrahl.astro`, `src/scripts/lichtstrahl.ts`): Canvas 2D, Handy 3 / Tablet 5 / Desktop 8 Fasern, Puls 0,3–0,8 Hz (Handy halb), Deckkraft 0,15–0,6, Breite 2–5 px, Farbe je Welt per CSS-Übergang (Einstieg Lime), Ursprung folgt dem Scrollen (±20 px, 0,1 s)
- [x] Lesbarkeit: In der Inhaltsspalte wird der Strahl gedämpft; gemessen an den gezeichneten Bildpunkten bei voller Stärke mindestens 4,56:1 für jede Textfarbe (390/768/1440 px)
- [x] Knöpfe als Pillen mit Akzent-Verlauf, dunkler Schrift und Leuchten; Rahmen-Knöpfe in Akzentfarbe; Kopfleiste behält ihre Maße
- [x] Karten als Glas (Haarlinie, Schatten, Oberkante, Unschärfe Tablet 6 px / Desktop 8 px), Innenabstand 24/28/32 px, Anheben nur ab Tablet mit Maus
- [x] Leuchten für Kartennummern, Kategorie-Zeile und Überschriften (Handy schwächer)
- [x] Neue Sektion „Unsere Zusammenarbeit“ (`#zusammenarbeit`, Farbwelt Grün) mit Stufen-Abzeichen und Akzent-Oberkante
- [x] Behoben: Hauptpunkte außerhalb des Bildes blendeten beim Laden 0,6 s lang aus (axe maß halb durchsichtige Abzeichen)
- [ ] FAQ „Was kostet die laufende Betreuung?“ mit Preis: nicht eingebaut (Projektregel „Keine Preise“), Freigabe der Gründer nötig
- [ ] Unschärfe hinter Glas-Karten auf echten Geräten prüfen (ohne Grafikkarte halbiert sie die Bildrate)
- [ ] „Unsere Zusammenarbeit“ wiederholt die drei Produktkarten aus „Leistungen“: zusammenführen?

## Stufe Mittel sichtbar machen, auch auf dem Handy (28.10.2026)

Ursache „auf dem iPhone nichts zu sehen“: Der Strahl wurde über der ganzen Inhaltsspalte auf rund 10 % gedämpft. Auf dem Handy ist die Spalte so breit wie der Bildschirm, also blieb überall nur ein Hauch übrig (stärkste Stelle etwa 6 % Deckkraft). Knöpfe und Karten waren aktiv, auf dem Handy aber kaum vom alten Aussehen zu unterscheiden.

- [x] Stufen-Auswahl geprüft: ohne gespeicherte Wahl immer Mittel (außer bei „Bewegung reduzieren“: Leicht); `localStorage.clear()` → Mittel
- [x] Dämpfung nur noch hinter Textzeilen, Rahmen-Knöpfen und Karten; in den Lücken volle Stärke (Handy und Desktop)
- [x] Strahl kräftiger: Deckkraft Handy 0,5–0,8, sonst 0,4–0,9; Breite 3–8 px; 5 Schichten je Faser; Fasern Handy 3 / Tablet 5 / Desktop 8
- [x] Hintergrund-Ebene `.farbwelt` entfernt (lag zwar unter dem Strahl, ist aber durch ihn ersetzt); Schichten: Grund → Strahl → Kacheln → Inhalt
- [x] Eine Akzentfarbe `--akzent` am `<html>`, gesetzt beim Scrollen; Knöpfe, Karten, Überschriften, Links und Strahl gleiten in 1,2 s mit
- [x] Karten: Glas mit Akzent-Oberkante und Innenschatten; Handy Rand 1,5 px und kräftiger (ohne Unschärfe), Tablet Unschärfe 6 px, Desktop 8 px
- [x] Knöpfe: Pille mit Leuchten, ohne Maus (Handy/Tablet) kräftigeres Leuchten, Mindesthöhe 48 px
- [x] Lesbarkeit gemessen (Strahl voll, jede Textzeile): mindestens 4,95:1 auf Start- und Unterseiten bei 390/768/1440 px
- [x] Leicht und Schwer bildpunktgleich zum vorigen Stand; `npm run pruefen` und Funktionstest ohne Befund
- [x] Lighthouse (Handy): Mittel 94–96, Barrierefreiheit 100; längste Reaktion 104 ms
- [ ] Auf einem echten iPhone ansehen (geprüft nur im Testbrowser Chromium; Safari/WebKit war hier nicht verfügbar)
- [ ] Wenn auf dem iPhone weiter nichts zu sehen ist: Stufen-Schalter oben rechts prüfen. Die Wahl wird auf dem Gerät gemerkt; wer einmal „Leicht“ gewählt hat, sieht immer Leicht.

## Stufe Mittel neu: lebendiger Hintergrund, Neon-Glow, 3 Akzentfarben (28.10.2026, abends)

- [x] Farbsystem: Grund `#0D1220`, Akzente Lime / Pink / Violett je Abschnitt, eine Variable `--akzent`, Übergang 1,2 s
- [x] Lichtstrahl (Linien) ersetzt durch atmende Lichtwolken (CSS, 0,3–0,4 Hz), Handy 3 / Desktop 4 Wolken, Desktop zusätzlich Lichter neben der Textspalte
- [x] Farbwechsel als weiche Welle (Maske wächst von unten bzw. beim Hochscrollen von oben, 1,2 s)
- [x] Lichtband an jedem Abschnittsübergang (im Abstand zwischen den Abschnitten, atmet), feine leuchtende Linie
- [x] Knöpfe: Pille, Leuchten 20 px (Handy 26 px), beim Überfahren/Antippen 32 px und 2 px angehoben, Mindesthöhe 48 px
- [x] Karten: Glas, 1,5 px Rand in Akzentfarbe, Innenschatten, Leuchten beim Überfahren und Antippen (Tipp-Feedback per Skript, weil Safari `:active` unzuverlässig setzt)
- [x] Einblenden mit 80 ms Abstand (höchstens 4 Schritte), Start vor dem Sichtbarwerden; Überschriften ohne GSAP
- [x] Ladezeit: Bilder vorab, Monitor-Zeitreise nur in Schwer; Mittel LCP 2,4 s, Unterseiten 2,0 s
- [x] Handy: Hintergrund folgt dem Finger um wenige Pixel und rastet weich ein; „Bewegung reduzieren“: alles steht, Farbe wechselt
- [x] Stufenwechsel Leicht ↔ Mittel ohne Neuladen
- [x] Lesbarkeit gemessen (alle Wolken und Bänder gleichzeitig am hellsten, jede Textzeile): mindestens 4,5:1 auf Start- und Unterseiten bei 390/768/1440 px
- [x] Leicht und Schwer bildpunktgleich (Schwer auch mit laufender Monitor-Animation); pruefen, Funktionstest ohne Befund; längste Reaktion 120 ms
- [ ] Auf echtem iPhone und Android ansehen (geprüft nur im Testbrowser Chromium)
- [ ] Mit Schwer wechselt die Stufe weiter mit Neuladen (Schwer baut die Seite in den Monitor um)
- [ ] Beschreibung der Stufe Mittel im Stufen-Menü (`src/config/stufen.ts`) nennt den neuen Hintergrund noch nicht (Text, nicht angefasst)

## Stufe Mittel: Premium-Basis (29.10.2026)

Ausgangspunkt v5 (Zweig `claude/stufe-mittel-sichtbar-z7pvbx`, Commit 342b666). v6 und v7 auf jenem Zweig sind nicht enthalten.
- [x] Knöpfe: Verlauf 135° Akzent → 25 % dunkler, Glanzkante innen, Leuchten 24 px (35 %), dazu enges Neon-Leuchten und farbiger Schatten; Ecken 12 px statt Pille; schwarze Schrift
- [x] Knöpfe beim Überfahren (Maus) und Antippen (Handy): 3 px hoch, Leuchten 40 px (50 %), Verlauf 10 % heller, 200 ms; das Leuchten liegt fertig auf ::before/::after und wird nur eingeblendet
- [x] Rahmen-Knöpfe: 1,5 px Rand in Akzentfarbe, beim Überfahren 10 % Akzent-Fläche
- [x] Karten Desktop (≥ 768 px): Glas 4 % Weiß, Unschärfe 12 px, Rand 1,5 px Akzent 35 %, Leuchten 40 px (15 %) + 12 px; Handy: keine Unschärfe, Akzent-Fläche 6 %, Leuchten 40 px (28 %); Ecken 20 px
- [x] Karten beim Überfahren/Antippen/Tastatur: 6 px hoch, Schatten 0 20px 60px + Leuchten 60 px (30 %), 250 ms
- [x] Überschriften: h1 und h2 weiß, letztes Wort im Verlauf Weiß → Akzentfarbe; h2 ab Tablet größer (bis 4 rem)
- [x] Kategorie-Zeile als leuchtendes Abzeichen mit Leuchtpunkt
- [x] Andockpunkte `data-fluss-ziel` an den 6 Karten der Startseite (`leistung-01…03`, `stufe-1…3`)
- [x] Kontrast gemessen (Nachtrag in docs/ENTSCHEIDUNGEN.md), Leicht/Schwer bildpunktgleich, Funktionstest und Seitenprüfung ohne Befund, Lighthouse Handy Start 93–96
- [ ] Auf echtem iPhone ansehen (geprüft nur im Testbrowser Chromium mit Handy-Nachbildung)
- [x] Hintergrund (Aurora) unverändert; ersetzt im nächsten Schritt (Binärcode-Strom, 29.10.2026)

## Stufe Mittel: Binärcode-Strom statt Aurora (29.10.2026)

- [x] Aurora vollständig entfernt (`Aurora.astro`, `aurora.ts`, CSS-Block); im Build kein Treffer mehr für „aurora“
- [x] Neuer Hintergrund `src/components/Binaerstrom.astro` + `src/scripts/binaerstrom.ts`: Canvas 2D, Zeichen 0/1 in JetBrains Mono 14 px, Bahnen leicht schräg mit Sinus-Welle, 20–40 px/s, Gruppen von 3–8 Zeichen
- [x] Dichte 30 % (Handy 15 %, höchstens 360 Zeichen; Desktop höchstens 2600), ~30 Bilder/s, Pixeldichte höchstens 2
- [x] Deckkraft 0,10–0,18, hinter Text 0,06, kein Glimmer im Umkreis von 20 px um Text; hinter den 6 Karten mit `data-fluss-ziel` keine Zeichen
- [x] Glimmer 0,5–0,7 für 400–800 ms mit weicher Spur (Desktop 4/s, Handy 1,5/s)
- [x] Farbe aus `--a` der Zeichenfläche (Akzentfarbe mit 1,2-s-Gleitwechsel), kein eigener Farbmechanismus
- [x] Pause bei verstecktem Tab und wenn die Fläche unsichtbar ist (Wechsel auf Leicht); „Bewegung reduzieren“: stehendes Muster
- [x] Start erst, wenn der Browser Luft hat (requestIdleCallback): das erste Zeichnen der Seite wartet nicht
- [x] Geprüft: Kontrast mindestens 5,04:1, Leicht/Schwer bildpunktgleich zu v8, Funktionstest und Seitenprüfung ohne Befund, Lighthouse Handy Startseite Median 96 (v8: 95), LCP 2,4 s unverändert, keine Konsolenfehler
- [ ] Spur über „Übermalen mit 10 % Grundfarbe“ ausprobiert und verworfen (Ziffern verschmieren, dunkle Reste), siehe docs/ENTSCHEIDUNGEN.md
- [ ] Auf echtem iPhone prüfen: Sichtbarkeit, Flüssigkeit, Akku/Wärme (geprüft nur im Testbrowser ohne Grafikkarte)

## Stufe Mittel: Binärstrom kalibriert + Sektions-Farbwelle (29.10.2026)

- [x] Deckkraft normaler Zeichen 0,16–0,28 (vorher 0,10–0,18); Dämpfung hinter Text (0,06) und Karten (frei) unverändert
- [x] Gerichteter Fluss: Bahnen zu Strömen gebündelt (Bänder alle 170–260 px, 40–80 px breit, voller, schneller 32–40 px/s, lange Ketten 8–16 Zeichen), ruhige Zonen dazwischen (6 % Grunddichte, 20–26 px/s); mittlere Dichte unverändert 30 % (Handy 15 %, höchstens 360 Zeichen, jetzt harte Grenze)
- [x] Fast waagerecht (Neigung 0,03 statt 0,18), Welle 4 px statt 7 px
- [x] Glimmer +50 %: Desktop 6/s (vorher 4), Handy 2,25/s (vorher 1,5); Deckkraft und Spur unverändert
- [x] Farbwelle beim Abschnittswechsel: 2 s (Handy 1,6 s), beim Herunterscrollen von unten nach oben, beim Hochscrollen von oben nach unten, links etwas früher; Mischsaum mit 6 vorgezeichneten Farbstufen je Zeichen, kein Farbwechsel pro Zeichen beim Zeichnen, jedes Zeichen geht nur vorwärts (kein Flackern)
- [x] Behoben (seit v5): Das atmende Lichtband zwischen den Abschnitten ragte am Handy bis 10 px über den Rand, die Seite ließ sich seitlich schieben und der Strom baute sich beim Scrollen neu auf. Abschnitte schneiden jetzt seitlich ab (`overflow-x: clip`)
- [x] Geprüft: Farbwelle gemessen (0,5 s nach dem Wechsel unten 89–100 % pink, oben 0 %), Kontrast mindestens 5,04:1, Lighthouse Handy Startseite Median 97 (v9: 97), LCP 2,4 s unverändert, Leicht/Schwer bildpunktgleich zu v9, Funktionstest und Seitenprüfung ohne Befund, keine Konsolenfehler, ruhige Variante zeigt die richtige Abschnittsfarbe
- [ ] Auf echtem iPhone prüfen: sichtbar, flüssig, Handy nicht warm (hier nicht möglich, nur Testbrowser)

## Stufe Mittel: Karten-Synergie + Scroll-Impuls (30.10.2026)

- [x] Anziehung: Strom-Zeichen im Umkreis von 140 px (Handy 90 px) um eine Karte mit `data-fluss-ziel` werden sanft zum nächsten Kartenrand gezogen (höchstens 10 px, Handy 6 px, weicher Verlauf ohne Knick); im 40-px-Band am Rand kräftiger (bis 0,35)
- [x] Randzeichen umfließen die Karten: auf Schienen 14 und 30 px außerhalb des Rands (Handy nur 14 px), oben und unten von links nach rechts, runde Ecken, 30 px/s, Deckkraft 0,24–0,35, an den Enden weich ein- und ausgeblendet; Desktop ~600, Handy ~250 Randzeichen
- [x] Karteninneres frei: Zeichen, deren Kästchen eine Karte berührt, werden nicht gezeichnet (geprüft: 0 Bildpunkte der Zeichenfläche in den Karten, 390 und 1440 px); Karten mit `data-fluss-ziel` haben keinen Text-Dämpfungsrand mehr, ihr Text hat ihn weiterhin
- [x] Scroll-Impuls: beim Scrollen alle 0,3 s (Handy 0,45 s) ein waagerechtes Lichtband, wandert in Scrollrichtung über die Bildhöhe, klingt in 0,8 s aus; Breite 50–160 px (Handy ×0,8) und Leuchtkraft 0,45–0,7 nach Scroll-Tempo; nutzt die Glimmer-Zeichen samt Spur; Randzeichen leuchten dabei 25 % stärker
- [x] Hinter und nahe an Text leuchtet kein Impuls (Lesbarkeit); darum ist er am Handy schwächer (dort ist fast die ganze Breite Text)
- [x] „Bewegung reduzieren“: keine Anziehung, keine Randzeichen, keine Impulse
- [x] Geprüft: Kontrast mindestens 4,95:1, Leicht/Schwer bildpunktgleich zu v10, Seitenprüfung und Funktionstest wie v10 (siehe unten), keine Konsolenfehler
- [ ] Funktionstest und Seitenprüfung sind datumsabhängig: am 30.10.2026 (Freitag, nächster Werktag erst im November) findet der Tischkalender (Schwer) keinen buchbaren Tag im Oktober, und `/termin/` meldet am Handy eine nicht per Tastatur erreichbare Wisch-Leiste. Beides auch in v10, nicht durch diese Änderung; der Test sollte unabhängig vom Datum werden
- [ ] Auf echtem iPhone prüfen: Verdichtung an Karten sichtbar, Impuls beim Scrollen spürbar, flüssig, Handy nicht warm

## Stufe Mittel: Karten-Synergie sichtbar (30.10.2026)

Anlass: Am echten iPhone war die Karten-Synergie aus v11 nicht zu sehen (Strom verschwand hinter den Karten, Verdichtung und Anziehung zu schwach). Scroll-Impuls unverändert.
- [x] Umlenkung statt Verdecken: Bahnen weichen 90 px (Handy 40 px) vor einer Karte nach oben oder unten aus, Bahnen bis 70 px (Handy 50 px) tief in der Karte werden in ein 56-px-Band am Rand gedrückt (dort ~2,4-fache Dichte, Deckkraft bis 0,55), kehren hinter der Karte zurück; tiefere Bahnen tauchen weich ab
- [x] Rand-Glow (`.card[data-fluss-ziel]::after`, box-shadow, nur Deckkraft ändert sich): atmet zwischen 0,31 und 0,54 als Welle in Flussrichtung (3,2 s), beim Scroll-Impuls bis ~0,9; bei „Bewegung reduzieren“ aus
- [x] Randzeichen: Dichte verdoppelt (0,3 → 0,6), Deckkraft 0,5–0,6 (vorher 0,24–0,35), Schienen 12/26 px (Handy 9 px, damit sie neben der Karte im Bild bleiben)
- [x] Grundstrom heller: 0,22–0,34 (vorher 0,16–0,28); Dämpfung hinter Text unverändert
- [x] Behoben (seit Schritt 1): Das Hover-Leuchten der Karten (`::before`) war in jedem Abschnitt lime, weil `--a` nicht an Pseudo-Elemente vererbt wird. Jetzt in der Abschnittsfarbe
- [x] Geprüft: Karteninneres 0 Bildpunkte, Leicht/Schwer bildpunktgleich zu v11, Funktionstest 21/21 bis zum bekannten datumsabhängigen Kalenderschritt
- [ ] Auf echtem iPhone prüfen: Umfließen oder Rand-Glow deutlich sichtbar, flüssig, Handy nicht warm

## Stufe Mittel: Karten-Synergie, Architektur-Fix (30.10.2026)

Befund vorab (gemessen): Die Karten sind in Mittel fast durchsichtig (Fläche 6 % Handy, 4 % Computer), nicht 97 % deckend; 97 % deckend sind sie nur in Leicht (das bekommt ein Gerät mit „Bewegung reduzieren“, wenn noch keine Stufe gewählt ist). Der Strom verschwand an der Karte, weil das Skript dort absichtlich nichts zeichnete. Darum Option (b): eigenes Randband über den Karten.
- [x] Maßnahme 1: zweite Zeichenfläche `.binaerstrom-rand` (z-index 2, über dem Inhalt, unter Kopfleiste und Dialogen, keine Klicks); Randzeichen laufen dort auf drei Schienen direkt auf der Kartenkante (14 px außen, 2 px außen, 9 px innen; Handy 8 px außen, 6 px innen); nie über Text (Maske: Zeichen nahe Text entfallen)
- [x] Maßnahme 2: Rand-Glow reines CSS (`.card[data-fluss-ziel]::after`, `@keyframes karte-atmen`, 3,2 s, 16 Stufen ≈ 5 Neuzeichnungen/s, Welle von Karte zu Karte); Impuls-Blitz über die Klasse `.fluss-impuls` (`@keyframes karte-blitz`, 0,7 s); `--fluss-glanz` entfernt
- [x] Maßnahme 3: Randband an allen vier Kartenkanten, Dichte 0,6 je Schiene (2–3 Schienen), Deckkraft 0,5–0,6
- [x] Gates: siehe Bericht und Commit (Fotos, box-shadow-Messung, Randband-Bildpunkte, Kartentext 0 Bildpunkte, Kontrast ≥ 5,04:1, Leicht/Schwer bildpunktgleich, Bildrate 24–28/s im Testbrowser, Lighthouse)
- [ ] Bei „Bewegung reduzieren“ gibt es kein Randband (nur den stehenden Rand-Glow); auf Wunsch als stehendes Muster ergänzen
- [ ] Echtes iPhone: nicht verfügbar, Prüfung beim Gründer

## Stufe Mittel: Band genau auf der Kartenkante (31.10.2026)

Anlass: Am iPhone lief das Band in Leistungen wie ein Rahmen um den Bildschirm statt auf den Kartenkanten (äußere Schiene 8 px neben der Karte, Karte fast so breit wie der Bildschirm), mit Lücke zur Karte und ohne Bogen an den Ecken; der Rand-Glow war nicht zu sehen.
- [x] Maßnahme 1: eine Schiene genau auf der Kante (Abstand 0, Zeichen halb außen, halb im textfreien Innenrand), Zeichen entlang der Kante gedreht, Ecken auf dem Bogen des echten `border-radius` (aus dem CSS gelesen). Kanten jeder Karte in jedem Bild neu gemessen (`getBoundingClientRect`), nicht mehr alle 1,5 s. Randfläche liegt im Dokument (`position: absolute`, das Skript rückt sie nach): Beim Scrollen läuft das Band ohne Verzug mit (vorher hinkte es bei schnellem Scrollen bis zu ~100 px hinterher). Dichte 0,85, Deckkraft 0,78–0,95, mit Lichthof
- [x] Maßnahme 2: Rand-Glow nur noch mit `currentColor` und festen Zahlen in den Keyframes (Farbe als `color` am Leucht-Rahmen; kein `var()`/`color-mix()` in den Keyframes, iOS-sicher), atmet über box-shadow und Deckkraft (0,55–1, 3,2 s), dauerhaft ohne Skript; Blitz beim Scroll-Impuls bleibt zusätzlich
- [x] Maßnahme 3: gleiches Verhalten in Leistungen und Unsere Zusammenarbeit (alle Karten mit `data-fluss-ziel`)
- [x] Sparsam: gerade Kanten mit vorgedrehten Zeichen, echte Drehung nur in den Eckbögen (sonst +8 Prozentpunkte Last am Handy)
- [x] Start ohne erzwungenes Layout: Größe der Zeichenfläche kommt aus dem ResizeObserver (Start-Task 1–3 ms statt 4–9 ms)
- [x] Gates 1–7 mit Messwerten und Fotos (siehe Commit); Gate 8: 30 Bilder/s, Pause bei verstecktem Tab, Hauptthread-Last wie v13
- [ ] Gate 8 Lighthouse Handy ≥ 90 nicht verlässlich: 14 Läufe Median 90,5 (78–97, 7 unter 90); v13 in derselben Umgebung Median 85,5 (72–97). Ursache: ein Idle-Task beim Start (erstes Layout nach dem Laden, zuletzt in `starteKacheln`) fällt je nach Zeitpunkt ins Messfenster. Eigene Etappe nötig
- [ ] Echtes iPhone: Prüfung beim Gründer (Stufe Mittel, „Bewegung reduzieren“ aus)

## Phase F: Vor dem Livegang (liegt bei den Gründern)

- [ ] Name und Domain final entschieden
- [ ] Impressum und Datenschutzerklärung mit echten Angaben gefüllt und rechtlich geprüft
- [ ] Hosting gebucht und Domain verbunden
- [ ] Eigene Telefonnummer und E-Mail-Adresse eingerichtet und in `src/config/site.ts` eingetragen
- [ ] Messung der Anfragen datenschutzfreundlich eingerichtet

## Prüfwerkzeuge

- `npm run build`, dann `npm run preview` und in einem zweiten Fenster `npm run pruefen`: prüft alle Seiten auf Handy, Tablet und Desktop, jeweils mit und ohne JavaScript (eine Hauptüberschrift, kein seitlicher Überlauf, Tippflächen, automatische Barrierefreiheitsprüfung).
- `npm run vorschau`: baut aus `dist/` eine Fassung mit relativen Links in `.vorschau/` (für die private Vorschau).
- `npm run ansehen`: zeigt den Build lokal an (http://localhost:4321) mit den Sicherheits-Headern aus `_headers`; Videos werden in Teilstücken ausgeliefert wie bei einem echten Hoster.
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
