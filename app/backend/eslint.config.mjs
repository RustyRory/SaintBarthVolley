import globals from 'globals';
import pluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'], // tous les fichiers JS côté backend
    languageOptions: {
      globals: globals.node, // globals Node
      parserOptions: { ecmaVersion: 2025, sourceType: 'module' },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error', // toutes les erreurs de style Prettier seront signalées par ESLint
    },
  },
]);
