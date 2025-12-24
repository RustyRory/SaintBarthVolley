module.exports = {
  env: {
    browser: true,
    es2025: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', 'prettier'],
  rules: {
    'prettier/prettier': ['error', { singleQuote: true, semi: true }],
    'react/react-in-jsx-scope': 'off', // <-- désactive la règle React 17+
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
