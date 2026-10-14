import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import pkg from './package.json' with { type: 'json' };
import { fsApi } from './server/fsApi.ts';

export default defineConfig({
    plugins: [vue(), tailwindcss(), fsApi()],
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
        },
    },
});
