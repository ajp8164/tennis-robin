import React from 'react';

import { useTheme } from '@react-native-hello/ui';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnumPickerScreen from 'components/EnumPickerScreen';
import PlayerScreen from 'components/PlayerScreen';
import SportEventEditorScreen from 'components/SportEventEditorScreen';
import SportEventScheduleScreen from 'components/SportEventScheduleScreen';
import { NewSportEventNavigatorParamList } from 'types/navigation';

const NewSportEventStack =
  createNativeStackNavigator<NewSportEventNavigatorParamList>();

const NewSportEventNavigator = () => {
  const theme = useTheme();
  return (
    <NewSportEventStack.Navigator
      initialRouteName={'NewSportEvent'}
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: theme.colors.screenHeaderBackground,
        },
        headerTitleStyle: { color: theme.colors.screenHeaderTitle },
        headerTintColor: theme.colors.screenHeaderButtonText,
      }}>
      <NewSportEventStack.Screen
        name="NewSportEvent"
        // @ts-expect-error - typing is incorrect on screens
        component={SportEventEditorScreen}
        options={{
          title: 'New Event',
        }}
      />
      <NewSportEventStack.Screen
        name="Player"
        component={PlayerScreen}
        options={{
          title: 'Player',
        }}
      />
      <NewSportEventStack.Screen
        name="SportEventSchedule"
        component={SportEventScheduleScreen}
        options={({ route }) => {
          return {
            title: route.params.screenTitle ?? 'hello',
          };
        }}
      />
      <NewSportEventStack.Screen
        name="EnumPicker"
        component={EnumPickerScreen}
        options={{
          title: '',
          presentation: 'modal',
        }}
      />
    </NewSportEventStack.Navigator>
  );
};

export default NewSportEventNavigator;
