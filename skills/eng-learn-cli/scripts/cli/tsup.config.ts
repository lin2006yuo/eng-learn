import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'dist',
  clean: true,
  platform: 'node',
  target: 'node20',
  bundle: true,
  splitting: false,
  sourcemap: false,
  dts: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  noExternal: [/./],
  esbuildOptions(options) {
    options.outExtension = { '.js': '.cjs' };
  },
});
