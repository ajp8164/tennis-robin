import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Divider, ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
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
  showActions?: boolean;
  onMatchActionPress: () => void;
}

const ScoreboardMatchView = (props: Props) => {
  const {
    sportEventId,
    round: r,
    court: c,
    showActions,
    onMatchActionPress,
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

  const homeIndex = TeamSides.indexOf('Home');
  const awayIndex = TeamSides.indexOf('Away');

  // Set counter
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
  let matchStateAction = '';
  let matchWinnerMessage = '';

  switch (matchState.status) {
    case 'not-started':
      matchStateLabel = 'Match Not Started';
      matchStateAction = 'Begin Match';
      break;
    case 'in-progress':
      matchStateLabel = 'Match In Progress';
      matchStateAction = 'Resume Match';
      break;
    case 'home-wins':
      matchStateLabel = 'Winner - Team 1';
      matchStateAction = 'Ended';
      matchWinnerMessage = `Congratulations ${playerNames(sportEvent.schedule!.rounds[r][c][homeIndex])}`;
      break;
    case 'away-wins':
      matchStateLabel = 'Winner - Team 2';
      matchStateAction = 'Ended';
      matchWinnerMessage = `Congratulations ${playerNames(sportEvent.schedule!.rounds[r][c][awayIndex])}`;
      break;
  }

  const renderHeader = () => {
    return (
      <Divider
        text={`Court ${c + 1}`}
        subHeaderStyle={s.headerText}
        rightComponent={
          matchState.status === 'not-started' ||
          matchState.status === 'in-progress' ? (
            <Button
              title={matchStateAction}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.dividerTextButton}
              onPress={onMatchActionPress}
            />
          ) : (
            <Text style={s.matchStatus}>{matchStateAction}</Text>
          )
        }
      />
    );
  };

  return (
    <>
      {showActions ? renderHeader() : null}
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
                teamIndex === homeIndex ? s.team1Scores : s.team2Scores,
                { width: sets.length * setScoreBoxWidth * 1.05 },
              ]}>
              {sets.map((_set, setIndex) => {
                const setState = getSetState(
                  sportEvent.numberOfGamesPerSet,
                  sportEvent.schedule?.scores[r]?.[c]?.[setIndex],
                );
                return (
                  <Text
                    key={`set-${setIndex}`}
                    style={[
                      s.score,
                      (teamIndex === homeIndex &&
                        setState.status === 'home-wins') ||
                      (teamIndex === awayIndex &&
                        setState.status === 'away-wins')
                        ? s.scoreWin
                        : s.scoreLose,
                      setState.status === 'in-progress'
                        ? s.scoreInProgress
                        : {},
                    ]}>
                    {setState.gameScores[teamIndex]}
                  </Text>
                );
              })}
            </View>
          </View>
        ))}
        {matchWinnerMessage ? (
          <View style={s.footer}>
            <Text style={s.result}>{matchWinnerMessage}</Text>
          </View>
        ) : null}
      </View>
    </>
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
  headerText: {
    ...theme.text.normal,
    textTransform: 'none',
  },
  matchStatus: {
    ...theme.text.normal,
    fontWeight: '500',
    padding: 15,
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
