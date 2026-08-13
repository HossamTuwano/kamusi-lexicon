import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    // @kamusi/core is a linked workspace package; Vite skips pre-bundling
    // linked deps by default, so its CJS dist is served raw and named
    // exports (e.g. PartOfSpeech) fail in the browser. Force esbuild
    // pre-bundling so CJS -> ESM interop works in the dev server too.
    include: ['@kamusi/core', '@kamusi/database'],
  },
  build: {
    commonjsOptions: {
      // Same problem in production: rollup's default /node_modules/ include
      // skips the workspace path, mis-parsing the CJS dist as ESM.
      include: [/node_modules/, /packages\/(core|database)\//],
    },
  },
});
