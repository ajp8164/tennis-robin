import '@react-native-firebase/app';

import { BackHandler } from 'react-native';

// import { getApp } from '@react-native-firebase/app';
// import { getFirebase } from '@react-native-firebase/firebase';
// import { getFirestore } from '@react-native-firebase/firestore';
// import { getStorage } from '@react-native-firebase/storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { ReactNativeHello, log } from '@react-native-hello/core';
import { appConfig } from 'config';
import { svgImages } from 'images';
import { AppError } from 'lib/errors';
import { initPushNotifications } from 'lib/notifications';

export enum InitStatus {
  NotAuthorized = 'NotAuthorized',
  NotVerified = 'NotVerified',
  Success = 'Success',
}

export const useInitApp = () => {

  return async (): Promise<InitStatus> => {
    try {
      // Initialize firestore for dev as necessary.
      if (__DEV__) {
        // const app = getApp();
        // const firebase = getFirebase(app);
        // const firestore = getFirestore(app);
        // const storage = getStorage(app);
        // firebase.useEmulator('10.6.9.64', 8080);
        // storage.useEmulator('10.6.9.64', 9199);
        // console.log('Firestore emulator running at 10.6.9.100:8080');
        // firestore.clearPersistence();
      }

      // Disable Android hardware back button.
      BackHandler.addEventListener('hardwareBackPress', () => {
        return true;
      });

      initPushNotifications();

      ReactNativeHello.init({
        buildEnvironment: appConfig.buildEnvironment,
        sentryEndpoint: appConfig.sentryEndpoint,
        sentryLoggingEnabled: appConfig.sentryLoggingEnabled,
        svgImages,
        // userId: '',
      });

      GoogleSignin.configure({
        webClientId: appConfig.firebaseOauthClientId,
      });

      return InitStatus.Success;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      log.error(`App initialization: ${e.message}`);
      throw new AppError(e.message);
    }
  };
};
