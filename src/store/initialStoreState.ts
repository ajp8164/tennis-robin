import {
  AppSettingsState,
  initialAppSettingsState,
} from 'store/slices/appSettings';
import { TeamState, initialTeamState } from 'store/slices/team';
import { UserState, initialUserState } from 'store/slices/user';

export interface StoreState {
  appSettings: AppSettingsState;
  team: TeamState;
  user: UserState;
}

export const initialStoreState = Object.freeze<StoreState>({
  appSettings: initialAppSettingsState,
  team: initialTeamState,
  user: initialUserState,
});
