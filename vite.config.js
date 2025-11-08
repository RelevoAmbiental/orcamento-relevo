import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/orcamento-relevo/', // caminho do repositório GitHub Pages
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
