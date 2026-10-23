# Veröffentlichung

## Was ich als Nächstes tun muss

Einsteiger-Anleitung mit allen Klickwegen: [START-HIER.md](START-HIER.md).

- [ ] Version 1 herunterladen: `releases/v1/catchup-seite-v1.zip` (START-HIER.md, Abschnitt b)
- [ ] Prüfsumme vergleichen mit `releases/v1/PRUEFSUMME.txt` (Abschnitt c)
- [ ] Zum Test bei Cloudflare hochladen und die Testadresse nicht weitergeben (Abschnitt d)
- [ ] Eigene Prüfung in sechs Klicks (Abschnitt e)
- [ ] Impressum-Angaben liefern: Firmenname und Rechtsform, Anschrift, Vertretung, ggf. Registernummer und USt-ID (Liste unten, Abschnitt 2)
- [ ] Hosting-Anbieter festlegen (Cloudflare ist ein US-Anbieter, Regel war „Hosting in der EU“), danach Hosting-Angaben für den Datenschutz liefern
- [ ] Impressum und Datenschutz rechtlich prüfen lassen
- [ ] Entscheiden: „Software nach Maß“ behalten oder herausnehmen; Freigabe des Kunden für „Ottos Werkstatt“ einholen
- [ ] Domain registrieren
- [ ] Erst danach: Claude Version 2 mit eingeschalteter Indexierung erstellen lassen (Abschnitt f)

---

Stand: 22.10.2026. Alles hier bezieht sich auf den Build aus `npm run build` (Ordner `dist/`) und das Paket `catchup-seite.zip`.

## 1. Wo steht was

| Was | Datei |
|---|---|
| Zentrale Konfiguration: Name, Claim, Domain, E-Mail, Telefon, Impressums-Angaben | `src/config/site.ts` |
| Schalter **INDEXIERUNG** (Standard: aus) | `src/config/site.ts`, Zeile `export const INDEXIERUNG = false;` |
| Schalter **REFERENZEN** (Projekt „Ottos Werkstatt“, Standard: aus) | `src/config/site.ts`, Zeile `export const REFERENZEN = false;` |
| Darstellungs-Stufen (Leicht, Mittel, Schwer) | `src/config/stufen.ts` |
| Aussicht durchs Fenster (nur Stufe Schwer, Desktop ab 1280 px) | `src/scripts/aussicht.ts`, Stile in `src/styles/monitor.css` |
| Impressum (Entwurf) | `src/pages/impressum.astro` → `/impressum/` |
| Datenschutzerklärung (Entwurf) | `src/pages/datenschutz.astro` → `/datenschutz/` |
| Sicherheits-Header für Cloudflare Pages | wird beim Bauen erzeugt: `dist/_headers` (aus `scripts/nachbereiten.mjs`) |
| Fehlerseite, Favicon, Manifest | `src/pages/404.astro`, `public/favicon.svg`, `src/pages/site.webmanifest.ts` |
| Paket bauen | `npm run build`, dann `npm run paket` → `catchup-seite.zip` (index.html liegt im Stamm) |
| Lokal ansehen | `npm run build`, dann `npm run ansehen` → http://localhost:4321 |

## 2. Offene Platzhalter

Alle erscheinen auf der Seite sichtbar gelb markiert als `<<HIER ANGABE EINTRAGEN: …>>`.

