const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Forzar bundles CJS de @firebase/* para que todos compartan
// el mismo registro de componentes y no haya instancias duplicadas.
// Solo los paquetes sin campo "react-native" en su package.json —
// esos son los que Metro resolvería al bundle browser/ESM por defecto.
//
// @firebase/firestore ya tiene "react-native": "dist/index.rn.js"
// → Metro lo resuelve correctamente, no lo forzamos.
//
// @firebase/auth ya tiene "react-native": "dist/rn/index.js"
// → Lo forzamos de todas formas para garantizar que sea ese y no otro.
const FIREBASE_CJS_MAP = {
  '@firebase/app':       path.resolve(__dirname, 'node_modules/@firebase/app/dist/index.cjs.js'),
  '@firebase/component': path.resolve(__dirname, 'node_modules/@firebase/component/dist/index.cjs.js'),
  '@firebase/util':      path.resolve(__dirname, 'node_modules/@firebase/util/dist/index.node.cjs.js'),
  '@firebase/logger':    path.resolve(__dirname, 'node_modules/@firebase/logger/dist/index.cjs.js'),
  '@firebase/auth':      path.resolve(__dirname, 'node_modules/@firebase/auth/dist/rn/index.js'),
};

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

  // Forzar bundles CJS/RN de Firebase para evitar instancias duplicadas
  // del registro de componentes que causa "Component auth has not been registered yet"
  if (FIREBASE_CJS_MAP[moduleName]) {
    const filePath = FIREBASE_CJS_MAP[moduleName];
    try {
      require('fs').accessSync(filePath);
      return { filePath, type: 'sourceFile' };
    } catch {
      // Si el archivo no existe, dejar que Metro resuelva normalmente
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
