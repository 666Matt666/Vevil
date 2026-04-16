// ESLint config para backend (NestJS + TypeScript)
// Basado en: NestJS Best Practices + TypeScript Best Practices
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'off',

    // General
    'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    'no-debugger': 'error',
    'semi': ['error', 'never'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'indent': ['error', 2],
    'no-mixed-spaces-and-tabs': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-throw-literal': 'error',
    'no-unused-expressions': 'error',
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '**/node_modules/*',
    'coverage',
    '*.js',
  ],
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
