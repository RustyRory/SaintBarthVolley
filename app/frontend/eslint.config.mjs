import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parserOptions: { ecmaVersion: 2025, sourceType: 'module' },
      globals: { window: true, document: true },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error', // toutes les erreurs de style Prettier seront signalées par ESLint
    },
  },
  pluginReact.configs.flat.recommended,
]);
