import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, ListRenderItem } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import {
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
import { deleteDocument, useCollection } from 'firebase/firestore';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Plus, Trash2 } from 'lucide-react-native';
import { Group } from 'types/group';
import { GroupsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<GroupsNavigatorParamList, 'Groups'>;

const GroupsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const confirmAction = useConfirmAction();

  const { docs: allGroups } = useCollection<Group>('Groups', {
    orderBy: [{ fieldPath: 'name', directionStr: 'asc' }],
  });

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={listEditorState?.enabled ? 'Done' : 'Edit'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={() => listEditorRef.current?.onToggleEditMode()}
          />
        );
      },
      headerRight: () => {
        return (
          <Button
            buttonStyle={theme.styles.buttonScreenHeader}
            headerRight
            icon={
              <Plus color={theme.colors.screenHeaderButtonText} size={28} />
            }
            onPress={() => navigation.navigate('NewGroup', {})}
          />
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listEditorState]);

  const deleteGroup = async (groupId: string) => {
    try {
      await deleteDocument('Groups', groupId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      Alert.alert(
        'Group Not Deleted',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }],
        {
          cancelable: false,
        },
      );
    }
  };

  const renderGroup: ListRenderItem<Group> = ({ item: group, index }) => {
    return (
      <ListItemSwipeable
        key={group.id}
        title={group.name}
        subtitle={`${group.players.length} Player${group.players.length !== 1 ? 's' : ''}`}
        valueStyle={theme.text.medium}
        position={listItemPosition(index, allGroups.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() =>
          navigation.navigate('GroupEditor', {
            groupId: group.id || '',
            screenTitle: group.name,
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
                label: `Delete Group`,
                title:
                  'This action cannot be undone.\nAre you sure you want to delete this group?',
              });
            },
            onPress: () => group.id && deleteGroup(group.id),
          },
        ]}
      />
    );
  };

  if (!allGroups.length) {
    return (
      <EmptyView
        info
        message={'No Groups'}
        details={'Tap the + button to add a Group.'}
        buttonTitle={'Add Group'}
        onButtonPress={() => navigation.navigate('NewGroup', {})}
      />
    );
  }

  return (
    <ScrollView
      style={theme.styles.view}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
        <FlatList
          scrollEnabled={false}
          data={allGroups}
          renderItem={renderGroup}
          keyExtractor={item => `${item.id}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Divider />}
          ListFooterComponent={<Divider />}
        />
      </ListEditor>
    </ScrollView>
  );
};

export default GroupsScreen;
