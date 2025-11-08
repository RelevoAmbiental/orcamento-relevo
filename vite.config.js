import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ⚙️ Configuração do Vite para domínio próprio (orcamento.relevo.eco.br)
export default defineConfig({
  plugins: [react()],
  base: '/', // raiz do domínio — mantenha assim
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true, // limpa a pasta dist antes de cada build
    rollupOptions: {
      output: {
        // Garante nomes limpos e cache-friendly no GitHub Pages
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  server: {
    port: 5173, // opcional para dev local
    open: true,
  },
});
