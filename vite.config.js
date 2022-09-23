import vue from '@vitejs/plugin-vue2'
import { viteExternalsPlugin } from 'vite-plugin-externals'

export default {
  plugins: [
    vue(),
    viteExternalsPlugin({
      vue: 'Vue'
    }),],
  build: {
    sourcemap: true,
    outDir: `dist/feature/`,
    rollupOptions: {
      // input: {
      //   main: resolve(__dirname, 'index.html'),
      //   command: resolve(__dirname, 'sandbox/index.html')
      // },
      external: ['vue', 'Vue'],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|svg|ico/i.test(extType)) {
            extType = 'img';
          }
          return `${extType}/[name][extname]`;
          //return `assets/${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
      },
    },
  },
}