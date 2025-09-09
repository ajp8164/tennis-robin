import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Divider, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getDocument } from 'firebase/firestore';
import { GroupsNavigatorParamList } from 'types/navigation';
import { Player } from 'types/player';

export type Props = NativeStackScreenProps<GroupsNavigatorParamList, 'Player'>;

const PlayerScreen = ({ route }: Props) => {
  const { playerId } = route.params || {};

  const theme = useTheme();
  const [player, setPlayer] = useState<Player>();

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
      <Text style={theme.text.normal}>{`Status: ${player?.status}`}</Text>
    </ScrollView>
  );
};

export default PlayerScreen;
