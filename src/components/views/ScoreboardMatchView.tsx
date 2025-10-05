import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Divider, ThemeManager, useTheme } from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { formatMatchTime } from 'lib/formatMatchTime';
import { useMyPlayer } from 'lib/player';
import {
  MatchStateResult,
  getMatchState,
  getSetState,
  useSharedMatchTimer,
} from 'lib/scoring';
import { mapToArray } from 'lib/utils';
import { Check } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { Match } from 'types/match';
import { Players, SportEvent, TeamSides } from 'types/sportEvent';

const setScoreBoxWidth = 30;

export interface Props {
  sportEvent: SportEvent;
  match: Match;
  round: number;
  court: number;
  showActions?: boolean;
  onPressMatchAction: () => void;
}

const ScoreboardMatchView = (props: Props) => {
  const {
    sportEvent,
    match,
    round: r,
    court: c,
    showActions,
    onPressMatchAction,
  } = props;

  const theme = useTheme();
  const s = useStyles();

  const { doc: myPlayer } = useMyPlayer();
  const matchTimer = useSharedMatchTimer({ match });

  const team1Index = TeamSides.indexOf('Team1');
  const team2Index = TeamSides.indexOf('Team2');

  // Set counter
  const sets = new Array(sportEvent?.numberOfSetsPerMatch).fill('');

  const [matchState, setMatchState] = useState<MatchStateResult>();

  useEffect(() => {
    if (!sportEvent) return;

    const updated = getMatchState(
      sportEvent.numberOfSetsPerMatch,
      sportEvent.numberOfGamesPerSet,
      match,
    );

    setMatchState(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    match,
    sportEvent?.numberOfGamesPerSet,
    sportEvent?.numberOfSetsPerMatch,
  ]);

  const playerNames = (players: Players) => {
    const player1 = players.p0
      ? `${players.p0.firstName.slice(0, 1)}. ${players.p0.lastName}`
      : '';
    const player2 = players.p1
      ? ` / ${players.p1.firstName.slice(0, 1)}. ${players.p1.lastName}`
      : '';
    return `${player1}${player2}`;
  };

  const renderHeader = () => {
    return (
      <Divider
        text={`Court ${c + 1}`}
        subHeaderStyle={s.headerText}
        rightComponent={
          <View style={{ flexDirection: 'row' }}>
            {/* Only the score keeper can start the match. */}
            {sportEvent.schedule?.rounds[`r${r}`].courts[`c${c}`].scoreKeeper
              ?.playerId === myPlayer?.id &&
            match?.timer.status !== 'ended' &&
            match?.timer.status !== 'abandoned' ? (
              <Button
                title={'Score this match'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.dividerTextButton}
                onPress={onPressMatchAction}
              />
            ) : null}
          </View>
        }
      />
    );
  };

  if (!sportEvent?.schedule) {
    return null;
  }

  return (
    <>
      {showActions ? renderHeader() : null}
      <View style={[s.container]}>
        <View style={s.header}>
          <Text style={s.date}>
            {DateTime.fromISO(sportEvent.date).toFormat('MMMM d, yyyy')}
          </Text>
          <Text style={s.location}>{sportEvent.location}</Text>
        </View>
        {mapToArray(
          sportEvent.schedule.rounds?.[`r${r}`]?.courts[`c${c}`].teams,
        )?.map((team, teamIndex) => (
          <View key={`team-${teamIndex}`} style={s.teamContainer}>
            <Check
              color={theme.colors.success}
              size={16}
              strokeWidth={4}
              style={{
                marginLeft: -7,
                marginRight: 2,
                opacity:
                  (matchState?.status === 'team1-wins' &&
                    teamIndex === team1Index) ||
                  (matchState?.status === 'team2-wins' &&
                    teamIndex === team2Index)
                    ? 1
                    : 0,
              }}
            />
            <View style={[s.playerNamesContainer]}>
              <Text style={s.playerName}>{playerNames(team.players)}</Text>
            </View>
            {/* Set scores */}
            <View
              style={[
                s.scoresContainer,
                teamIndex === team1Index ? s.team1Scores : s.team2Scores,
                { width: sets.length * setScoreBoxWidth * 1.05 },
              ]}>
              {sets.map((_set, setIndex) => {
                const setState = getSetState(
                  setIndex,
                  sportEvent.numberOfGamesPerSet,
                  match,
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
                    {setState.gameWins[teamIndex]}
                  </Text>
                );
              })}
            </View>
          </View>
        ))}
        <View style={s.footer}>
          <Text style={s.result}>
            {matchState?.status === 'not-started'
              ? 'Not Started'
              : `${matchState?.status === 'in-progress' ? 'In Progress' : 'Ended'}: ${formatMatchTime(matchTimer.elapsed)}`}
          </Text>
        </View>
      </View>
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    backgroundColor: `${theme.colors.brandSecondary}ff`,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: theme.radius.M,
  },
  date: {
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
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
  location: {
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
    textAlign: 'right',
  },
  matchStatus: {
    ...theme.text.normal,
    fontWeight: '500',
    padding: 15,
  },
  playerName: {
    ...theme.text.normal,
    color: theme.colors.stickyWhite,
    fontWeight: '500',
    lineHeight: 22,
  },
  playerNamesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  result: {
    ...theme.text.small,
    color: theme.colors.stickyWhite,
    // textAlign: 'center',
    // fontWeight: '700',
    marginTop: 10,
    textAlign: 'right',
  },
  score: {
    ...theme.text.normal,
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
