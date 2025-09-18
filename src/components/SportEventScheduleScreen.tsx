import React from 'react';
import { ScrollView } from 'react-native';

import { Divider, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import ScheduleRoundView from 'components/molecules/ScheduleRoundView';
import { useSportEvent } from 'lib/sportEvent';
import { SportEventsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'SportEventSchedule'
>;

const SportEventScheduleScreen = () => {
  const theme = useTheme();
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
      <Divider />
      {sportEvent.schedule
        ? sportEvent.schedule.allRounds?.map((_round, r) => (
            <ScheduleRoundView
              key={`round-${r + 1}`}
              r={r}
              sportEventId={sportEvent.id || ''}
            />
          ))
        : null}

      <Divider />
    </ScrollView>
  );
};

export default SportEventScheduleScreen;
