import react from '@vitejs/plugin-react';
// @ts-ignore
import path from 'path';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';
import { VitePWA } from 'vite-plugin-pwa';

// Polyfills Node (buffer, process, stream, etc.) via aliases + Rollup em vez de
// vite-plugin-node-polyfills no optimizeDeps — evita falhas em readable-stream/crypto no browser (tela branca).
const nodePolyfillAliases = {
  _stream_duplex: 'rollup-plugin-node-polyfills/polyfills/readable-stream/duplex',
  _stream_passthrough: 'rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough',
  _stream_readable: 'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
  _stream_transform: 'rollup-plugin-node-polyfills/polyfills/readable-stream/transform',
  _stream_writable: 'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
  assert: 'rollup-plugin-node-polyfills/polyfills/assert',
  console: 'rollup-plugin-node-polyfills/polyfills/console',
  constants: 'rollup-plugin-node-polyfills/polyfills/constants',
  domain: 'rollup-plugin-node-polyfills/polyfills/domain',
  events: 'rollup-plugin-node-polyfills/polyfills/events',
  http: 'rollup-plugin-node-polyfills/polyfills/http',
  https: 'rollup-plugin-node-polyfills/polyfills/http',
  os: 'rollup-plugin-node-polyfills/polyfills/os',
  path: 'rollup-plugin-node-polyfills/polyfills/path',
  punycode: 'rollup-plugin-node-polyfills/polyfills/punycode',
  querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
  stream: 'rollup-plugin-node-polyfills/polyfills/stream',
  string_decoder: 'rollup-plugin-node-polyfills/polyfills/string-decoder',
  sys: 'util',
  timers: 'rollup-plugin-node-polyfills/polyfills/timers',
  tty: 'rollup-plugin-node-polyfills/polyfills/tty',
  url: 'rollup-plugin-node-polyfills/polyfills/url',
  util: 'rollup-plugin-node-polyfills/polyfills/util',
  vm: 'rollup-plugin-node-polyfills/polyfills/vm',
  zlib: 'rollup-plugin-node-polyfills/polyfills/zlib',
  buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
  process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
};

// https://vitejs.dev/config/
const backendPort = (process.env.BACKEND_PORT && Number(process.env.BACKEND_PORT)) || 3080;
const backendURL = process.env.HOST
  ? `http://${process.env.HOST}:${backendPort}`
  : `http://localhost:${backendPort}`;

