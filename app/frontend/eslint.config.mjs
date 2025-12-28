import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2025,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: { window: true, document: true },
    },
    plugins: {
      prettier: pluginPrettier,
      react: pluginReact,
    },
    rules: {
      'prettier/prettier': ['error', { singleQuote: true, semi: true }],
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
