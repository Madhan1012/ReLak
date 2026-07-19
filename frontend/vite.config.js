import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached aggressively
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // PDF generation — only loaded on download
          'vendor-pdf': ['jspdf', 'html2canvas'],
          // Icons — separate so resume previews don't block landing page
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
