import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ThemeManager, getSvg, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { InviteRedemptionModal } from 'components/modals/InviteRedemptionModal';
import { getDocuments } from 'firebase/firestore';
import { useUserProfile } from 'lib/auth';
import { HomeNavigatorParamList } from 'types/navigation';
import { Token } from 'types/token';

export type Props = NativeStackScreenProps<HomeNavigatorParamList, 'Home'>;

const HomeScreen = () => {
  const theme = useTheme();
  const s = useStyles();

  const userProfile = useUserProfile();
  const [acceptedInvitation, setAcceptedInvitation] = useState(false);

  const inviteRedemptionModalModalRef = useRef<InviteRedemptionModal>(null);

  // Check for pending tokens and action them immediatley.
  // Query tokens using my email address.
  useEffect(() => {
    if (!userProfile) return;
    (async () => {
      const { result: tokens } = await getDocuments<Token>('Tokens', {
        where: [
          {
            fieldPath: 'email',
            opStr: '==',
            value: userProfile?.email,
          },
        ],
      });

      if (tokens.length) {
        inviteRedemptionModalModalRef.current?.present(tokens[0].value);
      }
    })();
  }, [userProfile]);

  const onInvitationAccepted = () => {
    setAcceptedInvitation(true);
  };

  return (
    <>
      <View style={theme.styles.view}>
        <SvgXml
          xml={getSvg('brandIcon')}
          width={s.icon.width}
          height={s.icon.width}
          style={s.icon}
        />
        {acceptedInvitation ? (
          <View>
            <Text
              style={
                s.title
              }>{`Welcome to the team ${userProfile?.firstName}!`}</Text>
          </View>
        ) : null}
        <Button
          title={'New Tournament'}
          titleStyle={theme.styles.buttonTitle}
          buttonStyle={theme.styles.button}
          containerStyle={[theme.styles.buttonBottomContainer, s.buttonBottom]}
          onPress={() => null}
        />
      </View>
      <InviteRedemptionModal
        ref={inviteRedemptionModalModalRef}
        onAccepted={onInvitationAccepted}
      />
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device, theme }) => ({
  buttonBottom: {
    bottom: 30,
  },
  icon: {
    width: device.screen.width * 0.5,
    alignSelf: 'center',
    marginTop: '60%',
  },
  text: {
    ...theme.text.xl,
    textAlign: 'center',
  },
  title: {
    ...theme.text.large,
    textAlign: 'center',
  },
}));

export default HomeScreen;
