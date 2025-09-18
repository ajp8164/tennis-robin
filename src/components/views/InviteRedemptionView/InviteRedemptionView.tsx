import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import { SvgXml } from 'react-native-svg';

import {
  Divider,
  ThemeManager,
  getSvg,
  useTheme,
} from '@react-native-hello/ui';
import { Button } from 'components/atoms/Button';
import { EmptyView } from 'components/molecules/EmptyView';
import {
  deleteDocument,
  getDocument,
  updateDocument,
} from 'firebase/firestore';
import { useMyPlayer } from 'lib/player';
import { Team } from 'types/team';
import { Token } from 'types/token';
import { UserProfile } from 'types/user';

interface InviteRedemptionViewInterface {
  tokenId: string;
  onAccepted: (teamName: string) => void;
  onDeclined: () => void;
  onCanceled: () => void;
}

export const InviteRedemptionView = (props: InviteRedemptionViewInterface) => {
  const { tokenId, onAccepted, onDeclined, onCanceled } = props;

  const theme = useTheme();
  const s = useStyles();

  const { doc: myPlayer } = useMyPlayer();
  const [team, setTeam] = useState<Team>();
  const [invitedBy, setInvitedBy] = useState<UserProfile>();
  const [enteredTokenId, setEnteredTokenId] = useState<string>('');

  useEffect(() => {
    verifyToken(tokenId);
  }, [tokenId]);

  const verifyToken = async (tokenId: string) => {
    // Get the token.
    const token = await getDocument<Token>('Tokens', tokenId);
    if (token && token?.teamId) {
      // Get the team.
      const team = await getDocument<Team>('Teams', token.teamId);

      if (team && token.inviterUserId) {
        setTeam(team);

        const user = await getDocument<UserProfile>(
          'Users',
          token.inviterUserId,
        );
        if (user) {
          setInvitedBy(user);
        } else {
          // Problem with user
        }
      } else {
        // Problem with team
      }
    } else {
      // Problem with token
    }
  };

  const tryAcceptInvite = async () => {
    if (tokenId === 'ask') {
      await verifyToken(enteredTokenId);
    }
    acceptInvite();
  };

  const acceptInvite = async () => {
    await addToTeam();
    await deleteToken();
    onAccepted(team?.name || '');
  };

  const addToTeam = async () => {
    if (team && myPlayer) {
      await updateDocument<Team>('Teams', {
        ...team,
        players: [...new Set([...team.players, myPlayer.id])],
      } as Team);
    }
  };

  const deleteToken = async () => {
    await deleteDocument('Tokens', tokenId);
  };

  const declineInvite = async () => {
    await deleteToken();
    onDeclined();
  };

  if (!invitedBy && tokenId !== 'ask') {
    return (
      <View style={theme.styles.viewAlt}>
        <EmptyView
          type={'loading'}
          message={'Loading'}
          details={"We're getting your invitation ready..."}
          style={s.empty}
        />
        <View style={s.buttons}>
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonOutlineTitle}
            buttonStyle={theme.styles.buttonOutline}
            outline
            containerStyle={s.buttonContainer}
            onPress={() => onCanceled()}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={theme.styles.viewAlt}>
      <Divider />
      <View style={s.container}>
        {tokenId === 'ask' ? (
          <Text style={s.title}>{'Have a\nTeam Invitation?'}</Text>
        ) : (
          <>
            <Text style={s.title}>
              {`${invitedBy?.firstName} ${invitedBy?.lastName} has invited\nyou to join the team`}
            </Text>
            <Text style={s.title}>{`"${team?.name}"`}</Text>
          </>
        )}
        <SvgXml
          xml={getSvg('brandIcon')}
          width={s.icon.width}
          height={s.icon.width}
          style={s.icon}
        />
        {tokenId === 'ask' ? (
          <>
            <Text style={s.description}>
              {'Enter your Team Invitation code'}
            </Text>
            <CodeField
              value={enteredTokenId}
              onChangeText={setEnteredTokenId}
              cellCount={6}
              rootStyle={s.codeFieldContainer}
              textContentType={'oneTimeCode'}
              keyboardAppearance={ThemeManager.name}
              allowFontScaling={false}
              renderCell={({ index, symbol, isFocused }) => (
                <Text key={index} style={[s.cell, isFocused && s.focusCell]}>
                  {symbol ||
                    (isFocused ? (
                      <Text style={s.cursor}>
                        <Cursor />
                      </Text>
                    ) : null)}
                </Text>
              )}
            />
          </>
        ) : null}
        <Text style={s.description}>
          {'We play matches each week from September to May.'}
        </Text>
        {team && team.players.length ? (
          <Text style={s.description}>
            {team.players.length > 1
              ? `${team?.players.length} people have already accepted`
              : `${team?.players.length} person has already accepted`}
          </Text>
        ) : null}
      </View>
      <View style={s.buttons}>
        <Button
          title={'Accept'}
          titleStyle={theme.styles.buttonTitle}
          buttonStyle={theme.styles.button}
          disabledStyle={theme.styles.buttonDisabled}
          disabledTitleStyle={theme.styles.buttonTitle}
          disabled={tokenId === 'ask' && enteredTokenId.length !== 6}
          onPress={() => tryAcceptInvite()}
        />
        <Button
          title={tokenId === 'ask' ? 'Cancel' : 'Decline'}
          titleStyle={theme.styles.buttonOutlineTitle}
          buttonStyle={theme.styles.buttonOutline}
          outline
          containerStyle={s.buttonContainer}
          onPress={() => {
            tokenId === 'ask' ? onCanceled() : declineInvite();
          }}
        />
      </View>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device, theme }) => ({
  buttons: {
    position: 'absolute',
    bottom: device.insets.bottom + 30,
    width: '100%',
    alignSelf: 'center',
  },
  buttonContainer: {
    marginTop: 15,
  },
  cell: {
    ...theme.text.h3,
    width: 40,
    height: 40,
    lineHeight: 35,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: theme.colors.midGray,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  codeFieldContainer: {
    marginVertical: 15,
    marginHorizontal: 30,
  },
  container: {
    marginTop: 30,
  },
  cursor: {
    ...theme.text.xl,
    lineHeight: 34,
    color: theme.colors.brandSecondary,
  },
  description: {
    ...theme.text.normal,
    textAlign: 'center',
    marginHorizontal: 30,
    marginTop: 15,
  },
  empty: {
    backgroundColor: theme.colors.viewAltBackground,
  },
  focusCell: {
    borderColor: theme.colors.brandSecondary,
  },
  icon: {
    width: device.screen.width * 0.5,
    alignSelf: 'center',
    marginTop: 10,
  },
  title: {
    ...theme.text.h3,
    fontWeight: '700',
    textAlign: 'center',
  },
}));

export default InviteRedemptionView;
