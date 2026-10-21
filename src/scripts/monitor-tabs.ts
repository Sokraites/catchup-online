/**
 * Tabs im Monitor-Browser.
 *
 * Ein Klick auf einen Link im Monitor oder in der Kopfleiste öffnet oben in der Browserleiste
 * einen neuen Tab, und die Unterseite erscheint im Bildschirm. Über die Tabs geht es zurück zur Übersicht.
 *
 * - Die Unterseite wird von ihrer echten Adresse geladen (dieselbe Seite, die Google sieht).
 * - Ihre Abschnitte kommen ins Monitor-Rad: Sie scrollt mit demselben Rad- und Epochen-Effekt wie die Startseite.
 * - Die Adresszeile zeigt den Pfad, die Browser-Zurück-Taste schließt den Tab wieder.
 * - Die Tabs in der Leiste sind Bedienhilfe für Maus und Finger; für Tastatur und Vorlesehilfen
 *   gibt es in der Unterseite den Knopf „Zurück zur Übersicht“.
 * - Ohne Monitor (ohne JavaScript, reduzierte Bewegung) sind es ganz normale Links.
 */
import { navigation } from '../config/site';
import type { MonitorSteuerung } from './monitor';

/**
 * rahmen: Seite mit eigener Gestaltung (z. B. Referenzprojekt), wird als ganze Seite im Tab gezeigt.
 * abschnitte: geladene Abschnitte der Unterseite (bleiben erhalten, solange der Tab offen ist).
 */
type Tab = { href: string; titel: string; abschnitte?: HTMLElement[]; rahmen?: boolean; belebt?: boolean };

