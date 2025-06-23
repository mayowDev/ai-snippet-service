// eslint.config.js
module.exports = [
    {
      ignores: ['node_modules/**', 'dist/**'],
      files: ['src/**/*.js'],
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      rules: {},
    },
  ];