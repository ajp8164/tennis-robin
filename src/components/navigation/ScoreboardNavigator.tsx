import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScoreboardScreen from 'components/ScoreboardScreen';
import { ScoreboardNavigatorParamList } from 'types/navigation';

const ScoreboardStack =
  createNativeStackNavigator<ScoreboardNavigatorParamList>();

const ScoreboardNavigator = () => {
  const theme = useTheme();
  return (
    <ScoreboardStack.Navigator
      initialRouteName={'Scoreboard'}
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <ScoreboardStack.Screen
        name="Scoreboard"
        component={ScoreboardScreen}
        options={{
          headerBackVisible: false,
          headerShown: false,
        }}
      />
    </ScoreboardStack.Navigator>
  );
};

export default ScoreboardNavigator;
