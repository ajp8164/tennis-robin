const config = {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: true,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  // @ianvs/prettier-plugin-sort-imports plugin options
  importOrder: [
    '^react',
    '^react-native',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^[.]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx'],
  importOrderTypeScriptVersion: '5.0.0',
  importOrderCaseSensitive: true,
  overrides: [
    {
      files: ['index.js'],
      options: {
        importOrder: [],
      },
    },
  ],
};

export default config;
