// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(), // Facilite l'utilisation des chemins de tsconfig.json dans les imports
    ],
    server: {
        port: 3000, // Choisissez le port qui vous convient
    },
});