| Platzhalter | Datei (Eintrag) | Erscheint auf |
|---|---|---|
| Firmenname und Rechtsform | `src/config/site.ts` (`rechtliches.firma`) | Impressum, Datenschutz |
| Ladungsfähige Anschrift | `src/config/site.ts` (`rechtliches.anschrift`) | Impressum, Datenschutz |
| Vertretungsberechtigte Person(en) | `src/config/site.ts` (`rechtliches.vertretung`) | Impressum, Datenschutz |
| Registergericht und Registernummer (falls eingetragen, sonst Zeile entfernen) | `src/config/site.ts` (`rechtliches.register`) | Impressum |
| Umsatzsteuer-ID (falls vorhanden, sonst Zeile entfernen) | `src/config/site.ts` (`rechtliches.ustId`) | Impressum |
| Inhaltlich verantwortliche Person nach § 18 Abs. 2 MStV | `src/config/site.ts` (`rechtliches.inhaltlichVerantwortlich`) | Impressum |
| Hosting-Anbieter mit Anschrift | `src/config/site.ts` (`rechtliches.hosting`) | Datenschutz |
| Speicherdauer der Server-Logfiles | `src/pages/datenschutz.astro` | Datenschutz |
| E-Mail-Anbieter mit Anschrift | `src/pages/datenschutz.astro` | Datenschutz |
| Domain `catchup-digital.com` (noch nicht registriert) | `src/config/site.ts` (`url`) | Canonical, Sitemap, Open Graph, JSON-LD, Adresszeile im Monitor |

Außerdem: Der Vermerk „ENTWURF – vor Veröffentlichung rechtlich prüfen“ steht oben auf Impressum und Datenschutz. Er wird erst nach der rechtlichen Prüfung entfernt (`src/components/EntwurfVermerk.astro` aus beiden Seiten herausnehmen).

## 3. Prüfergebnisse

| Prüfung | Ergebnis |
|---|---|
| Dateien im Build | 51 (Grenze 1.000) |
| Größte Datei | `og.png`, 256 KB (Grenze 25 MiB); größtes Skript 124 KB |
| ZIP | `catchup-seite.zip`, 737 KB, `index.html` im Stamm |
| Lighthouse Mobil, Startseite | Leistung 92 · Barrierefreiheit 100 · Empfehlungen 100 · SEO 66 |
| Warum SEO 66 | Einziger Abzug: „Seite ist für Suchmaschinen gesperrt“. Das ist der Schalter INDEXIERUNG (aus). Eingeschaltet entfällt der Abzug. |
| Ladezeit Startseite (simuliert, gedrosselt) | Hauptinhalt 2,7–2,8 s (Ziel 2,5 s, knapp verfehlt, siehe 6.), Springen 0, Blockierzeit 100–160 ms; Stufe Leicht: 2,5 s |
| Konsolenfehler | keine (alle 8 Seiten in 360, 768, 1440 px, mit aktiver Content-Security-Policy) |
| Content-Security-Policy | aktiv getestet: keine Verstöße; Terminbuch, Tabs, Stufen-Wahl, Kachel-Pfad funktionieren |
| Interne Links | 34 Adressen erreichbar, unbekannte Adresse zeigt die 404-Seite |
| Barrierefreiheit (axe) | keine Fehler, alle Seiten, 360/768/1440 px, mit und ohne JavaScript |
| Ohne JavaScript | alle Texte vollständig lesbar |
| Fremde Server | keine: Der Browser fragt nur die eigene Adresse an |
| Cookies | keine |
| Lokaler Speicher | ein Eintrag `catchup-stufe`, erst wenn jemand eine Darstellung wählt (in der Datenschutzerklärung beschrieben) |

Werkzeuge zum Wiederholen (Seite muss laufen, `npm run ansehen`):
`BASIS=http://localhost:4321 npm run pruefen`, `BASIS=http://localhost:4321 node scripts/funktionstest.mjs`, `sh scripts/messen.sh http://localhost:4321`.

## 4. So schalte ich die Indexierung ein

1. Erst wenn Impressum und Datenschutz vollständig und rechtlich geprüft sind.
2. In `src/config/site.ts` die Zeile `export const INDEXIERUNG = false;` ändern in `export const INDEXIERUNG = true;`.
3. `npm run build` und `npm run paket`, das neue Paket hochladen.

Wirkung: Das `noindex, nofollow` verschwindet von allen Seiten, `robots.txt` erlaubt alles und verweist auf die Sitemap, im Kopf jeder Seite steht der Sitemap-Verweis.

