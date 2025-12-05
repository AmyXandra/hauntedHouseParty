import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import restart from 'vite-plugin-restart'

export default defineConfig({
  plugins: [
    react(),
    restart({ restart: ['../public/**'] }) // Restart server on static file change
  ],
  root: 'src/',
  publicDir: '../public/', // Changed from static to public for React convention
  server: {
    host: true,
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true
  }
})
