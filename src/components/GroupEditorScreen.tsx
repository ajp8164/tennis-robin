import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  ListRenderItem,
  ScrollView,
  View,
} from 'react-native';

import { useEvent } from '@react-native-hello/core';
import {
  Chip,
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListEditor,
  ListEditorMethods,
  ListEditorState,
  ListItemSwipeable,
  listItemPosition,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EnumPickerResult, EnumPickerValue } from 'components/EnumPickerScreen';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemInputMethods } from 'components/atoms/List';
import { EmptyView } from 'components/molecules/EmptyView';
import {
  addDocument,
  getDocuments,
  updateDocument,
  useCollection,
  useDocument,
} from 'firebase/firestore';
import { Formik, FormikProps } from 'formik';
import { useUserProfile } from 'lib/auth';
import { useSelectedTeam } from 'lib/team';
import { CircleMinus, EyeOff } from 'lucide-react-native';
import { Group } from 'types/group';
import { GroupsNavigatorParamList } from 'types/navigation';
import { Player, PlayerStatus } from 'types/player';
import { Team } from 'types/team';
import * as Yup from 'yup';

// CompositeScreenProps not working here since NewGroup is also in the SetupNavigator
// just using a different presentation (didn't create a new navigator for a single screen).
export type Props =
  | NativeStackScreenProps<GroupsNavigatorParamList, 'GroupEditor'>
  | NativeStackScreenProps<GroupsNavigatorParamList, 'NewGroup'>;

// Order of fields for accessory view.
enum Fields {
  name,
}

type FormValues = {
  name: string;
};

