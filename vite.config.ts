import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(root, './src'),
    },
  },
  server: { host: '127.0.0.1', port: 5174, strictPort: true },
  build: { outDir: 'dist' },
});
