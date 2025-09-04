import { getApp } from '@react-native-firebase/app';
import {
  getDownloadURL,
  getMetadata,
  getStorage,
  listAll,
  ref,
  refFromURL,
} from '@react-native-firebase/storage';
import { log } from '@react-native-hello/core';

export type DirectoryFile = {
  name: string;
  size: number;
  date: string;
  url: string;
};

export type Directory = {
  files: DirectoryFile[];
  allocated: number;
};

/**
 * Check if a file exists remotely.
 * @param path - path to the file
 * @returns true if the file exists, otherwise false
 */
export const fileExists = async (path: string): Promise<boolean> => {
  const app = getApp();
  const storage = getStorage(app);
  const fileRef = ref(storage, refFromURL(storage, path).fullPath);

  try {
    await getMetadata(fileRef);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e?.code === 'storage/object-not-found') {
      return false;
    }
    // If some other error occurs just return false.
    return false;
  }
};

/**
 * Get a directory listing of files.
 * @param args.storagePath - path in storage where files are located
 * @param args.onSuccess - callback with a storage public url
 * @param args.onError - callback when an error occurs
 */

export const listFiles = async (args: {
  storagePath: string;
  onSuccess: (dir: Directory) => void;
  onError?: () => void;
}) => {
  const { storagePath, onSuccess, onError } = args;
  const app = getApp();
  const storage = getStorage(app);

  try {
    const storageRef = ref(storage, storagePath);

    try {
      const result = await listAll(storageRef);
      let allocated = 0;

      const files: (DirectoryFile | null)[] = await Promise.all(
        result.items.map(async itemRef => {
          try {
            const url = await getDownloadURL(itemRef);
            const metadata = await getMetadata(itemRef);
            allocated += metadata.size ?? 0;
            return {
              name: itemRef.name,
              size: metadata.size ?? 0,
              date: metadata.timeCreated ?? '',
              url,
            } as DirectoryFile;
          } catch (e: unknown) {
            if (e instanceof Error) {
              log.error(
                `Failed to get file info for ${itemRef.name}: ${e.message}`,
              );
            }
            onError?.();
            return null;
          }
        }),
      );

      onSuccess({
        allocated,
        files: files.filter((f): f is DirectoryFile => f !== null),
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        log.error(`Directory list failed: ${e.message}`);
      }
      onError?.();
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      log.error(`Directory list failed: ${e.message}`);
    }
    onError?.();
  }
};
