import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnumPickerScreen from 'components/EnumPickerScreen';
import PlayerScreen from 'components/PlayerScreen';
import TournamentEditorScreen from 'components/TournamentEditorScreen';
import TournamentScheduleScreen from 'components/TournamentScheduleScreen';
import TournamentsScreen from 'components/TournamentsScreen';
import { TournamentsNavigatorParamList } from 'types/navigation';

const TournamentsStack =
  createNativeStackNavigator<TournamentsNavigatorParamList>();

const TournamentsNavigator = () => {
  const theme = useTheme();
  return (
    <TournamentsStack.Navigator
      initialRouteName={'Tournaments'}
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <TournamentsStack.Screen
        name="Tournaments"
        component={TournamentsScreen}
        options={{
          headerLeft: () => null,
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: theme.colors.viewBackground,
          },
        }}
      />
      <TournamentsStack.Screen
        name="TournamentEditor"
        component={TournamentEditorScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle,
          };
        }}
      />
      <TournamentsStack.Screen
        name="NewTournament"
        component={TournamentEditorScreen}
        options={{
          title: 'New Tournament',
        }}
      />
      <TournamentsStack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          title: 'Player',
        }}
      />
      <TournamentsStack.Screen
        name="TournamentSchedule"
        component={TournamentScheduleScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle,
          };
        }}
      />
      <TournamentsStack.Screen
        name="EnumPicker"
        component={EnumPickerScreen}
        options={{
          title: '',
          presentation: 'modal',
        }}
      />
    </TournamentsStack.Navigator>
  );
};

export default TournamentsNavigator;
