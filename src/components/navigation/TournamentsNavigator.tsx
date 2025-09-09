import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
          headerBackVisible: false,
          headerShown: false,
        }}
      />
    </TournamentsStack.Navigator>
  );
};

export default TournamentsNavigator;
