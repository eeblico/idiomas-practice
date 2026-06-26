import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.hyperlingua.practice',
  appName: 'HyperLingua Practice',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
