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
| Private Vorschau | Erlaubt (20.10.2026): private Vorschau-Seite, nur für den Gründer sichtbar, nicht für Suchmaschinen. |
| Zwischenstände | Nach Phase B wird ein Entwurf gezeigt, danach ein erster Monitor-Entwurf. | 20.10.2026 |
| Handy-Gestaltung | Darf sich vom Desktop unterscheiden (gleicher Inhalt, eigene Darstellung), wenn es auf dem Handy besser wirkt. | 20.10.2026 |
| Kontakt | Eigene Telefonnummer und E-Mail kommen. Bis dahin Platzhalter, Seite wird gebaut, als gäbe es sie schon. | 20.10.2026 |
| Farbwelt | Aus der Vergleichsseite des Partners: dunkel mit Lila. Basis: Hintergrund `#0D0D13`, Flächen `#15151E`/`#1B1B26`, Linien `#272735`, Text `#EDECF6`, gedämpft `#9C9AB1`, Akzent `#7C4DFF`, hell `#A98BFF`, tief `#5B2BE0`. Kontraste werden geprüft und bei Bedarf angepasst. | 20.10.2026 |

## In Klärung

| Thema | Stand |
|---|---|
| Hosting-Anbieter und Domain | Gründer bucht selbst (Vorschlag: deutscher Anbieter wie netcup, Hetzner oder all-inkl, Domain beim selben Anbieter). |
| Monitor-Zeitreise | **Entschieden: Startseiten-Animation so beibehalten (Gründer, 21.10.2026), ist jetzt die Startseite.** Epochen: großer Röhrenmonitor 1990, kleinerer Röhrenmonitor 1997, Flachbildschirm 2004, Breitbild 2010, schmaler Rand 2016, heute randlos. Mit Gehäusekante und Standfuß (Handy ohne Fuß). Bildschirm durchsichtig, Kacheln scheinen durch. Entwurf liegt vor (`/entwurf/monitor/`, private Vorschau). Entscheidung durch Gründer offen. |
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