export default defineConfig(({ command }) => {
  const isProd = command === 'build';
  return {
    base: '',
    server: {
      allowedHosts:
        (process.env.VITE_ALLOWED_HOSTS && process.env.VITE_ALLOWED_HOSTS.split(',')) || [],
      host: process.env.HOST || 'localhost',
      port: (process.env.PORT && Number(process.env.PORT)) || 3090,
      strictPort: false,
      proxy: {
        '/api': {
          target: backendURL,
          changeOrigin: true,
        },
        '/oauth': {
          target: backendURL,
          changeOrigin: true,
        },
      },
    },
    envDir: '../',
    envPrefix: ['VITE_', 'SCRIPT_', 'DOMAIN_', 'ALLOW_'],
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
      'process.env': '{}',
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
          'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
          'process.env': '{}',
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        injectRegister: 'auto',
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false,
        },
        useCredentials: true,
        includeManifestIcons: false,
        workbox: {
          globPatterns: [
            '**/*.{js,css,html}',
            'assets/favicon*.png',
            'assets/icon-*.png',
            'assets/apple-touch-icon*.png',
            'assets/maskable-icon.png',
            'manifest.webmanifest',
          ],
          globIgnores: ['images/**/*', '**/*.map', 'index.html'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          navigateFallbackDenylist: [/^\/oauth/, /^\/api/],
        },
        includeAssets: [],
        manifest: {
          name: 'LibreChat',
          short_name: 'LibreChat',
          display: 'standalone',
          background_color: '#000000',
          theme_color: '#009688',
          icons: [
            {
              src: 'assets/favicon-32x32.png',
              sizes: '32x32',
              type: 'image/png',
            },
            {
              src: 'assets/favicon-16x16.png',
              sizes: '16x16',
              type: 'image/png',
            },
            {
              src: 'assets/apple-touch-icon-180x180.png',
              sizes: '180x180',
              type: 'image/png',
            },
            {
              src: 'assets/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'assets/maskable-icon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
      sourcemapExclude({ excludeNodeModules: true }),
      compression({
        threshold: 10240,
      }),
    ],
    publicDir: command === 'serve' ? './public' : false,
    build: {
      sourcemap: process.env.NODE_ENV === 'development',
      outDir: './dist',
      minify: 'terser',
      rollupOptions: {
        plugins: [rollupNodePolyFill() as Plugin],
        preserveEntrySignatures: 'strict',
        output: {
          manualChunks(id: string) {
            const normalizedId = id.replace(/\\/g, '/');
            if (normalizedId.includes('node_modules')) {
              if (normalizedId.includes('@codesandbox/sandpack')) {
                return 'sandpack';
              }
              if (normalizedId.includes('react-virtualized')) {
                return 'virtualization';
              }
              if (normalizedId.includes('i18next') || normalizedId.includes('react-i18next')) {
                return 'i18n';
              }
              if (normalizedId.includes('lodash')) {
                return 'utilities';
              }
              if (normalizedId.includes('date-fns')) {
                return 'date-utils';
              }
              if (normalizedId.includes('@dicebear')) {
                return 'avatars';
              }
              if (
                normalizedId.includes('react-dnd') ||
                normalizedId.includes('react-flip-toolkit')
              ) {
                return 'react-interactions';
              }
              if (normalizedId.includes('react-hook-form')) {
                return 'forms';
              }
              if (normalizedId.includes('react-router-dom')) {
                return 'routing';
              }
              if (
                normalizedId.includes('qrcode.react') ||
                normalizedId.includes('@marsidev/react-turnstile')
              ) {
                return 'security-ui';
              }

              if (normalizedId.includes('@codemirror/view')) {
                return 'codemirror-view';
              }
              if (normalizedId.includes('@codemirror/state')) {
                return 'codemirror-state';
              }
              if (normalizedId.includes('@codemirror/language')) {
                return 'codemirror-language';
              }
              if (normalizedId.includes('@codemirror')) {
                return 'codemirror-core';
              }

              if (
                normalizedId.includes('react-markdown') ||
                normalizedId.includes('remark-') ||
                normalizedId.includes('rehype-')
              ) {
                return 'markdown-processing';
              }
              if (normalizedId.includes('monaco-editor') || normalizedId.includes('@monaco-editor')) {
                return 'code-editor';
              }
              if (normalizedId.includes('react-window') || normalizedId.includes('react-virtual')) {
                return 'virtualization';
              }
              if (
                normalizedId.includes('zod') ||
                normalizedId.includes('yup') ||
                normalizedId.includes('joi')
              ) {
                return 'validation';
              }
              if (
                normalizedId.includes('axios') ||
                normalizedId.includes('ky') ||
                normalizedId.includes('fetch')
              ) {
                return 'http-client';
              }
              if (
                normalizedId.includes('react-spring') ||
                normalizedId.includes('react-transition-group')
              ) {
                return 'animations';
              }
              if (normalizedId.includes('react-select') || normalizedId.includes('downshift')) {
                return 'advanced-inputs';
              }
              if (normalizedId.includes('heic-to')) {
                return 'heic-converter';
              }

              if (normalizedId.includes('@radix-ui')) {
                return 'radix-ui';
              }
              if (normalizedId.includes('framer-motion')) {
                return 'framer-motion';
              }
              if (normalizedId.includes('node_modules/highlight.js')) {
                return 'markdown_highlight';
              }
              if (normalizedId.includes('katex') || normalizedId.includes('node_modules/katex')) {
                return 'math-katex';
              }
              if (normalizedId.includes('node_modules/hast-util-raw')) {
                return 'markdown_large';
              }
              if (normalizedId.includes('@tanstack')) {
                return 'tanstack-vendor';
              }
              if (normalizedId.includes('@headlessui')) {
                return 'headlessui';
              }

              return 'vendor';
            }
            if (normalizedId.includes('/src/locales/')) {
              return 'locales';
            }
            return null;
          },
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.names?.[0] && /\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.names[0])) {
              return 'assets/fonts/[name][extname]';
            }
            return 'assets/[name].[hash][extname]';
          },
        },
        onwarn(warning, warn) {
          if (warning.message.includes('Error when using sourcemap')) {
            return;
          }
          warn(warning);
        },
      },
      chunkSizeWarningLimit: 1500,
    },
    resolve: {
      alias: {
        '~': path.join(__dirname, 'src/'),
        $fonts: path.resolve(__dirname, 'public/fonts'),
        'micromark-extension-math': 'micromark-extension-llm-math',
        ...nodePolyfillAliases,
      },
    },
  };
});

interface SourcemapExclude {
  excludeNodeModules?: boolean;
}

export function sourcemapExclude(opts?: SourcemapExclude): Plugin {
  return {
    name: 'sourcemap-exclude',
    transform(code: string, id: string) {
      if (opts?.excludeNodeModules && id.includes('node_modules')) {
        return {
          code,
          map: { mappings: '' },
        };
      }
    },
  };
}
