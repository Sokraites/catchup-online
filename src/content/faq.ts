/**
 * Häufige Fragen. Entwürfe zur Prüfung durch die Gründer.
 * Regel: ehrlich und ermutigend, keine Versprechen, die niemand halten kann.
 * Werden als sichtbarer Text und als strukturierte Daten (FAQPage) ausgegeben.
 */
export type Frage = { frage: string; antwort: string };

export const faqStart: Frage[] = [
  {
    frage: 'Ich habe kaum Zeit. Wie viel Arbeit habe ich mit einer neuen Webseite?',
    antwort:
      'Weniger, als du denkst. Du erzählst uns in einem Gespräch, was deinen Betrieb ausmacht. Gestaltung, Texte, Technik und Auffindbarkeit übernehmen wir und legen dir alles zur Freigabe vor. Du entscheidest, wir machen.',
  },
  {
    frage: 'Meine Webseite ist schon ein paar Jahre alt. Muss alles neu?',
    antwort:
      'Nicht unbedingt. Oft steckt in einer alten Seite viel Gutes, das nur neu verpackt werden muss. Wir schauen uns deine Seite an und sagen dir ehrlich, ob sich eine Modernisierung oder ein Neubau mehr lohnt.',
  },
  {
    frage: 'Muss ich mich mit Technik auskennen?',
    antwort:
      'Nein. Wir erklären alles in normalem Deutsch und kümmern uns um das Technische. Du sollst dich um deine Kunden kümmern, nicht um deine Webseite.',
  },
  {
    frage: 'Funktioniert die Seite auch auf dem Handy?',
    antwort:
      'Sie wird sogar zuerst für das Handy gebaut, weil viele deiner Kunden genau dort nach dir suchen. Auf Tablet und Computer sieht sie danach genauso gut aus.',
  },
  {
    frage: 'Baut ihr auch Software, die es nur für meinen Betrieb gibt?',
    antwort:
      'Ja, wenn es sich für dich lohnt. Wir hören uns zuerst an, wo dir Zeit verloren geht. Gibt es dafür schon ein gutes fertiges Programm, empfehlen wir dir das. Wenn nicht, bauen wir eine eigene Lösung: erst klein zum Ausprobieren, dann Schritt für Schritt größer.',
  },
  {
    frage: 'Werde ich danach auch bei ChatGPT und Co. gefunden?',
    antwort:
      'Garantieren kann das niemand, der ehrlich ist. Aber wir bauen deine Seite so, dass KI-Assistenten klar verstehen, wer du bist, was du anbietest und wo. Das ist die beste Voraussetzung, um empfohlen zu werden.',
  },
  {
    frage: 'Warum ein Team aus dem Donnersbergkreis?',
    antwort:
      'Weil wir die Betriebe und Kunden hier kennen. Du hast feste Ansprechpartner, die du direkt erreichst, und musst nichts dreimal erklären.',
  },
];

export const faqAuffindbarkeit: Frage[] = [
  {
    frage: 'Was ist der Unterschied zwischen Google und einer KI-Suche?',
    antwort:
      'Google zeigt eine Liste von Seiten, aus der man selbst auswählt. KI-Assistenten wie ChatGPT oder Claude geben direkt eine Antwort und nennen dabei oft nur wenige Betriebe. Wer dort nicht vorkommt, wird gar nicht erst gesehen.',
  },
  {
    frage: 'Woher wissen KI-Assistenten, welchen Betrieb sie empfehlen?',
    antwort:
      'Sie stützen sich auf Inhalte, die sie im Netz klar lesen und zuordnen können: deine Webseite, Einträge in Verzeichnissen und was andere über dich schreiben. Je klarer und stimmiger diese Angaben sind, desto leichter fällt die Empfehlung.',
  },
  {
    frage: 'Wie schnell sehe ich Ergebnisse?',
    antwort:
      'Das hängt von deiner Branche und deinem Wettbewerb ab. Die Grundlagen wirken, sobald Suchmaschinen deine neue Seite gelesen haben. Wir zeigen dir, wie sich die Anfragen über deine Seite entwickeln, damit du es selbst siehst.',
  },
  {
    frage: 'Brauche ich dafür ständig neue Texte?',
    antwort:
      'Nein. Wichtiger als viele Texte sind die richtigen: klare Antworten auf die Fragen, die deine Kunden wirklich stellen. Die erarbeiten wir einmal gründlich mit dir.',
  },
];