## 5. So tausche ich E-Mail, Telefon und Domain aus

Alles nur in `src/config/site.ts`, danach `npm run build` und `npm run paket`:

- E-Mail: `email: ECHT('catchup-digital@protonmail.com')` → neue Adresse eintragen.
- Telefon: `anzeige: ECHT('+49 176 84607083')` (so wird sie angezeigt) und `link: '+4917684607083'` (für Anruf-Links, ohne Leerzeichen).
- Domain: `url: 'https://catchup-digital.com'` (ohne Schrägstrich am Ende). Wirkt auf Canonical, Sitemap, robots.txt, Open Graph, JSON-LD und die Adresszeile im Monitor.

Kontaktbereich, Fußzeile, Terminbuch, Terminseite, Impressum, Datenschutz und die strukturierten Daten lesen von dort.

## 6. Bekannte Mängel und offene Entscheidungen

**Zur Entscheidung (Gründer):**

1. **Hosting bei Cloudflare Pages:** Unsere Leitplanke lautet „Hosting in der EU“. Cloudflare ist ein US-Unternehmen mit weltweitem Netz. Entweder bewusst so entscheiden (und im Datenschutz benennen) oder einen EU-Anbieter wählen. Die Seite läuft bei jedem statischen Hosting.
2. **„Software nach Maß“:** Der Auftrag nennt vier Leistungen (neue Webseiten, Modernisierung, SEO, Auffindbarkeit bei KI-Suche). „Software nach Maß“ hattest du am 22.10. selbst gewünscht. Sie ist noch auf der Seite (Unterseite, Abschnitt „Welche digitale Lösung …“, Menüpunkt). Behalten oder herausnehmen?
3. **Referenz „Ottos Werkstatt“:** Ist vorerst ausgeblendet und nicht im Paket (Schalter REFERENZEN), bis die schriftliche Freigabe des Kunden für Nennung, Fotos und Kontaktdaten vorliegt.
4. **Darstellungs-Stufen:** Laut Zielbild gehört der Kachel-Pfad zur Standard-Darstellung. „Mittel“ (Standard) zeigt ihn jetzt; „Schwer“ dreht nur die Effekte auf (mehr Leuchten, Funkeln mit der Maus), die 3D-Figuren gibt es nicht mehr.

**Bekannte Mängel:**

- Ladezeit Startseite: Hauptinhalt nach 2,7–2,8 s im simulierten, gedrosselten Handy-Test (Ziel 2,5 s). Ursache: Der Einleitungstext erscheint erst, wenn die Monitor-Animation startet. Auf schnellem Hosting nach dem Livegang neu messen; in der Stufe Leicht 2,5 s.
- Nicht auf echten Handys getestet, nur nachgestellt (Chromium). Die Checkliste in `docs/QUALITAET.md` gilt weiter.
- „Ohne Server“: Die Seite ist rein statisch und läuft bei jedem statischen Hosting. Direkt per Doppelklick auf `index.html` funktioniert sie nicht vollständig, weil die Links vom Stammverzeichnis der Domain ausgehen.
- Terminbuch: Anfragen gehen per vorbereiteter E-Mail (ehrlich beschriftet). Echter Versand und belegte Tage erst mit einem Server-Dienst.
- Aussicht (Stufe Schwer): nur mit Software-Grafik getestet (ohne Grafikkarte, dort ca. 8 Bilder/s). Auf echten Rechnern mit Grafikkarte flüssiger; bitte an einem echten Desktop ansehen. Bei gesperrtem WebGL bleibt die Seite wie in Stufe Mittel.
- Der Sicherheits-Header `Strict-Transport-Security` ist bewusst nicht gesetzt. Cloudflare kann HTTPS selbst erzwingen; HSTS erst setzen, wenn die Domain sicher dauerhaft über HTTPS läuft.
