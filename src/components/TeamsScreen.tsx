import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  LayoutRectangle,
  ListRenderItem,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  Divider,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { ListItemCheckBoxInfo } from 'components/atoms/List';
import { archiveDocument, useCollection } from 'firebase/firestore';
import { useUserProfile } from 'lib/auth';
import { defaultTeamName, useDefaultTeam } from 'lib/team';
import { useConfirmAction } from 'lib/useConfirmAction';
import { CircleMinus, Plus, Trash2 } from 'lucide-react-native';
import { selectTeam } from 'store/selectors/teamSelectors';
import { saveSelectedTeam } from 'store/slices/team';
import { SetupNavigatorParamList } from 'types/navigation';
import { Team } from 'types/team';

export type Props = NativeStackScreenProps<SetupNavigatorParamList, 'Teams'>;

const TeamsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const confirmAction = useConfirmAction();
  const userProfile = useUserProfile();

  const { docs: allTeams } = useCollection<Team>('Teams', {
    where: [
      {
        fieldPath: 'defaultTeam',
        opStr: '==',
        value: false,
      },
      {
        fieldPath: 'owners',
        opStr: 'array-contains',
        value: userProfile?.id || '',
      },
    ],
    orderBy: [{ fieldPath: 'name', directionStr: 'asc' }],
  });

  const defaultTeam = useDefaultTeam();
  const selectedTeamId = useSelector(selectTeam).teamId;

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();
  const [listLayout, setListLayout] = useState<LayoutRectangle>();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            {allTeams.length ? (
              <Button
                title={listEditorState?.enabled ? 'Done' : 'Edit'}
                titleStyle={theme.styles.buttonScreenHeaderTitle}
                buttonStyle={theme.styles.buttonScreenHeader}
                onPress={() => listEditorRef.current?.onToggleEditMode()}
              />
            ) : null}
            <Button
              buttonStyle={theme.styles.buttonScreenHeader}
              headerRight
              icon={
                <Plus color={theme.colors.screenHeaderButtonText} size={28} />
              }
              onPress={() => navigation.navigate('NewTeam', {})}
            />
          </>
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTeams, listEditorState]);

  const setTeam = (team?: Team) => {
    dispatch(
      saveSelectedTeam({
        teamId: team?.id,
      }),
    );
  };

  const archiveTeam = async (team: Team) => {
    try {
      await archiveDocument('Teams', team);

      // Select the unknown commander if we delete the selected commander.
      if (team.id === selectedTeamId) {
        setTeam(defaultTeam);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      Alert.alert(
        'Team Not Deleted',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }],
        {
          cancelable: false,
        },
      );
    }
  };

  const renderTeam: ListRenderItem<Team> = ({ item: team, index }) => {
    return (
      <ListItemCheckBoxInfo
        key={team.id}
        title={team.name}
        position={listItemPosition(index, allTeams.length)}
        checked={team.id === selectedTeamId}
        listEditor={listEditorRef.current}
        onPress={() => setTeam(team)}
        onPressInfo={() =>
          navigation.navigate('TeamEditor', {
            teamId: team.id!,
            screenTitle: team.name,
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
                label: 'Delete Team',
                title: `This action cannot be undone.\nAre you sure you don't want to delete this team?`,
              });
            },
            onPress: () => archiveTeam(team),
          },
        ]}
      />
    );
  };

  const renderDefaultTeam = () => {
    return (
      <>
        {allTeams && <Divider />}
        <ListItemCheckBoxInfo
          title={defaultTeamName}
          position={['first', 'last']}
          hideInfo={true}
          checked={selectedTeamId === defaultTeam?.id}
          onPress={() => setTeam(defaultTeam)}
        />
        <Divider
          note
          light
          subHeaderStyle={theme.text.medium}
          text={
            'The default team is associated with all tournament groups not assigned to a named team. You may choose to use the default team or create named teams or both.'
          }
        />
      </>
    );
  };

  return (
    <ListEditor
      ref={listEditorRef}
      onChangeState={setListEditorState}
      listLayout={listLayout}>
      <View
        style={[{ flex: 1 }]}
        onLayout={e => setListLayout(e.nativeEvent.layout)}>
        <FlatList
          style={theme.styles.view}
          data={allTeams}
          renderItem={renderTeam}
          keyExtractor={item => `${item.id}`}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={allTeams.length ? <Divider /> : null}
          ListFooterComponent={renderDefaultTeam()}
        />
      </View>
    </ListEditor>
  );
};

export default TeamsScreen;
