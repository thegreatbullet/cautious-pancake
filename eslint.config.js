import { defineConfig } from 'eslint-define-config';
import prettierPlugin from 'eslint-plugin-prettier';

export default defineConfig({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    globals: {
      console: 'readonly',
      process: 'readonly',
      module: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
    },
  },

  plugins: {
    prettier: prettierPlugin,
  },

  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prettier/prettier': 'error',
  },

  ignores: ['node_modules/**', 'dist/**'],
});
