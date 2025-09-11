import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AboutScreen from 'components/AboutScreen';
import AppSettingsScreen from 'components/AppSettingsScreen';
import ContentScreen from 'components/ContentScreen';
import PlayerInvitationEditorScreen from 'components/PlayerInvitationEditorScreen';
import PlayerInvitationScreen from 'components/PlayerInvitationScreen';
import PlayerInvitationsScreen from 'components/PlayerInvitationsScreen';
import PlayerScreen from 'components/PlayerScreen';
import PlayersScreen from 'components/PlayersScreen';
import SetupScreen from 'components/SetupScreen';
import TeamEditorScreen from 'components/TeamEditorScreen';
import TeamsScreen from 'components/TeamsScreen';
import UserAccountScreen from 'components/UserAccountScreen';
import UserProfileEditorScreen from 'components/UserProfileEditorScreen';
import { appConfig } from 'config';
import { SetupNavigatorParamList } from 'types/navigation';

const SetupStack = createNativeStackNavigator<SetupNavigatorParamList>();

const SetupNavigator = () => {
  const theme = useTheme();

  return (
    <SetupStack.Navigator
      initialRouteName="Setup"
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <SetupStack.Screen
        name="Setup"
        component={SetupScreen}
        options={{
          title: 'Setup',
          headerLeft: () => null,
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: theme.colors.viewBackground,
          },
        }}
      />
      <SetupStack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          title: 'Player',
        }}
      />
      <SetupStack.Screen
        name="Players"
        component={PlayersScreen}
        options={{
          title: 'Players',
        }}
      />
      <SetupStack.Screen
        name="PlayerInvitation"
        component={PlayerInvitationScreen}
        options={{
          title: 'Invitation',
        }}
      />
      <SetupStack.Screen
        name="PlayerInvitationEditor"
        component={PlayerInvitationEditorScreen}
        options={{
          title: 'Invite Player',
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
      <SetupStack.Screen
        name="PlayerInvitations"
        component={PlayerInvitationsScreen}
        options={{
          title: 'Invite Players',
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
      <SetupStack.Screen
        name="Teams"
        component={TeamsScreen}
        options={{
          title: 'Teams',
        }}
      />
      <SetupStack.Screen
        name="TeamEditor"
        component={TeamEditorScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle,
          };
        }}
      />
      <SetupStack.Screen
        name="NewTeam"
        component={TeamEditorScreen}
        options={{
          title: 'New Team',
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />
      <SetupStack.Screen
        name="UserAccount"
        component={UserAccountScreen}
        options={{
          title: 'My Account',
        }}
      />
      <SetupStack.Screen
        name="UserProfileEditor"
        component={UserProfileEditorScreen}
        options={{
          title: '',
        }}
      />
      <SetupStack.Screen
        name="AppSettings"
        component={AppSettingsScreen}
        options={{
          title: 'App Settings',
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: theme.colors.viewBackground,
          },
        }}
      />
      <SetupStack.Screen
        name="Content"
        component={ContentScreen}
        options={{
          title: '',
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: theme.colors.viewBackground,
          },
        }}
      />
      <SetupStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: `About ${appConfig.appName}`,
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: theme.colors.viewBackground,
          },
        }}
      />
    </SetupStack.Navigator>
  );
};

export default SetupNavigator;
