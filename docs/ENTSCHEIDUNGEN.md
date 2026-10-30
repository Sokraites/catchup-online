# Entscheidungen

Stand: 20.10.2026. Ergänzt `UEBERGABE.md`, Abschnitt 9. Bei Widerspruch gilt dieser Stand.

## Entschieden

| Thema | Entscheidung | Datum |
|---|---|---|
| Freigabe | Der Gründer entscheidet und gibt frei. | 20.10.2026 |
| Code-Ablage | Privates GitHub-Repository `Sokraites/catchup-online`. | 20.10.2026 |
| Textpflege | Texte pflegen Gründer und Coding-Agent gemeinsam. | 20.10.2026 |
| Seitenstruktur | Startseite mit Scroll-Erlebnis plus eigene Unterseiten pro Leistung, besonders für das Thema KI. | 20.10.2026 |
| Anrede | „du“ (weicht vom Vorschlag „Sie“ ab). | 20.10.2026 |
| Ziel der Seite | Besucher sind beeindruckt und wollen etwas Ähnliches im eigenen Stil. | 20.10.2026 |
| Domain (Platzhalter) | `catchup-digital.com` | 20.10.2026 |
| Schreibweise | „Catch up“, getrennt geschrieben, überall und auch künftig. Die Domain bleibt `catchup-digital.com`. | 20.10.2026 |
| Ort (Platzhalter) | Donnersbergkreis | 20.10.2026 |
| Team-Abschnitt | Entfällt komplett, keine Fotos. | 20.10.2026 |
| KI-Lösungen | **Ändert die Übergabe (Abschnitt 2):** KI-Lösungen werden aktiv gezeigt, als eigene Unterseite. Stufen: Praktikant, Azubi, Mitarbeiter, Teamleiter-Niveau. Spielerisch, 3D, beim Scrollen einladende (winkende) Animationen. | 20.10.2026 |
| Monatsabo | Wird vorerst nicht erwähnt. | 20.10.2026 |
| FAQ | Eigene Entwurfsfragen, die Vertrauen und Lust auf Zusammenarbeit wecken, ohne aufdringlich zu sein. Keine unbelegten Versprechen. | 20.10.2026 |
| Aufbau | Seitenbaukasten Astro (Option 1A). | 20.10.2026 |
| Animation | GSAP für Scroll-Animationen, Three.js nur auf der KI-Seite (Option 2A). | 20.10.2026 |
| Hosting | Deutscher Webspeicher mit kleinem Server-Programm für die Terminanfrage (Option 3A). Anbieter noch offen. | 20.10.2026 |
| Zielwerte | Werte aus Leitplanke 3 gelten verbindlich. | 20.10.2026 |
| Vorladen | Links werden beim Überfahren bzw. Antippen vorgeladen. Gilt für jede Seite, die wir bauen. | 20.10.2026 |
| Logo (Platzhalter) | Herz in einem umgedrehten Dreieck. Wird auch als Siegel im Terminbuch genutzt. | 20.10.2026 |
| KI-Stufen | Praktikant, Azubi, Mitarbeiter, Teamleiter-Niveau. Je Stufe: Aussehen als KI-Agent, Aufwand der Einrichtung, benötigte Unterlagen. Handy: seitlich durchwischen. Desktop: beim Scrollen von rechts herein. | 20.10.2026 |
| Terminbuch | Knopf öffnet ein Buch mit Kalender, belegte Tage sichtbar, Siegelstempel am gewählten Tag, beim Absenden faltet sich ein Brief und wird gesiegelt. Darf nie langsamer sein als ein schlichter Kalender. Auch von der Startseite aus erreichbar. | 20.10.2026 |
| Kacheln | Desktop: Spur beim Überfahren, ohne Klicken. Pfad-Kacheln bleiben leuchten (Vorschlag Reihe 7/Spalte 7, dann 14/14, …). Handy: Effekt bleibt, aber mit angepasster Kachelgröße und eigenem Pfad; Funkeln beim Darüberstreichen. Der Pfad zählt erst, wenn alle Pfad-Kacheln auf den Bildschirm passen (nicht im flachen Start-Querformat). | 21.10.2026 |
| Auge | Folgt zu Beginn dem Mauszeiger (bzw. Finger). Sobald die erste Pfad-Kachel erreicht ist, schaut es starr in Richtung der nächsten freizuschaltenden Kachel. | 20.10.2026 |
| Monitor (Idee) | Kopfleiste bleibt oben stehen, der Monitor ist das, was scrollt. Beim Scrollen dreht der Inhalt wie an einem Rad zum nächsten Abschnitt. Muss sich so schnell und frei scrollen lassen wie eine normale Webseite, darf nicht aufhalten. | 20.10.2026 |
| Leuchteffekte | Nur im Monitor-Bildschirm (Startseite). Raster und Pfad zählen ab der oberen linken Ecke des Bildschirms. Freischalten bleibt ein verstecktes Easter Egg. | 20.10.2026 |
| Monitor-Bilder | Gehäuse und Füße aus 3D-Modellen gerendert (`npm run monitore`), keine fremden Bilder. Handy: Querformat nur zum Auftakt; beim Epochenwechsel bleibt der Bildschirm ausgezogen, nur das Rad dreht. Browser-Titelleiste bzw. Reiter auch auf dem Handy. Desktop: Monitor steht ruhig, kein Herauszoomen (Gründer: zu unruhig). | 21.10.2026 |
| Monitor-Tabs | Klick auf einen Link im Monitor oder im Menü der Kopfleiste öffnet einen neuen Tab in der Browserleiste, die Unterseite erscheint im Monitor und läuft mit demselben Rad- und Epochen-Effekt wie die Startseite (Gründer, 21.10.2026). Zurück zur Übersicht landet man an der alten Stelle. Zurück über den Tab „Catch up“, das × am Tab, den Knopf „Zurück zur Übersicht“ oder die Zurück-Taste des Browsers. Adresszeile zeigt den Pfad. Termin-Links öffnen weiter das Terminbuch. | 21.10.2026 |
| Terminbuch: Umblättern | Desktop: Doppelseite, links Monatskalender, rechts leer, bis ein Tag gewählt ist; dann erscheinen die Felder. Rechte Seite nach links ziehen = nächster Monat (Rückseite zeigt ihn schon), linke Seite nach rechts = Vormonat. Handy: eine Seite; die Monate liegen in einer Wisch-Spur wie die KI-Stufen (der Browser übernimmt das Wischen, rastet ein), das Wischen steuert das gewölbte Blatt (Gründer, 21.10.2026: Ziehen klappte auf dem Handy nicht). Pfeile blättern mit derselben Bewegung. | 21.10.2026 |
| Terminbuch (umgesetzt) | Buch klappt auf, blättert auf den aktuellen Monat, Feder kreist den heutigen Tag rot ein, gewählter Tag bekommt ein Wachssiegel, beim Absenden faltet sich ein Brief und wird gesiegelt. Termine vorläufig Mo–Fr, feste Uhrzeiten (`src/config/termine.ts`). Versand bis zur Anbindung per vorbereiteter E-Mail. | 21.10.2026 |
| Monitor-Gestaltung | Karten im Monitor kleiner, Gehäuse mit Tiefe nach hinten (Deckel), keine Unterschrift/Jahreszahl, Browserleiste im Stil der jeweiligen Zeit (ohne Logos und Markennamen). Wunsch: möglichst fotorealistisch. | 20.10.2026 |
| KI-Mitarbeiter-Idee | Läuft im System des Betriebs, kennt freigegebene Unterlagen, per Handy erreichbar (auch abends). Abgrenzung zur Cloud-App: fragen statt suchen, auch Nicht-Cloud-Daten, handelt, Daten bleiben auf Wunsch im Betrieb. Texte als Entwurf umgesetzt. | 20.10.2026 |
| KI-Seite Aufbau | Je Stufe ein kleiner 3D-Charakter in der Mitte, Fähigkeiten drumherum, Einsatzbeispiele darunter. Handy: seitlich wischen. Desktop: läuft beim Scrollen seitlich durch. Figuren: freundliche Roboter-Kollegen, je Stufe professioneller (Namensschild, Ordner und Kappe, Headset und Krawatte, Anzug mit Tablet und Lichtring); winken, wenn sie ins Bild kommen. Stil vorläufig, Gründer prüft. | 20.10.2026 |
| Startseite | Die Monitor-Seite ist jetzt die echte Startseite (`/`). Der Entwurf unter `/entwurf/monitor/` entfällt. | 21.10.2026 |
| Referenzen | **Ändert die Übergabe (keine Referenzen):** Referenzprojekt „Ottos Werkstatt“ (Ferienloft, Dannenfels) aus der Arbeit des Partners. Abschnitt „Projekte“ auf der Startseite; „Projekt ansehen“ öffnet es als Tab im Monitor, „In neuem Tab öffnen“ (nur auf der Karte) als echten Browser-Tab. Im Monitor-Tab selbst gibt es keinen solchen Knopf (Gründer, 21.10.2026). Projektseite unter `/referenzen/ottos-werkstatt/` (Schriften selbst ausgeliefert, nicht für Suchmaschinen). **Vor Livegang: Freigabe des Kunden für Nennung, Fotos und angezeigte Kontaktdaten einholen.** | 21.10.2026 |
| Terminbuch: Blättern | Blatt wölbt sich beim Umblättern wie Papier (Streifen mit eigenem Licht), Ecke hebt sich je nach Griffhöhe, Buchrücken und Seitenstapel. | 21.10.2026 |
| Darstellungs-Stufen | Drei Stufen „Leicht, Mittel, Schwer“ (Gründer: „Schwierigkeitsgrad“). Beim ersten Besuch ein Hinweis unten, der nichts blockiert (kein Einwilligungsbanner, die Seite bleibt lesbar); danach Schalter oben rechts. Wechsel lädt die Seite neu. Leicht: ruhige Seite mit großen, selbst gerenderten Bildern, nur das Nötigste (ohne die Abschnitte „Nutzen“ und „Gefunden werden“, die Inhalte stehen auf den Unterseiten). Mittel: Monitor-Zeitreise, Tabs, Terminbuch mit Animation. Schwer: zusätzlich Kachel-Rätsel mit Auge, winkende 3D-Figuren. Ohne Wahl gilt Mittel (bei „Bewegung reduzieren“ im System: Leicht). Die Wahl wird als ein Eintrag im Browser gemerkt, kein Cookie. Begründung (Rolle Geschäftsführung): Mittel zeigt, was wir können, ohne Handwerksbetriebe zu überfordern; Schwer ist das Schaufenster für Neugierige; Leicht ist der schnelle Weg zum Termin. Konfiguration: `src/config/stufen.ts`. | 22.10.2026 |
| Software nach Maß | Neue Leistung 05 mit eigener Unterseite `/software-nach-mass/` und Abschnitt „Welche digitale Lösung würde dir wirklich weiterhelfen?“ auf der Startseite. Ehrlich formuliert: Gibt es eine gute fertige Lösung, empfehlen wir sie. | 22.10.2026 |
| Marketing als Leistung | **Vorerst nicht** (Vorschlag Geschäftsführung, Gründer kann anders entscheiden): Werbeanzeigen und Social-Media-Betreuung sind laufende Arbeit mit eigenem Fachwissen und würden den Auftritt verwässern. „Gefunden werden“ deckt den Teil des Marketings ab, der zur Webseite gehört. Später als Erweiterung denkbar, wenn Kunden danach fragen. | 22.10.2026 |
| Terminbuch Handy | Zusätzlich zum Wischen: Eselsohr unten rechts antippen blättert um, die Ecke hebt sich nach dem Öffnen kurz an. Grund: Seitliches Wischen kann in eingebetteten Ansichten (z. B. Vorschau in der Claude-App) von der App abgefangen werden. | 22.10.2026 |
| KI-Mitarbeiter (Änderung) | **Ändert die Entscheidung vom 20.10.:** Das Stufenmodell (Praktikant bis Teamleiter), die Unterseite und die 3D-Figuren sind entfernt (Auftrag Livegang). KI-Agenten nur noch als kurze Zusatzzeile. | 22.10.2026 |
| Kontaktdaten | E-Mail catchup-digital@protonmail.com, Telefon +49 176 84607083, nur in `src/config/site.ts`. E-Mail wird später durch eine Adresse auf der eigenen Domain ersetzt. | 22.10.2026 |
| Indexierung | Schalter INDEXIERUNG in `src/config/site.ts`, Standard aus (noindex, robots.txt sperrt). Erst nach rechtlicher Prüfung einschalten. | 22.10.2026 |
| Referenz im Livegang | Schalter REFERENZEN, Standard aus, bis die Freigabe des Kunden vorliegt; die Projektseite wird dann auch nicht ausgeliefert. | 22.10.2026 |
| Darstellungs-Stufen (Anpassung) | Kachel-Pfad mit Auge gehört zum Zielbild und läuft in Mittel (Standard) und Schwer; Schwer dreht Effekte auf. Leicht bleibt ruhig. | 22.10.2026 |
| Hosting (offen) | Cloudflare Pages vorbereitet (`_headers`). Widerspricht „Hosting in der EU“: Gründer entscheidet. | 22.10.2026 |
| Aussicht (Stufe Schwer) | Nur Desktop (ab 1280 px, Maus, ohne reduzierte Bewegung): Hinter dem Monitor ein Fenster mit Blick über Meer, Gebirge und Stadt am Hang. Sonne wandert beim Scrollen vom Mittag bis zum Untergang, am Seitenende Nacht mit Milchstraße. Wellen dauerhaft, Gewitterwolke mit Blitz alle 30–65 s, abends Sternschnuppe alle 10–25 s. Tischkalender links: Zoom, Stift-Cursor, „Zurück zum Schreibtisch“, ein Tag öffnet das Terminbuch. Technik: eigenes WebGL-Programm ohne Bibliothek (20 KB), wird erst nach dem Laden geholt. | 23.10.2026 |
| Aussicht mit Foto (24.10.2026) | Stufe Schwer, Desktop: Das Foto `public/aussicht/fenster.webp` ersetzt die gezeichnete Szene (Wand, Rahmen und Tisch kommen aus dem Foto). Darüber legt ein Grafik-Programm Sonnenlauf, Wellen, Gewitterblitze, Nachthimmel mit Milchstraße, Sternschnuppen und Stadtlichter. Der Tischkalender sitzt genau auf dem Kalender im Foto. Die Sonne ist auf das dritte Fenster von rechts gelegt, dort steht sie aber hinter dem Monitor (offene Frage, siehe Bericht). | 24.10.2026 |
| Region entfernt | Keine Angabe „Donnersbergkreis“ oder „Rheinland-Pfalz“ mehr auf der Seite, in der Konfiguration, den Titeln und den strukturierten Daten. Die Seite ist für Betriebe offen. | 24.10.2026 |
| Gestaltung hochwertiger | Feine Goldlinien zwischen den Abschnitten, Goldrand an den Karten, Raster-Muster. In Stufe Leicht stärkere Goldakzente und ein Muster auf dem ganzen Grund. Nur Darstellung, Inhalte unverändert. | 24.10.2026 |
| Private Vorschau | Erlaubt (20.10.2026): private Vorschau-Seite, nur für den Gründer sichtbar, nicht für Suchmaschinen. |
| Zwischenstände | Nach Phase B wird ein Entwurf gezeigt, danach ein erster Monitor-Entwurf. | 20.10.2026 |
| Handy-Gestaltung | Darf sich vom Desktop unterscheiden (gleicher Inhalt, eigene Darstellung), wenn es auf dem Handy besser wirkt. | 20.10.2026 |
| Kontakt | Eigene Telefonnummer und E-Mail kommen. Bis dahin Platzhalter, Seite wird gebaut, als gäbe es sie schon. | 20.10.2026 |
| Farbwelt | Aus der Vergleichsseite des Partners: dunkel mit Lila. Basis: Hintergrund `#0D0D13`, Flächen `#15151E`/`#1B1B26`, Linien `#272735`, Text `#EDECF6`, gedämpft `#9C9AB1`, Akzent `#7C4DFF`, hell `#A98BFF`, tief `#5B2BE0`. Kontraste werden geprüft und bei Bedarf angepasst. | 20.10.2026 |
| Stufen | Leicht: ruhig und schick, ohne Bewegung. Mittel: Binärcode-Strom im Hintergrund (bis 28.10.: atmende Lichtwolken), Neon-Leuchten auf Knöpfen und Karten, Akzentfarbe je Abschnitt, Inhalte blenden ein, kein Monitor. Schwer: alles, was möglich ist (Monitor, Aussicht, Effekte). Leicht ↔ Mittel wechselt ohne Neuladen; mit Schwer lädt die Seite neu, weil Schwer die Seite in den Monitor umbaut. | 27.10.2026, Stand 28.10.2026 abends |
| Farbsystem Stufe Mittel | **Stand 28.10.2026 abends (Auftrag):** eine Grundfarbe für alles, dunkles Blau `#0D1220`; drei Akzentfarben je Abschnitt: Lime `#C8F542` (Einstieg, Leistungen, Software), Pink `#F472B6` (Nutzen, Auffindbarkeit, Idee, Ablauf), Violett `#A78BFA` (Zusammenarbeit, FAQ, Kontakt). Pink ist heller als das vorgeschlagene `#EC4899`: Damit war kleine pinke Schrift auf Karten schon ohne Hintergrund-Effekt knapp an 4,5:1. Eine Variable `--akzent` am `<html>`, alle Bausteine folgen in 1,2 s. Zuordnung: `src/config/farbwelten.ts` und `src/styles/farbwelten.css`. | 28.10.2026 |
| 3-Stufen-Angebot | Startseite zeigt drei Produktkarten: 01 · Fundament „Next-Gen Web & KI-Sichtbarkeit (GEO)“, 02 · Konversion „24/7 KI-Vorqualifizierer“, 03 · Laufender Vorsprung „Prozess-Automatisierung & GEO-Monitoring“ (`src/content/produkte.ts`), dazu ein Angebotskatalog in den strukturierten Daten. Menü und Unterseiten bleiben bei den bisherigen Leistungen. Ersetzt die frühere Linie „KI-Agenten nicht bewerben“. | 27.10.2026 |
| Einsatzgebiet (strukturierte Daten) | `areaServed`: Rheinland-Pfalz und Deutschland (`src/config/site.ts`). Auf der Seite selbst steht weiter keine Region. | 27.10.2026 |
| Überschriften Wort für Wort | Mit GSAP ScrollTrigger (Wunsch der Gründer). Auf der Startseite ist GSAP ohnehin geladen, auf Unterseiten wird es nur in Mittel nachgeladen. | 27.10.2026 |
| Scroll-Hinweis | Einmal pro Sitzung, gemerkt in `sessionStorage` (`scroll-hinweis-gezeigt`, endet mit dem Tab). Muss vor dem Livegang in die Datenschutzerklärung. | 27.10.2026 |
| Hintergrund Mittel („Binärcode-Strom“) | **Stand 29.10.2026 (v10):** ersetzt die Aurora (weiche Lichtwolken), die auf echtem iPhone nicht zu sehen war. Ein ruhiger Strom aus 0 und 1 in der Akzentfarbe fließt fast waagerecht von links nach rechts (20–40 px/s), gebündelt zu Strömen mit ruhigen Zonen dazwischen, kein Matrix-Regen. Zeichenfläche (Canvas 2D, kein WebGL, keine Bibliothek), etwa 30 Bilder/s. Rund 30 % der Plätze belegt (Handy 15 %, höchstens 360 Zeichen). Deckkraft 0,16–0,28 (v9: 0,10–0,18), hinter Text 0,06, einzelne Zeichen glimmen kurz auf (0,5–0,7) und ziehen eine weiche Spur hinter sich her; nahe an Text glimmt nichts, hinter den Karten der Startseite (`data-fluss-ziel`) liegt kein Zeichen. Farbwechsel als Welle durch den Strom (2 s, Handy 1,6 s, von der Seite, aus der der neue Abschnitt kommt), Anfangs- und Zielfarbe aus `--akzent`/`--a`. Das gleichzeitige 1,2-s-Gleiten von `--a` übernimmt im Strom die Welle: Mit dem Gleiten war die neue Farbe nach 0,5 s erst zu 30 % da und die Welle nicht zu sehen. Karten mit `data-fluss-ziel` werden vom Strom angezogen und außen umflossen (Randzeichen bis 0,35, Karteninneres frei); beim Scrollen wandert ein Lichtimpuls aus aufglimmenden Zeichen in Scrollrichtung durch den Strom (0,8 s) und lässt die Kartenränder kurz aufleuchten (Stand v11, 30.10.2026). Pause bei verstecktem Tab und in Leicht. „Bewegung reduzieren“: stehendes Muster. **Abweichung vom Auftrag:** Die Spur entsteht nicht durch Übermalen der ganzen Fläche mit 10 % Grundfarbe: Ausprobiert ließ das die Ziffern zu unlesbaren Streifen verschmieren, machte sie 2,5- bis 4,3-mal so deckend wie gewollt und hinterließ dunkle Rundungsreste. Stattdessen wird jedes Bild gelöscht und die Spur gezielt hinter glimmende Zeichen gezeichnet. | 29.10.2026 |
| Wechsel-Erkennung der Abschnitte | Gewünscht war IntersectionObserver mit threshold 0,3. Lange Abschnitte (höher als drei Bildschirme) erreichen nie 30 % Sichtbarkeit und hätten nie umgeschaltet. Umgesetzt: schmales Band in der Bildschirmmitte, wie bisher. | 28.10.2026 |
| Einblenden Mittel | Überschriften Wort für Wort, Absätze, Karten und Listen mit 80 ms Abstand, höchstens 4 Schritte (Überschriften ab dem 7. Wort gemeinsam), Start kurz bevor sie ins Bild kommen. Ohne GSAP: Überschriften warten nicht mehr auf eine 110-KB-Bibliothek. Bilder werden nach dem Laden der Seite vorab geholt (nicht im Datensparmodus). | 28.10.2026 |
| Ladezeit Startseite | Die Monitor-Zeitreise (mit GSAP) wird nur noch in Schwer geladen; dort wird sie schon im Kopf der Seite vorgeladen (`scripts/nachbereiten.mjs`), damit Schwer nicht langsamer wird. Mittel: LCP 2,4 s statt 2,6–2,9 s. | 28.10.2026 |
| Glas-Karten (Mittel) | Unschärfe wie bestellt (Tablet 6 px, Desktop 8 px). In der Testumgebung ohne Grafikkarte senkt sie die Bildrate am Desktop von 60 auf rund 35 Bilder/s, Eingaben bleiben sofort bedienbar. Auf echten Geräten prüfen. | 28.10.2026 |
| Preis in der FAQ | Nicht eingebaut: widerspricht „Keine Preise“ in CLAUDE.md. Erst nach ausdrücklicher Freigabe (inkl. netto/brutto, kostenloses Erstgespräch). | 28.10.2026 |

