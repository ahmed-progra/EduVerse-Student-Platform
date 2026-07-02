import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Flat ESLint config for the Next.js app. Builds on Next's native flat presets
 * (core-web-vitals → react-hooks + jsx-a11y, and the TypeScript ruleset), then
 * tunes a few rules to this codebase with explicit, documented rationale.
 */
const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // `//` is a deliberate section-label glyph in the design system (e.g.
      // `<span className="section-label-prefix">//</span>`), not a stray comment.
      "react/jsx-no-comment-textnodes": "off",

      // React-Compiler-targeted rules (react-hooks v7). This app does not use the
      // compiler; these fire on intentional, working patterns — SSR-hydration
      // setState, Math.random() in memoized confetti, and imperative Three.js / ref
      // setup — where "fixing" them would risk regressions in battle-tested code.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",

      // Only require `const` when every name in a destructuring can be const
      // (a sibling may legitimately need `let`, e.g. `let [x0, x1]` where x1 is reassigned).
      "prefer-const": ["error", { destructuring: "all" }],

      // Allow intentionally-unused args/vars when prefixed with `_`.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Documented `any` boundaries: the api-client transport seam (page-aggregate
    // payloads typed locally by each page) and the untyped Skulpt runtime + its
    // dynamic AST traversal in the visualizer.
    files: ["src/services/api-client.ts", "src/types/skulpt.d.ts", "src/features/visualizer/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
