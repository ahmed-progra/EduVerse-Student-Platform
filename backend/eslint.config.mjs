import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.js",
      "scripts/*.mjs",
      "scripts/*.ts",
      "src/__tests__/**",
    ],
  },
);