## In Klärung

| Thema | Stand |
|---|---|
| Hosting-Anbieter und Domain | Gründer bucht selbst (Vorschlag: deutscher Anbieter wie netcup, Hetzner oder all-inkl, Domain beim selben Anbieter). |
| Monitor-Zeitreise | **Entschieden: Startseiten-Animation so beibehalten (Gründer, 21.10.2026), ist jetzt die Startseite.** **Stand 27.10.2026: läuft nur noch in Stufe Schwer** (Zeile „Stufen“ oben); Leicht und Mittel zeigen die normale Seite. Epochen: großer Röhrenmonitor 1990, kleinerer Röhrenmonitor 1997, Flachbildschirm 2004, Breitbild 2010, schmaler Rand 2016, heute randlos. Mit Gehäusekante und Standfuß (Handy ohne Fuß). Bildschirm durchsichtig, Kacheln scheinen durch. Entwurf liegt vor (`/entwurf/monitor/`, private Vorschau). Entscheidung durch Gründer offen. |
| Wirkung der Kachel-Freischaltung | Vorläufig umgesetzt: Lichtwelle über das Raster, Auge freut sich, Meldung „Du hast den Weg gefunden“ mit Termin-Knopf. Alternativen vorgeschlagen, Gründer wählt. |
| Kachel-Pfad | Vorschlag umgesetzt: Maus 7/7 → 14/14 → 4/18 → 11/20 → 3/10, Touch 7/7 → 13/2 → 4/3 → 16/6 → 10/4 (Reihe/Spalte). Bestätigung offen. |