const GroupEditorScreen = ({ navigation, route }: Props) => {
  const { groupId } = route.params || {};

  const theme = useTheme();
  const event = useEvent();
  const userProfile = useUserProfile();
  const selectedTeam = useSelectedTeam();

  const { doc: group } = useDocument<Group>('Groups', groupId);
  const [groupPlayers, setGroupPlayers] = useState<Player[]>([]);

  // For building the player picker enum.
  const [playerEnum, setPlayerEnum] = useState<EnumPickerValue[]>([]);

  const { docs: allPlayers } = useCollection<Player>('Players', {
    where: [
      {
        fieldPath: 'user',
        opStr: 'in',
        value: selectedTeam?.users || [],
      },
    ],
    orderBy: [
      { fieldPath: 'lastName', directionStr: 'asc' },
      { fieldPath: 'firstName', directionStr: 'asc' },
    ],
  });
  console.log('U', allPlayers, selectedTeam?.users);

  const [initialValues, setInitialValues] = useState<FormValues>({
    name: '',
  });

  const schema = Yup.object().shape({
    name: Yup.string().required(),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const nameFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  const listEditorRef = useRef<ListEditorMethods>(null);
  const [listEditorState, setListEditorState] = useState<ListEditorState>();

  useEffect(() => {
    if (group && !initialValues.name) {
      setInitialValues({
        name: group.name,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  // When the group player assignments are changed refetch the collection of players.
  useEffect(() => {
    (async () => {
      const groupPlayers = await getDocuments<Player>('Players', {
        where: [
          {
            fieldPath: '__name__',
            opStr: 'in',
            value: group?.players || [],
          },
        ],
        orderBy: [
          { fieldPath: 'lastName', directionStr: 'asc' },
          { fieldPath: 'firstName', directionStr: 'asc' },
        ],
      });

      setGroupPlayers(groupPlayers.result);
    })();
  }, [group?.players]);

  // Create an enumeration of players for selection into the group.
  useEffect(() => {
    const playerEnum = allPlayers.map<EnumPickerValue>(p => {
      return {
        id: p.id!,
        label: `${p.lastName} ${p.firstName}`,
      };
    });

    setPlayerEnum(playerEnum);
  }, [allPlayers]);

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs([nameFieldRef.current].filter(Boolean));
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <Button
              title={listEditorState?.enabled ? 'Done' : 'Edit'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              onPress={() => listEditorRef.current?.onToggleEditMode()}
            />
            <Button
              title={'Save'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.buttonScreenHeader}
              disabledTitleStyle={theme.styles.buttonScreenHeaderTitle}
              disabledStyle={theme.styles.buttonScreenHeaderDisabled}
              disabled={!formikCanSubmit}
              headerRight
              onPress={save}
            />
          </>
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listEditorState, formikCanSubmit]);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('change-players', onChangePlayers);

    return () => {
      event.removeListener('change-players', onChangePlayers);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  const onChangePlayers = async (result: EnumPickerResult) => {
    if (group) {
      updateDocument<Group>('Groups', {
        ...group,
        players: result.value,
      });
    }
  };

  const removePlayer = async (playerId: string) => {
    if (group) {
      updateDocument<Group>('Groups', {
        ...group,
        players: group.players.filter(p => p !== playerId),
      });
    }
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    navigation.goBack();
  };

  const onSubmit = async (values: FormValues) => {
    if (group) {
      updateDocument<Group>('Groups', {
        ...group,
        name: values.name,
      });
    } else {
      const newGroup = await addDocument<Group>('Groups', {
        name: values.name,
        owners: [userProfile!.id],
        players: [],
      });

      // Associate the new group with my selected team.
      if (selectedTeam && newGroup.id) {
        updateDocument<Team>('Teams', {
          ...selectedTeam,
          groups: [...selectedTeam.groups, newGroup.id],
        } as Team);
      }
    }
  };

  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, changedFields, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);

    // Update header as name changes.
    if (changedFields?.includes('name')) {
      navigation.setOptions({
        title: next.values.name,
      });
    }
  };

  const renderPlayer: ListRenderItem<Player> = ({ item: player, index }) => {
    return (
      <ListItemSwipeable
        key={player.id}
        title={`${player.lastName} ${player.firstName}`}
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
        position={listItemPosition(index, groupPlayers.length)}
        rightContent={'chevron-right'}
        listEditor={listEditorRef.current}
        onPress={() =>
          navigation.navigate('Player', {
            playerId: player.id!,
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
            text: 'Remove',
            color: theme.colors.brandSecondary,
            ButtonComponent: <EyeOff color={theme.colors.stickyWhite} />,
            op: 'remove',
            onPress: () => player.id && removePlayer(player.id),
          },
        ]}
      />
    );
  };

  const renderPlayersHeader = () => (
    <Divider
      text={`${group?.players.length || ''} PLAYER${group?.players.length !== 1 ? 'S' : ''}`}
      rightComponent={
        <Button
          title={'Choose Players'}
          titleStyle={theme.styles.buttonScreenHeaderTitle}
          buttonStyle={theme.styles.dividerTextButton}
          onPress={() =>
            navigation.navigate('EnumPicker', {
              title: 'Players',
              values: playerEnum,
              selected: group?.players,
              itemPlural: 'Players',
              eventName: 'change-players',
              mode: 'many-or-none',
            })
          }
        />
      }
    />
  );

  const renderPlayersEmpty = () => (
    <>
      <Divider />
      <EmptyView
        info
        message={'No Players'}
        details={'Tap Choose Players to add Players.'}
        positionTop
        buttonTitle={'Choose Players'}
        onButtonPress={() =>
          navigation.navigate('EnumPicker', {
            title: 'Players',
            values: playerEnum,
            selected: group?.players,
            itemPlural: 'Players',
            eventName: 'change-players',
            mode: 'many-or-none',
          })
        }
      />
    </>
  );

  return (
    <>
      <ScrollView
        style={theme.styles.view}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Divider />
        <Formik
          innerRef={formik => {
            if (formik) {
              formikRef.current = formik;
            }
          }}
          initialValues={initialValues}
          enableReinitialize
          validationSchema={schema}
          validateOnMount
          onSubmit={onSubmit}>
          {({ errors, handleChange, values }) => (
            <View>
              <FormikStateWatcher<FormValues>
                onChange={onFormikWatcherStateChange}
              />
              <ListItemInput
                ref={nameFieldRef}
                position={['first', 'last']}
                error={!!errors.name}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('name'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.name),
                  value: values.name,
                  label: 'Group Name',
                  placeholder: 'Group Name',
                  autoCapitalize: 'words',
                }}
              />
            </View>
          )}
        </Formik>
        <ListEditor ref={listEditorRef} onChangeState={setListEditorState}>
          <FlatList
            contentInsetAdjustmentBehavior={'automatic'}
            style={theme.styles.view}
            data={groupPlayers}
            renderItem={renderPlayer}
            keyExtractor={item => `${item.id}`}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              groupPlayers.length ? renderPlayersHeader() : null
            }
            ListFooterComponent={<Divider />}
            ListEmptyComponent={renderPlayersEmpty()}
          />
        </ListEditor>
      </ScrollView>
      <KeyboardAccessory
        ref={keyboardAccessory}
        id={'keyboardAccessory'}
        fieldRefs={resolvedRefs}
        doneText={'Done'}
        disabledDone={!formikCanSubmit}
        onDone={Keyboard.dismiss}
      />
    </>
  );
};

export default GroupEditorScreen;
