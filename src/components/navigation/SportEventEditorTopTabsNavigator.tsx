import * as React from 'react';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import PlayerAvailabilityScreen from 'components/PlayerAvailabilityScreen';
import ScheduleScreen from 'components/ScheduleScreen';
import {
  SportEventEditorTabNavigatorParamList,
  SportEventsNavigatorParamList,
} from 'types/navigation';

const Tab =
  createMaterialTopTabNavigator<SportEventEditorTabNavigatorParamList>();

const SportEventEditorTopTabsNavigator = () => {
  const theme = useTheme();
  const s = useStyles();

  const navigation = useNavigation();
  const route =
    useRoute<
      RouteProp<SportEventsNavigatorParamList, 'SportEventEditorTopTabs'>
    >();

  useEffect(() => {
    navigation.getParent()?.setOptions({ title: route.params?.title || '' });
  }, [route.params, navigation]);

  return (
    <Tab.Navigator
      initialRouteName={'ScheduleTab'}
      screenOptions={{
        tabBarActiveTintColor: theme.colors.tabBarActiveTint,
        tabBarIndicatorStyle: {
          backgroundColor: theme.colors.tabBarActiveTint,
        },
        tabBarInactiveTintColor: theme.colors.tabBarInactiveTint,
        tabBarStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
          shadowColor: theme.colors.listItemBorder,
          shadowOpacity: 1,
        },
      }}>
      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={focused ? s.focused : s.unfocused}>{'Schedule'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="PlayerAvailabilityTab"
        component={PlayerAvailabilityScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={focused ? s.focused : s.unfocused}>
              {'Availability'}
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  focused: {
    ...theme.text.normal,
    color: theme.colors.tabBarActiveTint,
    fontWeight: '700',
  },
  unfocused: {
    ...theme.text.normal,
    color: theme.colors.tabBarInactiveTint,
  },
}));

export default SportEventEditorTopTabsNavigator;