## Offen (Platzhalter, bis entschieden)

| Thema | Vorläufiger Umgang |
|---|---|
| Belegte Tage im Terminbuch | Bis zur Anbindung Beispieldaten, nur in der Entwicklung sichtbar. |
| Schrift | Vorschlag: wie Vergleichsseite (Space Grotesk, Inter, JetBrains Mono), aber selbst ausgeliefert. |
| Fiktive Beispiele (Vorher/Nachher) | Nicht verwenden, bis freigegeben. |
| Fortschritt im Kachelpfad speichern | Nicht speichern, gilt nur solange die Seite offen ist. |
| Messung | Nur Platzhalter. |
| Impressum, Rechtsform, Verantwortlicher | Platzhalter. |

## Kontrast-Prüfung Farbwelten (Stufe Mittel, 27.10.2026)

Geprüft nach WCAG 2.2 AA: Fließtext und kleine Schrift mindestens 4,5:1, große Überschriften mindestens 3:1.
„Schlechtester Grund“: Abschnittsfarbe mit 5 % Akzent-Tönung (oben im Abschnitt) und den hellen Kachel-Linien darüber.
„Karte“: hervorgehobene Karte (Abschnittsfarbe mit 9 % Weiß). Text `#EDECF6`, gedämpfter Text `#A9A7BD`.

