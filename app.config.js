module.exports = ({ config }) => ({
  ...config,
  expo: {
    name: "Lavial",
    slug: "Lavial",
    version: "5.0.2",
    plugins: [
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/ClashGrotesk-Bold.otf",
            "./assets/fonts/ClashGrotesk-Extralight.otf",
            "./assets/fonts/ClashGrotesk-Light.otf",
            "./assets/fonts/ClashGrotesk-Medium.otf",
            "./assets/fonts/ClashGrotesk-Regular.otf",
            "./assets/fonts/ClashGrotesk-Semibold.otf"
          ]
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: "35.0.0",
            minSdkVersion: 24
          }
        }
      ]
    ],
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: "lavialapp",
    splash: {
      image: "./assets/splashScreen.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.lavial.bundle",
      icon: "./assets/icon.png",
      buildNumber: "15",
      infoPlist: {
        NSCameraUsageDescription: "Această aplicație nu folosește camera. Această permisiune este necesară pentru librării externe utilizate în aplicație."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/ic_launcher_foreground.png",
        backgroundColor: "#ffffff"
      },
      icon: "./assets/icon.png",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "POST_NOTIFICATIONS"
      ],
      package: "com.yourapp.bundle",
      versionCode: 46
    },
    web: {
      favicon: "./assets/icon.png"
    },
    extra: {
      eas: {
        projectId: "ba7a760e-a1fd-4332-913a-8342388e81ae"
      }
    }
  }
});