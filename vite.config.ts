import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Deploy target sets a sub-path (GitHub Pages); local dev keeps the root path.
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
})
