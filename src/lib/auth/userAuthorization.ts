import { useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';

import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { log } from '@react-native-hello/core';
import {
  addUser,
  cancelAllFirestoreSubscriptions,
  getUser,
  updateUser,
} from 'firebase/firestore';
import { AuthContext, signOut } from 'lib/auth';
import { listenForChangesToMyUserProfile } from 'lib/listeners';
import {
  removePushNotificationsFromUser,
  setupPushNotificationsForUser,
} from 'lib/notifications';
import { getUserAvatarColor, getUserInitials } from 'lib/user';
import lodash from 'lodash';
import { DateTime } from 'luxon';
import { store } from 'store';
import { revertCredentials } from 'store/actions';
import { saveUser } from 'store/slices/user';
import { User, UserProfile, UserRole, UserStatus } from 'types/user';

export const useAuthorizeUser = () => {
  const setUser = useSetUser();
  const authContext = useContext(AuthContext);

  const createProfile = useCallback(
    (credentials: FirebaseAuthTypes.User): UserProfile => {
      let firstName = credentials.displayName?.split(' ')[0] || '';
      let lastName = credentials.displayName?.split(' ')[1] || '';
      let displayName = credentials.displayName;

      // When auth provide is email/password (firebase) we check for auth data provided
      // during account setup and include it in the users profile.
      if (credentials.providerId === 'firebase') {
        firstName = authContext.emailPasswordAuthData.firstName;
        lastName = authContext.emailPasswordAuthData.lastName;
        displayName = `${firstName} ${lastName}`;
      }

      return {
        id: credentials.uid,
        createdOn: DateTime.now().toISO(),
        name: displayName,
        firstName,
        lastName,
        email: credentials.email,
        photoUrl: credentials.photoURL !== null ? credentials.photoURL : '',
        photoUrlDefault:
          credentials.photoURL !== null ? credentials.photoURL : '',
        avatar: {
          color: getUserAvatarColor(`${firstName}${lastName}`),
          title: getUserInitials(
            firstName || credentials.email || '',
            lastName,
          ),
        },
        role: UserRole.User,
        status: UserStatus.Active,
        groups: [],
        notifications: {
          badgeCount: 0,
          pushTokens: [],
        },
      } as UserProfile;
    },
    [authContext.emailPasswordAuthData],
  );

  return (
    credentials: FirebaseAuthTypes.User | null,
    result?: {
      onAuthorized?: (userProfile: UserProfile) => void;
      onUnauthorized?: (alertUser?: boolean) => void;
      onError?: (msg: string) => void;
    },
  ) => {
    if (credentials) {
      // Check if user already exists in firstore. If not then add the user to firestore.
      getUser(credentials.uid)
        .then(userProfile => {
          if (!userProfile) {
            // Add user to firestore and set user.
            const profile = createProfile(credentials);

            addUser(profile)
              .then(() => {
                log.debug(`User profile created: ${JSON.stringify(profile)}`);
                const user = setUser(credentials, profile);
                postSignInActions(user.profile).then(userProfile => {
                  result?.onAuthorized?.(userProfile);
                  log.debug(
                    `User sign in complete: ${JSON.stringify(userProfile)}`,
                  );
                });
              })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .catch((e: any) => {
                log.error(`Failed to add user to firestore: ${e.message}`);
                result?.onError?.(e.message);
              });
          } else {
            // User exists. Update user in firestore (if needed) and set user.
            if (userProfile.status === UserStatus.Active) {
              const updatedProfile = Object.assign({}, userProfile, {
                photoUrl: userProfile.photoUrl.length
                  ? userProfile.photoUrl
                  : credentials?.photoURL !== null
                    ? credentials?.photoURL
                    : '',
                photoUrlDefault:
                  credentials?.photoURL !== null ? credentials?.photoURL : '',
              }) as UserProfile;

              if (!lodash.isEqual(updatedProfile, userProfile)) {
                updateUser(updatedProfile)
                  .then(() => {
                    log.debug(
                      `User profile updated: ${JSON.stringify(updatedProfile)}`,
                    );
                    const user = setUser(credentials, updatedProfile);
                    postSignInActions(user.profile).then(userProfile => {
                      result?.onAuthorized?.(userProfile);
                      log.debug(
                        `User sign in complete: ${JSON.stringify(userProfile)}`,
                      );
                    });
                  })
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .catch((e: any) => {
                    log.error(`Failed to add user to firestore: ${e.message}`);
                    result?.onError?.(e.message);
                  });
              } else {
                const user = setUser(credentials, userProfile);
                postSignInActions(user.profile).then(userProfile => {
                  result?.onAuthorized?.(userProfile);
                  log.debug(
                    `User sign in complete: ${JSON.stringify(userProfile)}`,
                  );
                });
              }
            } else {
              // User is not allowed to sign in.
              signOut().then(() => {
                result?.onUnauthorized?.(true);
              });
            }
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((e: any) => {
          log.error(`Failed to authenticate credentialed user: ${e.message}`);
          result?.onError?.(e.message);
        });
    } else {
      // Ensure a clean state.
      preSignOutActions().then(() => {
        result?.onUnauthorized?.();
      });
    }
  };
};

const safeCredentials = (user: FirebaseAuthTypes.User) => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    isAnonymous: user.isAnonymous,
    providerId: user.providerId,
    metadata: user.metadata,
    providerData: user.providerData,
    multiFactor: user.multiFactor,
  };
};

const useSetUser = () => {
  const dispatch = useDispatch();
  return (credentials: FirebaseAuthTypes.User, profile: UserProfile) => {
    const user = {
      credentials: safeCredentials(credentials), // Remove non-serializable properties (functions).
      profile: {
        ...profile,
        id: credentials.uid, // Store the user id locally.
      },
    } as User;

    dispatch(saveUser({ user }));
    return user;
  };
};

const postSignInActions = async (
  userProfile: UserProfile,
): Promise<UserProfile> => {
  listenForChangesToMyUserProfile();
  return await setupPushNotificationsForUser(userProfile);
};

export const preSignOutActions = async (): Promise<UserProfile | undefined> => {
  const userProfile = store.getState().user.profile;

  // Cancel firestore data listener subscriptions before sign out.
  cancelAllFirestoreSubscriptions();

  // When a user is unauthorized (e.g. on sign out) remove the users push tokens.
  // This avoids sending notifications to a device that used to have the user signed
  // in but is no longer. Could get here with no previously authorized user.
  userProfile && (await removePushNotificationsFromUser(userProfile));

  // Clear our redux store.
  store.dispatch(revertCredentials());

  return userProfile;
};
