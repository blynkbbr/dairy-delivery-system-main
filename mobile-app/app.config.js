export default {
  expo: {
    name: "DairyFresh",
    slug: "dairyfresh-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.dairyfresh.mobile",
      buildNumber: "1.0.0",
      infoPlist: {
        NSCameraUsageDescription: "This app uses the camera to capture delivery proof photos.",
        NSLocationWhenInUseUsageDescription: "This app uses location to track deliveries and provide location-based services.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "This app uses location to track deliveries and provide location-based services.",
        NSMicrophoneUsageDescription: "This app may use the microphone for voice features."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      package: "com.dairyfresh.mobile",
      versionCode: 1,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.WAKE_LOCK",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE",
        "android.permission.USE_FINGERPRINT",
        "android.permission.USE_BIOMETRIC"
      ],
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff",
          defaultChannel: "default"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow DairyFresh to use your location to track deliveries and provide location-based services."
        }
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow DairyFresh to access your camera to capture delivery proof photos."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID || "your-eas-project-id-here"
      },
      apiUrl: process.env.API_URL || "http://localhost:3000/api",
      environment: process.env.NODE_ENV || "development"
    },
    owner: process.env.EXPO_ACCOUNT_OWNER
  }
};