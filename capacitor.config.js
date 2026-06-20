/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'com.owfinances.app',
  appName: 'OWFinances',
  webDir: 'dist/capacitor/www',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#1a237e',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

module.exports = config