| Welt | Grund | Akzent | Akzent auf Grund | Akzent, schlechtester Grund | Akzent auf Karte | gedämpft auf Karte | Text auf Karte |
|---|---|---|---|---|---|---|---|
| Einstieg | `#0d0d13` | `#a98bff` | 7,22 | 6,00 | 5,84 | 6,68 | 13,39 |
| Leistungen | `#12141f` | `#8b9dff` | 7,30 | 5,90 | 5,75 | 6,15 | 12,32 |
| Nutzen | `#0f1a14` | `#6ee7a0` | 11,54 | 9,00 | 9,01 | 5,93 | 11,88 |
| Auffindbarkeit | `#1a1220` | `#c084fc` | 6,90 | 5,59 | 5,43 | 6,12 | 12,25 |
| Software (Unterseite) | `#141020` | `#a78bfa` | 6,86 | 5,61 | 5,45 | 6,32 | 12,67 |
| Deine Idee | `#1a1512` | `#fbbf24` | 10,85 | 8,54 | 8,50 | 6,04 | 12,11 |
| Ablauf | `#0f1418` | `#7dd3fc` | 11,11 | 8,81 | 8,78 | 6,24 | 12,50 |
| FAQ | `#101318` | `#94a3b8` | 7,26 | 5,90 | 5,75 | 6,28 | 12,58 |
| Kontakt | `#12101e` | `#818cf8` | 6,29 | 5,18 | 5,01 | 6,37 | 12,76 |

