const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Zrušiť načítavanie fontov, ktoré spôsobujú problémy
  config.module.rules.forEach(rule => {
    if (rule.oneOf) {
      rule.oneOf.forEach(oneOf => {
        if (
          oneOf.test &&
          oneOf.test.toString().includes('ttf') ||
          (oneOf.test && oneOf.test.toString().includes('otf'))
        ) {
          oneOf.use = ['file-loader'];
        }
      });
    }
  });

  // Pridať fallback pre node moduly
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "fs": false,
    "crypto": false
  };

  // Pridať resolve pre správne načítavanie modulov
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'src': path.resolve(__dirname, 'src')
  };

  return config;
}; 