/**
 * Tabs im Monitor-Browser.
 *
 * Ein Klick auf einen Link im Monitor öffnet oben in der Browserleiste einen neuen Tab,
 * und die Unterseite erscheint im Bildschirm. Über die Tabs geht es zurück zur Übersicht.
 *
 * - Die Unterseite wird von ihrer echten Adresse geladen (dieselbe Seite, die Google sieht).
 * - Die Adresszeile zeigt den Pfad, die Browser-Zurück-Taste schließt den Tab wieder.
 * - Die Tabs in der Leiste sind Bedienhilfe für Maus und Finger; für Tastatur und Vorlesehilfen
 *   gibt es in der Unterseite den Knopf „Zurück zur Übersicht“.
 * - Ohne Monitor (ohne JavaScript, reduzierte Bewegung) sind es ganz normale Links.
 */
import { navigation } from '../config/site';

/** rahmen: Seite mit eigener Gestaltung (z. B. Referenzprojekt), wird als ganze Seite im Tab gezeigt. */
type Tab = { href: string; titel: string; html?: string; rahmen?: boolean };

export function starteMonitorTabs() {
  const html = document.documentElement;
  if (!html.classList.contains('monitor-an')) return;
  const schirm = document.querySelector<HTMLElement>('.monitor-schirm');
  const geraet = document.querySelector<HTMLElement>('.monitor-geraet');
  const seite = document.querySelector<HTMLElement>('[data-tab-seite]');
  const inhalt = document.querySelector<HTMLElement>('[data-tab-inhalt]');
  const flaeche = document.querySelector<HTMLElement>('.monitor-flaeche');
  if (!schirm || !geraet || !seite || !inhalt || !flaeche) return;

  const startAdresse = location.href;
  const tabs: Tab[] = [];
  let aktiv = -1; // -1 = Übersicht

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
  }

  async function lade(tab: Tab) {
    if (tab.html) return tab.html;
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
    tab.html = main.innerHTML;
    return tab.html;
  }

  async function oeffne(href: string, rahmen = false, titel?: string) {
    let i = tabs.findIndex((t) => t.href === href);
    if (i < 0) {
      tabs.push({ href, titel: titel ?? titelFuer(href), rahmen });
      i = tabs.length - 1;
    }
    await zeigeTab(i, false);
    history.pushState({ monitorTab: href }, '', href);
  }

  async function zeigeTab(i: number, adresseErsetzen: boolean) {
    aktiv = i;
    zeichneTabs();
    const tab = tabs[i];
    seite!.classList.toggle('mit-rahmen', Boolean(tab.rahmen));
    const extern = seite!.querySelector<HTMLAnchorElement>('[data-tab-extern]');
    if (extern) {
      extern.hidden = !tab.rahmen;
      extern.href = tab.href;
    }
    try {
      if (tab.rahmen) {
        // Eigenständige Seite: als ganze Seite im Monitor zeigen
        const rahmen = document.createElement('iframe');
        rahmen.className = 'tab-rahmen';
        rahmen.src = tab.href;
        rahmen.title = tab.titel;
        inhalt!.replaceChildren(rahmen);
      } else {
        inhalt!.innerHTML = await lade(tab);
      }
    } catch {
      // Laden fehlgeschlagen: ganz normal zur Seite wechseln
      location.href = tabs[i].href;
      return;
    }
    zeichneTabs();
    seite!.hidden = false;
    flaeche!.style.visibility = 'hidden';
    seite!.scrollTop = 0;
    // Während eine Unterseite offen ist, scrollt nur sie, nicht die Startseite dahinter.
    html.classList.add('monitor-tab-offen');
    if (adresseErsetzen) history.replaceState({ monitorTab: tabs[i].href }, '', tabs[i].href);
    seite!.querySelector<HTMLElement>('[data-tab-zurueck]')?.focus({ preventScroll: true });
    // Die KI-Seite bringt eigene Bewegung mit (Stufen und Figuren)
    if (inhalt!.querySelector('[data-stufen]')) {
      import('./ki-seite').then(({ starteKiSeite }) => starteKiSeite(inhalt!, true));
    }
  }

  function zeigeUebersicht(adresseErsetzen: boolean) {
    aktiv = -1;
    seite!.hidden = true;
    flaeche!.style.visibility = '';
    html.classList.remove('monitor-tab-offen');
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
    if (!a || !schirm!.contains(a) || a.target) return;
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
    else oeffne(href, true);
  });

  zeichneTabs();
}
