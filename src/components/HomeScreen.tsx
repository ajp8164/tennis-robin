import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  ThemeManager,
  getSvg,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InviteRedemptionModal } from 'components/modals/InviteRedemptionModal';
import { appConfig } from 'config';
import { getDocuments } from 'firebase/firestore';
import { useUserProfile } from 'lib/auth';
import { useSelectedTeam } from 'lib/team';
import { HomeNavigatorParamList } from 'types/navigation';
import { Token } from 'types/token';

export type Props = NativeStackScreenProps<HomeNavigatorParamList, 'Home'>;

const HomeScreen = () => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  const userProfile = useUserProfile();
  const selectedTeam = useSelectedTeam();
  const [acceptedInvitation, setAcceptedInvitation] = useState<{
    teamName: string;
  }>();

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

  const onInvitationAccepted = (teamName: string) => {
    setAcceptedInvitation({ teamName });
  };

  return (
    <>
      <View style={[theme.styles.view]}>
        <View
          style={[
            s.content,
            { top: device.insets.top + device.headerBar.height },
          ]}>
          <SvgXml
            xml={getSvg('brandIcon')}
            width={s.icon.width}
            height={s.icon.width}
            style={s.icon}
          />
          <Text
            style={[
              theme.text.h2,
              { fontWeight: '700', marginBottom: 10 },
            ]}>{`Welcome to\n${appConfig.appName}!`}</Text>
          <Text style={s.text}>{`${selectedTeam?.name}`}</Text>
          {acceptedInvitation ? (
            <Text
              style={
                s.accepted
              }>{`Welcome to team "${acceptedInvitation.teamName}" ${userProfile?.firstName}!`}</Text>
          ) : null}
        </View>
      </View>
      <InviteRedemptionModal
        ref={inviteRedemptionModalModalRef}
        onAccepted={onInvitationAccepted}
      />
    </>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device, theme }) => ({
  accepted: {
    ...theme.text.xl,
    marginTop: 50,
  },
  content: {
    position: 'absolute',
    paddingHorizontal: 17,
    width: '100%',
  },
  icon: {
    width: device.screen.width * 0.5,
    alignSelf: 'center',
  },
  text: {
    ...theme.text.normal,
  },
}));

export default HomeScreen;
