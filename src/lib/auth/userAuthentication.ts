import { useContext } from 'react';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';

import { appleAuth } from '@invertase/react-native-apple-authentication';
import { getApp } from '@react-native-firebase/app';
import {
  AppleAuthProvider,
  createUserWithEmailAndPassword as FBCreateUserWithEmailAndPassword,
  sendPasswordResetEmail as FBSendPasswordResetEmail,
  signOut as FBSignOut,
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
  signInWithEmailAndPassword,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { log } from '@react-native-hello/core';
// import { NativeModules } from 'react-native';
import { appConfig } from 'config';
import { AuthContext, preSignOutActions } from 'lib/auth';

// const { RNTwitterSignIn } = NativeModules;

export const signInWithApple = async () => {
  const app = getApp();
  const auth = getAuth(app);
  try {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      // It appears putting FULL_NAME first is important
      // See https://github.com/invertase/react-native-apple-authentication/issues/293
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error('No identify token returned');
    }
    const { identityToken, nonce } = appleAuthRequestResponse;
    const appleCredential = AppleAuthProvider.credential(identityToken, nonce);
    const userCredential = await signInWithCredential(auth, appleCredential);
    const name = appleAuthRequestResponse.fullName;
    userCredential.user = {
      ...userCredential.user,
      displayName: `${name?.givenName} ${name?.familyName}`,
    };
    return userCredential;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // com.apple.AuthenticationServices.AuthorizationError is likely due to the user not being
    // signed into their iOS device via the Settings app or they auth'd with an incorrect
    // password.
    if (
      !e.message.includes('com.apple.AuthenticationServices.AuthorizationError')
    ) {
      log.error(`Apple sign in error: ${e.message}`);
      throw new Error(
        'An internal error occurred while trying to sign in. Please try again.',
      );
    }
  }
};

export const signInWithFacebook = async () => {
  const app = getApp();
  const auth = getAuth(app);
  try {
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);
    if (result.isCancelled) {
      throw new Error('User canceled the login process');
    }
    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      throw new Error('Something went wrong obtaining access token');
    }
    const facebookCredential = FacebookAuthProvider.credential(
      data.accessToken,
    );
    return await signInWithCredential(auth, facebookCredential);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (!e.message.includes('canceled')) {
      log.error(`Facebook sign in error: ${e.message}`);
      throw new Error(
        'An internal error occurred while trying to sign in. Please try again.',
      );
    }
  }
};

export const signInWithGoogle = async () => {
  try {
    const app = getApp();
    const auth = getAuth(app);

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Need to have debug keystore SHA1 in Firebase console.
    // See https://github.com/react-native-google-signin/google-signin/issues/767
    GoogleSignin.configure({ webClientId: appConfig.googleSignInWebClientId });

    const { data } = await GoogleSignin.signIn();
    if (data) {
      const googleCredential = GoogleAuthProvider.credential(data.idToken);
      return signInWithCredential(auth, googleCredential);
    }
    throw { message: 'No sign in data returned' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (!e.message?.includes('No sign in data returned')) {
      log.error(`Google sign in error: ${e.message}`);
      throw new Error(
        'An internal error occurred while trying to sign in. Please try again.',
      );
    }
  }
};

export const signInWithTwitter = async () => {
  try {
    // Twitter sign is disabled, the library is out of support/old.
    // Need to call during app init.
    // RNTwitterSignIn.init('KEY', 'SECRET').then(() => {
    //   console.log('Twitter SDK initialized');
    // }).catch((e: any) => {
    //   console.log('err',e);
    // });

    // const { authToken, authTokenSecret } = await RNTwitterSignIn.logIn();
    // const twitterCredential = auth.TwitterAuthProvider.credential(
    //   authToken,
    //   authTokenSecret,
    // );
    // return await auth().signInWithCredential(twitterCredential);
    throw 'Twitter sign in not supported';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (!e.message?.includes('No sign in data returned')) {
      log.error(`Twitter sign in error: ${e.message}`);
      throw new Error(
        'An internal error occurred while trying to sign in. Please try again.',
      );
    }
  }
};

export const signInwithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  const app = getApp();
  const auth = getAuth(app);
  return await signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // Success
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((e: any) => {
      if (e.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already in use.');
      }
      if (e.code === 'auth/invalid-email') {
        throw new Error('This email address is invalid.');
      }
      log.error(`Email/password sign in error: ${e.message}`);
      throw new Error(
        'An internal error occurred while trying to sign in. Please try again.',
      );
    });
};

export const signOut = async () => {
  const app = getApp();
  const auth = getAuth(app);
  try {
    const userProfile = await preSignOutActions();

    // Sign out here results in an event to auth().onAuthStateChanged() with null credentials.
    LoginManager.logOut();
    await FBSignOut(auth);

    log.debug(`User sign out complete: ${JSON.stringify(userProfile)}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (!e.message.includes('auth/no-current-user')) {
      log.error(`Sign out error: ${e.message}`);
    }
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  const app = getApp();
  const auth = getAuth(app);
  try {
    return await FBSendPasswordResetEmail(auth, email);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.message.includes('auth/user-not-found')) {
      throw new Error('There is no existing user for this email address.');
    }
    log.error(`Password reset error: ${e.message}`);
    throw new Error(
      'An internal error occurred while trying to send a reset password email. Please try again.',
    );
  }
};

export const useCreateUserWithEmailAndPassword = () => {
  const app = getApp();
  const auth = getAuth(app);
  const authContext = useContext(AuthContext);

  return async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => {
    try {
      // Save email/password (firebase) provider UI auth data for later profile creation.
      authContext.emailPasswordAuthData = { firstName, lastName };

      // Create the account at firebase.
      const user = await FBCreateUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Need to update since firebase won't accept this data on create.
      await user.user.updateProfile({
        displayName: `${firstName} ${lastName}`,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.message.includes('auth/email-already-exists')) {
        throw new Error(
          'The provided email is already in use by an existing user.',
        );
      }
      log.error(`Create account error: ${e.message}`);
      throw new Error(
        'An internal error occurred while creating your account. Please try again.',
      );
    }
  };
};