export function starteMonitorTabs(monitor: MonitorSteuerung | undefined) {
  const html = document.documentElement;
  if (!html.classList.contains('monitor-an')) return;
  const schirm = document.querySelector<HTMLElement>('.monitor-schirm');
  const geraet = document.querySelector<HTMLElement>('.monitor-geraet');
  const seite = document.querySelector<HTMLElement>('[data-tab-seite]');
  const inhalt = document.querySelector<HTMLElement>('[data-tab-inhalt]');
  const flaeche = document.querySelector<HTMLElement>('.monitor-flaeche');
  if (!monitor || !schirm || !geraet || !seite || !inhalt || !flaeche) return;

  const startAdresse = location.href;
  const tabs: Tab[] = [];
  let aktiv = -1; // -1 = Übersicht
  /** Liegt gerade eine Unterseite im Rad (statt der Startseite)? */
  let imRad = false;
  /** Scrollposition der Startseite, bevor der erste Tab aufging */
  let startScroll = 0;

  const titelFuer = (href: string, doc?: Document) => {
    const pfad = new URL(href).pathname;
    const nav = navigation.find((n) => pfad.endsWith(n.href) || pfad.endsWith(`${n.href}index.html`));
    if (nav) return nav.label;
    return doc?.querySelector('h1')?.textContent?.trim().slice(0, 24) ?? 'Seite';
  };
  const pfadFuer = (href: string) =>
    new URL(href).pathname
      .replace(/^.*\/site\//, '/')
      .replace(/index\.html$/, '')
      .replace(/^\//, '');

  /** Tabs in alle Browserleisten (jede Epoche hat ihre eigene) zeichnen. */
  function zeichneTabs() {
    geraet!.classList.toggle('mit-tabs', tabs.length > 0);
    document.querySelectorAll<HTMLElement>('[data-reiter]').forEach((leiste) => {
      leiste.replaceChildren();
      const alle = [{ href: '', titel: 'Catch up' }, ...tabs];
      alle.forEach((t, n) => {
        const i = n - 1;
        const tab = document.createElement('span');
        tab.className = 'bl-tab bl-tab-dyn';
        if (i === aktiv) tab.classList.add('bl-tab-aktiv');
        tab.textContent = i < 0 ? document.querySelector('.brand span')?.textContent ?? t.titel : t.titel;
        tab.addEventListener('click', () => (i < 0 ? zeigeUebersicht(true) : zeigeTab(i, true)));
        if (i >= 0) {
          const zu = document.createElement('span');
          zu.className = 'bl-tab-zu';
          zu.textContent = '×';
          zu.addEventListener('click', (e) => {
            e.stopPropagation();
            schliesse(i);
          });
          tab.append(zu);
        }
        leiste.append(tab);
      });
    });
    const pfad = aktiv >= 0 ? pfadFuer(tabs[aktiv].href) : '';
    document.querySelectorAll('[data-pfad]').forEach((p) => (p.textContent = pfad));
    // Kopfleiste: offener Tab ist die aktuelle Seite
    document.querySelectorAll<HTMLAnchorElement>('.main-nav a').forEach((a) => {
      if (aktiv >= 0 && a.href === tabs[aktiv].href) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  async function lade(tab: Tab) {
    if (tab.abschnitte) return tab.abschnitte;
    const antwort = await fetch(tab.href);
    const doc = new DOMParser().parseFromString(await antwort.text(), 'text/html');
    const main = doc.querySelector('main');
    if (!main) throw new Error('keine Seite');
    // Relative Adressen auf die geladene Seite beziehen, damit Links und Bilder stimmen
    main.querySelectorAll<HTMLElement>('[href], [src]').forEach((el) => {
      for (const attr of ['href', 'src']) {
        const wert = el.getAttribute(attr);
        if (wert && !wert.startsWith('#') && !/^(mailto|tel|data):/.test(wert)) el.setAttribute(attr, new URL(wert, antwort.url).href);
      }
    });
    tab.titel = titelFuer(tab.href, doc);
    const abschnitte = [...main.children].filter((e): e is HTMLElement => e.tagName === 'SECTION');
    if (!abschnitte.length) throw new Error('keine Abschnitte');
    // Für Tastatur und Vorlesehilfen: Zurück-Knopf am Anfang der Unterseite
    const kopf = document.createElement('p');
    kopf.className = 'tab-kopf tab-kopf-rad';
    const zurueck = document.createElement('button');
    zurueck.type = 'button';
    zurueck.className = 'tab-zurueck';
    zurueck.textContent = '← Zurück zur Übersicht';
    zurueck.addEventListener('click', () => zeigeUebersicht(true));
    kopf.append(zurueck);
    (abschnitte[0].firstElementChild ?? abschnitte[0]).prepend(kopf);
    tab.abschnitte = abschnitte.map((a) => document.adoptNode(a));
    return tab.abschnitte;
  }

  async function oeffne(href: string, rahmen = false, titel?: string) {
    let i = tabs.findIndex((t) => t.href === href);
    if (i < 0) {
      tabs.push({ href, titel: titel ?? titelFuer(href), rahmen });
      i = tabs.length - 1;
    }
    // Erst den Verlauf-Eintrag anlegen: So merkt sich der Browser die Stelle auf der Startseite.
    history.pushState({ monitorTab: href }, '', href);
    await zeigeTab(i, false);
  }

  async function zeigeTab(i: number, adresseErsetzen: boolean) {
    if (aktiv < 0 && !imRad) startScroll = scrollY;
    aktiv = i;
    zeichneTabs();
    const tab = tabs[i];
    try {
      if (tab.rahmen) {
        // Eigenständige Seite: als ganze Seite im Monitor zeigen (eigener Bildlauf, die Seite dahinter steht)
        seite!.classList.add('mit-rahmen');
        const rahmen = document.createElement('iframe');
        rahmen.className = 'tab-rahmen';
        rahmen.src = tab.href;
        rahmen.title = tab.titel;
        inhalt!.replaceChildren(rahmen);
        seite!.hidden = false;
        flaeche!.style.visibility = 'hidden';
        html.classList.add('monitor-tab-offen');
        seite!.querySelector<HTMLElement>('[data-tab-zurueck]')?.focus({ preventScroll: true });
      } else {
        // Unterseite ins Rad legen: gleiche Drehung und Epochen wie die Startseite
        const abschnitte = await lade(tab);
        if (aktiv !== i) return; // inzwischen ein anderer Tab gewählt
        seite!.hidden = true;
        inhalt!.replaceChildren();
        flaeche!.style.visibility = '';
        html.classList.remove('monitor-tab-offen');
        monitor!.wechsleSeiten(abschnitte);
        imRad = true;
        abschnitte[0].querySelector<HTMLElement>('.tab-zurueck')?.focus({ preventScroll: true });
        // Die KI-Seite bringt eigene Bewegung mit (Stufen und Figuren)
        if (!tab.belebt && abschnitte.some((a) => a.matches('[data-stufen]') || a.querySelector('[data-stufen]'))) {
          tab.belebt = true;
          import('./ki-seite').then(({ starteKiSeite }) => starteKiSeite(flaeche!, true));
        }
      }
    } catch {
      // Laden fehlgeschlagen: ganz normal zur Seite wechseln
      location.href = tabs[i].href;
      return;
    }
    zeichneTabs();
    if (adresseErsetzen) history.replaceState({ monitorTab: tabs[i].href }, '', tabs[i].href);
  }

  function zeigeUebersicht(adresseErsetzen: boolean) {
    aktiv = -1;
    seite!.hidden = true;
    inhalt!.replaceChildren();
    flaeche!.style.visibility = '';
    html.classList.remove('monitor-tab-offen');
    if (imRad) {
      imRad = false;
      monitor!.wechsleSeiten(null, startScroll);
    }
    zeichneTabs();
    if (adresseErsetzen) history.replaceState(null, '', startAdresse);
  }

  function schliesse(i: number) {
    const warAktiv = i === aktiv;
    tabs.splice(i, 1);
    if (warAktiv) zeigeUebersicht(true);
    else {
      if (aktiv > i) aktiv--;
      zeichneTabs();
    }
  }

  // Links im Monitor öffnen einen Tab (Termin-Links öffnen weiterhin das Terminbuch).
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || (e as MouseEvent).ctrlKey || (e as MouseEvent).metaKey || (e as MouseEvent).shiftKey) return;
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
    // Links im Bildschirm und in der Kopfleiste (Menü, Logo); „Termin buchen“ bleibt beim Terminbuch.
    if (!a || !(schirm!.contains(a) || a.closest('.site-header')) || a.target) return;
    const roh = a.getAttribute('href') ?? '';
    if (roh.startsWith('#') || /^(mailto|tel):/.test(roh)) return;
    const ziel = new URL(a.href);
    if (ziel.origin !== location.origin || /\/termin\/(index\.html)?$/.test(ziel.pathname)) return;
    e.preventDefault();
    // Link zur Startseite (z. B. „Start“ in der Brotkrumen-Leiste): zurück zur Übersicht
    if (pfadFuer(ziel.href) === '') return zeigeUebersicht(true);
    if (a.hasAttribute('data-tab-rahmen')) {
      const titel = a.closest('article')?.querySelector('h3')?.textContent?.trim();
      return oeffne(ziel.href, true, titel);
    }
    oeffne(ziel.href);
  });

  seite.querySelector('[data-tab-zurueck]')!.addEventListener('click', () => zeigeUebersicht(true));

  // Browser-Zurück: zwischen Unterseite und Übersicht wechseln
  addEventListener('popstate', (e) => {
    const href = (e.state as { monitorTab?: string } | null)?.monitorTab;
    if (!href) return zeigeUebersicht(false);
    const i = tabs.findIndex((t) => t.href === href);
    if (i >= 0) zeigeTab(i, false);
    else oeffne(href, href.includes('/referenzen/'));
  });

  zeichneTabs();
}
