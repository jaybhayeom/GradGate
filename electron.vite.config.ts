import { resolve } from 'path';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copySqlSchemasPlugin() {
  const copyFiles = () => {
    const srcDb = path.resolve(__dirname, 'src/main/db');
    const outDb = path.resolve(__dirname, 'out/main/db');
    if (!fs.existsSync(outDb)) {
      fs.mkdirSync(outDb, { recursive: true });
    }
    for (const file of ['curriculumSchema.sql', 'userProfileSchema.sql']) {
      const srcFile = path.join(srcDb, file);
      const outFile = path.join(outDb, file);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, outFile);
      }
    }
  };

  return {
    name: 'copy-sql-schemas',
    buildStart: copyFiles,
    writeBundle: copyFiles,
    closeBundle: copyFiles
  };
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: [] }), copySqlSchemasPlugin()],
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react()]
  }
});
