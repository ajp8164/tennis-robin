import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

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

type PlayerPosition = {
  r: number; // round
  c: number; // court
  t: number; // team
  p: number; // player
};

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
  const [swapSelection, setSwapSelection] = useState<PlayerPosition>();

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

  const setSwap = (position: PlayerPosition) => {
    if (!swapSelection) {
      setSwapSelection(position);
    } else {
      // Get path in rounds to each player.
      const player1Path = `[${swapSelection.r}][${swapSelection.c}][${swapSelection.t}][${swapSelection.p}]`;
      const player2Path = `[${position.r}][${position.c}][${position.t}][${position.p}]`;

      // Get each player at their round path.
      const player1: Player = lodash.get(schedule?.allRounds, player1Path);
      const player2: Player = lodash.get(schedule?.allRounds, player2Path);

      // Check validity of the requested assignments.
      // No player may be present in a round more than once.
      const player1RoundPath = `[${swapSelection.r}]`;
      const player2RoundPath = `[${position.r}]`;

      const player1RoundPlayers: Player[] = lodash
        .get(schedule!.allRounds, player1RoundPath)
        .flat(Infinity);
      const player2RoundPlayers: Player[] = lodash
        .get(schedule!.allRounds, player2RoundPath)
        .flat(Infinity);

      const p1Index = player2RoundPlayers.findIndex(p => p.id === player1.id);
      const p2Index = player1RoundPlayers.findIndex(p => p.id === player2.id);

      if (
        player1RoundPath === player2RoundPath ||
        (player1RoundPath !== player2RoundPath && p1Index < 0 && p2Index < 0)
      ) {
        // Set each player to the others value.
        lodash.set(schedule!.allRounds, player1Path, player2);
        lodash.set(schedule!.allRounds, player2Path, player1);
      } else {
        Alert.alert(
          'Illegal Assignment',
          'A player may not exist in a round more than once. Please check your assignment and try again.',
          [{ text: 'OK' }],
          { cancelable: false },
        );
      }

      // Clear swap selection.
      setSwapSelection(undefined);
    }
  };

  const renderCourt = (r: number, c: number, court: Player[][]) => {
    return (
      <View key={`court-${c + 1}]`}>
        <ListItem
          position={['first', 'last']}
          containerStyle={s.courtItem}
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
                      lodash.isEqual(swapSelection, { r, c, t: 0, p: 0 })
                        ? s.playerSelected
                        : {},
                    ]}
                    onPress={() => setSwap({ r, c, t: 0, p: 0 })}>
                    {`${court[0][0].firstName} ${court[0][0].lastName}` ||
                      'bye'}
                  </Text>
                  {schedule?.kind === 'doubles' ? (
                    <Text
                      style={[
                        s.player,
                        lodash.isEqual(swapSelection, { r, c, t: 0, p: 1 })
                          ? s.playerSelected
                          : {},
                      ]}
                      onPress={() => setSwap({ r, c, t: 0, p: 1 })}>
                      {`${court[0][1].firstName} ${court[0][1].lastName}` ||
                        'bye'}
                    </Text>
                  ) : null}
                </View>
                {/* Team 2 players */}
                <View style={s.team2}>
                  <Text
                    style={[
                      s.player,
                      lodash.isEqual(swapSelection, { r, c, t: 1, p: 0 })
                        ? s.playerSelected
                        : {},
                    ]}
                    onPress={() => setSwap({ r, c, t: 1, p: 0 })}>
                    {`${court[1][0].firstName} ${court[1][0].lastName}` ||
                      'bye'}
                  </Text>
                  {schedule?.kind === 'doubles' ? (
                    <Text
                      style={[
                        s.player,
                        lodash.isEqual(swapSelection, { r, c, t: 1, p: 1 })
                          ? s.playerSelected
                          : {},
                      ]}
                      onPress={() => setSwap({ r, c, t: 1, p: 1 })}>
                      {`${court[1][1]?.firstName} ${court[1][1]?.lastName}` ||
                        'bye'}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          }
          mainContentStyle={s.mainContainer}
        />
        {c === schedule!.numberOfCourts - 1 ? null : <Divider />}
      </View>
    );
  };

  const renderByes = (r: number, c: number, court: Player[][]) => {
    // Return real bye players for the specified round (r) and court (c).
    // A bye player is a player not having the bye-placeholder in their name.
    return (
      <View style={s.byesContainer}>
        <Text style={{ ...theme.text.medium }}>{'Byes'}</Text>
        <View style={s.byes}>
          {court.map((team, t) => {
            return team.map((_player, p) => {
              if (court[t][p].firstName !== '(Bye)') {
                return (
                  <Text
                    style={[
                      s.player,
                      s.byePlayer,
                      lodash.isEqual(swapSelection, { r, c, t, p })
                        ? s.playerSelected
                        : {},
                    ]}
                    onPress={() => setSwap({ r, c, t, p })}>
                    {`${court[t][p].firstName} ${court[t][p].lastName}`}
                  </Text>
                );
              } else {
                null;
              }
            });
          })}
        </View>
      </View>
    );
  };

  if (!schedule) return null;

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      {schedule.allRounds.map((round, r) => (
        <View key={`round-${r + 1}`} style={s.roundContainer}>
          <Divider text={`ROUND ${r + 1}`} subHeaderStyle={s.roundLabel} />
          {round.map((court, c) => (
            <>
              {/* Courts with bye placeholders are not playable matches. Render court for 
              playable matches and the list of bye players */}
              {court.flat().findIndex(p => p.firstName === '(Bye)') >= 0
                ? renderByes(r, c, court)
                : renderCourt(r, c, court)}
            </>
          ))}
        </View>
      ))}
      <Divider />
    </ScrollView>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  byes: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  byesContainer: {
    marginTop: 10,
    marginLeft: 10,
  },
  byePlayer: {
    marginRight: 10,
    marginBottom: 10,
    borderColor: theme.colors.brandSecondary,
  },
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
  courtItem: {
    // borderColor: theme.colors.lightGray,
    // borderWidth: 1,
  },
  courtLabel: {
    ...theme.text.normal,
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
    fontWeight: '700',
  },
  playerSelected: {
    backgroundColor: theme.colors.brandSecondary,
    borderColor: theme.colors.brandSecondary,
    color: theme.colors.stickyWhite,
  },
  roundContainer: {
    borderWidth: 1,
    borderColor: theme.colors.brandSecondary,
    backgroundColor: `${theme.colors.brandSecondary}30`,
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderRadius: theme.radius.M,
    marginBottom: 20,
  },
  roundLabel: {
    marginTop: -10,
  },
  team1: {
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  team2: {
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  vs: {
    ...theme.text.medium,
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
