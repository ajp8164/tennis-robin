import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import { documentId } from '@react-native-firebase/firestore';
import {
  ConditionalWrapper,
  Divider,
  ListItemCollapsible,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import ScoreboardMatchView from 'components/views/ScoreboardMatchView';
import { updateDocument, useCollection, useDocument } from 'firebase/firestore';
import { flattenPlayers } from 'lib/player';
import { RoundStatus, getRoundState, getSportEventState } from 'lib/scoring';
import { mapToArray } from 'lib/utils';
import { DateTime } from 'luxon';
import { Match } from 'types/match';
import { SportEventsNavigatorParamList } from 'types/navigation';
import { SportEvent } from 'types/sportEvent';

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'SportEventStart'
>;

const SportEventStartScreen = ({ navigation, route }: Props) => {
  const { sportEventId } = route.params || {};

  const theme = useTheme();

  const { doc: sportEvent } = useDocument<SportEvent>(
    'SportEvents',
    sportEventId,
  );

  const { docs: matches } = useCollection<Match>(
    'Matches',
    {
      where: [
        {
          fieldPath: documentId(),
          opStr: 'in',
          value: sportEvent?.matches || [],
        },
      ],
      orderBy: [
        { fieldPath: 'roundNumber', directionStr: 'asc' },
        { fieldPath: 'courtNumber', directionStr: 'asc' },
      ],
    },
    [sportEvent],
  );

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Close'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={() => navigation.goBack()}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // End of sport event?
  useEffect(() => {
    if (!sportEvent || !matches.length) return;
    const sportEventState = getSportEventState(sportEvent, matches);

    if (
      sportEventState.status === 'ended' && // Reported status
      sportEvent.state.status !== 'ended' // Saved status
    ) {
      const updatedSportEventState = sportEvent.state;

      if (sportEventState.status === 'ended') {
        updatedSportEventState.status = sportEventState.status;
        updatedSportEventState.endDate = DateTime.now().toISO();
      }

      updateDocument<SportEvent>('SportEvents', {
        ...sportEvent,
        state: updatedSportEventState,
      });
    }
  }, [sportEvent, matches]);

  const getRoundLabel = (roundStatus: RoundStatus) => {
    return roundStatus === 'not-started'
      ? 'Not Started'
      : roundStatus === 'in-progress'
        ? 'In Progress'
        : 'Ended';
  };

  const roundsArr = sportEvent?.schedule
    ? mapToArray(sportEvent.schedule.rounds)
    : [];

  if (!roundsArr.length || !matches) {
    return null;
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      {sportEvent?.schedule &&
      mapToArray(sportEvent.schedule.rounds).length > 1 ? (
        <Divider />
      ) : null}
      {sportEvent?.schedule
        ? roundsArr.map((round, r) => {
            const roundState = getRoundState(
              round,
              matches.filter(m => m.roundNumber === r),
              sportEvent.numberOfSetsPerMatch,
              sportEvent.numberOfGamesPerSet,
            );
            return (
              <View key={`round-${r + 1}`}>
                <ConditionalWrapper
                  condition={roundsArr.length > 1} // Use the collapsible only if there is more than one round
                  wrapper={children => (
                    <ListItemCollapsible
                      title={`ROUND ${r + 1}`}
                      subtitle={`${roundState.matchCount} matches`}
                      value={getRoundLabel(roundState.status)}
                      valueStyle={[
                        theme.text.medium,
                        { color: theme.colors.listItemSubtitle },
                      ]}
                      initExpanded={false}
                      position={['first', 'last']}>
                      {children}
                    </ListItemCollapsible>
                  )}>
                  <>
                    {mapToArray(round.courts).map((court, c) => {
                      // Skip round/court that has bye players.
                      const byeIndex = flattenPlayers(court.teams).findIndex(
                        p => p.firstName === '(Bye)',
                      );
                      if (byeIndex >= 0) return null;
                      return (
                        <View key={`court-${c + 1}`}>
                          <ScoreboardMatchView
                            sportEvent={sportEvent}
                            match={
                              matches.filter(
                                m => m.roundNumber === r && m.courtNumber === c,
                              )?.[0]
                            }
                            round={r}
                            court={c}
                            showActions
                            onPressMatchAction={() =>
                              navigation.navigate('MatchScoring', {
                                sportEventId,
                                round: r,
                                court: c,
                              })
                            }
                          />
                        </View>
                      );
                    })}
                  </>
                </ConditionalWrapper>
                <Divider />
              </View>
            );
          })
        : null}
      <Divider />
    </ScrollView>
  );
};

export default SportEventStartScreen;
