import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { ISODateString } from '@react-native-hello/common';
import { UserRole } from 'types/user';

export * from './addDocument';
export * from './archiveDocument';
export * from './collectionChangeListener';
export * from './deleteDocument';
export * from './documentChangeListener';
export * from './getDocument';
export * from './getDocumentCount';
export * from './getDocuments';
export * from './subscriptions';
export * from './updateDocument';
export * from './useCollection';
export * from './useDocument';

export const whereInChunkSize = 10; // Firestore limit

export type WithId<T> = T & {
  id: string;
  createdOn?: ISODateString;
  updatedOn?: ISODateString;
  archivedOn?: ISODateString | null;
};

export type ListenerAuth = {
  allowedRoles?: UserRole[];
  userRole?: UserRole;
};

export type QueryResult<T> = {
  allLoaded: boolean;
  lastDocument?: FirebaseFirestoreTypes.DocumentData;
  result: T[];
  snapshot?: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>;
};

export type QueryOrderBy = {
  fieldPath: string | FirebaseFirestoreTypes.FieldPath;
  directionStr?: 'asc' | 'desc' | undefined;
};

export type QueryWhere = {
  fieldPath: string | FirebaseFirestoreTypes.FieldPath;
  opStr: FirebaseFirestoreTypes.WhereFilterOp;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

export type QueryWithMeta = {
  query: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData>;
  orderBy: { field: string; direction: 'asc' | 'desc' | undefined }[];
};

export type CollectionChangeListenerOptions = {
  lastDocument?: FirebaseFirestoreTypes.DocumentData;
  limit?: number;
  orderBy?: QueryOrderBy[];
  where?: QueryWhere[];
  subCollection?: {
    documentPath: string;
    name: string;
  };
  auth?: ListenerAuth;
};
