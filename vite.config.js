import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // <---- importante! raiz do domínio
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
