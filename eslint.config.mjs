import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [".next/*", "node_modules/*", "out/*"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": hooksPlugin,
      "@next/next": nextPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // React
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // TypeScript - MÁS ESTRICTO
      "@typescript-eslint/no-explicit-any": "warn", // Cambio: off → warn
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],

      // React Hooks - MÁS ESTRICTO
      "react-hooks/exhaustive-deps": "warn", // Cambio: añadir
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/set-state-in-effect": "off",

      // Console - BLOQUEAR EN PRODUCCIÓN
      "no-console": ["warn", { "allow": ["error", "warn"] }], // Cambio: añadir
    },
  }
);
