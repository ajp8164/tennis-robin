/* global module */

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // ignore: [],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.ios.js', '.android.js', '.ts', '.tsx'],
        root: ['.'],
        alias: {
          app: './src/app/',
          config: './src/config/',
          components: './src/components/',
          firebase: './src/firebase/',
          images: './src/images/',
          lib: './src/lib/',
          store: './src/store/',
          theme: './src/theme/',
          types: './src/types/',
        },
      },
    ],
    [
      'babel-plugin-inline-import',
      {
        extensions: ['.svg'],
      },
    ],
    'react-native-reanimated/plugin',
    'module:react-native-dotenv',
  ],
};
