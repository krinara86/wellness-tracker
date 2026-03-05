import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'wellness-tracker' with your actual GitHub repo name if different
export default defineConfig({
  plugins: [react()],
  base: '/wellness-tracker/',
})
