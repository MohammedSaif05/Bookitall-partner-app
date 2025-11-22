const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    ...defaultConfig.resolver,
    // Ensure .js files are resolved properly
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'mjs', 'cjs'],
    // Remove js from asset extensions to allow it as source
    assetExts: (defaultConfig.resolver?.assetExts || []).filter((ext) => ext !== 'js'),
  },
};

module.exports = withNativeWind(mergeConfig(defaultConfig, config), {
  input: './global.css',
});
