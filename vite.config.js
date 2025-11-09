import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detecta automaticamente o domínio de produção
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? '/' // domínio personalizado: orcamento.relevo.eco.br
    : '/'

export default defineConfig({
  plugins: [react()],
  base: baseUrl,
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: true,
  },
})
