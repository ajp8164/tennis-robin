import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, ListRenderItem } from 'react-native';

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
import { EmptyView } from 'components/molecules/EmptyView';
import { archiveDocument, useCollection } from 'firebase/firestore';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Plus, Trash2 } from 'lucide-react-native';
import { SetupNavigatorParamList } from 'types/navigation';
import { Player, PlayerStatus } from 'types/player';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Players'>;

const PlayersScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const confirmAction = useConfirmAction();

  const { docs: allPlayers } = useCollection<Player>('Players', {
    orderBy: [
      { fieldPath: 'lastName', directionStr: 'asc' },
      { fieldPath: 'firstName', directionStr: 'asc' },
    ],
  });

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            headerRight
            icon={
              <Plus color={theme.colors.screenHeaderButtonText} size={28} />
            }
            onPress={() => navigation.navigate('NewPlayer', {})}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const renderPlayer: ListRenderItem<Player> = ({ item: player, index }) => {
    return (
      <ListItemSwipeable
        key={player.id}
        title={`${player.lastName}, ${player.firstName}`}
        value={
          player.status === PlayerStatus.Active ? (
            <Chip
              text={'Active'}
              color={theme.colors.success}
              textColor={theme.colors.stickyWhite}
            />
          ) : (
            <Chip
              text={'Inactive'}
              color={theme.colors.assertive}
              textColor={theme.colors.stickyWhite}
            />
          )
        }
        position={listItemPosition(index, allPlayers.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() =>
          navigation.navigate('PlayerEditor', {
            playerId: player.id || '',
            screenTitle: `${player.firstName} ${player.lastName}`,
          })
        }
        showEditor={listEditorState?.show}
        editAction={{
          ButtonComponent: <CircleMinus color={theme.colors.assertive} />,
          op: 'open-swipeable',
          draggable: true,
        }}
        swipeableActionsRight={[
          {
            text: 'Delete',
            color: theme.colors.assertive,
            ButtonComponent: <Trash2 color={theme.colors.stickyWhite} />,
            op: 'remove',
            confirmation: () => {
              listEditorRef.current?.reset();
              return confirmAction({
                label: `Delete Player`,
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this player?',
              });
            },
            onPress: () => archivePlayer(player),
          },
        ]}
      />
    );
  };

  if (!allPlayers.length) {
    return (
      <EmptyView
        info
        message={'No Players'}
        details={'Tap the + button to add a Player.'}
        buttonTitle={'Add Player'}
        onButtonPress={() => navigation.navigate('NewPlayer', {})}
      />
    );
  }

  return (
    <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
      <FlatList
        style={theme.styles.view}
        data={allPlayers}
        renderItem={renderPlayer}
        keyExtractor={item => `${item.id}`}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allPlayers.length ? <Divider /> : null}
        ListFooterComponent={<Divider />}
      />
    </ListEditor>
  );
};

export default PlayersScreen;
