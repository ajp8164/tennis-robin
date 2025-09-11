import { useContext } from 'react';
import { useDispatch } from 'react-redux';

import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { log } from '@react-native-hello/core';
import { addDocument, getDocument, updateDocument } from 'firebase/firestore';
import { AuthContext, signOut } from 'lib/auth';
import { getUserAvatarColor, getUserInitials } from 'lib/user';
import lodash from 'lodash';
import { saveUser } from 'store/slices/user';
import { User, UserProfile, UserRole, UserStatus } from 'types/user';

import { postSignInActions } from './postSignInActions';
import { preSignOutActions } from './preSignOutActions';

export const useAuthorizeUser = () => {
  const setUser = useSetUserCredentials();
  const authContext = useContext(AuthContext);

  const createProfile = (credentials: FirebaseAuthTypes.User): UserProfile => {
    let firstName = credentials.displayName?.split(' ')[0] || '';
    let lastName = credentials.displayName?.split(' ')[1] || '';
    let displayName = credentials.displayName;

    // When auth provide is email/password (password) we check for auth data provided
    // during account setup and include it in the users profile.
    if (credentials.providerData?.[0]?.providerId === 'password') {
      firstName = authContext.emailPasswordAuthData.firstName;
      lastName = authContext.emailPasswordAuthData.lastName;
      displayName = `${firstName} ${lastName}`;
    }

    return {
      id: credentials.uid,
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

            addDocument<UserProfile>('Users', userProfile, {
              id: userProfile.id,
            })
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
