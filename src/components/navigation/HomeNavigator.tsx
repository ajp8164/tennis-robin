import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from 'components/HomeScreen';
import { HomeNavigatorParamList } from 'types/navigation';

const HomeStack = createNativeStackNavigator<HomeNavigatorParamList>();

const HomeNavigator = () => {
  return (
    <HomeStack.Navigator
      initialRouteName={'Home'}
      screenOptions={{
        title: undefined,
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerBackVisible: false,
        }}
      />
    </HomeStack.Navigator>
  );
};

export default HomeNavigator;
