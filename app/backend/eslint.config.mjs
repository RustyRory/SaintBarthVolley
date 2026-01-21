import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module", // <- Important !
      globals: {
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
      },
    },

    plugins: {
      prettier: prettierPlugin,
    },

    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: true,
          trailingComma: "es5",
          printWidth: 100,
          endOfLine: "auto",
        },
      ],
    },
  },
];
