import nextConfig from 'eslint-config-next';

const config = [
  // Global ignores
  {
    ignores: ['node_modules/**', 'coverage/**', '.next/**', 'out/**', 'build/**']
  },
  // Extend Next.js config
  ...nextConfig,
  // Custom rules
  {
    rules: {
      'semi': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'no-extra-boolean-cast': 'off',
      'space-before-function-paren': 'off',
      'multiline-ternary': 'off'
    }
  },
  // Forbid default exports in components (use `export const Name = ...`)
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'error'
    }
  }
];

export default config;
