import react from '@vitejs/plugin-react-swc';
import { componentTagger } from 'lovable-tagger';
import path from 'path';
import { defineConfig } from 'vite';

function manualChunks(id: string) {
  if (id.includes('node_modules')) {
    return 'nm';
  } else {
    return 'main';
  }
}

export default defineConfig(({ mode }) => {
  console.log("mode: ",mode);
  const res = {
    base: './',
    preview: {
      port: 8080,
    },
    server: {
      host: '::',
      port: 8080,
    },
    build: {},
    publicDir: 'static',
    plugins: [react(), mode === 'development' && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };

  if (mode === 'development' || mode === 'staging' || mode === 'mobile') {
    res.build = {
      outDir: 'public',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    };
  } else if (mode === 'production') {
    res.build = {
      outDir: '/var/www/cowboy_cards/html',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    };
  }
  return res;
});
