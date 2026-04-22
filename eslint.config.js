import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  localStorage: "readonly",
  sessionStorage: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  Blob: "readonly",
  URL: "readonly",
  Audio: "readonly",
  fetch: "readonly",
  performance: "readonly",
  alert: "readonly",
  console: "readonly",
  HTMLInputElement: "readonly",
  HTMLTextAreaElement: "readonly",
  HTMLSelectElement: "readonly",
  HTMLElement: "readonly",
  Element: "readonly",
  MutationObserver: "readonly",
  CustomEvent: "readonly",
  process: "readonly",
};

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: browserGlobals,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    files: [
      "src/components/inventorsInvestors/pages/InventorsInvestorsSwipePage.jsx",
      "src/components/inventorsInvestors/InventorsInvestorsUI.jsx",
      "src/components/AccountCustomizePage.jsx",
    ],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["app/layout.jsx"],
    rules: {
      "@next/next/no-css-tags": "off",
    },
  },
]);
