import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Divider, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getDocument } from 'firebase/firestore';
import { usePlayerStatusDecoration } from 'lib/player';
import { SportEventsNavigatorParamList } from 'types/navigation';
import { Player } from 'types/player';

export type Props = NativeStackScreenProps<
  SportEventsNavigatorParamList,
  'Player'
>;

const PlayerScreen = ({ route }: Props) => {
  const { playerId } = route.params || {};

  const theme = useTheme();
  const [player, setPlayer] = useState<Player>();
  const playerStatusDecoration = usePlayerStatusDecoration();

  useEffect(() => {
    if (playerId) {
      getDocument<Player>('Players', playerId).then(player => {
        setPlayer(player);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <Text style={theme.text.h3}>
        {`${player?.firstName} ${player?.lastName}`}
      </Text>
      <Text style={theme.text.normal}>{player?.email}</Text>
      <Divider />
      {player?.status ? (
        <Text
          style={
            theme.text.normal
          }>{`Status: ${playerStatusDecoration[player.status].label}`}</Text>
      ) : null}
    </ScrollView>
  );
};

export default PlayerScreen;
