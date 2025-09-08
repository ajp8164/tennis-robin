import { ReactNode, createContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';

import { getApp } from '@react-native-firebase/app';
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
} from '@react-native-firebase/auth';
import { appConfig } from 'config';
import lodash from 'lodash';
import { DateTime } from 'luxon';
import { selectUser } from 'store/selectors/userSelectors';
import { EmailPasswordAuthData } from 'types/user';

import { useAuthorizeUser } from './userAuthorization';

type AuthContext = {
  emailPasswordAuthData: EmailPasswordAuthData;
  userIsAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContext>({
  emailPasswordAuthData: { firstName: '', lastName: '' },
  userIsAuthenticated: false,
});

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);

  const app = getApp();
  const auth = getAuth(app);

  const authorizeUser = useAuthorizeUser();
  const user = useSelector(selectUser);

  const emailPasswordAuthData = useRef<EmailPasswordAuthData>({
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, credentials => {
      if (isReAuthenticationRequired(user.credentials)) {
        // TODO
      }

      setUserIsAuthenticated(!lodash.isEmpty(user.credentials));

      authorizeUser(credentials, {
        onError: onAuthError,
        onAuthorized,
        onUnauthorized,
      });
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAuthError = (msg: string) => {
    if (msg.includes('firestore/unavailable')) {
      Alert.alert(
        'Service Unavailable',
        "We can't connect to the server. Please check your network connection and try again.",
        [{ text: 'OK' }],
        { cancelable: false },
      );
    } else {
      Alert.alert(
        'Sign In Failed',
        'There was a problem signing in. Please try again.',
        [{ text: 'OK' }],
        { cancelable: false },
      );
    }
  };

  const onAuthorized = (_userId: string) => {};

  const onUnauthorized = (accountNotActive?: boolean) => {
    if (accountNotActive) {
      Alert.alert(
        'Account Disabled',
        'Contact your administrator for more information.',
        [{ text: 'OK' }],
        { cancelable: false },
      );
    }
  };

  const isReAuthenticationRequired = (
    credentials?: FirebaseAuthTypes.User | null,
  ) => {
    const lastSignInTime = credentials?.metadata?.lastSignInTime;
    if (appConfig.requireReAuthDays > 0 && lastSignInTime) {
      const daysSinceLastSignIn = DateTime.fromISO(lastSignInTime)
        .diffNow()
        .shiftTo('days')
        .toObject().days;
      if (
        daysSinceLastSignIn &&
        Math.abs(daysSinceLastSignIn) < appConfig.requireReAuthDays
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        emailPasswordAuthData: emailPasswordAuthData.current,
        userIsAuthenticated,
      }}>
      <>{children}</>
    </AuthContext.Provider>
  );
};
