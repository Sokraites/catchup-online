# Start hier

Diese Anleitung ist für dich, wenn du die Seite zum ersten Mal herunterlädst, prüfst und zum Testen bei einem Hoster hochlädst. Ein Hoster ist ein Anbieter, der deine Seite im Internet bereitstellt.

## a) Wo liegt was

Alle Pfade gelten im **Repository**: Das ist der Projektordner bei GitHub, in dem alle Dateien mit ihren früheren Ständen gespeichert sind.

1. **Fertige Seite zum Hochladen:** `releases/v1/catchup-seite-v1.zip` (später `releases/v2/…`).
2. **Liste aller Versionen:** `releases/AKTUELL.md`.
3. **Alle Einstellungen der Seite** (Name, E-Mail, Telefon, Impressums-Angaben, Schalter): `src/config/site.ts`.
4. **Was vor dem Livegang noch fehlt:** oben in `VERÖFFENTLICHUNG.md`.
5. **Diese Anleitung:** `START-HIER.md`.

## b) So hole ich die Seite auf meinen Rechner

Die ZIP ist die fertige Seite. Sie entsteht aus dem Quelltext durch den **Build**: Das ist der Schritt, in dem ein Programm aus den Bauplänen die fertigen Dateien macht, die ein Browser anzeigen kann.

- [ ] Im Browser https://github.com/Sokraites/catchup-online öffnen (du musst bei GitHub angemeldet sein, das Repository ist privat).
- [ ] In der Dateiliste auf den Ordner **releases** klicken.
- [ ] Auf den Ordner **v1** klicken.
- [ ] Auf die Datei **catchup-seite-v1.zip** klicken.
- [ ] Rechts oben auf das **Download-Symbol** klicken (Pfeil nach unten, Tooltip „Download raw file“). Die Datei landet in deinem Download-Ordner.

**Achtung:** Nicht den grünen Knopf **„Code → Download ZIP“** benutzen. Der lädt den ganzen Quelltext herunter, nicht die fertige Seite. Den kann kein Hoster direkt anzeigen.

## c) So prüfe ich, dass die Datei unversehrt ist

Eine **Prüfsumme** ist eine lange Zahl, die aus dem Inhalt einer Datei berechnet wird. Ändert sich auch nur ein Zeichen in der Datei, kommt eine andere Zahl heraus. Die richtige Zahl steht in `releases/v1/PRUEFSUMME.txt`. Du berechnest die Zahl für deine heruntergeladene Datei und vergleichst.

### Windows: „Prüfsumme berechnen“

- **Wo ausführen:** Startmenü öffnen, `cmd` tippen, **Eingabeaufforderung** öffnen. Dann mit `cd Downloads` in den Download-Ordner wechseln.
- **Befehl:**
  ```
  certutil -hashfile catchup-seite-v1.zip SHA256
  ```
- **Bestandteile:**
  - `certutil`: ein Werkzeug, das in Windows schon eingebaut ist.
  - `-hashfile`: sagt dem Werkzeug, dass es eine Prüfsumme einer Datei berechnen soll.
  - `catchup-seite-v1.zip`: der Name der Datei. **Anpassen**, falls deine Datei anders heißt (z. B. `catchup-seite-v1 (1).zip`, wenn du sie zweimal geladen hast) oder wenn du später v2 prüfst.
  - `SHA256`: das Rechenverfahren. Muss genau so bleiben, sonst passt die Zahl nicht zur PRUEFSUMME.txt.
- **Ergebnis:** In der zweiten Zeile erscheint eine lange Zahl aus Ziffern und Buchstaben. Sie muss Zeichen für Zeichen der Zahl in `PRUEFSUMME.txt` entsprechen. Groß- oder Kleinschreibung spielt keine Rolle.

### macOS: „Prüfsumme berechnen“

- **Wo ausführen:** Programm **Terminal** öffnen (Programme → Dienstprogramme → Terminal). Dann mit `cd ~/Downloads` in den Download-Ordner wechseln.
- **Befehl:**
  ```
  shasum -a 256 catchup-seite-v1.zip
  ```
- **Bestandteile:**
  - `shasum`: ein Werkzeug, das in macOS schon eingebaut ist.
  - `-a 256`: wählt das Rechenverfahren SHA-256. Muss genau so bleiben.
  - `catchup-seite-v1.zip`: der Name der Datei. **Anpassen**, falls deine Datei anders heißt oder du später v2 prüfst.
- **Ergebnis:** Eine lange Zahl, dahinter der Dateiname. Die Zahl muss der Zahl in `PRUEFSUMME.txt` entsprechen.

Stimmen die Zahlen nicht überein, die Datei löschen und neu herunterladen.

## d) So lade ich die ZIP zum Test bei Cloudflare hoch

