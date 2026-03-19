import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        proxy: {
            '/api': {
                target: 'https://pu.humanity.peoplefirst.org.ng',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    define: {
        'import.meta.env.VITE_API_URL': JSON.stringify(
            process.env.NODE_ENV === 'production' 
                ? 'https://pu.humanity.peoplefirst.org.ng' 
                : 'http://localhost:8000'
        ),
    },
});
