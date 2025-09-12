import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { revertAppSettings } from 'store/actions';
import { ThemeSettings } from 'types/appSettings';
import { Tou } from 'types/tou';

export type OnboardProgress = 'complete' | 'none';

export interface AppSettingsState {
  biometrics: boolean;
  firstLaunch: boolean;
  onboardProgress?: OnboardProgress;
  themeSettings: ThemeSettings;
  tou: Tou;
}

export const initialAppSettingsState = Object.freeze<AppSettingsState>({
  biometrics: false,
  firstLaunch: true,
  onboardProgress: 'none',
  themeSettings: {
    followDevice: true,
    app: 'light',
  },
  tou: {
    accepted: undefined,
  },
});

const handleSaveBiometrics: CaseReducer<
  AppSettingsState,
  PayloadAction<{ value: boolean }>
> = (state, { payload }) => {
  return {
    ...state,
    biometrics: payload.value,
  };
};

const handleSaveFirstLaunch: CaseReducer<
  AppSettingsState,
  PayloadAction<{ value: boolean }>
> = (state, { payload }) => {
  return {
    ...state,
    firstLaunch: payload.value,
  };
};

const handleSaveOnboardProgress: CaseReducer<
  AppSettingsState,
  PayloadAction<{ progress: OnboardProgress }>
> = (state, { payload }) => {
  return {
    ...state,
    onboardProgress: payload.progress,
  };
};

const handleSaveThemeSettings: CaseReducer<
  AppSettingsState,
  PayloadAction<{ themeSettings: ThemeSettings }>
> = (state, { payload }) => {
  return {
    ...state,
    themeSettings: payload.themeSettings,
  };
};

const handleSaveAcceptTou: CaseReducer<
  AppSettingsState,
  PayloadAction<{ tou: Tou }>
> = (state, { payload }) => {
  return {
    ...state,
    tou: payload.tou,
  };
};

const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState: initialAppSettingsState,
  extraReducers: builder =>
    builder.addCase(revertAppSettings, () => initialAppSettingsState),
  reducers: {
    saveAcceptTou: handleSaveAcceptTou,
    saveBiometrics: handleSaveBiometrics,
    saveFirstLaunch: handleSaveFirstLaunch,
    saveOnboardProgress: handleSaveOnboardProgress,
    saveThemeSettings: handleSaveThemeSettings,
  },
});

export const appSettingsReducer = appSettingsSlice.reducer;
export const saveAcceptTou = appSettingsSlice.actions.saveAcceptTou;
export const saveBiometrics = appSettingsSlice.actions.saveBiometrics;
export const saveFirstLaunch = appSettingsSlice.actions.saveFirstLaunch;
export const saveOnboardProgress = appSettingsSlice.actions.saveOnboardProgress;
export const saveThemeSettings = appSettingsSlice.actions.saveThemeSettings;
