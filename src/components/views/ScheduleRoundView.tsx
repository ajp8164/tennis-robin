import React, { useEffect, useState } from 'react';
import { Alert, StyleProp, Text, View, ViewStyle } from 'react-native';

import { documentId } from '@react-native-firebase/firestore';
import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  ListItem,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { EnumPickerResult, EnumPickerValue } from 'components/EnumPickerScreen';
import { getDocuments, useCollection } from 'firebase/firestore';
import { flattenPlayers, usePlayerStatusDecoration } from 'lib/player';
import { PlayerSwapPosition, schedulers } from 'lib/sportEvent';
import { useSportEventStore } from 'lib/sportEvent/useSportEventStore';
import { useSelectedTeam } from 'lib/team';
import { mapToArray } from 'lib/utils';
import lodash from 'lodash';
import { MultipleNavigatorParamList } from 'types/navigation';
import { Player } from 'types/player';
import { Court, Round, ScoreKeeper } from 'types/sportEvent';

export interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  round: Round;
}

const ScheduleRoundView = (props: Props) => {
  const { containerStyle, round } = props;

  const theme = useTheme();
  const s = useStyles();

  const event = useEvent();
  const navigation: NavigationProp<MultipleNavigatorParamList> =
    useNavigation();

  const {
    playerSwapPosition,
    sportEvent,
    updateScoreKeeper,
    updatePlayerSwapPosition,
    updateScheduleRounds,
  } = useSportEventStore();

  const schedule = sportEvent.schedule
    ? Object.assign({}, sportEvent.schedule)
    : undefined;

  const scheduler = schedulers.find(s => s.id === schedule?.schedulerId);
  const isRound = scheduler?.eventFormat === 'Round Robin';
  const { doc: selectedTeam } = useSelectedTeam();

  // For building the player picker enum.
  // Show all players on the selected team.
  const [playersEnum, setPlayersEnum] = useState<EnumPickerValue[]>([]);
  const playerStatusDecoration = usePlayerStatusDecoration();

  const { docs: allPlayers } = useCollection<Player>('Players', {
    where: [
      {
        fieldPath: documentId(),
        opStr: 'in',
        value: selectedTeam?.players || [],
      },
    ],
    orderBy: [
      { fieldPath: 'lastName', directionStr: 'asc' },
      { fieldPath: 'firstName', directionStr: 'asc' },
    ],
  });

  // Create an enumeration of players for selection into the sportEvent.
  useEffect(() => {
    const teamMembersEnum = allPlayers
      .filter(p => p.user)
      .map<EnumPickerValue>(p => {
        return {
          id: p.id!,
          title: `${p.firstName} ${p.lastName}`,
          subtitle: playerStatusDecoration[p.status].label,
          leftIcon: {
            icon: playerStatusDecoration[p.status].icon,
            color: playerStatusDecoration[p.status].color,
          },
        };
      });

    setPlayersEnum(teamMembersEnum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlayers]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on(`change-score-keeper-${round.number}`, onChangeScoreKeeper);

    return () => {
      event.removeListener(
        `change-score-keeper-${round.number}`,
        onChangeScoreKeeper,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeScoreKeeper = async (result: EnumPickerResult) => {
    const { result: players } = await getDocuments<Player>('Players', {
      where: [{ fieldPath: documentId(), opStr: 'in', value: result.value }],
    });

    if (players[0] && players[0].id) {
      const scoreKeeper: ScoreKeeper = {
        name: `${players[0].firstName} ${players[0].lastName}`,
        playerId: players[0].id,
      };

      const round = result.extraData.round as Round;
      const court = result.extraData.court as Court;

      if (court.scoreKeeper?.playerId !== scoreKeeper.playerId) {
        updateScoreKeeper(scoreKeeper, round, court);
      }
    }
  };

  const setSwap = (position: PlayerSwapPosition) => {
    if (!playerSwapPosition) {
      // Set the first selected player.
      const player: Player =
        schedule!.rounds[position.r].courts[position.c].teams[position.t]
          .players[position.p];

      // May not have players if no player assignment was made.
      if (!player) return;

      updatePlayerSwapPosition(position);
    } else {
      // Get path in rounds to each player.
      const player1Path = `[${playerSwapPosition.r}].courts[${playerSwapPosition.c}].teams[${playerSwapPosition.t}].players[${playerSwapPosition.p}]`;
      const player2Path = `[${position.r}].courts[${position.c}].teams[${position.t}].players[${position.p}]`;

      // Get each player at their round path.
      const player1: Player = lodash.get(
        schedule?.rounds,
        player1Path,
      ) as unknown as Player;

      const player2: Player = lodash.get(
        schedule?.rounds,
        player2Path,
      ) as unknown as Player;

      // May not have players if no player assignment was made.
      // Make sure both players are set.
      if (!player1 || !player2) {
        // Clear swap selection.
        updatePlayerSwapPosition(undefined);
        return;
      }

      // Check validity of the requested assignments.
      // No player may be present in a round more than once.
      const player1Court = `rounds[${playerSwapPosition.r}].courts[${playerSwapPosition.c}]`;
      const player2Court = `rounds[${position.r}].courts[${position.c}]`;

      const player1RoundPlayers: Player[] = flattenPlayers(
        lodash.get(schedule!, `${player1Court}.teams`)!,
      );

      const player2RoundPlayers: Player[] = flattenPlayers(
        lodash.get(schedule!, `${player2Court}.teams`)!,
      );

      const p1Index = player2RoundPlayers.findIndex(p => p.id === player1.id);
      const p2Index = player1RoundPlayers.findIndex(p => p.id === player2.id);

      if (
        player1Court === player2Court ||
        (player1Court !== player2Court && p1Index < 0 && p2Index < 0)
      ) {
        // Set each player to the others value.
        const swapped = lodash.cloneDeep(sportEvent.schedule?.rounds || {});
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

  const onPressScoreKeeper = (round: Round, court: Court) => {
    const selected = court.scoreKeeper?.playerId;
    navigation.navigate('EnumPicker', {
      title: 'Score Keeper',
      values: playersEnum,
      selected: selected ? [selected] : [],
      extraData: { round, court },
      itemPlural: 'Team Members',
      eventName: `change-score-keeper-${round.number}`,
      mode: 'one',
      closeOnSelect: true,
    });
  };

  const renderCourt = (round: Round, court: Court) => {
    const r = round.number!;
    const c = court.number!;
    return (
      <View key={`court-${c + 1}]`}>
        <ListItem
          position={['first', 'last']}
          containerStyle={s.courtItem}
          headerContent={
            <View style={s.courtHeader}>
              <Text style={s.team1Team2}>{'Team 1'}</Text>
              <Text style={s.courtLabel}>{`Court ${c + 1}`}</Text>
              <Text style={s.team1Team2}>{'Team 2'}</Text>
            </View>
          }
          footerContent={renderScoreKeeper(round, court)}
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
                      lodash.isEqual(playerSwapPosition, {
                        r,
                        c,
                        t: 0,
                        p: 0,
                      })
                        ? s.playerSelected
                        : {},
                    ]}
                    onPress={() => setSwap({ r, c, t: 0, p: 0 })}>
                    {court.teams['0'].players['0']?.firstName
                      ? `${court.teams['0'].players['0']?.firstName} ${court.teams['0'].players['0']?.lastName}`
                      : 'Player 1'}
                  </Text>
                  {scheduler?.typeOfMatch === 'Doubles' ? (
                    <Text
                      style={[
                        s.player,
                        lodash.isEqual(playerSwapPosition, {
                          r,
                          c,
                          t: 0,
                          p: 1,
                        })
                          ? s.playerSelected
                          : {},
                      ]}
                      onPress={() => setSwap({ r, c, t: 0, p: 1 })}>
                      {court.teams['0'].players['1']?.firstName
                        ? `${court.teams['0'].players['1']?.firstName} ${court.teams['0'].players['1']?.lastName}`
                        : 'Player 2'}
                    </Text>
                  ) : null}
                </View>
                {/* Team 2 players */}
                <View style={s.team2}>
                  <Text
                    style={[
                      s.player,
                      lodash.isEqual(playerSwapPosition, {
                        r,
                        c,
                        t: 1,
                        p: 0,
                      })
                        ? s.playerSelected
                        : {},
                    ]}
                    onPress={() => setSwap({ r, c, t: 1, p: 0 })}>
                    {court.teams['1'].players['0']
                      ? `${court.teams['1'].players['0']?.firstName} ${court.teams['1'].players['0']?.lastName}`
                      : scheduler?.typeOfMatch === 'Singles'
                        ? 'Player 2'
                        : 'Player 3'}
                  </Text>
                  {scheduler?.typeOfMatch === 'Doubles' ? (
                    <Text
                      style={[
                        s.player,
                        lodash.isEqual(playerSwapPosition, {
                          r,
                          c,
                          t: 1,
                          p: 1,
                        })
                          ? s.playerSelected
                          : {},
                      ]}
                      onPress={() => setSwap({ r, c, t: 1, p: 1 })}>
                      {court.teams['1'].players['1']
                        ? `${court.teams['1'].players['1']?.firstName} ${court.teams['1'].players['1']?.lastName}`
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

  const renderByes = (round: Round, court: Court) => {
    // Return real bye players for the specified round (r) and court (c).
    // A bye player is a player not having the bye-placeholder in their name.
    const r = round.number!;
    const c = court.number!;
    return (
      <View key={`byes-${court.number! + 1}]`} style={s.byesContainer}>
        <Text style={{ ...theme.text.medium }}>{'Byes'}</Text>
        <View style={s.byes}>
          {mapToArray(court.teams).map((team, t) => {
            return mapToArray(team).map((players, p) => {
              return mapToArray(players).map(player => {
                if (player.firstName !== '(Bye)') {
                  return (
                    <Text
                      key={`bye-player-${court.number! + 1}]`}
                      style={[
                        s.player,
                        s.byePlayer,
                        lodash.isEqual(playerSwapPosition, { r, c, t, p })
                          ? s.playerSelected
                          : {},
                      ]}
                      onPress={() => setSwap({ r, c, t, p })}>
                      {`${player.firstName} ${player.lastName}`}
                    </Text>
                  );
                } else {
                  null;
                }
              });
            });
          })}
        </View>
      </View>
    );
  };

  const renderScoreKeeper = (round: Round, court: Court) => {
    return (
      <View style={s.scoreKeeperContainer}>
        <Text
          style={[s.scoreKeeper]}
          onPress={() => onPressScoreKeeper(round, court)}>
          {`${court.scoreKeeper?.name || 'Unassigned'}`}
        </Text>
      </View>
    );
  };

  return (
    <View style={[s.roundContainer, containerStyle]}>
      {isRound ? (
        <Divider
          text={`ROUND ${round.number! + 1}`}
          subHeaderStyle={s.roundLabel}
        />
      ) : (
        <View style={s.noRoundLabel} />
      )}
      {mapToArray(round.courts).map((court, c) => {
        // Courts with bye placeholders are not playable matches. Render court for
        // playable matches with the list of bye players.
        return flattenPlayers(court.teams).findIndex(
          p => p?.firstName === '(Bye)',
        ) >= 0
          ? renderByes(round, { ...court, number: c })
          : renderCourt(round, { ...court, number: c });
      })}
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
  team1Team2: {
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
  scoreKeeper: {
    ...theme.text.medium,
    color: theme.colors.midGray,
    borderWidth: 1,
    borderRadius: theme.radius.S,
    paddingHorizontal: 5,
    paddingVertical: 3,
    fontWeight: '700',
    marginRight: 10,
    marginLeft: 5,
    borderColor: theme.colors.brandSecondary,
  },
  scoreKeeperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 5,
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
