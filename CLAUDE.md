# CLAUDE.md – verbindliche Regeln für dieses Projekt

Webseite „Catch up“ (Arbeitsname, immer getrennt geschrieben). Ausführliche Quelle: `UEBERGABE.md`.
Getroffene und offene Entscheidungen: `docs/ENTSCHEIDUNGEN.md`. Etappen: `docs/PLAN.md`.

## Rangfolge bei Zielkonflikten

1. Lesbarkeit und Auffindbarkeit
2. Nutzung auf dem Smartphone
3. Ladezeit
4. Show-Effekt

## Leitplanken (Kurzform)

1. **Echter HTML-Text.** Aller Inhalt steht als lesbarer Text im HTML. Monitor, Kacheln und 3D-Effekte sind nur Darstellung. Ohne JavaScript bleibt eine einfache, vollständige Version lesbar.
2. **Kacheln sparsam.** Keine Tausende HTML-Elemente. Zeichenfläche (Canvas) oder vergleichbar sparsame Technik.
3. **Ladezeit ist Design.** Ziel (mobil): LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1, Lighthouse Leistung ≥ 90, SEO und Barrierefreiheit ≥ 95. Schwere Effekte (z. B. 3D) nur nachladen, wo sie gebraucht werden.
4. **Barrierefreiheit.** `prefers-reduced-motion` ergibt eine ruhige Variante. Alles per Tastatur bedienbar, ausreichende Kontraste, Alternativtexte. Dekoration (Kacheln, 3D) ist für Hilfstechnik ausgeblendet (`aria-hidden`).
5. **Datenschutz.** Schriften und Bibliotheken selbst ausliefern, nichts von Fremdservern laden. Keine Tracker, keine Cookies, kein Einwilligungsbanner. Nichts ohne Notwendigkeit auf dem Gerät speichern. Messung nur als Platzhalter.
6. **SEO/GEO von Anfang an.** Genau eine H1 pro Seite, Titel und Beschreibung, Open Graph, `sitemap.xml`, `robots.txt`, Schema.org-Daten mit Platzhaltern, FAQ mit Kundenfragen. Eigene Unterseiten pro Leistung.
7. **Rechtliches.** Impressum und Datenschutz als Seiten mit klar markierten Platzhaltern. Keine erfundenen Namen, Adressen, Telefonnummern oder Rechtsformen. Rechtliche Prüfung vor Livegang. Kein Livegang mit unvollständigen Angaben.
8. **Zentral änderbar.** Name, Claim, Domain und Kontakt stehen nur in der Konfigurationsdatei, nie verstreut im Code.
9. **Hosting.** Statisch ausliefern, Hosting in der EU.
10. **Vorladen.** Links werden beim Überfahren (Desktop) bzw. Antippen (Handy) vorgeladen, damit der Klick sofort wirkt. Pflicht für jede Seite.
11. **Animation bremst nie.** Eingaben reagieren sofort. Animationen laufen parallel und lassen sich unterbrechen, niemand wartet auf sie.
12. **Handy darf anders aussehen.** Gleicher Inhalt im HTML, aber eigene Darstellung, wenn sie auf dem Handy besser wirkt.

## Was nicht ins Projekt gehört

- Keine Personennamen der Gründer, keine privaten Angaben, keine Team-Fotos. Ein Team-Abschnitt entfällt.
- Keine Preise, keine Interna.
- Keine Kopien von Texten, Bildern, Logos oder Marken (Apple oder andere).
- Keine erfundenen Zahlen, Referenzen oder Kundenstimmen.

## Technik

- Astro (Seitenbaukasten), GSAP (Scroll-Animationen), Three.js nur auf der KI-Seite. Versionen fest eingetragen in `package.json`.
- Zentrale Angaben: `src/config/site.ts`. Seiten: `src/pages/`. Bausteine: `src/components/`.
- Lokal starten: `npm install`, dann `npm run dev`. Fertige Seite bauen: `npm run build` (Ergebnis in `dist/`).

## Arbeitsweise

- Texte auf der Webseite: Deutsch, Anrede „du“, klar, ohne Fachjargon, konkreter Nutzen.
- Kleine Etappen, nach jeder Etappe `docs/PLAN.md` abhaken und einen Git-Commit mit verständlicher Beschreibung machen.
- Vor jedem Bericht selbst prüfen: Smartphone-Breite (390 px), Tablet und Desktop. Offen sagen, was noch nicht funktioniert.
- Speichern in GitHub (`Sokraites/catchup-online`, privat) ist erlaubt. Alles andere gilt als Veröffentlichung: nichts veröffentlichen, nichts auf Fremdserver hochladen, keine Zugangsdaten nutzen, ohne vorher zu fragen.
- Entscheidungen kurz und in einfachem Deutsch erklären. Der Gründer ist kein Webentwickler.
- Fehlt eine Angabe, die eine Entscheidung stark beeinflusst: nachfragen, nicht raten.
