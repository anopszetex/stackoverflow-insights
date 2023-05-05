module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'google',
    'plugin:import/recommended',
    'plugin:node/recommended',
    'prettier',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'new-cap': 'off',
    'no-invalid-this': 'off',
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'no-console': 2,
  },
};
