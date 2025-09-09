import { getApp } from '@react-native-firebase/app';
import {
  collection,
  getCountFromServer,
  getFirestore,
} from '@react-native-firebase/firestore';

export const getDocumentCount = async (
  collectionPath: string,
): Promise<number> => {
  const app = getApp();
  const db = getFirestore(app);

  const collRef = collection(db, collectionPath);
  const snapshot = await getCountFromServer(collRef);
  return snapshot.data().count;
};
