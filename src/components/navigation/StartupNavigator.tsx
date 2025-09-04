import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from 'components/WelcomeScreen';
import { StartupNavigatorParamList } from 'types/navigation';

const StartupStack = createNativeStackNavigator<StartupNavigatorParamList>();

const StartupNavigator = () => {
  const theme = useTheme();

  return (
    <StartupStack.Navigator
      initialRouteName={'Welcome'}
      screenOptions={{
        title: undefined,
        headerBackTitle: 'Back',
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <StartupStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
    </StartupStack.Navigator>
  );
};

export default StartupNavigator;
