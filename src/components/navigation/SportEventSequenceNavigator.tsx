import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SportEventRoundsScreen from 'components/SportEventSequenceRoundsScreen';
import SportEventStartScreen from 'components/SportEventStartScreen';
import { SportEventSequenceNavigatorParamList } from 'types/navigation';

const SportEventSequenceStack =
  createNativeStackNavigator<SportEventSequenceNavigatorParamList>();

const SportEventSequenceNavigator = () => {
  const theme = useTheme();
  return (
    <SportEventSequenceStack.Navigator
      initialRouteName={'SportEventStart'}
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <SportEventSequenceStack.Screen
        name="SportEventStart"
        component={SportEventStartScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle,
          };
        }}
      />
      <SportEventSequenceStack.Screen
        name="SportEventRounds"
        component={SportEventRoundsScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle,
            headerShadowVisible: false,
          };
        }}
      />
    </SportEventSequenceStack.Navigator>
  );
};

export default SportEventSequenceNavigator;
