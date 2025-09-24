import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  ThemeManager,
  getColoredSvg,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import { useDocument } from 'firebase/firestore';
import { getSetState } from 'lib/scoring';
import { decodeSportEvent } from 'lib/sportEvent';
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
  const device = useDevice();

  const { doc: sportEventEncoded } = useDocument<SportEventEncoded>(
    'SportEvents',
    sportEventId,
  );

  const sportEvent = useMemo(
    () => decodeSportEvent(sportEventEncoded),
    [sportEventEncoded],
  );

  const homeIndex = TeamSides.indexOf('Home');

  const playerNames = (players: Player[]) => {
    const player1 = `${players[0].lastName} ${players[0].firstName.slice(0, 1)}.`;
    const player2 = `${players[1].lastName} ${players[1].firstName.slice(0, 1)}.`;
    return `${player1}/${player2}`;
  };

  const sets = new Array(sportEvent?.numberOfSets).fill('');

  const renderScores = () => {
    return (
      <>
        {sportEvent?.schedule?.rounds[r][c].map((_team, teamIndex) => (
          <View key={`team-${teamIndex}`} style={s.teamContainer}>
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
                return (
                  <Text
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
      </>
    );
  };

  if (!sportEvent?.schedule) {
    return <EmptyView type={'error'} message={'No Scheduled Match!'} />;
  }

  return (
    <View style={[theme.styles.view, s.container]}>
      <Button
        buttonStyle={theme.styles.buttonScreenHeader}
        containerStyle={{
          height: device.insets.top + 40,
          alignSelf: 'flex-end',
          justifyContent: 'flex-end',
        }}
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
            style={{}}
          />
          <Text style={s.teamName}>
            {playerNames(sportEvent.schedule!.rounds[r][c][1])}
          </Text>
        </View>
        {/* Scores */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {renderScores()}
        </View>
        {/* Team 1 */}
        <View style={s.team1}>
          <Text style={s.teamName}>
            {playerNames(sportEvent.schedule!.rounds[r][c][0])}
          </Text>
          <SvgXml
            xml={getColoredSvg('chevronHandle')}
            width={40}
            color={theme.colors.whiteTransparentLight}
            style={{
              transform: [{ rotate: '180deg' }],
            }}
          />
        </View>
      </View>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device, theme }) => ({
  container: {
    backgroundColor: theme.colors.brandSecondary,
    justifyContent: 'space-between',
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
