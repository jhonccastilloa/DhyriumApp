module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json',
        ],
        alias: {
          '@': './src',
        },
      },
    ],
    '@babel/plugin-transform-export-namespace-from',
    [
      'react-native-unistyles/plugin',
      {
        // pass root folder of your application
        // all files under this folder will be processed by the Babel plugin
        // if you need to include more folders, or customize discovery process
        // check available babel options
        root: 'src',
      },
    ],
    'react-native-worklets/plugin',
  ],
};
