import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    commonjsOptions: {
      // @kamusi/core resolves to a workspace path outside real node_modules,
      // so rollup's default /node_modules/ include skips it and mis-parses
      // the CJS dist as ESM. Force CJS interop for the shared packages.
      include: [/node_modules/, /packages\/(core|database)\//],
    },
  },
});
