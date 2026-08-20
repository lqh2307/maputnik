import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  {
    files: ["src/**/*.{js,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-undef": "off",
      "react-hooks/exhaustive-deps": "off",
      "arrow-body-style": ["error", "always"],
      "object-curly-newline": [
        "error",
        {
          ObjectExpression: {
            multiline: true,
            minProperties: 1,
          },
        },
      ],
      curly: ["error", "all"],
    },
  },
  {
    files: ["src/stores/*Store.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*Store", "./*Store.*", "../stores", "../stores/*"],
              message:
                "Stores must stay independent; coordinate multiple stores in a component hook.",
            },
          ],
        },
      ],
    },
  },
];
