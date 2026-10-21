# Qualitätsbericht (Phase E)

Stand: 21.10.2026. Gemessen am gebauten, komprimierten Stand (`npm run build && npm run komprimieren`).

## 1. Ladezeit und Flüssigkeit (Handy)

Gemessen mit Lighthouse 13.5 im Handy-Modus (gedrosseltes Netz und gedrosselter Prozessor, wie Google es tut).
Werkzeug: `sh scripts/messen.sh`.

| Seite | Tempo (Ziel ≥ 90) | Barrierefreiheit (Ziel ≥ 95) | SEO (Ziel ≥ 95) | Hauptinhalt sichtbar (LCP, Ziel ≤ 2,5 s) | Springen beim Laden (CLS, Ziel ≤ 0,1) |
|---|---|---|---|---|---|
| Startseite | 95 | 100 | 100 | 2,5 s | 0 |
| Neue Webseite | 99 | 100 | 100 | 1,7 s | 0 |
| KI-Mitarbeiter | 99 | 100 | 100 | 2,1 s | 0 |
| Termin | 99 | 100 | 100 | 1,8 s | 0 |

Reaktionszeit auf Eingaben (INP, Ziel ≤ 200 ms), Handy mit 4-fach gedrosseltem Prozessor.
Werkzeug: `node scripts/reaktion.mjs`.

| Eingabe | Reaktion |
|---|---|
| Startseite: Sprung-Link im Monitor | 48–64 ms |
| Termin buchen (Buch öffnet) | 24–32 ms |
| Terminbuch: Tag wählen | 120–152 ms |
| Häufige Frage aufklappen | 48–72 ms |
| KI-Seite: nächste Stufe | 48–80 ms |

**Ergebnis: Alle Zielwerte erreicht.** Die Startseite liegt beim Hauptinhalt genau auf der Grenze (2,5 s).

Was dafür geändert wurde:
- Komprimierte Fassungen aller Text-Dateien (Brotli/Gzip): 1.138 KB → 269 KB.
- KI-Seite: 3D-Programm erst laden, wenn die erste Figur ins Bild kommt; Scroll-Bibliothek nur am Desktop.
- Sprung-Links im Monitor: erst sichtbar reagieren, dann rechnen.
- Terminbuch: Monatspfeil und Schließen-Knopf überlappen auf dem Handy nicht mehr.

## 2. Barrierefreiheit

- Automatische Prüfung (axe) auf allen Seiten, Handy, Tablet, Desktop, mit und ohne JavaScript: keine Fehler. Werkzeug: `npm run pruefen`.
- Automatische Prüfung bei geöffnetem Terminbuch: keine Fehler.
- Tastatur: alle Links, Knöpfe, Fragen, Terminbuch (Esc schließt), KI-Stufen (Pfeile, Punkte). Im Monitor holt der Tastatur-Fokus den richtigen Abschnitt nach vorn. Tabs im Monitor haben für Tastatur und Vorlesehilfen den Knopf „Zurück zur Übersicht“.
- Bilder haben Alternativtexte; Dekoration (Kacheln, Monitor-Gehäuse, Figuren-Animation) ist für Hilfstechnik ausgeblendet.
- Reduzierte Bewegung: Monitor, Kacheln-Nachleuchten, Figuren-Animation und Blätter-Animation sind aus; alles bleibt bedienbar.

## 3. Ohne JavaScript

Alle Seiten sind ohne JavaScript vollständig lesbar (geprüft): Die Startseite zeigt dann alle Abschnitte untereinander, „Termin buchen“ führt zur Terminseite mit Telefon und E-Mail.

## 4. Abgleich mit dem Zielbild

