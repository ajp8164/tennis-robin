import { useEffect, useState } from 'react';

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { WithId, documentChangeListener, getDocument } from './index';

export const useDocument = <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionPath: string,
  documentPath?: string,
) => {
  const [document, setDocument] = useState<WithId<T>>();

  // Fetch once on mount or when path changes
  useEffect(() => {
    if (!documentPath) return;

    getDocument<WithId<T>>(collectionPath, documentPath).then(doc => {
      if (doc) {
        setDocument(doc);
      }
    });
  }, [collectionPath, documentPath]);

  // Subscribe to live updates
  useEffect(() => {
    if (!documentPath) return;

    const unsubscribe = documentChangeListener<T>(
      collectionPath,
      documentPath,
      snapshot => {
        if (snapshot.exists()) {
          setDocument({ id: snapshot.id, ...snapshot.data() } as WithId<T>);
        } else {
          setDocument(undefined);
        }
      },
    );
    return unsubscribe;
  }, [collectionPath, documentPath]);

  return { doc: documentPath ? document : undefined };
};
