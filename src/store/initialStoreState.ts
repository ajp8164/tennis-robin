import { AppSettingsState, initialAppSettingsState } from 'store/slices/appSettings';
import { UserState, initialUserState } from 'store/slices/user';

export interface StoreState {
  appSettings: AppSettingsState;
  user: UserState;
}

export const initialStoreState = Object.freeze<StoreState>({
  appSettings: initialAppSettingsState,
  user: initialUserState,
});
