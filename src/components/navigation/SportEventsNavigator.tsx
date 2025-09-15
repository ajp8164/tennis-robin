import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnumPickerScreen from 'components/EnumPickerScreen';
import PlayerScreen from 'components/PlayerScreen';
import SportEventEditorScreen from 'components/SportEventEditorScreen';
import SportEventScheduleScreen from 'components/SportEventScheduleScreen';
import SportEventsScreen from 'components/SportEventsScreen';
import { SportEventsNavigatorParamList } from 'types/navigation';

import SportEventSequenceNavigator from './SportEventSequenceNavigator';

const SportEventsStack =
  createNativeStackNavigator<SportEventsNavigatorParamList>();

const SportEventsNavigator = () => {
  const theme = useTheme();
  return (
    <SportEventsStack.Navigator
      initialRouteName={'SportEvents'}
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <SportEventsStack.Screen
        name="SportEvents"
        component={SportEventsScreen}
        options={{
          headerLeft: () => null,
          title: 'Events',
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: theme.colors.viewBackground,
          },
        }}
      />
      <SportEventsStack.Screen
        name="SportEventSequenceNavigator"
        component={SportEventSequenceNavigator}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <SportEventsStack.Screen
        name="SportEventEditor"
        component={SportEventEditorScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle,
          };
        }}
      />
      <SportEventsStack.Screen
        name="NewSportEvent"
        component={SportEventEditorScreen}
        options={{
          title: 'New Event',
          presentation: 'fullScreenModal',
        }}
      />
      <SportEventsStack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          title: 'Player',
        }}
      />
      <SportEventsStack.Screen
        name="SportEventSchedule"
        component={SportEventScheduleScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle,
          };
        }}
      />
      <SportEventsStack.Screen
        name="EnumPicker"
        component={EnumPickerScreen}
        options={{
          title: '',
          presentation: 'modal',
        }}
      />
    </SportEventsStack.Navigator>
  );
};

export default SportEventsNavigator;
