import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { revertAppSettings } from 'store/actions';

export interface TeamState {
  teamId?: string;
}

export const initialTeamState = Object.freeze<TeamState>({
  teamId: undefined,
});

const handleSaveSelectedTeam: CaseReducer<
  TeamState,
  PayloadAction<{ teamId?: string }>
> = (state, { payload }) => {
  return {
    ...state,
    teamId: payload.teamId,
  };
};

const teamSlice = createSlice({
  name: 'team',
  initialState: initialTeamState,
  extraReducers: builder =>
    builder.addCase(revertAppSettings, () => initialTeamState),
  reducers: {
    saveSelectedTeam: handleSaveSelectedTeam,
  },
});

export const teamReducer = teamSlice.reducer;
export const saveSelectedTeam = teamSlice.actions.saveSelectedTeam;
