import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    allowedHosts: ['5173-iet5z0jheqmlp9n6seny2-62b4a251.manus.computer'],
  },
  plugins: [react()],
  base: '/orcamento/', // ✅ MUDANÇA CRÍTICA
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
