import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';

import { Divider, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import ScheduleRoundView from 'components/molecules/ScheduleRoundView';
import { useDocument } from 'firebase/firestore';
import { PlayerSwapProvider, decodeSportEvent } from 'lib/sportEvent';
import { SportEventsNavigatorParamList } from 'types/navigation';
import { SportEventEncoded } from 'types/sportEvent';

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'SportEventSchedule'
>;

const SportEventScheduleScreen = ({ route }: Props) => {
  const { sportEventId } = route.params || {};

  const theme = useTheme();

  const { doc: sportEventEncoded } = useDocument<SportEventEncoded>(
    'SportEvents',
    sportEventId,
  );

  const sportEvent = useMemo(
    () => decodeSportEvent(sportEventEncoded),
    [sportEventEncoded],
  );

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
      <PlayerSwapProvider>
        {sportEvent?.schedule
          ? sportEvent.schedule?.allRounds.map((_round, r) => (
              <ScheduleRoundView
                key={`round-${r + 1}`}
                r={r}
                sportEventId={sportEvent.id || ''}
              />
            ))
          : null}
      </PlayerSwapProvider>

      <Divider />
    </ScrollView>
  );
};

export default SportEventScheduleScreen;
