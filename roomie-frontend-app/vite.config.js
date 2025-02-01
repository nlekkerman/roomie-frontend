import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/user-cashflow': 'https://8000-nlekkerman-roomie-9vxufbf7skz.ws-eu117.gitpod.io', // Adjust the backend URL here
    },
  },
});
