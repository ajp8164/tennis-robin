import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, { FadeOut } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { ThemeManager, getColoredSvg, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { updateDocument, useDocument } from 'firebase/firestore';
import { formatMatchTime } from 'lib/formatMatchTime';
import {
  getGameState,
  getMatchState,
  getSetState,
  getSportEventState,
} from 'lib/scoring';
import { decodeSportEvent, encodeSportEvent } from 'lib/sportEvent';
import lodash from 'lodash';
import { CircleX, Redo, Undo } from 'lucide-react-native';
import { DateTime } from 'luxon';
import { SportEventsNavigatorParamList } from 'types/navigation';
import { Player } from 'types/player';
import {
  MatchTimerState,
  SportEvent,
  SportEventEncoded,
  TeamSides,
} from 'types/sportEvent';

const setScoreBoxWidth = 30;

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'MatchScoring'
>;

const MatchScoringScreen = ({ navigation, route }: Props) => {
  const { sportEventId, round: r, court: c } = route.params || {};

  const theme = useTheme();
  const s = useStyles();

  const team1Index = TeamSides.indexOf('Team1');
  const team2Index = TeamSides.indexOf('Team2');

  const { doc: sportEventEncoded } = useDocument<SportEventEncoded>(
    'SportEvents',
    sportEventId,
  );

  const sportEvent = useMemo(
    () => decodeSportEvent(sportEventEncoded),
    [sportEventEncoded],
  );

  // Set counter
  const sets = new Array(sportEvent?.numberOfSetsPerMatch).fill('');

  const [currentSet, setCurrentSet] = useState(
    sportEvent?.schedule?.scores.length || 0,
  );
  const [currentGame, setCurrentGame] = useState(
    sportEvent?.schedule?.scores[currentSet]?.length || 0,
  );
  const [matchEnded, setMatchEnded] = useState(false);

  const team1Scores = sportEvent?.schedule?.scores?.[r]?.[c]?.[currentSet]?.[
    currentGame
  ]?.[team1Index] || [0];
  const team1CurrentScore = team1Scores[team1Scores.length - 1];

  const team2Scores = sportEvent?.schedule?.scores?.[r]?.[c]?.[currentSet]?.[
    currentGame
  ]?.[team2Index] || [0];
  const team2CurrentScore = team2Scores[team2Scores.length - 1];

  // A mesage to display for a team. [team1, team2].
  const [teamMessage, setTeamMessage] = useState<string[]>();

  const matchTimerRef = useRef<NodeJS.Timeout>(null);
  const sportEventRef = useRef<SportEvent | null>(null); // Needed for match timer.

  // Pre-initialization for match timer.
  useEffect(() => {
    sportEventRef.current = sportEvent ?? null;

    // This match can only proceed if the sport event is still in-progress.
    if (sportEvent?.state?.status === 'ended') return;

    const timerIsRunning =
      lodash.get(
        sportEvent?.schedule?.matchDetails,
        `[${r}][${c}].timer.state`,
      ) === 'running';

    if (sportEvent && !timerIsRunning) {
      updateMatchTimer('running');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportEvent]);

  // Start the match timer.
  useEffect(() => {
    matchTimerRef.current = setInterval(() => {
      const sportEvent = sportEventRef.current;
      if (!sportEvent?.schedule) return;

      const updated = lodash.cloneDeep(sportEvent.schedule.matchDetails) || [];
      const prev = lodash.get(updated, `[${r}][${c}].timer`);

      const updatedMinutes = prev.minutes + 1;
      lodash.set(updated, `[${r}][${c}].timer.hours`, prev.hours);
      lodash.set(updated, `[${r}][${c}].timer.minutes`, updatedMinutes);

      if (updatedMinutes === 60) {
        lodash.set(updated, `[${r}][${c}].timer.hours`, prev.hours + 1);
        lodash.set(updated, `[${r}][${c}].timer.minutes`, 0);
      }

      lodash.set(updated, `[${r}][${c}].timer.state`, 'running');

      // Update match time.
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
    }, 60 * 1000); // Update every minute

    return () => {
      // Pause match timer on screen unmount.
      updateMatchTimer('paused');
      clearInterval(matchTimerRef.current!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for end of game or set or match.
  useEffect(() => {
    if (!sportEvent?.schedule || matchEnded) return;

    // Don't process a game, set, match advance if working on an undo.
    if (processingUndo.current) {
      // Remove the message during undo.
      setTeamMessage(['', '']);

      processingUndo.current = false;
      return;
    }

    const playerCount = sportEvent.schedule!.rounds[r][c].length;
    const gameWinner = `Game Winner${playerCount !== 1 ? 's!' : '!'}`;
    const setWinner = `Set Winner${playerCount !== 1 ? 's!' : '!'}`;
    const matchWinner = `Match Winner${playerCount !== 1 ? 's!' : '!'}`;

    const matchState = getMatchState(
      sportEvent.numberOfSetsPerMatch,
      sportEvent.numberOfGamesPerSet,
      sportEvent.schedule.scores?.[r]?.[c],
      sportEvent.schedule.matchDetails?.[r]?.[c],
    );

    const setState = getSetState(
      sportEvent.numberOfGamesPerSet,
      sportEvent.schedule?.scores?.[r]?.[c]?.[currentSet],
    );

    const gameState = getGameState(
      sportEvent.schedule.scores?.[r]?.[c]?.[currentSet]?.[currentGame],
    );

    // Move to next game?
    if (
      gameState.status === 'team1-wins' ||
      gameState.status === 'team2-wins'
    ) {
      setCurrentGame(currentGame => currentGame + 1);

      if (gameState.status === 'team1-wins') {
        setTeamMessage([gameWinner, '']);
      } else {
        setTeamMessage(['', gameWinner]);
      }
    }

    // Move to next set?
    if (setState.status === 'team1-wins' || setState.status === 'team2-wins') {
      setCurrentSet(currentSet => currentSet + 1);
      setCurrentGame(0);

      if (setState.status === 'team1-wins') {
        setTeamMessage([setWinner, '']);
      } else {
        setTeamMessage(['', setWinner]);
      }
    }

    // End match?
    if (
      matchState.status === 'team1-wins' ||
      matchState.status === 'team2-wins'
    ) {
      setMatchEnded(true);
      updateMatchTimer('ended');

      if (matchState.status === 'team1-wins') {
        setTeamMessage([matchWinner, '']);
      } else {
        setTeamMessage(['', matchWinner]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c, currentGame, currentSet, r, sportEvent]);

  // End of sport event?
  useEffect(() => {
    if (!sportEvent) return;
    const sportEventState = getSportEventState(sportEvent);

    if (
      sportEventState.status === 'ended' && // Reported status
      sportEvent.state.status !== 'ended' // Saved status
    ) {
      const updatedSportEventState = sportEvent.state;

      if (sportEventState.status === 'ended') {
        updatedSportEventState.status = sportEventState.status;
        updatedSportEventState.endDate = DateTime.now().toISO();
      }

      updateDocument<SportEventEncoded>(
        'SportEvents',
        encodeSportEvent({
          ...sportEvent,
          state: updatedSportEventState,
        }),
      );
    }
  }, [sportEvent]);

  const updateMatchTimer = (state: MatchTimerState) => {
    const sportEvent = sportEventRef.current;
    if (!sportEvent?.schedule) return;

    const updated = lodash.cloneDeep(sportEvent?.schedule?.matchDetails) || [];
    const timer = lodash.get(updated, `[${r}][${c}].timer`);

    // Don't update if the match has already ended.
    if (timer?.state === 'ended') return;

    lodash.set(updated, `[${r}][${c}].timer`, {
      ...timer,
      state,
      hours: timer?.hours || 0,
      minutes: timer?.minutes || 0,
    });

    // Start sport event.
    // The sport event status changes to in-progress when the first match begins.
    const sportEventState = { ...sportEvent.state };
    if (state === 'running' && sportEventState.status !== 'in-progress') {
      sportEventState.status = 'in-progress';
      sportEventState.startDate = DateTime.now().toISO();
    }

    // Update match timer.
    updateDocument<SportEventEncoded>(
      'SportEvents',
      encodeSportEvent({
        ...sportEvent,
        state: sportEventState,
        schedule: {
          ...sportEvent.schedule,
          matchDetails: updated,
        },
      }),
    );
  };

  const playerNames = (players: Player[]) => {
    const player1 = players[0]
      ? `${players[0].lastName} ${players[0].firstName.slice(0, 1)}.`
      : '';
    const player2 = players[1]
      ? ` / ${players[1].lastName} ${players[1].firstName.slice(0, 1)}.`
      : '';
    return `${player1}${player2}`;
  };

  const swipe = Gesture.Fling()
    .direction(Directions.UP)
    .onEnd(() => {
      if (!matchEnded) {
        increaseScoreTeam2();
      }
    })
    .runOnJS(true);

  const swipeDown = Gesture.Fling()
    .direction(Directions.DOWN)
    .onEnd(() => {
      if (!matchEnded) {
        increaseScoreTeam1();
      }
    })
    .runOnJS(true);

  const increaseScoreTeam1 = () => {
    increaseScore(team1Index, team2Index);
  };

  const increaseScoreTeam2 = () => {
    increaseScore(team2Index, team1Index);
  };

  const increaseScore = (teamAIndex: number, teamBIndex: number) => {
    // Reset message.
    setTeamMessage(undefined);

    if (!sportEvent.schedule) return;

    const workingScores = sportEvent.schedule.scores;

    //Round, court, set, game, team, scores
    const teamAScores = workingScores?.[r]?.[c]?.[currentSet]?.[currentGame]?.[
      teamAIndex
    ] || [0];

    const teamBScores = workingScores?.[r]?.[c]?.[currentSet]?.[currentGame]?.[
      teamBIndex
    ] || [0];

    const currentScore = teamAScores[teamAScores.length - 1];

    if (currentScore === 0) {
      teamAScores?.push(15);
    } else if (currentScore === 15) {
      teamAScores?.push(30);
    } else if (currentScore === 30) {
      teamAScores?.push(40);
    } else if (currentScore === 40) {
      teamAScores?.push(50); // Win if by 2
    } else if (currentScore >= 50) {
      // Continue adding 10 until the game ends.
      // Scores over 40 are shown as deuce (40 all) or Ad, 40.
      teamAScores?.push(currentScore + 10); // Win in tie breaker
    }

    // Lodash set ensures whole path exists.
    lodash.set(
      workingScores,
      `[${r}][${c}][${currentSet}][${currentGame}][${teamAIndex}]`,
      teamAScores,
    );

    // Extend team B score unchanged.
    teamBScores?.push(teamBScores[teamBScores?.length - 1]);

    lodash.set(
      workingScores,
      `[${r}][${c}][${currentSet}][${currentGame}][${teamBIndex}]`,
      teamBScores,
    );

    // Update scores
    updateDocument<SportEventEncoded>(
      'SportEvents',
      encodeSportEvent({
        ...sportEvent,
        schedule: {
          ...sportEvent.schedule,
          scores: workingScores,
        },
      }),
    );

    // Prevent a redo if we increase score on an undo state.
    // Check if the undo buffer should be reset.
    if (undoBuffer.current[0].length > 0) {
      const newAScore = teamAScores[teamAScores.length - 1];
      const newBScore = teamBScores[teamBScores.length - 1];

      const teamAUndoIndex = undoBuffer.current[teamAIndex].length - 1;
      const teamBUndoIndex = undoBuffer.current[teamBIndex].length - 1;

      const currentABuf = undoBuffer.current[teamAIndex][teamAUndoIndex];
      const currentBBuf = undoBuffer.current[teamBIndex][teamBUndoIndex];

      // If the new score is advancing past the buffer value then reset the undo buffer.
      if (newAScore >= currentABuf || newBScore >= currentBBuf) {
        undoBuffer.current = [[], []];
      }
    }
  };

  const undoBuffer = useRef<number[][]>([[], []]);
  const processingUndo = useRef(false);

  const alterScore = (which: 'undo' | 'redo') => {
    if (!sportEvent.schedule) return;

    let updateScores = false;
    const workingScores = sportEvent.schedule.scores;

    // Must be more than one score to undo.
    if (which === 'undo') {
      // Undo in game.
      if (team1Scores.length > 1 && team2Scores.length > 1) {
        // Remove the last score from each team.
        undoBuffer.current[team1Index].push(
          team1Scores.splice(team1Scores.length - 1, 1)[0],
        );
        undoBuffer.current[team2Index].push(
          team2Scores.splice(team2Scores.length - 1, 1)[0],
        );
        updateScores = true;
      }

      // Undo match win.
      if (matchEnded) {
        // Back to the last set.
        setMatchEnded(false);
        processingUndo.current = true;
      }

      // Undo set win.
      if (
        !matchEnded &&
        currentSet > 0 &&
        team1Scores.length === 1 &&
        team2Scores.length === 1
      ) {
        // Back to the last set.
        setCurrentSet(currentSet => currentSet - 1);
        setCurrentGame(sportEvent.schedule.scores[r][c][currentSet - 1].length);
        processingUndo.current = true;
      }

      // Undo game win.
      if (
        !matchEnded &&
        currentGame > 0 &&
        team1Scores.length === 1 &&
        team2Scores.length === 1
      ) {
        // Back to the last game.
        setCurrentGame(currentGame => currentGame - 1);
        processingUndo.current = true;
      }
    }

    // Must be a score in the undo buffer to redo.
    if (which === 'redo' && undoBuffer.current.length > 0) {
      // Move last buffered score into team scores.
      const team1UndoIndex = undoBuffer.current[team1Index].length - 1;
      const team2UndoIndex = undoBuffer.current[team2Index].length - 1;

      team1Scores.push(undoBuffer.current[team1Index][team1UndoIndex]);
      team2Scores.push(undoBuffer.current[team2Index][team2UndoIndex]);

      // Remove undone scores from buffer.
      undoBuffer.current[team1Index].splice(team1UndoIndex, 1);
      undoBuffer.current[team2Index].splice(team2UndoIndex, 1);

      updateScores = true;
    }

    if (updateScores) {
      // Lodash set ensures whole path exists.
      lodash.set(
        workingScores,
        `[${r}][${c}][${currentSet}][${currentGame}][${team1Index}]`,
        team1Scores,
      );

      lodash.set(
        workingScores,
        `[${r}][${c}][${currentSet}][${currentGame}][${team2Index}]`,
        team2Scores,
      );

      // Update scores
      updateDocument<SportEventEncoded>(
        'SportEvents',
        encodeSportEvent({
          ...sportEvent,
          schedule: {
            ...sportEvent.schedule,
            scores: workingScores,
          },
        }),
      );
    }
  };

  // Resolve scoring value for display.
  const resolveDispayedScore = (score: number, otherScore: number) => {
    if (matchEnded) {
      return '';
    }

    // Not in tie break?
    if (score <= 40 && otherScore <= 40) {
      return score;
    }

    if (score > 40 && otherScore < 40) {
      return 40;
    }

    if (otherScore > 40 && score < 40) {
      return score;
    }

    // In tie break

    // Deuce?
    if (score === otherScore) {
      return 40;
    }

    // Who's advantage?
    if (score > otherScore) {
      return 'Ad';
    } else {
      return 40;
    }
  };

  const renderSetScores = () => {
    return (
      <>
        {sportEvent?.schedule?.rounds[r][c].map((_, teamIndex, arr) => {
          // Top of the screen is team2, bottom is team1.
          // Reverse the index so team2 set wins are on top.
          const reverseTeamIndex = arr.length - 1 - teamIndex;
          return (
            <View key={`team-${reverseTeamIndex}`} style={s.teamContainer}>
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
                        (reverseTeamIndex === team1Index &&
                          setState.status === 'team1-wins') ||
                        (reverseTeamIndex === team2Index &&
                          setState.status === 'team2-wins')
                          ? s.scoreWin
                          : s.scoreLose,
                        setState.status === 'in-progress'
                          ? s.scoreInProgress
                          : {},
                      ]}>
                      {setState.gameScores[reverseTeamIndex]}
                    </Text>
                  );
                })}
              </View>
            </View>
          );
        })}
      </>
    );
  };

  if (!sportEvent?.schedule) {
    return <EmptyView type={'error'} message={'No Scheduled Match!'} />;
  }

  return (
    <GestureDetector gesture={Gesture.Exclusive(swipe, swipeDown)}>
      <View style={[theme.styles.view, s.container]}>
        <View style={s.header}>
          <Text style={s.matchTime}>
            {formatMatchTime(sportEvent.schedule.matchDetails?.[r]?.[c]?.timer)}
          </Text>
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<CircleX color={theme.colors.stickyWhite} size={33} />}
            onPress={() => navigation.goBack()}
          />
        </View>
        <View style={s.footer}>
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<Undo color={theme.colors.stickyWhite} size={33} />}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            disabled={
              currentSet === 0 &&
              currentGame === 0 &&
              team1CurrentScore === 0 &&
              team2CurrentScore === 0
            }
            onPress={() => alterScore('undo')}
          />
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            icon={<Redo color={theme.colors.stickyWhite} size={33} />}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            // Doesn't matter which buffer index we use (using 0).
            disabled={undoBuffer.current[0].length === 0}
            onPress={() => alterScore('redo')}
          />
        </View>
        <View style={{ flex: 1 }}>
          {/* Team 2 */}
          <View style={s.team2}>
            <SvgXml
              xml={getColoredSvg('chevronHandle')}
              width={40}
              color={theme.colors.whiteTransparentLight}
            />
            <Text style={s.teamName}>
              {playerNames(sportEvent.schedule!.rounds[r][c][team2Index])}
            </Text>
            <Text style={s.gameScore}>
              {resolveDispayedScore(team2CurrentScore, team1CurrentScore)}
            </Text>
          </View>
          {/* Team 2 message */}
          <View style={s.messageContainer}>
            {teamMessage && teamMessage[team2Index] ? (
              <Animated.Text style={s.message} exiting={FadeOut}>
                {teamMessage[team2Index]}
              </Animated.Text>
            ) : null}
          </View>
          {/* Set scores */}
          <View style={s.setScoresContainer}>{renderSetScores()}</View>
          {/* Team 1 message */}
          <View style={s.messageContainer}>
            {teamMessage && teamMessage[team1Index] ? (
              <Animated.Text style={s.message} exiting={FadeOut}>
                {teamMessage[team1Index]}
              </Animated.Text>
            ) : null}
          </View>
          {/* Team 1 */}
          <View style={s.team1}>
            <Text style={s.gameScore}>
              {resolveDispayedScore(team1CurrentScore, team2CurrentScore)}
            </Text>
            <Text style={s.teamName}>
              {playerNames(sportEvent.schedule!.rounds[r][c][team1Index])}
            </Text>
            <SvgXml
              xml={getColoredSvg('chevronHandle')}
              width={40}
              color={theme.colors.whiteTransparentLight}
              style={s.chevronDown}
            />
          </View>
        </View>
      </View>
    </GestureDetector>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device, theme }) => ({
  chevronDown: {
    transform: [{ rotate: '180deg' }],
  },
  container: {
    backgroundColor: theme.colors.brandSecondary,
    justifyContent: 'space-between',
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: device.insets.bottom,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  gameScore: {
    ...theme.text.h1,
    color: theme.colors.stickyWhite,
    fontWeight: '700',
    marginVertical: 10,
    lineHeight: 0,
  },
  header: {
    flexDirection: 'row',
    marginTop: device.insets.top,
    alignItems: 'center',
  },
  matchTime: {
    ...theme.text.xl,
    color: theme.colors.stickyWhite,
    marginLeft: 10,
    flex: 1,
  },
  message: {
    ...theme.text.xl,
    color: theme.colors.stickyWhite,
    textAlign: 'center',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: theme.radius.M,
    borderColor: theme.colors.whiteTransparentLight,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  setScoresContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  team1: {
    paddingBottom: device.insets.bottom,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  team2: {
    width: '100%',
    alignItems: 'center',
  },
  teamName: {
    ...theme.text.h4,
    fontWeight: '700',
    color: theme.colors.stickyWhite,
  },
}));

export default MatchScoringScreen;
