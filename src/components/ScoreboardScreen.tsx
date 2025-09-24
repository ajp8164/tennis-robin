import React from 'react';
import { ScrollView } from 'react-native';

import { Divider, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScoreboardNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ScoreboardNavigatorParamList,
  'Scoreboard'
>;

const ScoreboardScreen = () => {
  const theme = useTheme();

  return (
    <ScrollView style={theme.styles.view}>
      <Divider />
    </ScrollView>
  );
};

export default ScoreboardScreen;
