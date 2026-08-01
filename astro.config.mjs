// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://outzero.app',
  image: {
    // The editorial backdrops are original uploads pulled from Firebase at
    // build time and re-encoded locally (see `spots.ts`), which the image
    // pipeline refuses to do for a host that isn't listed here.
    domains: ['firebasestorage.googleapis.com'],
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
