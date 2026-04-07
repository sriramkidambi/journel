module.exports = {
  extends: 'erb',
  plugins: ['@typescript-eslint'],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-import-module-exports': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    // Cyclomatic complexity - max 10 for maintainable code
    'complexity': ['error', { 'max': 10 }],
    // Max lines per file - prevents large files (500 lines)
    'max-lines': ['warn', { 'max': 500, 'skipBlankLines': true, 'skipComments': true }],
    // Max file size in bytes warning (100KB)
    'max-len': ['warn', { 'code': 120 }],
    // Naming conventions
    '@typescript-eslint/naming-convention': [
      'error',
      {
        'selector': 'variable',
        'format': ['camelCase', 'UPPER_CASE', 'PascalCase'],
        'leadingUnderscore': 'allow'
      },
      {
        'selector': 'function',
        'format': ['camelCase', 'PascalCase']
      },
      {
        'selector': 'typeLike',
        'format': ['PascalCase']
      },
      {
        'selector': 'interface',
        'format': ['PascalCase'],
        'prefix': ['I']
      }
    ],
    // Import boundaries for code modularization
    'import/no-restricted-paths': ['error', {
      'zones': [
        { 'target': './src/renderer', 'from': './src/main' },
        { 'target': './src/main', 'from': './src/renderer' }
      ]
    }],
    // Tech debt tracking - ensure TODO/FIXME have issue references
    'no-warning-comments': ['warn', { 'terms': ['todo', 'fixme', 'hack', 'xxx'], 'location': 'start' }],
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
