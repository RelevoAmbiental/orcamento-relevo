import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // raiz do domínio principal — certo!
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    mimeTypes: {
      // garante que .jsx e .js sejam servidos corretamente no dev
      'text/javascript': ['js', 'jsx'],
    },
  },
});
