import { usersDocumentChangeListener } from 'firebase/firestore';
import { dispatch, store } from 'store';
import { updateUserProfile } from 'store/slices/user';
import { UserProfile } from 'types/user';

export const listenForChangesToMyUserProfile = () => {
  const me = store.getState().user.profile;
  if (!me?.id) return;

  usersDocumentChangeListener(me.id, snapshot => {
    dispatch(
      updateUserProfile({ userProfile: snapshot.data() as UserProfile }),
    );
  });
};
