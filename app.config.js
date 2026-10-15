try {
  const { config } = require('dotenv');
  config();
} catch (e) {
  // dotenv not available, env vars must be set manually
}

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: 'RepsolGo',
    slug: 'repsol-go',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#041E42',
      },
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
    newArchEnabled: true,
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
