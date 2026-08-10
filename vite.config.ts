import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    watch: {
      // required for HMR to see edits through a Docker bind mount on macOS
      usePolling: true,
    },
  },
})
