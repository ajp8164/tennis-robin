import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from 'store/initialStoreState';

export const selectAppState = (state: StoreState): StoreState => state;

export const selectAppSettings = createSelector(selectAppState, appState => {
  return appState.appSettings;
});

export const selectBiometrics = createSelector(selectAppState, appState => {
  return appState.appSettings.biometrics;
});

export const selectThemeSettings = createSelector(selectAppState, appState => {
  return appState.appSettings.themeSettings;
});

export const selectTou = createSelector(selectAppState, appState => {
  return appState.appSettings.tou;
});