Ergebnis: Alle Kombinationen erfüllen AA auch für kleine Schrift. Keine Farbe musste angepasst werden; die Palette gilt wie vorgeschlagen.
axe kann den Kontrast über der festen Farb-Ebene nicht selbst messen (meldet „nicht prüfbar“), deshalb diese Rechnung.

Nachtrag 28.10.2026: Die dunklen Grundfarben je Abschnitt sind entfallen, der Grund ist überall `#0d0d13` (Zeile „Einstieg“). Jede Akzentfarbe hat auf diesem Grund mindestens so viel Kontrast wie auf ihrem früheren Grund. Hinter Text liegt jetzt zusätzlich der gedämpfte Lichtstrahl: gemessen an den gezeichneten Bildpunkten (Strahl in voller Stärke, jede Textzeile, 390/768/1440 px, Start- und Unterseiten) mindestens 4,95:1.

Nachtrag 27.10.2026 (zweite Runde): Keine Farbe geändert. Titel in Karten nehmen beim Überfahren den Akzent an (Spalte „Akzent auf Karte“, mindestens 5,01:1). Der goldene Glanz des Schimmers (`#f6e2b5`) liegt auf allen Grundfarben bei 13,97 bis 15,19:1.

Nachtrag 28.10.2026 (v4, Knöpfe und Abzeichen in Mittel): dunkle Schrift `#0d0d13` auf dem Akzent-Verlauf (unten 15 % dunkler) mindestens 4,83:1 (Kontakt), Rahmen-Knöpfe Akzent auf Grund mindestens 6,29:1, beim Überfahren mindestens 5,54:1, Abzeichen Stufe 1/2/3 mindestens 6,49 / 9,11 / 12,34:1. Keine Farbe angepasst.

