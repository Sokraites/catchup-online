// @ts-check
import { defineConfig } from 'astro/config';
import { site } from './src/config/site.ts';

export default defineConfig({
  site: site.url,
  trailingSlash: 'always',
  // Links werden beim Überfahren (bzw. Fokus) vorgeladen, damit der Klick sofort wirkt.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
