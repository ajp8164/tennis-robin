import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { ThemeManager } from '@react-native-hello/ui';
import { useDocument } from 'firebase/firestore';
import { getMatchState, getSetState } from 'lib/scoring';
import { decodeSportEvent } from 'lib/sportEvent';
import { Player } from 'types/player';
import { SportEventEncoded, TeamSides } from 'types/sportEvent';

const setScoreBoxWidth = 30;

export interface Props {
  sportEventId: string;
  round: number;
  court: number;
}

const ScoreboardMatchView = (props: Props) => {
  const { sportEventId, round, court } = props;

  const s = useStyles();

  const { doc: sportEventEncoded } = useDocument<SportEventEncoded>(
    'SportEvents',
    sportEventId,
  );

  const sportEvent = useMemo(
    () => decodeSportEvent(sportEventEncoded),
    [sportEventEncoded],
  );

  const homeIndex = TeamSides.indexOf('Home');
  const awayIndex = TeamSides.indexOf('Away');

  const r = round;
  const c = court;
  const sets = new Array(sportEvent?.numberOfSets).fill('');

  const playerNames = (players: Player[]) => {
    const player1 = players[0]
      ? `${players[0].lastName} ${players[0].firstName.slice(0, 1)}.`
      : '';
    const player2 = players[1]
      ? `/${players[1].lastName} ${players[1].firstName.slice(0, 1)}.`
      : '';
    return `${player1}${player2}`;
  };

  if (!sportEvent?.schedule) {
    return null;
  }

  const matchState = getMatchState(
    sportEvent.numberOfSets,
    sportEvent.numberOfGamesPerSet,
    sportEvent.schedule?.scores[r]?.[c],
  );

  let matchStateLabel = '';
  let resultLabel = '';
  switch (matchState) {
    case 'not-started':
      matchStateLabel = 'Match Not Started';
      break;
    case 'in-progress':
      matchStateLabel = 'Match In Progress';
      break;
    case 'home-wins':
      matchStateLabel = 'Winner - Team 1';
      break;
    case 'away-wins':
      matchStateLabel = 'Winner - Team 2';
      break;
  }

  return (
    <View style={[s.container]}>
      <View style={s.header}>
        <Text style={s.playStatus}>{matchStateLabel}</Text>
        <Text style={s.playTime}>{'2h 23m'}</Text>
      </View>
      {sportEvent.schedule?.rounds?.[r]?.[c]?.map((team, teamIndex) => (
        <View key={`team-${teamIndex}`} style={s.teamContainer}>
          <View style={[s.playerNamesContainer]}>
            <Text style={s.playerName}>{playerNames(team)}</Text>
          </View>
          <View
            style={[
              s.scoresContainer,
              teamIndex === 0 ? s.team1Scores : s.team2Scores,
              { width: sets.length * setScoreBoxWidth * 1.05 },
            ]}>
            {sets.map((_set, setIndex) => {
              const setState = getSetState(
                sportEvent.numberOfGamesPerSet,
                sportEvent.schedule?.scores[r]?.[c]?.[setIndex],
              );
              if (teamIndex === homeIndex && matchState === 'home-wins') {
                resultLabel = `Congratulations ${playerNames(sportEvent.schedule!.rounds[r][c][teamIndex])}`;
              }
              if (teamIndex === awayIndex && matchState === 'away-wins') {
                resultLabel = `Congratulations ${playerNames(sportEvent.schedule!.rounds[r][c][teamIndex])}`;
              }

              return (
                <Text
                  key={`set-${setIndex}`}
                  style={[
                    s.score,
                    teamIndex === homeIndex && setState === 'home-wins'
                      ? s.scoreWin
                      : s.scoreLose,
                    setState === 'in-progress' ? s.scoreInProgress : {},
                  ]}>
                  {sportEvent.schedule?.scores[r]?.[c]?.[setIndex]?.[
                    teamIndex
                  ] || ''}
                </Text>
              );
            })}
          </View>
        </View>
      ))}
      {resultLabel ? (
        <View style={s.footer}>
          <Text style={s.result}>{resultLabel}</Text>
        </View>
      ) : null}
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    backgroundColor: `${theme.colors.brandSecondary}ff`,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: theme.radius.M,
  },
  footer: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  playStatus: {
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
  },
  playTime: {
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
  },
  playerName: {
    ...theme.text.medium,
    color: theme.colors.stickyWhite,
    fontWeight: '500',
    lineHeight: 22,
  },
  playerNamesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  result: {
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 15,
  },
  score: {
    ...theme.text.xl,
    backgroundColor: theme.colors.blackTransparentMid,
    color: theme.colors.stickyWhite,
    flex: 1,
    textAlign: 'center',
    lineHeight: 30,
    height: setScoreBoxWidth,
  },
  scoreInProgress: {
    backgroundColor: theme.colors.blackTransparentDark,
  },
  scoreLose: {
    fontWeight: '200',
  },
  scoreWin: {
    fontWeight: '500',
  },
  scoresContainer: {
    flexDirection: 'row',
    borderRadius: theme.radius.S,
    overflow: 'hidden',
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  team1Scores: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.blackTransparentLight,
  },
  team2Scores: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
}));

export default ScoreboardMatchView;
