import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from 'store/initialStoreState';

export const selectAppState = (state: StoreState): StoreState => state;

export const selectUser = createSelector(selectAppState, appState => {
  return appState.user;
});

export const selectUserProfile = createSelector(selectAppState, appState => {
  return appState.user.profile;
});