Wichtig vorab:
- Version 1 ist eine **Testversion**. Sie enthält **noindex**: Das ist eine Markierung in jeder Seite, die Suchmaschinen wie Google sagt, dass sie die Seite nicht aufnehmen sollen. Außerdem stehen in Impressum und Datenschutz noch Platzhalter. Die Testadresse deshalb nicht weitergeben.
- Cloudflare ändert die Bezeichnungen seiner Knöpfe ab und zu. Wenn ein Name nicht genau passt, nach dem ähnlichsten suchen.
- Cloudflare ist ein US-Anbieter. Ob du dort dauerhaft bleibst, ist noch offen (siehe `VERÖFFENTLICHUNG.md`). Für einen Test reicht es.

Schritte zum Abhaken:

- [ ] Bei https://dash.cloudflare.com anmelden (oder kostenlos registrieren).
- [ ] Links im Menü **Workers & Pages** öffnen.
- [ ] **Create application** (oder **Create**) anklicken.
- [ ] Den Reiter **Pages** wählen und dort die Möglichkeit zum Hochladen wählen (**Upload assets** bzw. **Drag and drop**), nicht „Connect to Git“.
- [ ] Einen **Projektnamen** eingeben, z. B. `catchup-test`. Er wird Teil der Testadresse.
- [ ] **Create project** anklicken.
- [ ] Die Datei `catchup-seite-v1.zip` aus deinem Download-Ordner in das Feld ziehen. Die ZIP **nicht** vorher entpacken.
- [ ] **Deploy site** (Bereitstellen) anklicken und warten, bis die Erfolgsmeldung erscheint.
- [ ] Die angezeigte Adresse öffnen (endet auf `.pages.dev`).

## e) Meine eigene Prüfung in sechs Klicks

- [ ] **Seite öffnen:** Die `.pages.dev`-Adresse am Computer öffnen. Erscheint die Startseite mit dem Monitor?
- [ ] **Handy im mobilen Netz:** Am Handy WLAN ausschalten und die Adresse öffnen. Lädt die Seite zügig, und ist alles lesbar?
- [ ] **Impressum und Datenschutz:** Ganz unten auf „Impressum“ und auf „Datenschutz“ klicken. Beide öffnen sich und zeigen oben „ENTWURF – vor Veröffentlichung rechtlich prüfen“.
- [ ] **Falsche Adresse:** Hinter die Adresse `/gibt-es-nicht` schreiben. Es erscheint die Seite „Diese Seite gibt es nicht (mehr).“
- [ ] **noindex finden:** Am Computer Rechtsklick auf die Seite, **Seitenquelltext anzeigen**, dann mit Strg+F (Mac: Cmd+F) nach `noindex` suchen. Es muss gefunden werden, solange die Seite eine Testversion ist.
- [ ] **Kontakt:** Unten auf die E-Mail-Adresse und die Telefonnummer klicken. Es öffnet sich das E-Mail-Programm bzw. die Telefon-App mit `catchup-digital@protonmail.com` bzw. `+49 176 84607083`.

## f) So entsteht Version 2

1. **Mir sagen, was sich ändern soll.** Zum Beispiel:
   - „Trage im Impressum ein: Firmenname …, Anschrift …, vertreten durch …“
   - „Schalte die Indexierung ein.“ (erst, wenn Impressum und Datenschutz rechtlich geprüft sind)
   - „Erstelle danach Version 2 mit `npm run release -- v2` und pushe sie.“
2. **Ich (Claude) ändere die Seite**, prüfe sie und führe aus: `npm run release -- v2 "Was ist neu: …"`. Dabei entsteht der Ordner `releases/v2/` mit ZIP, Prüfsumme, Inhalt und Version, und in `releases/AKTUELL.md` kommt eine Zeile dazu. Danach mache ich einen **Commit** (ein gespeicherter Stand des Projekts mit Beschreibung), ein **Tag** `v2` (ein fester Name für genau diesen Stand, damit man ihn später wiederfindet) und lade beides zu GitHub hoch.
3. **Du lädst `releases/v2/catchup-seite-v2.zip` herunter** (wie in b), prüfst sie (wie in c) und lädst sie bei Cloudflare hoch: Im Projekt **Create deployment** bzw. **Neue Bereitstellung** wählen und die neue ZIP hineinziehen.

**Zurück auf Version 1, falls v2 Probleme macht:**
- Am schnellsten bei Cloudflare: Im Projekt den Bereich **Deployments** öffnen, bei der früheren Bereitstellung (v1) auf das Menü mit den drei Punkten klicken und **Rollback** (Zurückrollen) wählen.
- Oder: `releases/v1/catchup-seite-v1.zip` erneut herunterladen und wie in d) als neue Bereitstellung hochladen. Version 1 bleibt im Repository immer erhalten.

## g) Was ich nicht selbst ausführen muss

Die Prüf-Skripte `npm run pruefen`, `node scripts/funktionstest.mjs` und `sh scripts/messen.sh` sind Werkzeuge für Claude. Sie testen die Seite automatisch auf Fehler, Barrierefreiheit und Ladezeit. Du musst sie nicht ausführen und nichts installieren. Für dich reichen die Schritte b) bis e).
