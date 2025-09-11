import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Divider, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getDocument } from 'firebase/firestore';
import { usePlayerStatusDecoration } from 'lib/player';
import { SetupNavigatorParamList } from 'types/navigation';
import { PlayerStatus } from 'types/player';
import { Token } from 'types/token';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'PlayerInvitation'
>;

const PlayerInvitationScreen = ({ route }: Props) => {
  const { tokenId } = route.params || {};

  const theme = useTheme();
  const playerStatusDecoration = usePlayerStatusDecoration();
  const [token, setToken] = useState<Token>();

  useEffect(() => {
    getDocument<Token>('Tokens', tokenId).then(token => {
      setToken(token);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <Text style={theme.text.h3}>
        {`${token?.firstName} ${token?.lastName}`}
      </Text>
      <Text style={theme.text.normal}>{token?.email}</Text>
      <Divider />
      <Text
        style={
          theme.text.normal
        }>{`Status: ${playerStatusDecoration[PlayerStatus.Invited].label}`}</Text>
    </ScrollView>
  );
};

export default PlayerInvitationScreen;
