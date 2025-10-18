import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const config = [
  // Global ignores
  {
    ignores: ['node_modules/**', 'coverage/**', '.next/**', 'out/**', 'build/**']
  },
  // Extend Next.js config
  ...compat.extends('next/core-web-vitals'),
  // Custom rules
  {
    rules: {
      'semi': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'no-extra-boolean-cast': 'off',
      'space-before-function-paren': 'off',
      'multiline-ternary': 'off'
    }
  }
];

export default config;
