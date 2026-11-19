const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Shim Node's `buffer` module for react-native-svg
  if (moduleName === 'buffer') {
    return {
      filePath: path.resolve(__dirname, 'shims/buffer.js'),
      type: 'sourceFile',
    };
  }

  // Fix react-native 0.86 exports map issue on Windows for react-native-reanimated
  if (moduleName === 'react-native/Libraries/Renderer/shims/ReactNative') {
    return {
      filePath: path.resolve(__dirname, 'shims/ReactNative.js'),
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