Nachtrag 29.10.2026 (Premium-Basis: Knöpfe, Karten, Überschriften in Mittel): gemessen an den gezeichneten Bildpunkten (Text ausgeblendet, Hintergrund unter jeder Textzeile fotografiert, Aurora läuft, 390 und 1440 px, jeder Abschnitt der Startseite in Lime, Pink und Violett).
- Knopf-Schrift jetzt **schwarz** statt dunkelblau: Am dunklen Ende des neuen Verlaufs (Akzent → 25 % Richtung Schwarz) hätte dunkelblaue Schrift bei Pink und Violett nur 4,1:1. Schwarz: mindestens 4,6:1 am dunkelsten Punkt, gemessen 5,1:1 und mehr.
- Rahmen-Knöpfe beim Überfahren/Antippen: Die 10-%-Fläche hebt den Grund an (Pink am Handy 4,20:1). Nur in diesem Zustand wird die Schrift 28 % heller, jetzt mindestens 5,06:1.
- Überschriften-Wort im Verlauf (Weiß → Akzent): gerechnet mit der Akzentfarbe als schwächstem Punkt, mindestens 4,60:1. Restliche Überschrift weiß, mindestens 5,76:1.
- Abzeichen (Kategorie-Zeile) mindestens 4,79:1, Kartentext auf der getönten Handy-Karte mindestens 4,58:1, Einleitungen mindestens 4,79:1.
- Kein Wert unter 4,5:1. Nichts wurde global abgedunkelt.

Nachtrag 29.10.2026 (Binärcode-Strom statt Aurora): gleiche Messung wie oben (Text ausgeblendet, Hintergrund unter jeder Textzeile fotografiert, Strom läuft, 390 und 1440 px, jeder Abschnitt in Lime, Pink und Violett). Schlechtester Wert 5,04:1, kein Text unter 4,5:1. Der Strom liegt hinter Text bei höchstens 0,06 Deckkraft, im Umkreis von 20 px um Text glimmt nichts.

Nachtrag 29.10.2026 (v10, Strom kräftiger 0,16–0,28, Farbwelle): gleiche Messung, schlechtester Wert 5,04:1. Die Dämpfung hinter Text ist unverändert, kräftiger sind nur Zeichen außerhalb von Text.

Nachtrag 30.10.2026 (v11, Karten-Synergie und Scroll-Impuls): gleiche Messung, schlechtester Wert 4,95:1 (Kategorie-Abzeichen „Kontakt“, Violett, 1440 px; schwankt je Messung mit der Lage der Zeichen). Kartentext mindestens 5,04:1. Randzeichen (bis 0,35) liegen außerhalb der Karten, der Impuls leuchtet nie hinter oder nahe an Text.
