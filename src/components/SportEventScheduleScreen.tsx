import React from 'react';
import { ScrollView } from 'react-native';

import { Divider, ThemeManager, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import ScheduleRoundView from 'components/views/ScheduleRoundView';
import { useSportEvent } from 'lib/sportEvent';
import { SportEventsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'SportEventSchedule'
>;

const SportEventScheduleScreen = () => {
  const theme = useTheme();
  const s = useStyles();

  const { sportEvent } = useSportEvent();

  if (!sportEvent) {
    return (
      <EmptyView
        type={'info'}
        message={'No Schedule'}
        details={'Add players to your event to generate a schedule.'}
      />
    );
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider
        note
        light
        text={
          'Change the schedule by swapping player assignments. Swap two players by tapping player 1 and then player 2.'
        }
        subHeaderStyle={s.divider}
      />
      {sportEvent.schedule
        ? sportEvent.schedule.allRounds?.map((_round, r) => (
            <ScheduleRoundView key={`round-${r + 1}`} r={r} />
          ))
        : null}

      <Divider />
    </ScrollView>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  divider: {
    ...theme.text.medium,
    marginTop: 0,
  },
}));

export default SportEventScheduleScreen;
