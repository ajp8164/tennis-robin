import { useContext } from 'react';
import { useDispatch } from 'react-redux';

import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { log } from '@react-native-hello/core';
import {
  addDocument,
  cancelAllFirestoreSubscriptions,
  getDocument,
  updateDocument,
} from 'firebase/firestore';
import { AuthContext, signOut } from 'lib/auth';
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
  const setUser = useSetUserCredentials();
  const authContext = useContext(AuthContext);

  // useListenForChangesToMyUserProfile();

  const createProfile = (credentials: FirebaseAuthTypes.User): UserProfile => {
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
        title: getUserInitials(firstName || credentials.email || '', lastName),
      },
      role: UserRole.User,
      status: UserStatus.Active,
      groups: [],
      notifications: {
        badgeCount: 0,
        pushTokens: [],
      },
    } as UserProfile;
  };

  return (
    credentials: FirebaseAuthTypes.User | null,
    result?: {
      onAuthorized?: (userId: string) => void;
      onUnauthorized?: (alertUser?: boolean) => void;
      onError?: (msg: string) => void;
    },
  ) => {
    if (credentials) {
      // Check if user already exists in firstore. If not then add the user to firestore.
      getDocument<UserProfile>('Users', credentials.uid)
        .then(userProfile => {
          if (!userProfile) {
            // Add user to firestore and set user.
            const userProfile = createProfile(credentials);

            addDocument<UserProfile>('Users', userProfile)
              .then(() => {
                log.debug(
                  `User profile created: ${JSON.stringify(userProfile)}`,
                );
                setUser({ credentials });
                postSignInActions(userProfile).then(() => {
                  result?.onAuthorized?.(userProfile.id);
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
                updateDocument('Users', updatedProfile)
                  .then(() => {
                    log.debug(
                      `User profile updated: ${JSON.stringify(updatedProfile)}`,
                    );
                    setUser({ credentials });
                    postSignInActions(updatedProfile).then(() => {
                      result?.onAuthorized?.(updatedProfile.id);
                      log.debug(
                        `User sign in complete: ${JSON.stringify(updatedProfile)}`,
                      );
                    });
                  })
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .catch((e: any) => {
                    log.error(`Failed to add user to firestore: ${e.message}`);
                    result?.onError?.(e.message);
                  });
              } else {
                setUser({ credentials });
                postSignInActions(userProfile).then(() => {
                  result?.onAuthorized?.(userProfile.id);
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

const useSetUserCredentials = () => {
  const dispatch = useDispatch();
  return (args: { credentials: FirebaseAuthTypes.User }) => {
    const user = {
      credentials: safeCredentials(args.credentials), // Remove non-serializable properties (functions).
    } as User;

    dispatch(saveUser({ user }));
    return user;
  };
};

// const useListenForChangesToMyUserProfile = () => {
//   const dispatch = useDispatch();
//   const me = store.getState().user.profile;

//   const { doc } = useDocument<UserProfile>('Users', me?.id || '');

//   useEffect(() => {
//     if (me && doc && !lodash.isEqual(me, doc)) {
//       dispatch(updateUserProfile({ userProfile: doc }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [doc, me]);
// };

const postSignInActions = async (userProfile: UserProfile) => {
  await setupPushNotificationsForUser(userProfile);
};

export const preSignOutActions = async () => {
  const userId = store.getState().user.credentials?.uid;

  // Cancel firestore data listener subscriptions before sign out.
  cancelAllFirestoreSubscriptions();

  // When a user is unauthorized (e.g. on sign out) remove the users push tokens.
  // This avoids sending notifications to a device that used to have the user signed
  // in but is no longer. Could get here with no previously authorized user.
  userId && (await removePushNotificationsFromUser(userId));

  // Clear our redux store.
  store.dispatch(revertCredentials());
};
