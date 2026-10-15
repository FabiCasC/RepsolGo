const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Stub out Node's `buffer` module so react-native-svg doesn't crash Metro
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'buffer') {
    return {
      filePath: path.resolve(__dirname, 'shims/buffer.js'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
