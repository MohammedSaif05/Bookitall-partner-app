/**
 * React Native Configuration
 * This file configures autolinking and build settings
 * For New Architecture, let autolinking handle dependencies automatically
 */
module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
    },
    ios: {},
  },
  assets: ['./assets/fonts/'],
};

