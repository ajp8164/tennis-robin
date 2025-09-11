import { cancelAllFirestoreSubscriptions } from 'firebase/firestore';
import { removePushNotificationsFromUser } from 'lib/notifications';
import { store } from 'store';
import { revertAppSettings, revertCredentials } from 'store/actions';

export const preSignOutActions = async () => {
  const userId = store.getState().user.credentials?.uid;

  // Cancel firestore data listener subscriptions before sign out.
  cancelAllFirestoreSubscriptions();

  // When a user is unauthorized (e.g. on sign out) remove the users push tokens.
  // This avoids sending notifications to a device that used to have the user signed
  // in but is no longer. Could get here with no previously authorized user.
  userId && (await removePushNotificationsFromUser(userId));

  // Clear our redux store.
  store.dispatch(revertAppSettings());
  store.dispatch(revertCredentials());
};