| Zielbild (Übergabe, Abschnitte 1 und 4) | Stand |
|---|---|
| Seite ist selbst der Beweis, Erlebnis wie eine Produktseite | Monitor-Zeitreise mit gerenderten Geräten, Kachel-Easter-Egg, Terminbuch, 3D-Figuren, Tabs im Monitor |
| Kachel-Hintergrund mit Freischalt-Pfad, Touch-Variante | umgesetzt (Leuchten nur im Monitor, Funkeln auf dem Handy) |
| Monitor trägt den Inhalt, Animation hängt am Inhalt | umgesetzt (Rad-Wechsel je Abschnitt, Epoche je Abschnitt) |
| Kacheln und Monitor als ein Erlebnis | umgesetzt (Raster liegt im Bildschirm, Auge zeigt den Weg) |
| Handy zuerst | eigene Handy-Darstellung (Querformat-Auftakt, Wischen, einseitiges Buch) |
| Echter, lesbarer Text für Google und KI | ja, alles im HTML; strukturierte Daten, Sitemap, llms.txt |
| Ladezeit als Teil des Designs | Zielwerte erreicht (siehe 1.) |

## 5. Bekannte Lücken

- Auf echten Handys nicht getestet (nur nachgestellt). Bitte Checkliste unten durchgehen.
- 3D läuft hier über einen Software-Ersatz; auf echten Geräten mit Grafikchip ist es flüssiger, aber ungetestet.
- Die Startseite liegt beim Hauptinhalt genau auf 2,5 s; mit langsamem Hosting könnte es knapp darüber liegen.
- Kachelpfad auf dem Handy: zählt erst, wenn der Monitor hochkant steht (im flachen Querformat zu Beginn passen die Pfad-Kacheln nicht hinein). Antippen einer Pfad-Kachel über einer Karte öffnet die Karte; kurzes Wischen schaltet frei, ohne etwas zu öffnen.
- Terminbuch: belegte Tage und echter Versand fehlen (erst mit Hosting).
- Messung der Anfragen: nur vorbereitet.

## 6. Was vor dem Livegang fehlt (bei den Gründern)

1. Name und Domain final; Domain eintragen in `src/config/site.ts`.
2. Telefonnummer und E-Mail eintragen (`src/config/site.ts`).
3. Impressum und Datenschutz mit echten Angaben füllen und rechtlich prüfen lassen.
4. Referenzprojekt „Ottos Werkstatt“: schriftliche Freigabe des Kunden für Nennung, Fotos und die auf der Projektseite gezeigten Kontaktdaten.
5. Texte, FAQ, KI-Stufen freigeben.
6. Termin-Regeln festlegen (Wochentage, Uhrzeiten) in `src/config/termine.ts`.
7. Hosting buchen; danach: Versand der Terminanfragen und Kalender-Anbindung, datenschutzfreundliche Messung.
8. Belohnung am Ende des Kachelpfads und Pfad bestätigen.

## Checkliste für den Test auf echten Handys

1. Startseite öffnen: Sieht man zuerst einen Röhrenmonitor?
2. Scrollen: Fühlt es sich wie normales Scrollen an? Stört das Einrasten?
3. Wechselt der Monitor sichtbar die Epoche, ohne zu ruckeln?
4. Erst ein Stück scrollen (Monitor hochkant), dann mit kurzem Wischen über die Kacheln streichen: Funkelt es? Leuchtet Kachel 7/7 dauerhaft? Lässt sich der Pfad bis 5/5 freischalten?
5. Eine Leistungskarte oder einen Menüpunkt oben antippen: Öffnet sich ein Tab im Monitor? Dreht die Unterseite beim Scrollen wie die Startseite? Kommt man zurück an dieselbe Stelle?
6. „Projekt ansehen“ beim Referenzprojekt: Erscheint es im Monitor-Tab?
7. „Termin buchen“: Klappt das Buch auf? Kreist die Feder den heutigen Tag ein?
8. Kalenderseite seitlich wischen: Wölbt sich das Blatt, rastet der nächste Monat ein? Pfeile ebenso?
9. Tag wählen, Felder ausfüllen, absenden: Faltet sich der Brief?
10. KI-Seite: seitlich wischen, winken die Figuren?
