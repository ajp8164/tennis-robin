import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TournamentsScreen from 'components/TournamentsScreen';
import { TournamentsNavigatorParamList } from 'types/navigation';

const TournamentsStack =
  createNativeStackNavigator<TournamentsNavigatorParamList>();

const TournamentsNavigator = () => {
  return (
    <TournamentsStack.Navigator
      initialRouteName={'Tournaments'}
      screenOptions={{
        title: undefined,
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
