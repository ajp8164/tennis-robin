import { combineReducers } from '@reduxjs/toolkit';
import { appSettingsReducer } from 'store/slices/appSettings';
import { teamReducer } from 'store/slices/team';
import { userReducer } from 'store/slices/user';

export const rootReducer = combineReducers({
  appSettings: appSettingsReducer,
  team: teamReducer,
  user: userReducer,
});
