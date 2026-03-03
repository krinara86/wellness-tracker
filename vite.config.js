import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'wellness-tracker' below with your actual GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/wellness-tracker/',
})
