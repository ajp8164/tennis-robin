import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { documentId } from '@react-native-firebase/firestore';
import {
  Divider,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCollection, useDocument } from 'firebase/firestore';
import { uniquePartnerDoubles } from 'lib/tournamentAlgorithms';
import lodash from 'lodash';
import { TournamentsNavigatorParamList } from 'types/navigation';
import { Player } from 'types/player';
import { Schedule, Tournament } from 'types/tournament';

export type Props = NativeStackScreenProps<
  TournamentsNavigatorParamList,
  'TournamentSchedule'
>;

const TournamentScheduleScreen = ({ route }: Props) => {
  const { tournamentId } = route.params || {};

  const theme = useTheme();
  const s = useStyles();

  const { doc: tournament } = useDocument<Tournament>(
    'Tournaments',
    tournamentId,
  );
  const [schedule, setSchedule] = useState<Schedule>();

  const { docs: players } = useCollection<Player>('Players', {
    where: [
      {
        fieldPath: documentId(),
        opStr: 'in',
        value: tournament?.players || [],
      },
    ],
  });

  useEffect(() => {
    if (!tournament) return;
    try {
      const schedule = uniquePartnerDoubles(players, tournament.numberOfCourts);
      setSchedule(schedule);
      console.log(schedule);
    } catch (e) {
      console.log(e);
    }
  }, [players, tournament]);

  const [swapSelect, setSwapSelect] = useState<PlayerPosition>();

  type PlayerPosition = {
    r: number;
    c: number;
    t: number;
    p: number;
  };

  const setSwap = (position: PlayerPosition) => {
    if (!swapSelect) {
      setSwapSelect(position);
    } else {
      // Swap players

      const position1 = `[${swapSelect.r}][${swapSelect.c}].team${swapSelect.t}.player${swapSelect.p}`;
      const position2 = `[${position.r}][${position.c}].team${position.t}.player${position.p}`;

      console.log(lodash.get(schedule?.rounds, position1));
      console.log(lodash.get(schedule?.rounds, position2));

      const p1 = lodash.get(schedule?.rounds, position1);
      const p2 = lodash.get(schedule?.rounds, position2);

      lodash.set(schedule!.rounds, position1, p2);
      lodash.set(schedule!.rounds, position2, p1);
      // Clear swap select
      setSwapSelect(undefined);
    }
  };

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      {schedule?.rounds.map((round, r) => (
        <View key={`round-${r + 1}`}>
          <Divider text={`ROUND ${r + 1}`} />
          {round.map((court, c) => (
            <View key={`court-${c + 1}]`}>
              <ListItem
                position={['first', 'last']}
                mainContent={
                  <View style={s.courtContainer}>
                    {/* Top */}
                    {/* Court label */}
                    <View style={s.courtHeader}>
                      <Text style={s.courtLabel}>{`Court ${c + 1}`}</Text>
                    </View>
                    {/* Bottom */}
                    <View style={s.court}>
                      {/* Net vs */}
                      <View style={s.net} />
                      <View style={s.vsContainer}>
                        <Text style={s.vs}>{'vs'}</Text>
                      </View>
                      {/* Team 1 players */}
                      <View style={s.team1}>
                        <Text
                          style={[
                            s.player,
                            lodash.isEqual(swapSelect, { r, c, t: 1, p: 1 })
                              ? s.playerSelected
                              : {},
                          ]}
                          onPress={() => setSwap({ r, c, t: 1, p: 1 })}>
                          {`${court.team1.player1.firstName} ${court.team1.player1.lastName}` ||
                            'bye'}
                        </Text>
                        <Text
                          style={[
                            s.player,
                            lodash.isEqual(swapSelect, { r, c, t: 1, p: 2 })
                              ? s.playerSelected
                              : {},
                          ]}
                          onPress={() => setSwap({ r, c, t: 1, p: 2 })}>
                          {`${court.team1.player2.firstName} ${court.team1.player2.lastName}` ||
                            'bye'}
                        </Text>
                      </View>
                      {/* Team 2 players */}
                      <View style={s.team2}>
                        <Text
                          style={[
                            s.player,
                            lodash.isEqual(swapSelect, { r, c, t: 2, p: 1 })
                              ? s.playerSelected
                              : {},
                          ]}
                          onPress={() => setSwap({ r, c, t: 2, p: 1 })}>
                          {`${court.team2.player1.firstName} ${court.team2.player1.lastName}` ||
                            'bye'}
                        </Text>
                        <Text
                          style={[
                            s.player,
                            lodash.isEqual(swapSelect, { r, c, t: 2, p: 2 })
                              ? s.playerSelected
                              : {},
                          ]}
                          onPress={() => setSwap({ r, c, t: 2, p: 2 })}>
                          {`${court.team2.player2.firstName} ${court.team2.player2.lastName}` ||
                            'bye'}
                        </Text>
                      </View>
                    </View>
                  </View>
                }
                mainContentStyle={s.mainContainer}
              />
              {c === schedule.numberOfCourts - 1 ? null : <Divider />}
            </View>
          ))}
        </View>
      ))}
      <Divider />
    </ScrollView>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  court: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    flex: 1,
  },
  courtContainer: {
    flex: 1,
  },
  courtHeader: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 5,
  },
  courtLabel: {
    ...theme.text.normal,
    fontWeight: '500',
    backgroundColor: theme.colors.listItem,
  },
  mainContainer: {
    justifyContent: 'center',
    height: 110,
    paddingVertical: 5,
  },
  net: {
    position: 'absolute',
    left: '50%',
    height: '100%',
    borderWidth: 1,
    borderColor: theme.colors.brandSecondary,
  },
  player: {
    ...theme.text.medium,
    borderWidth: 1,
    borderColor: theme.colors.subtleGray,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  playerSelected: {
    backgroundColor: theme.colors.brandSecondary,
    borderColor: theme.colors.brandSecondary,
    color: theme.colors.stickyWhite,
  },
  team1: {
    justifyContent: 'space-around',
  },
  team2: {
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  vs: {
    ...theme.text.medium,
    fontWeight: '500',
    backgroundColor: theme.colors.listItem,
    paddingVertical: 3,
  },
  vsContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
}));

export default TournamentScheduleScreen;
