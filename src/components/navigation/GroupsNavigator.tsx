import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnumPickerScreen from 'components/EnumPickerScreen';
import GroupEditorScreen from 'components/GroupEditorScreen';
import GroupsScreen from 'components/GroupsScreen';
import { GroupsNavigatorParamList } from 'types/navigation';

const GroupsStack = createNativeStackNavigator<GroupsNavigatorParamList>();

const GroupsNavigator = () => {
  const theme = useTheme();

  return (
    <GroupsStack.Navigator
      initialRouteName={'Groups'}
      screenOptions={{
        title: undefined,
      }}>
      <GroupsStack.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          headerLeft: () => null,
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerLargeStyle: {
            backgroundColor: theme.colors.viewBackground,
          },
        }}
      />
      <GroupsStack.Screen
        name="GroupEditor"
        component={GroupEditorScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle,
          };
        }}
      />
      <GroupsStack.Screen
        name="NewGroup"
        component={GroupEditorScreen}
        options={{
          title: 'New Group',
        }}
      />
      <GroupsStack.Screen
        name="EnumPicker"
        component={EnumPickerScreen}
        options={{
          title: '',
        }}
      />
    </GroupsStack.Navigator>
  );
};

export default GroupsNavigator;
