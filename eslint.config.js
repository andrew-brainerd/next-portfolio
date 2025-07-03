const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      ".next/**",
      "out/**",
      "build/**"
    ]
  },
  // Extend Next.js config
  ...compat.extends("next/core-web-vitals"),
  // Custom rules
  {
    rules: {
      "semi": ["error", "always"],
      "no-multiple-empty-lines": ["error", { "max": 2 }],
      "no-extra-boolean-cast": "off",
      "space-before-function-paren": "off",
      "multiline-ternary": "off"
    }
  }
];
