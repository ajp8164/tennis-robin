import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { documentId } from '@react-native-firebase/firestore';
import { Divider, ThemeManager, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyView } from 'components/molecules/EmptyView';
import { useCollection, useDocument } from 'firebase/firestore';
import { getSetState } from 'lib/scoring';
import { mapToArray } from 'lib/utils';
import { DateTime } from 'luxon';
import { Match } from 'types/match';
import { SportEventsNavigatorParamList } from 'types/navigation';
import { SportEvent, TeamSides } from 'types/sportEvent';

const setScoreBoxWidth = 30;

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'SportEventSummary'
>;

const SportEventSummaryScreen = ({ route }: Props) => {
  const { sportEventId } = route.params || {};

  const theme = useTheme();
  const s = useStyles();

  const team1Index = TeamSides.indexOf('Team1');
  const team2Index = TeamSides.indexOf('Team2');

  // *** Live sportEvent data ***
  //
  const { doc: sportEvent } = useDocument<SportEvent>(
    'SportEvents',
    sportEventId,
  );

  const { docs: matches } = useCollection<Match>('Matches', {
    where: [
      {
        fieldPath: documentId(),
        opStr: 'in',
        value: sportEvent?.matches || [],
      },
    ],
    orderBy: [
      { fieldPath: 'roundNumber', directionStr: 'asc' },
      { fieldPath: 'courtNumber', directionStr: 'asc' },
    ],
  });
  //
  // ***

  // Set counter
  const sets = new Array(sportEvent?.numberOfSetsPerMatch).fill('');

  const renderSetScores = (r: number, c: number) => {
    return (
      <>
        {mapToArray(
          sportEvent?.schedule?.rounds[`r${r}`].courts[`c${c}`].teams,
        ).map((_, teamIndex, arr) => {
          // Top of the screen is team2, bottom is team1.
          // Reverse the index so team2 set wins are on top.
          const reverseTeamIndex = arr.length - 1 - teamIndex;
          const match = matches.find(
            m => m.roundNumber === r && m.courtNumber === c,
          );
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
                    sportEvent?.numberOfGamesPerSet || 0,
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
        })}
      </>
    );
  };

  if (!sportEvent) {
    return <EmptyView type={'loading'} />;
  }

  return (
    <EmptyView type={'loading'} waitFor={sportEvent} fadeIn>
      <ScrollView
        style={theme.styles.view}
        showsVerticalScrollIndicator={false}>
        <Divider />
        <Text style={theme.text.h3}>{sportEvent.name}</Text>
        <Text
          style={[theme.text.small, { color: theme.colors.listItemSubtitle }]}>
          {`${DateTime.fromISO(sportEvent.date).toFormat(
            'MMM d',
          )} ${DateTime.fromISO(sportEvent.date)
            .toFormat("'at' h:mma")
            .toLowerCase()}`}
        </Text>
        <Text
          style={[theme.text.small, { color: theme.colors.listItemSubtitle }]}>
          {`Status: ${sportEvent.state.status}`}
        </Text>
        {sportEvent.state.startDate ? (
          <Text
            style={[
              theme.text.small,
              { color: theme.colors.listItemSubtitle },
            ]}>
            {`Started: ${DateTime.fromISO(sportEvent.state.startDate).toFormat(
              'MMM d',
            )} ${DateTime.fromISO(sportEvent.state.startDate)
              .toFormat("'at' h:mma")
              .toLowerCase()}`}
          </Text>
        ) : null}
        {sportEvent.location ? (
          <Text
            style={[
              theme.text.small,
              { color: theme.colors.listItemSubtitle },
            ]}>
            {sportEvent.location}
          </Text>
        ) : null}
        <Text
          style={[theme.text.small, { color: theme.colors.listItemSubtitle }]}>
          {sportEvent.courtSurface}
        </Text>
        <Text
          style={[theme.text.small, { color: theme.colors.listItemSubtitle }]}>
          {`${sportEvent.numberOfCourts} Court${sportEvent.numberOfCourts !== 1 ? 's' : ''}`}
        </Text>
        <Text
          style={[theme.text.small, { color: theme.colors.listItemSubtitle }]}>
          {`${sportEvent.numberOfSetsPerMatch} Set${sportEvent.numberOfSetsPerMatch !== 1 ? 's' : ''} per Match`}
        </Text>
        <Text
          style={[theme.text.small, { color: theme.colors.listItemSubtitle }]}>
          {`${sportEvent.numberOfGamesPerSet} Game${sportEvent.numberOfGamesPerSet !== 1 ? 's' : ''} per Set`}
        </Text>
        {mapToArray(sportEvent.schedule?.rounds).map((round, r) =>
          mapToArray(round.courts).map((court, c) => {
            const match = matches.find(
              m => m.roundNumber === r && m.courtNumber === c,
            );
            return (
              <View key={`round-${r}-court-${c}`}>
                <Text
                  style={[
                    theme.text.small,
                    { color: theme.colors.listItemSubtitle },
                  ]}>
                  {'Team 1: '}
                  {court.teams.t0.players.p0
                    ? `${court.teams.t0.players.p0.firstName} ${court.teams.t0.players.p0.lastName}`
                    : ''}
                  {court.teams.t0.players.p1
                    ? `${court.teams.t0.players.p1.firstName} ${court.teams.t0.players.p1.lastName}`
                    : ''}
                </Text>
                <Text
                  style={[
                    theme.text.small,
                    { color: theme.colors.listItemSubtitle },
                  ]}>
                  {'Team 2: '}
                  {court.teams.t1.players.p0
                    ? `${court.teams.t1.players.p0.firstName} ${court.teams.t1.players.p0.lastName}`
                    : ''}
                  {court.teams.t1.players.p1
                    ? `${court.teams.t1.players.p1.firstName} ${court.teams.t1.players.p1.lastName}`
                    : ''}
                </Text>
                <Text
                  style={[
                    theme.text.small,
                    { color: theme.colors.listItemSubtitle },
                  ]}>
                  {sportEvent.schedule?.rounds?.[`r${r}`].courts?.[`c${c}`]
                    ? `score keeper: ${sportEvent.schedule?.rounds?.[`r${r}`].courts?.[`c${c}`]?.scoreKeeper?.name}`
                    : 'None'}
                </Text>
                {renderSetScores(r, c)}
                <Text
                  style={[
                    theme.text.small,
                    { color: theme.colors.listItemSubtitle },
                  ]}>
                  {`hours: ${match?.timer.elapsedTime.hours}`}
                  {`minutes: ${match?.timer.elapsedTime.minutes}`}
                </Text>
              </View>
            );
          }),
        )}
      </ScrollView>
    </EmptyView>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
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

export default SportEventSummaryScreen;
