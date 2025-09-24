import React from 'react';
import { Alert, StyleProp, Text, View, ViewStyle } from 'react-native';

import {
  Divider,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import {
  PlayerSwapPosition,
  schedulers,
  useSportEventStore,
} from 'lib/sportEvent';
import lodash from 'lodash';
import { Player } from 'types/player';

export interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  r: number;
}

const ScheduleRoundView = (props: Props) => {
  const { containerStyle, r } = props;

  const theme = useTheme();
  const s = useStyles();
  const {
    playerSwapPosition,
    sportEvent,
    updatePlayerSwapPosition,
    updateScheduleRounds,
  } = useSportEventStore();

  const schedule = sportEvent.schedule
    ? Object.assign({}, sportEvent.schedule)
    : undefined;

  const scheduler = schedulers.find(s => s.id === schedule?.schedulerId);
  const isRound = scheduler?.eventFormat === 'Round Robin';

  // Player swap first selection.
  // Not all users of this component may require the swap player swap feature.
  // If not then this context won't be used (no provider is wrapping the use of
  // this component).

  const setSwap = (position: PlayerSwapPosition) => {
    if (!playerSwapPosition) {
      const playerPath = `[${position.r}][${position.c}][${position.t}][${position.p}]`;
      const player: Player = lodash.get(schedule?.rounds, playerPath);

      // May not have players if no player assignment was made.
      if (!player) return;

      updatePlayerSwapPosition(position);
    } else {
      // Get path in rounds to each player.
      const player1Path = `[${playerSwapPosition.r}][${playerSwapPosition.c}][${playerSwapPosition.t}][${playerSwapPosition.p}]`;
      const player2Path = `[${position.r}][${position.c}][${position.t}][${position.p}]`;

      // Get each player at their round path.
      const player1: Player = lodash.get(schedule?.rounds, player1Path);
      const player2: Player = lodash.get(schedule?.rounds, player2Path);

      // May not have players if no player assignment was made.
      // Make sure both players are set.
      if (!player1 || !player2) {
        // Clear swap selection.
        updatePlayerSwapPosition(undefined);
        return;
      }

      // Check validity of the requested assignments.
      // No player may be present in a round more than once.
      const player1RoundPath = `[${playerSwapPosition.r}]`;
      const player2RoundPath = `[${position.r}]`;

      const player1RoundPlayers: Player[] = lodash
        .get(schedule!.rounds, player1RoundPath)
        .flat(Infinity);
      const player2RoundPlayers: Player[] = lodash
        .get(schedule!.rounds, player2RoundPath)
        .flat(Infinity);

      const p1Index = player2RoundPlayers.findIndex(p => p.id === player1.id);
      const p2Index = player1RoundPlayers.findIndex(p => p.id === player2.id);

      if (
        player1RoundPath === player2RoundPath ||
        (player1RoundPath !== player2RoundPath && p1Index < 0 && p2Index < 0)
      ) {
        // Set each player to the others value.
        const swapped = lodash.cloneDeep(sportEvent.schedule?.rounds || []);
        lodash.set(swapped, player1Path, player2);
        lodash.set(swapped, player2Path, player1);

        updateScheduleRounds(swapped);
      } else {
        Alert.alert(
          'Illegal Assignment',
          'A player may not exist in a round more than once. Please check your assignment and try again.',
          [{ text: 'OK' }],
          { cancelable: false },
        );
      }

      // Clear swap selection.
      updatePlayerSwapPosition(undefined);
    }
  };

  // const updateScore = (
  //   r: number,
  //   c: number,
  //   set: number,
  //   team: number,
  //   value: number,
  // ) => {
  //   const updated = [...(sportEvent.schedule?.scores || [])];
  //   updated[r] = updated[r] || [];
  //   updated[r][c] = updated[r][c] || [];
  //   updated[r][c][set] = (updated[r][c][set] || []) as number[];
  //   updated[r][c][set][team] = value;

  //   updateDocument<SportEventEncoded>(
  //     'SportEvents',
  //     encodeSportEvent({
  //       ...sportEvent,
  //       schedule: {
  //         ...sportEvent.schedule!,
  //         scores: updated,
  //       },
  //     }),
  //   );
  // };

  // const isWin = (team: number, scores?: number[]) => {
  //   if (!scores) return false;

  //   const home = TeamSides.indexOf('Home');
  //   const away = TeamSides.indexOf('Away');

  //   // Must win by 2 or in a tie breaker (7-6).
  //   if (
  //     team === home &&
  //     ((scores[home] > 5 && scores[home] - scores[away] >= 2) ||
  //       scores[home] === 7)
  //   ) {
  //     return true;
  //   }
  //   if (
  //     team === away &&
  //     ((scores[away] > 5 && scores[away] - scores[home] >= 2) ||
  //       scores[away] === 7)
  //   ) {
  //     return true;
  //   }
  //   return false;
  // };

  const renderCourt = (r: number, c: number, court: Player[][]) => {
    // Argument court is teams on court [team-index 0-1][player-index 0-1]
    return (
      <View key={`court-${c + 1}]`}>
        <ListItem
          position={['first', 'last']}
          containerStyle={s.courtItem}
          headerContent={
            <View style={s.courtHeader}>
              <Text style={s.homeAway}>{'Home'}</Text>
              <Text style={s.courtLabel}>{`Court ${c + 1}`}</Text>
              <Text style={s.homeAway}>{'Away'}</Text>
            </View>
          }
          mainContent={
            <View style={s.courtContainer}>
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
                      lodash.isEqual(playerSwapPosition, { r, c, t: 0, p: 0 })
                        ? s.playerSelected
                        : {},
                    ]}
                    onPress={() => setSwap({ r, c, t: 0, p: 0 })}>
                    {court?.[0]?.[0]
                      ? `${court[0][0].firstName} ${court[0][0].lastName}`
                      : 'Player 1'}
                  </Text>
                  {scheduler?.typeOfMatch === 'Doubles' ? (
                    <Text
                      style={[
                        s.player,
                        lodash.isEqual(playerSwapPosition, { r, c, t: 0, p: 1 })
                          ? s.playerSelected
                          : {},
                      ]}
                      onPress={() => setSwap({ r, c, t: 0, p: 1 })}>
                      {court?.[0]?.[1]
                        ? `${court[0][1].firstName} ${court[0][1].lastName}`
                        : 'Player 2'}
                    </Text>
                  ) : null}
                </View>
                {/* Team 2 players */}
                <View style={s.team2}>
                  <Text
                    style={[
                      s.player,
                      lodash.isEqual(playerSwapPosition, { r, c, t: 1, p: 0 })
                        ? s.playerSelected
                        : {},
                    ]}
                    onPress={() => setSwap({ r, c, t: 1, p: 0 })}>
                    {court?.[1]?.[0]
                      ? `${court[1][0].firstName} ${court[1][0].lastName}`
                      : scheduler?.typeOfMatch === 'Singles'
                        ? 'Player 2'
                        : 'Player 3'}
                  </Text>
                  {scheduler?.typeOfMatch === 'Doubles' ? (
                    <Text
                      style={[
                        s.player,
                        lodash.isEqual(playerSwapPosition, { r, c, t: 1, p: 1 })
                          ? s.playerSelected
                          : {},
                      ]}
                      onPress={() => setSwap({ r, c, t: 1, p: 1 })}>
                      {court?.[1]?.[1]
                        ? `${court[1][1].firstName} ${court[1][1].lastName}`
                        : 'Player 4'}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          }
          mainContentStyle={s.mainContainer}
        />
        {c === schedule!.numberOfCourtsUsed - 1 ? null : <Divider />}
      </View>
    );
  };

  const renderByes = (r: number, c: number, court: Player[][]) => {
    // Return real bye players for the specified round (r) and court (c).
    // A bye player is a player not having the bye-placeholder in their name.
    return (
      <View key={`byes-${c + 1}]`} style={s.byesContainer}>
        <Text style={{ ...theme.text.medium }}>{'Byes'}</Text>
        <View style={s.byes}>
          {court.map((team, t) => {
            return team.map((_player, p) => {
              if (court[t][p].firstName !== '(Bye)') {
                return (
                  <Text
                    key={`bye-player-${c + 1}]`}
                    style={[
                      s.player,
                      s.byePlayer,
                      lodash.isEqual(playerSwapPosition, { r, c, t, p })
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

  return (
    <View style={[s.roundContainer, containerStyle]}>
      {isRound ? (
        <Divider text={`ROUND ${r + 1}`} subHeaderStyle={s.roundLabel} />
      ) : (
        <View style={s.noRoundLabel} />
      )}
      {schedule?.rounds[r].map((court, c) =>
        // Courts with bye placeholders are not playable matches. Render court for
        // playable matches with the list of bye players.
        court.flat().findIndex(p => p?.firstName === '(Bye)') >= 0
          ? renderByes(r, c, court)
          : renderCourt(r, c, court),
      )}
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  courtItem: {
    borderColor: theme.colors.lightGray,
    borderWidth: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  courtLabel: {
    ...theme.text.normal,
    backgroundColor: theme.colors.listItem,
  },
  homeAway: {
    ...theme.text.small,
    color: theme.colors.lightGray,
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
  noRoundLabel: {
    height: 10,
  },
  player: {
    ...theme.text.medium,
    borderWidth: 1,
    borderColor: theme.colors.subtleGray,
    borderRadius: theme.radius.S,
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

export default ScheduleRoundView;
