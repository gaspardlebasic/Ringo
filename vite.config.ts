import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' => chemins relatifs, compatible avec GitHub Pages (site projet)
export default defineConfig({
  plugins: [react()],
  base: './',
})
