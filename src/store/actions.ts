import { createAction } from '@reduxjs/toolkit';

export const revertAppSettings = createAction('REVERT_SETTINGS');
export const revertCredentials = createAction('REVERT_CREDENTIALS');
