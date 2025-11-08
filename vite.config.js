// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/orcamento-relevo/', // necessário para GitHub Pages (repositório de projeto)
  build: { outDir: 'dist', sourcemap: false }
});
