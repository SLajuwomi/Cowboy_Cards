import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cowboycards',
  appName: 'Cowboy Cards',
  webDir: 'public',
  server: {
    url: 'https://cowboy-cards.dsouth.org/',// this is the IP from the second line ("Network") of the output of 'npm run dev' that runs the Vite front-end dev server
    cleartext: true,
  }
};

export default config;
