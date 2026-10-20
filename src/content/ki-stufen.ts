/**
 * KI-Mitarbeiter-Stufen. Entwürfe zur Prüfung durch die Gründer.
 * Grundidee: Der KI-Mitarbeiter läuft im System des Betriebs, kennt die freigegebenen Unterlagen
 * und ist per Handy erreichbar, auch abends. Keine Zeit- oder Preisangaben, Aufwand nur in Worten.
 */
export const kiStufen = [
  {
    id: 'praktikant',
    faehigkeiten: ['Kundenfragen beantworten', 'Öffnungszeiten & Anfahrt', 'Rund um die Uhr da', 'Weiterleiten an dich', 'Freundlicher Ton', 'Lernt aus deiner FAQ'],
    einsatz: ['Chat auf deiner Webseite, der die häufigsten Fragen sofort beantwortet', 'Erste Antwort auf Anfragen per Nachricht, auch am Wochenende', 'Terminwünsche aufnehmen und an dich weitergeben'],
    titel: 'Praktikant',
    motto: 'Beantwortet die Standardfragen.',
    kann: 'Beantwortet Fragen deiner Kunden auf der Webseite oder per Nachricht, zum Beispiel zu Öffnungszeiten, Leistungen oder Anfahrt. Was er nicht sicher weiß, gibt er an dich weiter.',
    beispiel: '„Habt ihr samstags geöffnet?“',
    aufwand: 'Gering',
    aufwandStufe: 1,
    unterlagen: ['Deine Webseite', 'Eine Liste häufiger Kundenfragen', 'Öffnungszeiten und Kontaktwege'],
  },
  {
    id: 'azubi',
    faehigkeiten: ['Unterlagen durchsuchen', 'Antwort mit Quelle', 'Dokumente aufs Handy', 'Kennt Preislisten', 'Auch abends erreichbar', 'Nur freigegebene Ordner'],
    einsatz: ['Abends vom Sofa: „Was haben wir dem Kunden letztes Jahr angeboten?“', 'Auf der Baustelle: „Schick mir den Schaltplan von Projekt Lindenstraße.“', 'Neue Kollegen fragen ihn statt dich'],
    titel: 'Azubi',
    motto: 'Kennt eure Unterlagen und findet alles.',
    kann: 'Hat Zugriff auf die Unterlagen, die du freigibst: Angebote, Preislisten, Handbücher, Verträge. Du fragst ihn per Handy, auch abends, und er antwortet mit der passenden Stelle oder schickt dir das Dokument.',
    beispiel: '„Was haben wir letztes Jahr für das Dach in der Hauptstraße angeboten?“',
    aufwand: 'Überschaubar',
    aufwandStufe: 2,
    unterlagen: ['Alles vom Praktikanten', 'Freigegebene Ordner auf eurem Firmenrechner oder Server', 'Wer was sehen darf'],
  },
  {
    id: 'mitarbeiter',
    faehigkeiten: ['Unterlagen versenden', 'Angebotsentwürfe', 'Termine eintragen', 'Programme bedienen', 'Fragt bei Ausnahmen', 'Feste Abläufe'],
    einsatz: ['Wartungsunterlagen an Kunden schicken und Termine vorschlagen', 'Aus einer Anfrage einen Angebotsentwurf machen, den du nur noch prüfst', 'Eingehende Rechnungen sortieren und an die Buchhaltung geben'],
    titel: 'Mitarbeiter',
    motto: 'Erledigt Abläufe, nicht nur Fragen.',
    kann: 'Übernimmt feste Abläufe von Anfang bis Ende: schickt einem Kunden die Unterlagen, schreibt einen Angebotsentwurf, trägt Termine ein. Bei allem, was ungewöhnlich ist, fragt er dich vorher.',
    beispiel: '„Schick dem Kunden von heute Morgen die Wartungsunterlagen und biete ihm zwei Termine an.“',
    aufwand: 'Mittel',
    aufwandStufe: 3,
    unterlagen: [
      'Alles vom Azubi',
      'Beschreibung der Abläufe, die er übernehmen soll',
      'Zugang zu den Programmen, mit denen er arbeiten soll',
      'Klare Regeln, wann er dich fragen muss',
    ],
  },
  {
    id: 'teamleiter',
    faehigkeiten: ['Aufgaben koordinieren', 'Fristen im Blick', 'Morgenbericht', 'Team informieren', 'Prioritäten setzen', 'Meldet, wo du gebraucht wirst'],
    einsatz: ['Jeden Morgen eine kurze Übersicht aufs Handy: erledigt, offen, dringend', 'Erinnert rechtzeitig an Fristen, Wartungen und Wiedervorlagen', 'Verteilt wiederkehrende Aufgaben ans Team und hakt nach'],
    titel: 'Teamleiter-Niveau',
    motto: 'Behält den Überblick, damit du es nicht musst.',
    kann: 'Koordiniert mehrere Aufgaben und Abläufe, achtet auf Fristen und schickt dir morgens eine kurze Übersicht aufs Handy: was erledigt ist, was ansteht und wo du gebraucht wirst.',
    beispiel: '„Was muss ich heute wissen?“',
    aufwand: 'Hoch, Schritt für Schritt',
    aufwandStufe: 4,
    unterlagen: [
      'Alles vom Mitarbeiter',
      'Deine Ziele und Prioritäten',
      'Wer im Betrieb wofür zuständig ist',
      'Was er freigeben darf und was nicht',
    ],
  },
] as const;

/** Antwort auf den Einwand „Ich habe meine Dateien doch schon in der Cloud auf dem Handy“. */
export const kiMehrwert = [
  {
    titel: 'Fragen statt suchen',
    text: 'Ein Cloud-Ordner zeigt dir Dateien. Du musst wissen, wo etwas liegt, es öffnen und selbst lesen. Der KI-Mitarbeiter liest für dich und antwortet in einem Satz, mit Quelle.',
  },
  {
    titel: 'Auch was nicht in der Cloud liegt',
    text: 'In vielen Betrieben liegt das Wichtigste auf dem Firmenrechner, im Warenwirtschaftsprogramm oder in E-Mails. Der KI-Mitarbeiter kann auch dort nachsehen, wenn du es freigibst.',
  },
  {
    titel: 'Er handelt, nicht nur zeigt',
    text: 'Er schickt das Dokument an den Kunden, schreibt den Entwurf oder trägt den Termin ein. Eine Datei-App kann das nicht.',
  },
  {
    titel: 'Du bestimmst, wo die Daten bleiben',
    text: 'Auf Wunsch läuft er auf eurem eigenen System. Du legst fest, welche Ordner er sehen darf und was er ohne Rückfrage tun darf.',
  },
] as const;
