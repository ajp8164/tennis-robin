// @ts-expect-error no types available for @eslint/eslintrc
import { FlatCompat } from '@eslint/eslintrc';
// @ts-expect-error no types available for @eslint/js
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
  ),
  eslintConfigPrettier,
  {
    // Import that `ignores` is in its own config object by itself.
    // See https://eslint.org/docs/latest/use/configure/migration-guide#ignoring-files
    ignores: [
      'babel.config.js',
      'eslint.config.mjs',
      'metro.config.js',
      'prettier.config.js',
      'packages/*/lib/*',
      'react-native.config.js',
    ],
  },
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      globals: {
        __DEV__: 'readonly',
        console: 'readonly',
      },
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
    },

    settings: {
      'import/resolver': {
        'babel-module': {},
      },
    },

    rules: {
      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      'prefer-const': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['off'],
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],

    rules: {
      '@typescript-eslint/no-shadow': ['off'],
      'no-shadow': 'off',
      'no-undef': 'off',
    },
  },
];
