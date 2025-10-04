import { useEffect, useState } from 'react';

import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { log } from '@react-native-hello/core';

import { WithId, documentChangeListener } from './index';

export const useDocument = <T extends FirebaseFirestoreTypes.DocumentData>(
  collectionPath: string,
  documentPath?: string,
) => {
  const [document, setDocument] = useState<WithId<T>>();
  const [loading, setLoading] = useState<boolean>(!!documentPath);

  useEffect(() => {
    if (!documentPath) return;

    setLoading(true);

    const unsubscribe = documentChangeListener<T>(
      collectionPath,
      documentPath,
      snapshot => {
        log.debug(
          `firestore - useDocument: ${collectionPath} (from cache = ${snapshot.metadata.fromCache})`,
        );

        if (snapshot.exists()) {
          setDocument({ id: snapshot.id, ...snapshot.data() } as WithId<T>);
        } else {
          setDocument(undefined);
        }
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [collectionPath, documentPath]);

  return { doc: documentPath ? document : undefined, loading };
};
