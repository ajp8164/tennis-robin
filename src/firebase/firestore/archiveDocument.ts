import { log } from '@react-native-hello/core';
import { DateTime } from 'luxon';

import { updateDocument } from './updateDocument';

export const archiveDocument = async <T>(path: string, doc: T) => {
  try {
    await updateDocument(path, {
      ...doc,
      archivedOn: DateTime.now().toISO(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e instanceof Error) {
      log.error(`Failed to archive document at path ${path}: ${e.message}`);
    } else {
      log.error(`Failed to archive document at path ${path}: ${String(e)}`);
    }
    throw e;
  }
};
