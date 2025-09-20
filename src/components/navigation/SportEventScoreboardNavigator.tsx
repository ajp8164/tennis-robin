import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SportEventScoreboardScreen from 'components/SportEventScoreboardScreen';
import SportEventStartScreen from 'components/SportEventStartScreen';
import { SportEventScoreboardNavigatorParamList } from 'types/navigation';

const SportEventScoreboardStack =
  createNativeStackNavigator<SportEventScoreboardNavigatorParamList>();

const SportEventScoreboardNavigator = () => {
  const theme = useTheme();
  return (
    <SportEventScoreboardStack.Navigator
      initialRouteName={'SportEventStart'}
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <SportEventScoreboardStack.Screen
        name="SportEventStart"
        component={SportEventStartScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle,
          };
        }}
      />
      <SportEventScoreboardStack.Screen
        name="SportEventScoreboard"
        component={SportEventScoreboardScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle,
            headerShadowVisible: false,
          };
        }}
      />
    </SportEventScoreboardStack.Navigator>
  );
};

export default SportEventScoreboardNavigator;
