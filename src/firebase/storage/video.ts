import { getApp } from '@react-native-firebase/app';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
} from '@react-native-firebase/storage';
import { log } from '@react-native-hello/core';
import { uuidv4 } from 'lib/utils';

export type Video = {
  mimeType: string;
  uri: string;
};

// Convert destination file extensions as needed for video player compatibility.
const videoTypeMap: { [key in string]: string } = {
  quicktime: 'mov',
};

/**
 * Upload a previously obtained video asset to storage. This function deletes the specified old
 * video if it specified.
 * @param args.video - the video description
 * @param args.storagePath - path in storage where the video will be stored
 * @param args.oldVideo - (optional) if it exists, this video will be deleted from storage
 * @param args.onSuccess - callback with a storage public url
 * @param args.onError - callback when an error occurs
 */

export const uploadVideo = async (args: {
  video: Video;
  storagePath: string;
  oldVideo?: string;
  onSuccess: (url: string) => void;
  onError: () => void;
}) => {
  const { video, storagePath, oldVideo, onSuccess, onError } = args;
  const app = getApp();
  const storage = getStorage(app);

  try {
    const videoType = video.mimeType.split('/')[1];
    const destFilename = `${storagePath}${uuidv4()}.${videoTypeMap[videoType] || videoType}`;
    const sourceFile = video.uri.replace('file://', '');
    const storageRef = ref(storage, destFilename);

    try {
      // Upload the video
      await storageRef.putFile(sourceFile).catch(() => {
        // Swallow potential second throw inside putFile
      });

      // Get the download URL
      const url = await getDownloadURL(storageRef);

      // Delete old video if present
      if (oldVideo) {
        const oldVideoRef = ref(storage, `${storagePath}${oldVideo}`);
        await deleteObject(oldVideoRef).catch(() => {
          // Ignore errors for missing old video
        });
      }

      onSuccess(url);
    } catch (e: unknown) {
      log.error('Video upload failed', e);
      onError();
    }
  } catch (e: unknown) {
    log.error('Video save failed', e);
    onError();
  }
};

/**
 * Delete a video from storage.
 * @param args.filename - the file to delete
 * @param args.storagePath - path in storage where the video is stored
 * @param args.onSuccess - callback when complete
 * @param args.onError - callback when an error occurs
 */

export const deleteVideo = async (args: {
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
    onError?.();
    return;
  }

  const fileRef = ref(storage, `${storagePath}${cleanedFilename}`);

  try {
    await deleteObject(fileRef);
    onSuccess?.();
  } catch (e: unknown) {
    // Ignore if object does not exist
    if (e instanceof Error && !e.message.includes('storage/object-not-found')) {
      log.error(`Failed to delete video: ${e.message}`);
    }
    onError?.();
  }
};
