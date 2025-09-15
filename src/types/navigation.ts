import { NavigatorScreenParams } from '@react-navigation/core';
import { EnumPickerInterface } from 'components/EnumPickerScreen';
import { ContentView } from 'types/content';

// This type should be used when type checking a screen that appears in multiple navigators.
// Using this type avoids screen components having to import all the ..NavigatorParamList types
// instead of chosing one at random.
export type MultipleNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
};

export type AuthenticationNavigatorParamList = {
  BiometricsLogin: undefined;
  ChooseSignIn: {
    returning?: boolean;
  };
  CreateAccount: undefined;
  EmailSignIn: undefined;
  ForgotPassword: undefined;
  OnboardBiometrics: undefined;
  OnboardNotifications: undefined;
  OnboardWelcome: undefined;
  Tabs: NavigatorScreenParams<TabNavigatorParamList>;
};

export type SportEventsNavigatorParamList = {
  EnumPicker: EnumPickerInterface;
  NewSportEvent: {
    sportEventId?: string;
  };
  Player: {
    playerId: string;
  };
  SportEvents: undefined;
  SportEventEditor: {
    sportEventId: string;
    screenTitle: string;
  };
  SportEventSchedule: {
    sportEventId: string;
    screenTitle: string;
  };
};

export type HomeNavigatorParamList = {
  Home: undefined;
};

export type MainNavigatorParamList = {
  Authentication: NavigatorScreenParams<AuthenticationNavigatorParamList>;
  Tabs: NavigatorScreenParams<TabNavigatorParamList>;
};

export type SetupNavigatorParamList = {
  About: undefined;
  AppSettings: undefined;
  Content: {
    content: ContentView;
  };
  NewTeam: {
    teamId?: string;
  };
  Player: {
    playerId: string;
  };
  Players: undefined;
  PlayerInvitation: {
    tokenId: string;
  };
  PlayerInvitations: undefined;
  PlayerInvitationEditor: undefined;
  Setup: {
    subNav?: string;
  };
  Teams: undefined;
  TeamEditor: {
    teamId: string;
    screenTitle: string;
  };
  UserAccount: undefined;
  UserProfileEditor: undefined;
};

export type TabNavigatorParamList = {
  HomeTab: undefined;
  SetupTab: {
    screen: string;
    params: object;
  };
  SportEventsTab: undefined;
};
