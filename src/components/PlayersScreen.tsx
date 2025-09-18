import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, ListRenderItem } from 'react-native';

import { documentId } from '@react-native-firebase/firestore';
import {
  Chip,
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItemSwipeable,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { DynamicIcon } from 'components/atoms/DynamicIcon';
import { EmptyView } from 'components/molecules/EmptyView';
import {
  archiveDocument,
  deleteDocument,
  useCollection,
} from 'firebase/firestore';
import { appIcons } from 'lib/appIcons';
import { usePlayerStatusDecoration } from 'lib/player';
import { useSelectedTeam } from 'lib/team';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Trash2, Undo } from 'lucide-react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { Player, PlayerStatus } from 'types/player';
import { Token } from 'types/token';

type Item = {
  type: 'player' | 'token';
  id: string;
  firstName: string;
  lastName: string;
  status: PlayerStatus;
  source: Player | Token;
};

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Players'>;

const PlayersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const confirmAction = useConfirmAction();
  const playerStatusDecoration = usePlayerStatusDecoration();

  const { doc: selectedTeam } = useSelectedTeam();
  const [items, setItems] = useState<Item[]>([]);

  const { docs: players } = useCollection<Player>('Players', {
    where: [
      {
        fieldPath: documentId(),
        opStr: 'in',
        value: selectedTeam?.players || [],
      },
    ],
  });

  const { docs: invites } = useCollection<Token>('Tokens', {
    where: [
      {
        fieldPath: 'teamId',
        opStr: '==',
        value: selectedTeam?.id || '',
      },
    ],
  });

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    const playerItems: Item[] = players.map(p => {
      return {
        type: 'player',
        id: p.id!,
        firstName: p.firstName,
        lastName: p.lastName,
        status: p.status,
        source: p,
      };
    });

    const inviteItems: Item[] = invites.map(i => {
      return {
        type: 'token',
        id: i.value,
        firstName: i.firstName || 'No name',
        lastName: i.lastName || '',
        status: PlayerStatus.Invited,
        source: i,
      };
    });

    setItems(
      [...playerItems, ...inviteItems].sort((a, b) => {
        if (a.lastName < b.lastName) return -1;
        if (a.lastName > b.lastName) return 1;
        return 0;
      }),
    );
  }, [players, invites]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            title={'Invite Players'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={() => navigation.navigate('PlayerInvitations')}
          />
        );
      },
    });
  });

  const archivePlayer = async (player: Player) => {
    try {
      await archiveDocument('Players', player);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      Alert.alert(
        'Player Not Deleted',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }],
        {
          cancelable: false,
        },
      );
    }
  };

  const revokeInvite = async (token: Token) => {
    try {
      await deleteDocument('Tokens', token.value);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      Alert.alert(
        'Player Invite Not Deleted',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }],
        {
          cancelable: false,
        },
      );
    }
  };

  const renderItem: ListRenderItem<Item> = ({ item, index }) => {
    const isPlayer = item.type === 'player';
    return (
      <ListItemSwipeable
        key={item.id}
        title={`${item.lastName}, ${item.firstName}`}
        value={
          isPlayer ? (
            <DynamicIcon
              icon={appIcons[playerStatusDecoration[item.status].icon]}
              color={playerStatusDecoration[item.status].color}
            />
          ) : (
            <Chip
              text={playerStatusDecoration[item.status].label}
              color={playerStatusDecoration[item.status].color}
              textColor={theme.colors.stickyWhite}
            />
          )
        }
        position={listItemPosition(index, items.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() => {
          isPlayer
            ? navigation.navigate('Player', {
                playerId: item.id || '',
              })
            : navigation.navigate('PlayerInvitation', {
                tokenId: item.id || '',
              });
        }}
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
          draggable: true,
        }}
        swipeableActionsRight={[
          {
            text: isPlayer ? 'Delete' : 'Revoke',
            color: isPlayer ? theme.colors.assertive : theme.colors.info,
            ButtonComponent: isPlayer ? (
              <Trash2 color={theme.colors.stickyWhite} />
            ) : (
              <Undo color={theme.colors.stickyWhite} />
            ),
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction(
                isPlayer
                  ? {
                      label: `Delete Player`,
                      title:
                        'This action cannot be undone.\nAre you sure you want to delete this player?',
                    }
                  : {
                      label: `Revoke Invite`,
                      title: 'You can create a new invitation later.',
                    },
              );
            },
            onPress: () => {
              isPlayer
                ? archivePlayer(item.source as Player)
                : revokeInvite(item.source as Token);
            },
          },
        ]}
      />
    );
  };

  if (!players.length) {
    return (
      <EmptyView
        type={'info'}
        message={'No Players'}
        details={'Invite Players to your Team.'}
        buttonTitle={'Invite Players'}
        onButtonPress={() => navigation.navigate('PlayerInvitations')}
      />
    );
  }

  return (
    <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
      <FlatList
        style={theme.styles.view}
        data={items}
        renderItem={renderItem}
        keyExtractor={item => `${item.id}`}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={items.length ? <Divider /> : null}
        ListFooterComponent={<Divider />}
      />
    </ListEditor>
  );
};

export default PlayersScreen;
