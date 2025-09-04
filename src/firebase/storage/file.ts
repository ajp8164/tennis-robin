import { getApp } from '@react-native-firebase/app';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  putFile,
  ref,
} from '@react-native-firebase/storage';
import { log } from '@react-native-hello/core';
import { uuidv4 } from 'lib/utils';

export type File = {
  mimeType: string;
  uri: string;
};

/**
 * Save a previously obtained file asset to storage. This function deletes the specified old
 * file if specified.
 * @param args.file - the local file description
 * @param args.storagePath - path in storage where the file will be stored
 * @param args.destFilename - (optional) if it exists, the name of the destination file. If not specifed then a random filename is created.
 * @param args.oldFile - (optional) if it exists, this file will be deleted from storage
 * @param args.onSuccess - callback with a storage public url
 * @param args.onError - callback when an error occurs
 */
export const saveFile = async (args: {
  file: File;
  storagePath: string;
  destFilename?: string;
  oldFile?: string;
  onSuccess: (url: string) => void;
  onError?: () => void;
}) => {
  const {
    file,
    storagePath,
    destFilename: dest,
    oldFile,
    onSuccess,
    onError,
  } = args;
  const app = getApp();
  const storage = getStorage(app);

  try {
    const fileType = file.mimeType.split('/')[1];
    const destFilename = dest
      ? `${storagePath}${dest}`
      : `${storagePath}${uuidv4()}.${fileType}`;

    const sourceFilename = file.uri.replace('file://', '');
    const storageRef = ref(storage, destFilename);

    try {
      await putFile(storageRef, sourceFilename);

      const url = await getDownloadURL(storageRef);

      if (oldFile) {
        await deleteFile({
          filename: oldFile,
          storagePath,
          onSuccess: () => {
            onSuccess(url);
          },
          onError,
        });
      } else {
        onSuccess(url);
      }
    } catch (e: unknown) {
      onError?.();
      if (e instanceof Error) log.error(`File save failed: ${e.message}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error) log.error(`File save failed: ${e.message}`);
    onError?.();
  }
};

/**
 * Delete a file from storage.
 * @param args.filename - the file to delete
 * @param args.storagePath - path in storage where the file is stored
 * @param args.onSuccess - callback when complete
 * @param args.onError - callback when an error occurs
 */
export const deleteFile = async (args: {
  filename: string;
  storagePath: string;
  onSuccess: () => void;
  onError?: () => void;
}) => {
  const app = getApp();
  const storage = getStorage(app);

  const { filename, onError, onSuccess, storagePath } = args;

  const filenameRef = `${storagePath}${
    filename.replace(/%2F/g, '/').split('/').pop()?.split('#')[0].split('?')[0]
  }`;

  const fileRef = ref(storage, filenameRef);

  try {
    await deleteObject(fileRef);
    onSuccess();
  } catch (e: unknown) {
    if (e instanceof Error && !e.message.includes('storage/object-not-found')) {
      log.error(`Failed to delete file: ${e.message}`);
    }
    onError?.();
  }
};
