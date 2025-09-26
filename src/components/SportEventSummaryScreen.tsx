import React from 'react';
import { ScrollView } from 'react-native';

import { Divider, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SportEventsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'SportEventSummary'
>;

const SportEventSummaryScreen = () => {
  const theme = useTheme();

  return (
    <ScrollView style={theme.styles.view}>
      <Divider />
    </ScrollView>
  );
};

export default SportEventSummaryScreen;
