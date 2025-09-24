import React, { useEffect, useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import {
  ConditionalWrapper,
  Divider,
  ListItemCollapsible,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import ScoreboardMatchView from 'components/views/ScoreboardMatchView';
import { useDocument } from 'firebase/firestore';
import { getRoundState } from 'lib/scoring';
import { decodeSportEvent } from 'lib/sportEvent';
import { SportEventsNavigatorParamList } from 'types/navigation';
import { SportEventEncoded } from 'types/sportEvent';

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'SportEventStart'
>;

const SportEventStartScreen = ({ navigation, route }: Props) => {
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

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      {sportEvent?.schedule
        ? sportEvent.schedule.rounds?.map((round, r) => {
            const roundState = getRoundState(sportEvent, round, r);
            return (
              <View key={`round-${r + 1}`}>
                <ConditionalWrapper
                  condition={round.length > 1} // Use the collapsible only if there is more than one round
                  wrapper={children => (
                    <ListItemCollapsible
                      title={`ROUND ${r + 1}`}
                      subtitle={`${roundState.matchCount} matches`}
                      value={roundState.roundStateLabel}
                      initExpanded={false}
                      position={['first', 'last']}>
                      {children}
                    </ListItemCollapsible>
                  )}>
                  <>
                    {round.map((court, c) => {
                      // Skip round/court that has bye players.
                      const byeIndex = court
                        .flat()
                        .findIndex(p => p.firstName === '(Bye)');
                      if (byeIndex >= 0) return null;
                      return (
                        <View key={`court-${c + 1}`}>
                          <Divider
                            text={`Court ${c + 1}`}
                            subHeaderStyle={{
                              ...theme.text.normal,
                              textTransform: 'none',
                            }}
                            rightComponent={
                              <Button
                                title={'Begin Match'}
                                titleStyle={
                                  theme.styles.buttonScreenHeaderTitle
                                }
                                buttonStyle={theme.styles.dividerTextButton}
                                onPress={() =>
                                  navigation.navigate('MatchScoring', {
                                    sportEventId,
                                    round: r,
                                    court: 0,
                                  })
                                }
                              />
                            }
                          />
                          <ScoreboardMatchView
                            sportEventId={sportEventId}
                            round={r}
                            court={c}
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
