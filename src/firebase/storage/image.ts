import { getApp } from '@react-native-firebase/app';
import {
  FirebaseStorageTypes,
  deleteObject,
  getDownloadURL,
  getStorage,
  putFile,
  ref,
} from '@react-native-firebase/storage';
import { log } from '@react-native-hello/core';

export type Image = {
  mimeType: string;
  uri: string;
};

/**
 * Save a previously obtained image asset to storage. This function deletes the specified old
 * image if it specified.
 * @param args.image - the image description
 * @param args.storagePath - path in storage where the image will be stored
 * @param args.oldImage - (optional) if it exists, this image will be deleted from storage
 * @param args.onSuccess - callback with a storage public url
 * @param args.onError - callback when an error occurs
 */

export const uploadImage = async (args: {
  image: { uri: string; mimeType: string };
  storagePath: string;
  oldImage?: string;
  onSuccess: (url: string) => void;
  onError: () => void;
}) => {
  const { image, storagePath, oldImage, onSuccess, onError } = args;
  const app = getApp();
  const storage = getStorage(app);

  try {
    const destFilename = `${storagePath}${image.uri.split('/').pop()}`;
    const sourceFilename = `file://${image.uri.replace('file://', '')}`;
    const storageRef = ref(storage, destFilename);

    const task = putFile(storageRef, sourceFilename);

    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        () => {
          return;
        },
        reject,
        resolve,
      );
    });

    const url = await getUrlWithRetry(storageRef);

    // Clean up the old image if provided (ignore if it does not exist)
    if (oldImage) {
      try {
        await deleteObject(ref(storage, oldImage));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e?.code !== 'storage/object-not-found') throw e;
      }
    }

    onSuccess(url);
  } catch (e: unknown) {
    onError();
    if (e instanceof Error) {
      log.error(`Image save failed: ${e.message}`);
    }
  }
};

/**
 * Delete an image from storage.
 * @param args.filename - the file to delete
 * @param args.storagePath - path in storage where the image is stored
 * @param args.onSuccess - callback when complete
 * @param args.onError - callback when an error occurs
 */

export const deleteImage = async (args: {
  filename: string;
  storagePath: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { filename, storagePath, onSuccess, onError } = args;
  const app = getApp();
  const storage = getStorage(app);

  // Clean up filename
  const cleanedFilename = filename
    .replace(/%2F/g, '/')
    .split('/')
    .pop()
    ?.split('#')[0]
    .split('?')[0];

  if (!cleanedFilename) {
    log.error('Invalid filename provided to deleteImage.');
    onError?.();
    return;
  }

  const fileRef = ref(storage, `${storagePath}${cleanedFilename}`);
  try {
    await deleteObject(fileRef);
    onSuccess?.();
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (!e.message.includes('storage/object-not-found')) {
        log.error(`Failed to delete image: ${e.message}`);
      }
    }
    onError?.();
  }
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function getUrlWithRetry(r: FirebaseStorageTypes.Reference, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      return await getDownloadURL(r);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e?.code !== 'storage/object-not-found' || i === tries - 1) throw e;
      await sleep(200 * (i + 1));
    }
  }
  throw new Error('Could not get download URL');
}
