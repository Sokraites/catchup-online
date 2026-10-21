#!/bin/sh
# Misst Seiten mit Lighthouse im Handy-Modus. Voraussetzung: gebaute, komprimierte Seite läuft
# (npm run build && npm run komprimieren && npx http-server dist -p 4322 -s -b -g).
#   sh scripts/messen.sh [adresse]
BASIS=${1:-http://localhost:4322}
mkdir -p docs/messung
for seite in "" "webseiten-erstellen/" "ki-mitarbeiter/" "termin/"; do
  name=$(echo "start-${seite}" | tr '/' '-' | sed 's/-*$//')
  npx lighthouse "$BASIS/$seite" --quiet --chrome-flags="--headless=new --no-sandbox --use-angle=swiftshader" \
    --form-factor=mobile --output=json --output-path="docs/messung/$name.json" \
    --only-categories=performance,accessibility,best-practices,seo >/dev/null 2>&1
  node -e "
    const d = require('./docs/messung/$name.json'), a = d.audits, c = d.categories;
    const p = (k) => Math.round(c[k].score * 100);
    console.log('$name'.padEnd(26), 'Tempo', p('performance'), '| Barrierefreiheit', p('accessibility'), '| SEO', p('seo'),
      '| LCP', a['largest-contentful-paint'].displayValue, '| CLS', a['cumulative-layout-shift'].displayValue, '| TBT', a['total-blocking-time'].displayValue);
  "
done
