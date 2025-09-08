import { useSelector } from 'react-redux';

import { useDocument } from 'firebase/firestore';
import { selectUser } from 'store/selectors/userSelectors';
import { UserProfile } from 'types/user';

export const useUserProfile = () => {
  const { credentials } = useSelector(selectUser);
  const { doc } = useDocument<UserProfile>('Users', credentials?.uid || '');
  return doc;
};
