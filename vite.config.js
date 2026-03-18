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
                target: 'http://pu.osun.accordofficial.com',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    define: {
        'import.meta.env.VITE_API_URL': JSON.stringify(
            process.env.NODE_ENV === 'production' 
                ? 'http://pu.osun.accordofficial.com' 
                : 'http://localhost:8000'
        ),
    },
});
