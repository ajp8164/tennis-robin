import { NavigatorScreenParams } from '@react-navigation/core';
import { ContentView } from 'types/content';

export enum StartupScreen {
  None = 'None',
  Home = 'Home',
  Welcome = 'Welcome',
}

export type HomeNavigatorParamList = {
  Home: undefined;
};

export type MainNavigatorParamList = {
  Startup: NavigatorScreenParams<StartupNavigatorParamList>;
  Tabs: NavigatorScreenParams<TabNavigatorParamList>;
};

export type SetupNavigatorParamList = {
  About: undefined;
  AppSettings: undefined;
  Content: {
    content: ContentView;
  };
  Setup: {
    subNav?: string;
  };
  UserAccount: undefined;
  UserProfileEditor: undefined;
};

export type StartupNavigatorParamList = {
  Welcome: undefined;
};

export type TabNavigatorParamList = {
  HomeTab: undefined;
  SetupTab: {
    screen: string;
    params: object;
  };
};
