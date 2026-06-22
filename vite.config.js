import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '5174'),
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '4174'),
    allowedHosts: true,
  },
});
