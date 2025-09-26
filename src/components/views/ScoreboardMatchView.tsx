import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Divider, ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { updateDocument, useDocument } from 'firebase/firestore';
import { formatMatchTime } from 'lib/formatMatchTime';
import { getMatchState, getSetState } from 'lib/scoring';
import { decodeSportEvent, encodeSportEvent } from 'lib/sportEvent';
import lodash from 'lodash';
import { Player } from 'types/player';
import { SportEventEncoded, TeamSides } from 'types/sportEvent';

const setScoreBoxWidth = 30;

export interface Props {
  sportEventId: string;
  round: number;
  court: number;
  showActions?: boolean;
  onPressMatchAction: () => void;
}

const ScoreboardMatchView = (props: Props) => {
  const {
    sportEventId,
    round: r,
    court: c,
    showActions,
    onPressMatchAction,
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

  const team1Index = TeamSides.indexOf('Team1');
  const team2Index = TeamSides.indexOf('Team2');

  // Set counter
  const sets = new Array(sportEvent?.numberOfSetsPerMatch).fill('');

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
    sportEvent.numberOfSetsPerMatch,
    sportEvent.numberOfGamesPerSet,
    sportEvent.schedule?.scores[r]?.[c],
    sportEvent.schedule?.matchDetails[r]?.[c],
  );

  const timer = sportEvent.schedule?.matchDetails[r]?.[c]?.timer;

  let matchStateLabel = '';
  let matchStateAction = '';
  let matchWinnerMessage = '';

  switch (timer?.state || 'initial') {
    case 'initial':
      matchStateLabel = 'Match Not Started';
      matchStateAction = 'Begin Match';
      break;
    case 'running':
      matchStateLabel = 'Match In Progress';
      matchStateAction = '';
      break;
    case 'paused':
      matchStateLabel = 'Match In Progress';
      matchStateAction = 'Resume';
      break;
    case 'ended':
      matchStateLabel = 'Ended';
      matchStateAction = '';

      switch (matchState.status) {
        case 'team1-wins':
          matchStateLabel = 'Winner - Team 1';
          matchStateAction = 'Ended';
          matchWinnerMessage = `Congratulations ${playerNames(sportEvent.schedule!.rounds[r][c][team1Index])}`;
          break;
        case 'team2-wins':
          matchStateLabel = 'Winner - Team 2';
          matchStateAction = 'Ended';
          matchWinnerMessage = `Congratulations ${playerNames(sportEvent.schedule!.rounds[r][c][team2Index])}`;
          break;
      }

      break;
    case 'abandoned':
      matchStateLabel = 'Abandoned';
      matchStateAction = '';
      break;
  }

  const endMatch = () => {
    // Set match timer to final state.
    if (!sportEvent?.schedule) return;

    const updated = lodash.cloneDeep(sportEvent?.schedule?.matchDetails) || [];
    lodash.set(updated, `[${r}][${c}].timer.state`, 'abandoned');

    // Update match timer.
    updateDocument<SportEventEncoded>(
      'SportEvents',
      encodeSportEvent({
        ...sportEvent,
        schedule: {
          ...sportEvent.schedule,
          matchDetails: updated,
        },
      }),
    );
  };

  const renderHeader = () => {
    return (
      <Divider
        text={`Court ${c + 1}`}
        subHeaderStyle={s.headerText}
        rightComponent={
          <View style={{ flexDirection: 'row' }}>
            {matchState.status === 'in-progress' ? (
              <Button
                title={'End'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.dividerTextButton}
                onPress={endMatch}
              />
            ) : null}
            {matchState.status === 'not-started' ||
            matchState.status === 'in-progress' ? (
              <Button
                title={matchStateAction}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.dividerTextButton}
                onPress={onPressMatchAction}
              />
            ) : (
              <Text style={s.matchStatus}>{matchStateAction}</Text>
            )}
          </View>
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
          <Text style={s.playTime}>
            {formatMatchTime(
              sportEvent?.schedule?.matchDetails?.[r]?.[c]?.timer,
            )}
          </Text>
        </View>
        {sportEvent.schedule?.rounds?.[r]?.[c]?.map((team, teamIndex) => (
          <View key={`team-${teamIndex}`} style={s.teamContainer}>
            <View style={[s.playerNamesContainer]}>
              <Text style={s.playerName}>{playerNames(team)}</Text>
            </View>
            <View
              style={[
                s.scoresContainer,
                teamIndex === team1Index ? s.team1Scores : s.team2Scores,
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
                      (teamIndex === team1Index &&
                        setState.status === 'team1-wins') ||
                      (teamIndex === team2Index &&
                        setState.status === 'team2-wins')
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
