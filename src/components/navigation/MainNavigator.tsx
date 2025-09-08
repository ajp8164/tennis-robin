import React from 'react';
import { useSelector } from 'react-redux';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { selectUser } from 'store/selectors/userSelectors';
import { MainNavigatorParamList } from 'types/navigation';

import AuthenticationNavigator from './AuthenticationNavigator';
import TabNavigator from './TabNavigator';

const MainStack = createNativeStackNavigator<MainNavigatorParamList>();

const MainNavigator = () => {
  const { credentials } = useSelector(selectUser);
  return (
    <MainStack.Navigator
      initialRouteName={!credentials ? 'Authentication' : 'Tabs'}>
      <MainStack.Screen
        name="Authentication"
        component={AuthenticationNavigator}
        options={{
          headerShown: false,
        }}
      />
      <MainStack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />
    </MainStack.Navigator>
  );
};

export default MainNavigator;
