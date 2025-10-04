import React, { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';

import { Divider, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { InfoModal, InfoModalMethods } from 'components/modals/InfoModal';
import { EmptyView } from 'components/molecules/EmptyView';
import ScheduleRoundView from 'components/views/ScheduleRoundView';
import eventScheduleExplainer from 'lib/content/eventScheduleExplainer.json';
import { useSportEventStore } from 'lib/sportEvent/useSportEventStore';
import { mapToArray } from 'lib/utils';
import { Info } from 'lucide-react-native';
import { SportEventsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'SportEventSchedule'
>;

const SportEventScheduleScreen = ({ navigation }: Props) => {
  const theme = useTheme();

  const { sportEvent } = useSportEventStore();

  const infoModalRef = useRef<InfoModalMethods>(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            icon={
              <Info color={theme.colors.screenHeaderButtonText} size={28} />
            }
            buttonStyle={theme.styles.buttonScreenHeader}
            headerRight
            onPress={() => infoModalRef.current?.present()}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    !sportEvent ||
    !sportEvent.schedule ||
    !Object.keys(sportEvent.schedule.rounds).length
  ) {
    return (
      <>
        <EmptyView
          type={'info'}
          message={'No Schedule'}
          details={'Add players to your event to create a schedule.'}
        />
        <InfoModal
          ref={infoModalRef}
          snapPoints={['92%']}
          title={'Event Schedule'}
          text={eventScheduleExplainer}
        />
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={theme.styles.view}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider />
        {sportEvent.schedule
          ? mapToArray(sportEvent.schedule.rounds)?.map((round, r) => {
              return (
                <ScheduleRoundView
                  key={`round-${r + 1}`}
                  round={{ ...round, number: r }}
                />
              );
            })
          : null}
        <Divider />
      </ScrollView>
      <InfoModal
        ref={infoModalRef}
        snapPoints={['92%']}
        title={'Event Schedule'}
        text={eventScheduleExplainer}
      />
    </>
  );
};

export default SportEventScheduleScreen;
