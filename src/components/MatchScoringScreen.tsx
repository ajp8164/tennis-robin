import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, { FadeOut } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import {
  Divider,
  ThemeManager,
  getColoredSvg,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { InfoModal, InfoModalMethods } from 'components/modals/InfoModal';
import { EmptyView } from 'components/molecules/EmptyView';
import {
  addDocument,
  updateDocument,
  useCollection,
  useDocument,
} from 'firebase/firestore';
import matchScoringExplainer from 'lib/content/matchScoringExplainer.json';
import { formatMatchTime } from 'lib/formatMatchTime';
import { flattenPlayers } from 'lib/player';
import {
  getGameState,
  getMatchState,
  getSetState,
  useSharedMatchTimer,
} from 'lib/scoring';
import { mapToArray } from 'lib/utils';
import lodash from 'lodash';
import {
  CircleX,
  Info,
  Pause,
  Play,
  Redo,
  Square,
  Undo,
} from 'lucide-react-native';
import { DateTime } from 'luxon';
import { Match, Point } from 'types/match';
import { SportEventsNavigatorParamList } from 'types/navigation';
import { Players, SportEvent, TeamSides } from 'types/sportEvent';

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

  const { doc: sportEvent } = useDocument<SportEvent>(
    'SportEvents',
    sportEventId,
  );

  const { docs: matches, loading: matchesLoading } = useCollection<Match>(
    'Matches',
    {
      where: [
        {
          fieldPath: 'sportEventId',
          opStr: '==',
          value: sportEventId,
        },
        {
          fieldPath: 'roundNumber',
          opStr: '==',
          value: r,
        },
        {
          fieldPath: 'courtNumber',
          opStr: '==',
          value: c,
        },
      ],
    },
  );

  const [match, setMatch] = useState<Match>();
  const matchTimer = useSharedMatchTimer({ match });

  // Set counter
  const sets = new Array(sportEvent?.numberOfSetsPerMatch).fill('');

  const [currentSet, setCurrentSet] = useState(
    mapToArray(match?.sets).length || 0,
  );
  const [currentGame, setCurrentGame] = useState(
    mapToArray(match?.sets?.[`s${currentSet}`]).length || 0,
  );
  const [matchEnded, setMatchEnded] = useState(
    matchTimer.status === 'ended' || matchTimer.status === 'abandoned',
  );

  const team1Points = match?.sets?.[`s${currentSet}`]?.games?.[
    `g${currentGame}`
  ]?.teams?.[`t${team1Index}`].points || [{ v: 0 }];
  const team1CurrentPoint = team1Points[team1Points.length - 1];

  const team2Points = match?.sets?.[`s${currentSet}`]?.games?.[
    `g${currentGame}`
  ]?.teams?.[`t${team2Index}`].points || [{ v: 0 }];
  const team2CurrentPoint = team2Points[team2Points.length - 1];

  // A message to display for a team. [team1, team2].
  const [teamMessage, setTeamMessage] = useState<string[]>();

  const undoBuffer = useRef<Point[][]>([[], []]); // points, [team1, team2]
  const processingUndo = useRef(false);

  const infoModalRef = useRef<InfoModalMethods>(null);

  // Load the match or create a new match.
  useEffect(() => {
    if (sportEvent && !matchesLoading) {
      if (matches?.[0]) {
        setMatch(matches[0]);
      } else {
        const newMatch: Match = {
          courtNumber: c,
          roundNumber: r,
          sets: {},
          sportEventId,
          timer: {
            elapsedTime: { hours: 0, minutes: 0 },
            resumeTime: DateTime.now().toISO(),
            status: 'initial',
          },
        };

        addDocument<Match>('Matches', newMatch).then(match => {
          // Add the match doc id to the sport event.
          const matchIds = new Set(sportEvent?.matches);
          matchIds.add(match.id!);
          updateDocument('SportEvents', {
            ...sportEvent,
            matches: [...matchIds],
          });
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, matchesLoading, sportEvent]);

  // Check for end of game or set or match.
  useEffect(() => {
    if (!sportEvent?.schedule || !match || matchEnded) return;

    // Don't process a game, set, match advance if working on an undo.
    if (processingUndo.current) {
      // Remove the message during undo.
      setTeamMessage(['', '']);
      processingUndo.current = false;
      return;
    }

    const playerCount = flattenPlayers(
      sportEvent.schedule!.rounds[r].courts[c].teams,
    ).length;

    const gameWinner = `Game Winner${playerCount !== 1 ? 's!' : '!'}`;
    const setWinner = `Set Winner${playerCount !== 1 ? 's!' : '!'}`;
    const matchWinner = `Match Winner${playerCount !== 1 ? 's!' : '!'}`;
    const matchAbandoned = 'Match Ended';

    const matchState = getMatchState(
      sportEvent.numberOfSetsPerMatch,
      sportEvent.numberOfGamesPerSet,
      match,
    );

    const setState = getSetState(
      currentSet,
      sportEvent.numberOfGamesPerSet,
      match,
    );

    const gameState = getGameState(currentGame, currentSet, match);

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
      matchState.status === 'team2-wins' ||
      matchTimer.status === 'ended' ||
      matchTimer.status === 'abandoned'
    ) {
      setMatchEnded(true);
      matchTimer.end();

      if (matchState.status === 'team1-wins') {
        setTeamMessage([matchWinner, '']);
      } else if (matchState.status === 'team2-wins') {
        setTeamMessage(['', matchWinner]);
      } else if (matchTimer.status === 'abandoned') {
        setTeamMessage(['', matchAbandoned]);
      }
    }
  }, [
    r,
    c,
    currentGame,
    currentSet,
    match,
    matchEnded,
    matchTimer,
    sportEvent,
  ]);

  const pauseMatch = () => {
    matchTimer.pause();
  };
  const resumeMatch = () => {
    matchTimer.start();
  };
  const endMatch = () => {
    matchTimer.abandon();
  };

  const playerNames = (players: Players) => {
    const player1 = players['0']
      ? `${players['0'].lastName} ${players['0'].firstName.slice(0, 1)}.`
      : '';
    const player2 = players[1]
      ? ` / ${players['1'].lastName} ${players['1'].firstName.slice(0, 1)}.`
      : '';
    return `${player1}${player2}`;
  };

  const swipe = Gesture.Fling()
    .direction(Directions.UP)
    .onEnd(() => {
      increaseScoreTeam2();
    })
    .runOnJS(true);

  const swipeDown = Gesture.Fling()
    .direction(Directions.DOWN)
    .onEnd(() => {
      increaseScoreTeam1();
    })
    .runOnJS(true);

  const increaseScoreTeam1 = () => {
    increaseScore(team1Index, team2Index);
  };

  const increaseScoreTeam2 = () => {
    increaseScore(team2Index, team1Index);
  };

  const increaseScore = (teamAIndex: number, teamBIndex: number) => {
    if (!sportEvent?.schedule || !match || matchEnded) return;

    // If the match timer is not running then start it. This allows the timer to start automatically
    // when the first point value is entered or when entering a point value when the match is paused.
    if (matchTimer.status !== 'running') {
      // Need to delay the update to allow the point values to update first otherwise the point values update
      // overwrites the timer update.
      setTimeout(() => {
        resumeMatch();
      });
    }

    // Reset message.
    setTeamMessage(undefined);

    const workingSets = lodash.cloneDeep(match?.sets || {});
    const teamAPath = `s${currentSet}.games.g${currentGame}.teams.t${teamAIndex}.points`;
    const teamBPath = `s${currentSet}.games.g${currentGame}.teams.t${teamBIndex}.points`;

    // Ensure team A points array exists.
    let teamAPoints = lodash.get(workingSets, teamAPath, []) as Point[];

    if (teamAPoints.length === 0) {
      teamAPoints = [{ v: 0 }];
    }

    // Ensure team B points array exists.
    let teamBPoints = lodash.get(workingSets, teamBPath, []) as Point[];

    if (teamBPoints.length === 0) {
      teamBPoints = [{ v: 0 }];
    }

    const currentPoint = teamAPoints[teamAPoints.length - 1];

    // Push the next score for Team A.
    if (currentPoint.v === 0) {
      teamAPoints.push({ v: 15 });
    } else if (currentPoint.v === 15) {
      teamAPoints.push({ v: 30 });
    } else if (currentPoint.v === 30) {
      teamAPoints.push({ v: 40 });
    } else if (currentPoint.v === 40) {
      teamAPoints.push({ v: 50 }); // Win if by 2
    } else if (currentPoint.v >= 50) {
      teamAPoints.push({ v: currentPoint.v + 10 }); // Tiebreaker
    }

    // Commit updates back into workingSets.
    lodash.set(workingSets, teamAPath, teamAPoints);

    // Extend team B points unchanged (repeat last value).
    teamBPoints.push(teamBPoints[teamBPoints.length - 1]);
    lodash.set(workingSets, teamBPath, teamBPoints);

    // Update set scores.
    updateDocument<Match>('Matches', {
      ...match,
      sets: workingSets,
    });

    // Prevent a redo if we increase point value on an undo state.
    // Check if the undo buffer should be reset.
    if (undoBuffer.current[0].length > 0) {
      const newAPoint = teamAPoints[teamAPoints.length - 1];
      const newBPoint = teamBPoints[teamBPoints.length - 1];

      const teamAUndoIndex = undoBuffer.current[teamAIndex].length - 1;
      const teamBUndoIndex = undoBuffer.current[teamBIndex].length - 1;

      const currentABuf = undoBuffer.current[teamAIndex][teamAUndoIndex];
      const currentBBuf = undoBuffer.current[teamBIndex][teamBUndoIndex];

      // If the new point value is advancing past the buffer value then reset the undo buffer.
      if (newAPoint.v >= currentABuf.v || newBPoint.v >= currentBBuf.v) {
        undoBuffer.current = [[], []];
      }
    }
  };

  const alterScore = (which: 'undo' | 'redo') => {
    if (!sportEvent?.schedule || !match) return;

    let updateScores = false;
    const workingSets = match.sets;

    // Must be more than one score to undo.
    if (which === 'undo') {
      // Undo in game.
      if (team1Points.length > 1 && team2Points.length > 1) {
        // Remove the last score from each team.
        undoBuffer.current[team1Index].push(
          team1Points.splice(team1Points.length - 1, 1)[0],
        );
        undoBuffer.current[team2Index].push(
          team2Points.splice(team2Points.length - 1, 1)[0],
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
        team1Points.length === 1 &&
        team2Points.length === 1
      ) {
        // Back to the last set.
        setCurrentSet(currentSet => currentSet - 1);
        setCurrentGame(
          mapToArray(match.sets[`s${currentSet - 1}`]?.games).length,
        );
        processingUndo.current = true;
      }

      // Undo game win.
      if (
        !matchEnded &&
        currentGame > 0 &&
        team1Points.length === 1 &&
        team2Points.length === 1
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

      team1Points.push(undoBuffer.current[team1Index][team1UndoIndex]);
      team2Points.push(undoBuffer.current[team2Index][team2UndoIndex]);

      // Remove undone scores from buffer.
      undoBuffer.current[team1Index].splice(team1UndoIndex, 1);
      undoBuffer.current[team2Index].splice(team2UndoIndex, 1);

      updateScores = true;
    }

    if (updateScores) {
      // Lodash set ensures whole path exists.
      lodash.set(
        workingSets,
        `s${currentSet}.games.g${currentGame}.teams.t${team1Index}.points`,
        team1Points,
      );

      lodash.set(
        workingSets,
        `s${currentSet}.games.g${currentGame}.teams.t${team2Index}.points`,
        team2Points,
      );

      // Update set scores.
      updateDocument<Match>('Matches', {
        ...match,
        sets: workingSets,
      });
    }
  };

  // Resolve scoring value for display.
  const resolveDispayedScore = (
    pointValue: number,
    otherPointValue: number,
  ) => {
    if (matchEnded) {
      return '';
    }

    // Not in tie break?
    if (pointValue <= 40 && otherPointValue <= 40) {
      return pointValue;
    }

    if (pointValue > 40 && otherPointValue < 40) {
      return 40;
    }

    if (otherPointValue > 40 && pointValue < 40) {
      return pointValue;
    }

    // In tie break

    // Deuce?
    if (pointValue === otherPointValue) {
      return 40;
    }

    // Who's advantage?
    if (pointValue > otherPointValue) {
      return 'Ad';
    } else {
      return 40;
    }
  };

  const renderSetScores = () => {
    if (!sportEvent || !match) return null;
    return (
      <>
        {mapToArray(sportEvent.schedule?.rounds[r].courts[c].teams).map(
          (_, teamIndex, arr) => {
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
                      setIndex,
                      sportEvent.numberOfGamesPerSet,
                      match,
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
                        {setState.gameWins[reverseTeamIndex]}
                      </Text>
                    );
                  })}
                </View>
              </View>
            );
          },
        )}
      </>
    );
  };

  if (!sportEvent?.schedule) {
    return <EmptyView type={'error'} message={'No Scheduled Match!'} />;
  }

  return (
    <>
      <GestureDetector gesture={Gesture.Exclusive(swipe, swipeDown)}>
        <View style={[theme.styles.view, s.container]}>
          <View style={s.header}>
            <Text style={s.matchTime}>
              {formatMatchTime(matchTimer.elapsed)}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Button
                buttonStyle={theme.styles.buttonScreenHeader}
                icon={<CircleX color={theme.colors.stickyWhite} size={33} />}
                onPress={() => navigation.goBack()}
              />
            </View>
          </View>
          {/* Match timer controls */}
          <View style={s.controls}>
            <Button
              icon={<Play color={theme.colors.stickyWhite} size={33} />}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={
                matchTimer.status === 'running' ||
                matchTimer.status === 'ended' ||
                matchTimer.status === 'abandoned'
              }
              onPress={() => resumeMatch()}
            />
            <Button
              icon={<Pause color={theme.colors.stickyWhite} size={33} />}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={matchTimer.status !== 'running'}
              onPress={() => pauseMatch()}
            />
            <Button
              icon={<Square color={theme.colors.stickyWhite} size={25} />}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={
                matchTimer.status !== 'running' &&
                matchTimer.status !== 'paused'
              }
              onPress={() => endMatch()}
            />
            <Divider />
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              icon={<Info color={theme.colors.stickyWhite} size={33} />}
              onPress={() => infoModalRef.current?.present()}
            />
          </View>
          {/* Undo / Redo */}
          <View style={s.footer}>
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              icon={<Undo color={theme.colors.stickyWhite} size={33} />}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={
                currentSet === 0 &&
                currentGame === 0 &&
                team1CurrentPoint.v === 0 &&
                team2CurrentPoint.v === 0
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
                {playerNames(
                  sportEvent.schedule!.rounds[r].courts[c].teams[team2Index]
                    .players,
                )}
              </Text>
              <Text style={s.gameScore}>
                {resolveDispayedScore(team2CurrentPoint.v, team1CurrentPoint.v)}
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
                {resolveDispayedScore(team1CurrentPoint.v, team2CurrentPoint.v)}
              </Text>
              <Text style={s.teamName}>
                {playerNames(
                  sportEvent.schedule!.rounds[r].courts[c].teams[team1Index]
                    .players,
                )}
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
      <InfoModal
        ref={infoModalRef}
        title={'Scoring Matches'}
        text={matchScoringExplainer}
        snapPoints={['70%']}
      />
    </>
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
  controls: {
    position: 'absolute',
    left: 5,
    top: '25%',
    alignItems: 'center',
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: theme.radius.M,
    borderColor: theme.colors.whiteTransparentMid,
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
