// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Upraviť konfiguráciu pre web
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];
config.resolver.assetExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ttf'];

// Pridať fallback resolve pre chýbajúce moduly
config.resolver.extraNodeModules = new Proxy({}, {
  get: (target, name) => {
    return path.join(process.cwd(), `node_modules/${name}`);
  }
});

// Pridanie mapovania pre fonty vector icons
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@expo/vector-icons': path.resolve(__dirname, './node_modules/@expo/vector-icons'),
  'react-native-vector-icons': path.resolve(__dirname, './node_modules/react-native-vector-icons'),
};

module.exports = config; 