import React, { useEffect, useMemo, useState } from 'react';
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
import { getGameState, getMatchState, getSetState } from 'lib/scoring';
import { decodeSportEvent, encodeSportEvent } from 'lib/sportEvent';
import lodash from 'lodash';
import { CircleX } from 'lucide-react-native';
import { SportEventsNavigatorParamList } from 'types/navigation';
import { Player } from 'types/player';
import { SportEventEncoded, TeamSides } from 'types/sportEvent';

const setScoreBoxWidth = 30;

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'MatchScoring'
>;

const MatchScoringScreen = ({ navigation, route }: Props) => {
  const { sportEventId, round: r, court: c } = route.params || {};

  const theme = useTheme();
  const s = useStyles();

  const homeIndex = TeamSides.indexOf('Home');
  const awayIndex = TeamSides.indexOf('Away');

  const { doc: sportEventEncoded } = useDocument<SportEventEncoded>(
    'SportEvents',
    sportEventId,
  );

  const sportEvent = useMemo(
    () => decodeSportEvent(sportEventEncoded),
    [sportEventEncoded],
  );

  // Set counter
  const sets = new Array(sportEvent?.numberOfSets).fill('');

  const [currentSet, setCurrentSet] = useState(
    sportEvent?.schedule?.scores.length || 0,
  );

  const [currentGame, setCurrentGame] = useState(
    sportEvent?.schedule?.scores[currentSet]?.length || 0,
  );

  const [matchEnded, setMatchEnded] = useState(false);

  const homeScores = sportEvent?.schedule?.scores?.[r]?.[c]?.[currentSet]?.[
    currentGame
  ]?.[homeIndex] || [0];
  const homeCurrentScore = homeScores[homeScores.length - 1];

  const awayScores = sportEvent?.schedule?.scores?.[r]?.[c]?.[currentSet]?.[
    currentGame
  ]?.[awayIndex] || [0];
  const awayCurrentScore = awayScores[awayScores.length - 1];

  // A mesage to display for a team. [team1, team2].
  const [teamMessage, setTeamMessage] = useState<string[]>();

  // Check for end of game or set or match.
  useEffect(() => {
    const matchState = getMatchState(
      sportEvent?.numberOfSets,
      sportEvent?.numberOfGamesPerSet,
      sportEvent?.schedule?.scores?.[r]?.[c],
    );

    const setState = getSetState(
      sportEvent?.numberOfGamesPerSet,
      sportEvent?.schedule?.scores?.[r]?.[c]?.[currentSet],
    );

    const gameState = getGameState(
      sportEvent?.schedule?.scores?.[r]?.[c]?.[currentSet]?.[currentGame],
    );

    // Move to next game?
    if (gameState.status === 'home-wins' || gameState.status === 'away-wins') {
      setCurrentGame(currentGame => currentGame + 1);

      if (gameState.status === 'home-wins') {
        setTeamMessage(['Team 1 Wins Game', '']);
      } else {
        setTeamMessage(['', 'Team 2 Wins Game']);
      }
    }

    // Move to next set?
    if (setState.status === 'home-wins' || setState.status === 'away-wins') {
      setCurrentSet(currentSet => currentSet + 1);
      setCurrentGame(0);

      if (setState.status === 'home-wins') {
        setTeamMessage(['Team 1 Wins Set', '']);
      } else {
        setTeamMessage(['', 'Team 2 Wins Set']);
      }
    }

    // End match?
    if (
      matchState.status === 'home-wins' ||
      matchState.status === 'away-wins'
    ) {
      setMatchEnded(true);

      if (matchState.status === 'home-wins') {
        setTeamMessage(['Team 1 Wins Match', '']);
      } else {
        setTeamMessage(['', 'Team 2 Wins Match']);
      }
    }
  }, [c, currentGame, currentSet, r, sportEvent]);

  const playerNames = (players: Player[]) => {
    const player1 = players[0]
      ? `${players[0].lastName} ${players[0].firstName.slice(0, 1)}.`
      : '';
    const player2 = players[1]
      ? `/${players[1].lastName} ${players[1].firstName.slice(0, 1)}.`
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
    increaseScore(homeIndex, awayIndex);
  };

  const increaseScoreTeam2 = () => {
    increaseScore(awayIndex, homeIndex);
  };

  const increaseScore = (teamAIndex: number, teamBIndex: number) => {
    // Reset message.
    setTeamMessage(undefined);

    if (!sportEvent.schedule) return;

    const workingScores = sportEvent.schedule?.scores;

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
  };

  // Resolve scoring value in case of a tie breaker.
  const resolveScore = (score: number, otherScore: number) => {
    if (matchEnded) {
      return 0;
    }

    // In tie break?
    if (
      score <= 40 ||
      otherScore <= 40 ||
      (score === 40 && otherScore === 40)
    ) {
      return score;
    }

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
                  reverseTeamIndex === 0 ? s.team2Scores : s.team1Scores,
                  { width: sets.length * setScoreBoxWidth * 1.05 },
                ]}>
                {sets.map((_, setIndex) => {
                  const setState = getSetState(
                    sportEvent.numberOfGamesPerSet,
                    sportEvent.schedule?.scores[r]?.[c]?.[setIndex],
                  );
                  return (
                    <Text
                      key={`set-${setIndex}`}
                      style={[
                        s.score,
                        teamIndex === homeIndex &&
                        setState.status === 'home-wins'
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
        <Button
          buttonStyle={theme.styles.buttonScreenHeader}
          containerStyle={s.closeButton}
          icon={<CircleX color={theme.colors.stickyWhite} size={33} />}
          onPress={() => navigation.goBack()}
        />
        <View style={{ flex: 1 }}>
          {/* Team 2 */}
          <View style={s.team2}>
            <SvgXml
              xml={getColoredSvg('chevronHandle')}
              width={40}
              color={theme.colors.whiteTransparentLight}
            />
            <Text style={s.teamName}>
              {playerNames(sportEvent.schedule!.rounds[r][c][awayIndex])}
            </Text>
            <Text style={s.gameScore}>
              {resolveScore(awayCurrentScore, homeCurrentScore)}
            </Text>
          </View>
          {/* Team 2 message */}
          <View style={s.messageContainer}>
            {teamMessage && teamMessage[awayIndex] ? (
              <Animated.Text style={s.message} exiting={FadeOut}>
                {teamMessage[awayIndex]}
              </Animated.Text>
            ) : null}
          </View>
          {/* Set scores */}
          <View style={s.setScoresContainer}>{renderSetScores()}</View>
          {/* Team 1 message */}
          <View style={s.messageContainer}>
            {teamMessage && teamMessage[homeIndex] ? (
              <Animated.Text style={s.message} exiting={FadeOut}>
                {teamMessage[homeIndex]}
              </Animated.Text>
            ) : null}
          </View>
          {/* Team 1 */}
          <View style={s.team1}>
            <Text style={s.gameScore}>
              {resolveScore(homeCurrentScore, awayCurrentScore)}
            </Text>
            <Text style={s.teamName}>
              {playerNames(sportEvent.schedule!.rounds[r][c][homeIndex])}
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
  closeButton: {
    height: device.insets.top + 40,
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.brandSecondary,
    justifyContent: 'space-between',
  },
  gameScore: {
    ...theme.text.h1,
    color: theme.colors.stickyWhite,
    fontWeight: '700',
    marginVertical: 10,
    lineHeight: 0,
  },
  message: {
    ...theme.text.xl,
    color: theme.colors.stickyWhite,
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
