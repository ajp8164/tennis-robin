import { combineReducers } from '@reduxjs/toolkit';
import { appSettingsReducer } from 'store/slices/appSettings';
import { userReducer } from 'store/slices/user';

export const rootReducer = combineReducers({
  appSettings: appSettingsReducer,
  user: userReducer,
});
