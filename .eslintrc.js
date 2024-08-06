module.exports = {
  env: {
    node: true,
    browser: false,
  },
  ignorePatterns: ['!**/.eslintrc.js', '!**/.prettierrc.js', '**/dist/**'],
  plugins: ['prettier', '@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': 'warn',
    'import/order': [
      'warn',
      { alphabetize: { order: 'asc' }, 'newlines-between': 'always' },
    ],
    'import/first': 'error',
    'import/no-mutable-exports': 'error',
    'import/newline-after-import': 'warn',
  },
};
