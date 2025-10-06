import React from 'react';
import { ScrollView } from 'react-native';

import { Divider, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SportEventEditorTabNavigatorParamList } from 'types/navigation';

type Props = NativeStackScreenProps<
  SportEventEditorTabNavigatorParamList,
  'ScheduleTab'
>;

const ScheduleScreen = ({ navigation: _ }: Props) => {
  const theme = useTheme();

  return (
    <ScrollView style={theme.styles.view} showsVerticalScrollIndicator={false}>
      <Divider />
    </ScrollView>
  );
};

export default ScheduleScreen;
