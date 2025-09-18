import React, { useContext, useMemo } from 'react';
import { Alert, StyleProp, Text, View, ViewStyle } from 'react-native';

import {
  Divider,
  Input,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { updateDocument, useDocument } from 'firebase/firestore';
import {
  PlayerPosition,
  PlayerSwapContext,
  decodeSportEvent,
  encodeSportEvent,
} from 'lib/sportEvent';
import lodash from 'lodash';
import { Player } from 'types/player';
import {
  MatchGender,
  MatchType,
  SportEventEncoded,
  TeamName,
} from 'types/sportEvent';

export interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  r: number;
  roundLabel?: boolean;
  showScores?: boolean;
  sportEventId: string;
}

const ScheduleRoundView = (props: Props) => {
  const {
    containerStyle,
    r,
    roundLabel = true,
    showScores,
    sportEventId,
  } = props;

  const theme = useTheme();
  const s = useStyles();

  const { doc: sportEventEncoded } = useDocument<SportEventEncoded>(
    'SportEvents',
    sportEventId,
  );

  const sportEvent = useMemo(
    () => decodeSportEvent(sportEventEncoded),
    [sportEventEncoded],
  );

  const schedule = sportEvent?.schedule
    ? Object.assign({}, sportEvent.schedule)
    : undefined;

  // Player swap first selection.
  // Not all users of this component may require the swap player swap feature.
  // If not then this context won't be used (no provider is wrapping the use of
  // this component).
  const { swapSelection, setSwapSelection } = useContext(PlayerSwapContext);

  const numberOfScores =
    sportEvent?.gender === MatchGender.Mens
      ? new Array(5).fill('') // 5 set match
      : new Array(3).fill(''); // 3 set match

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

        updateDocument<SportEventEncoded>(
          'SportEvents',
          encodeSportEvent({
            ...sportEvent,
            schedule: {
              ...sportEvent.schedule!,
            },
          }),
        );
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

  const updateScore = (
    r: number,
    c: number,
    set: number,
    team: TeamName,
    value: number,
  ) => {
    const updated = [...(sportEvent.schedule?.scores || [])];
    updated[r] = updated[r] || [];
    updated[r][c] = updated[r][c] || [];
    updated[r][c][set] = (updated[r][c][set] || []) as number[];
    updated[r][c][set][team] = (updated[r][c][set][team] || []) as TeamName;
    updated[r][c][set][team] = value;

    updateDocument<SportEventEncoded>(
      'SportEvents',
      encodeSportEvent({
        ...sportEvent,
        schedule: {
          ...sportEvent.schedule!,
          scores: updated,
        },
      }),
    );
  };

  const isWin = (team: TeamName, scores?: number[]) => {
    if (!scores) return false;

    // Must win by 2 or in a tie breaker (7-6).
    if (
      team === TeamName.Home &&
      ((scores[TeamName.Home] > 5 &&
        scores[TeamName.Home] - scores[TeamName.Away] >= 2) ||
        scores[TeamName.Home] === 7)
    ) {
      return true;
    }
    if (
      team === TeamName.Away &&
      ((scores[TeamName.Away] > 5 &&
        scores[TeamName.Away] - scores[TeamName.Home] >= 2) ||
        scores[TeamName.Away] === 7)
    ) {
      return true;
    }
    return false;
  };

  const renderCourt = (r: number, c: number, court: Player[][]) => {
    return (
      <View key={`court-${c + 1}]`}>
        <ListItem
          position={['first', 'last']}
          containerStyle={s.courtItem}
          headerContent={
            <View style={s.header}>
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
                      lodash.isEqual(swapSelection, { r, c, t: 0, p: 0 })
                        ? s.playerSelected
                        : {},
                    ]}
                    onPress={() => setSwap({ r, c, t: 0, p: 0 })}>
                    {`${court[0][0].firstName} ${court[0][0].lastName}` ||
                      'bye'}
                  </Text>
                  {sportEvent.typeOfMatch === MatchType.Doubles ? (
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
                  {sportEvent.typeOfMatch === MatchType.Doubles ? (
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
          footerContent={showScores ? renderScores(r, c) : <></>}
        />
        {c === schedule!.numberOfCourtsUsed - 1 ? null : <Divider />}
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

  // Scores - Rounds, court, set, team
  const renderScores = (r: number, c: number) => {
    return (
      <View style={s.scoresContainer}>
        {/* Home */}
        <View style={s.scoresRow}>
          {numberOfScores.map((_set, set) => (
            <Input
              key={`${set}`}
              caretHidden
              selectTextOnFocus
              selectionColor={theme.colors.brandSecondary}
              inputStyle={{
                ...s.scoreInput,
                ...(isWin(TeamName.Home, schedule?.scores[r]?.[c]?.[set])
                  ? {
                      backgroundColor: theme.colors.brandSecondary,
                      color: theme.colors.stickyWhite,
                    }
                  : {}),
              }}
              value={(
                schedule?.scores[r]?.[c]?.[set]?.[TeamName.Home] || 0
              ).toFixed(0)}
              onChangeText={value =>
                updateScore(r, c, set, TeamName.Home, parseInt(value))
              }
            />
          ))}
        </View>
        {/* Away */}
        <View style={s.scoresRow}>
          {numberOfScores.map((_set, set) => (
            <Input
              key={`${set}`}
              caretHidden
              selectTextOnFocus
              selectionColor={theme.colors.brandSecondary}
              inputStyle={{
                ...s.scoreInput,
                ...(isWin(TeamName.Away, schedule?.scores[r]?.[c]?.[set])
                  ? {
                      backgroundColor: theme.colors.brandSecondary,
                      color: theme.colors.stickyWhite,
                    }
                  : {}),
              }}
              value={(
                schedule?.scores[r]?.[c]?.[set]?.[TeamName.Away] || 0
              ).toFixed(0)}
              onChangeText={value =>
                updateScore(r, c, set, TeamName.Away, parseInt(value))
              }
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[s.roundContainer, containerStyle]}>
      {roundLabel ? (
        <Divider text={`ROUND ${r + 1}`} subHeaderStyle={s.roundLabel} />
      ) : (
        <View style={s.noRoundLabel} />
      )}
      {schedule?.allRounds[r].map((court, c) =>
        // Courts with bye placeholders are not playable matches. Render court for
        // playable matches with the list of bye players.
        court.flat().findIndex(p => p.firstName === '(Bye)') >= 0
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
    alignItems: 'center',
    width: '100%',
    paddingVertical: 5,
  },
  courtItem: {
    borderColor: theme.colors.lightGray,
    borderWidth: 1,
  },
  courtLabel: {
    ...theme.text.normal,
    backgroundColor: theme.colors.listItem,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
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
  scoreInput: {
    ...theme.text.h2,
    width: 30,
    height: 30,
    paddingHorizontal: 0,
    paddingVertical: 0,
    margin: 0,
    lineHeight: 0,
    textAlign: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.colors.brandSecondary,
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
  },
  scoresRow: {
    flexDirection: 'row',
    marginBottom: 10,
    flex: 1,
    justifyContent: 'space-evenly',
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
