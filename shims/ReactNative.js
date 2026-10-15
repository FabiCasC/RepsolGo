// Shim for react-native/Libraries/Renderer/shims/ReactNative
// react-native-reanimated uses findHostInstance_DEPRECATED from this module
// In RN 0.77+ (New Architecture), this lives in ReactFabric instead

'use strict';

let ReactNative;

try {
  ReactNative = require('react-native/Libraries/Renderer/implementations/ReactNativeRenderer-prod');
} catch (e) {
  // Fallback: provide minimal stub
  ReactNative = {
    findHostInstance_DEPRECATED: () => null,
    findNodeHandle: () => null,
  };
}

module.exports = ReactNative;
