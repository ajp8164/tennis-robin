import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from 'components/HomeScreen';
import { HomeNavigatorParamList } from 'types/navigation';

const HomeStack = createNativeStackNavigator<HomeNavigatorParamList>();

const HomeNavigator = () => {
  const theme = useTheme();
  return (
    <HomeStack.Navigator
      initialRouteName={'Home'}
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerBackVisible: false,
          headerShown: false,
        }}
      />
    </HomeStack.Navigator>
  );
};

export default HomeNavigator;
