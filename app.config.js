const { config } = require('dotenv');
config();

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: 'RepsolGo',
    slug: 'repsolgo',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#041E42',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#041E42',
      },
      newArchEnabled: false,
      package: 'com.repsolperu.repsolgo',
      permissions: [
        'CAMERA',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'USE_BIOMETRIC',
        'USE_FINGERPRINT',
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
        },
      },
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      [
        'expo-local-authentication',
        {
          faceIDPermission: 'Allow RepsolGo to use Face ID.',
        },
      ],
    ],
    scheme: 'repsolgo',
    experiments: {
      typedRoutes: false,
    },
    extra: {
      eas: {
        projectId: '0890aa81-06e3-4177-91ca-ddb90d886020',
      },
    },
  },
};
