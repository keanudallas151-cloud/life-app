import js from "@eslint/js";
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
};

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
    ],
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
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      // Standard fetch/sync-to-state effects and inline sidebar helpers trip these;
      // disabling keeps lint useful without fighting legitimate React patterns.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
]);
