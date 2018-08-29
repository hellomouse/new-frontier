module.exports = {
  extends: [
    'eslint:recommended',
    'eslint-config-google'
  ],
  parserOptions: {
    ecmaVersion: 8,
    sourceType: "module",
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  plugins: [
    'react'
  ],
  rules: {
    'comma-dangle': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'indent': 'off',
    'no-console': 'off',
    'object-curly-spacing': ['error', 'always'],
    'space-infix-ops': ['error', { int32Hint: true }],
    'max-len': ['error', 120]
  }
};
