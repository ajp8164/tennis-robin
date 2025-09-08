import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { CaseReducer, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { revertCredentials } from 'store/actions';
import { User } from 'types/user';

export interface UserState {
  credentials: FirebaseAuthTypes.User | null | undefined;
}

export const initialUserState = Object.freeze<UserState>({
  credentials: undefined,
});

const handleSaveUser: CaseReducer<UserState, PayloadAction<{ user: User }>> = (
  state,
  { payload },
) => {
  return {
    ...state,
    credentials: payload.user.credentials,
  };
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  extraReducers: builder =>
    builder.addCase(revertCredentials, () => initialUserState),
  reducers: {
    saveUser: handleSaveUser,
  },
});

export const userReducer = userSlice.reducer;
export const saveUser = userSlice.actions.saveUser;
