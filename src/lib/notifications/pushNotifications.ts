import { isEmulator } from 'react-native-device-info';

import notifee from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  subscribeToTopic as FBSubscribeToTopic,
  unsubscribeFromTopic as FBUnsubscribeFromTopic,
  getAPNSToken,
  getMessaging,
  getToken,
  hasPermission,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  requestPermission,
  setAPNSToken,
} from '@react-native-firebase/messaging';
import { log } from '@react-native-hello/core';
import { updateUser } from 'firebase/firestore';
import lodash from 'lodash';
import { NotificationInterface } from 'types/notification';
import { UserProfile } from 'types/user';

export type PushNotificationToken = {
  fcm: string;
  apns: string | null;
};

export type MessagingTopic = 'all-installs' | 'all-users';

export const initPushNotifications = () => {
  const app = getApp();
  const messaging = getMessaging(app);

  requestPermission(messaging).then(async permission => {
    // Need to fetch token before subscribing to topic.
    const token = await getDeviceToken();
    subscribeToTopic('all-installs');

    log.debug(`Push notifications permission: ${permission}`);
    log.debug(`Push notifications token: ${JSON.stringify(token)}`);
  });
};

export const subscribeToTopic = (name: MessagingTopic) => {
  const app = getApp();
  const messaging = getMessaging(app);
  FBSubscribeToTopic(messaging, name);
};

export const unsubscribeFromTopic = (name: MessagingTopic) => {
  const app = getApp();
  const messaging = getMessaging(app);
  FBUnsubscribeFromTopic(messaging, name);
};

const getDeviceToken = async (): Promise<PushNotificationToken> => {
  const app = getApp();
  const messaging = getMessaging(app);
  if (await isEmulator()) {
    // Running on the iOS simulator will produce an error. Setting a bogus value here avoids the error.
    // See https://github.com/invertase/react-native-firebase/issues/6893
    await setAPNSToken(messaging, 'bogus');
  }

  if (!isDeviceRegisteredForRemoteMessages(messaging)) {
    await registerDeviceForRemoteMessages(messaging);
  }

  const fcm = await getToken(messaging);
  const apns = await getAPNSToken(messaging);
  return { fcm, apns };
};

export const hasPushNotificationsPermission = async () => {
  const app = getApp();
  const messaging = getMessaging(app);
  const authStatus = await hasPermission(messaging);
  return authStatus === AuthorizationStatus.AUTHORIZED;
};

export const setupPushNotificationsForUser = async (
  userProfile: UserProfile,
): Promise<UserProfile> => {
  // Add push token to the authorized user profile.
  const token = await getDeviceToken();

  const updatedProfile = Object.assign({}, userProfile);
  if (token) {
    updatedProfile.notifications.pushTokens = lodash.uniq(
      updatedProfile.notifications.pushTokens.concat(token?.fcm),
    );
    updateUser(updatedProfile);
  }
  subscribeToTopic('all-users');

  // Restore badge count to app icon. Signing in from a signed out state
  // reapplys the badge count. If already signed in then the badge count is
  // simply reasserted.
  notifee.setBadgeCount(userProfile.notifications.badgeCount);

  return updatedProfile;
};

export const removePushNotificationsFromUser = async (
  userProfile?: UserProfile,
): Promise<void> => {
  // Remove push token from the authorized user profile.
  // Remove only the token for this device.
  if (userProfile) {
    const { fcm } = await getDeviceToken();
    const updatedProfile = Object.assign({}, userProfile);
    updatedProfile.notifications.pushTokens = lodash.filter(
      userProfile.notifications.pushTokens,
      t => {
        return t !== fcm;
      },
    );
    await updateUser(updatedProfile);
  }
  unsubscribeFromTopic('all-users');

  // Remove app icon badge count.
  notifee.setBadgeCount(0);
};

export const displayNotification = async (props: NotificationInterface) => {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display a notification
  await notifee.displayNotification({
    title: props.title,
    body: props.description,
    android: {
      channelId,
      smallIcon: 'ic_launcher',
    },
  });
};
