import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';

import { useEvent } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EnumPickerResult } from 'components/EnumPickerScreen';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemInputMethods } from 'components/atoms/List';
import {
  addDocument,
  getDocument,
  updateDocument,
  useCollection,
} from 'firebase/firestore';
import { Formik, FormikProps } from 'formik';
import { Group } from 'types/group';
import { GroupsNavigatorParamList } from 'types/navigation';
import { Player } from 'types/player';
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

  const [playerEnum, setPlayerEnum] = useState<string[]>([]);

  const { docs: allPlayers } = useCollection<Player>('Players', {
    orderBy: [
      { fieldPath: 'lastName', directionStr: 'asc' },
      { fieldPath: 'firstName', directionStr: 'asc' },
    ],
  });

  const [initialValues, setInitialValues] = useState<FormValues>({
    name: '',
  });

  useEffect(() => {
    if (groupId) {
      getDocument<Group>('Groups', groupId).then(group => {
        if (group) {
          setInitialValues({
            name: group.name,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create an enumeration of players for selection into the group.
  useEffect(() => {
    const playerEnum = allPlayers.map(p => {
      return `${p.lastName} ${p.firstName}{${p.id}}`;
    });

    setPlayerEnum(playerEnum);
  }, [allPlayers]);

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

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs([nameFieldRef.current].filter(Boolean));
  }, []);

  useEffect(() => {
    // Event handlers for EnumPicker
    event.on('player', onChangePlayers);

    return () => {
      event.removeListener('player', onChangePlayers);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangePlayers = (result: EnumPickerResult) => {
    console.log(result.value);
  };

  const cancel = () => {
    formikRef.current?.resetForm();
    Keyboard.dismiss();
    navigation.goBack();
  };

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    navigation.goBack();
  };

  const onSubmit = (values: FormValues) => {
    if (groupId) {
      updateDocument<Group>('Groups', {
        id: groupId,
        name: values.name,
      });
    } else {
      addDocument<Group>('Groups', {
        name: values.name,
      });
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

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={cancel}
          />
        );
      },
      headerRight: () => {
        return (
          <Button
            title={'Save'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            disabledTitleStyle={theme.styles.buttonScreenHeaderTitle}
            disabledStyle={theme.styles.buttonScreenHeaderDisabled}
            disabled={!canSubmit}
            onPress={save}
          />
        );
      },
    });
  };

  return (
    <>
      <ScrollView
        style={theme.styles.view}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
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
        <Divider
          text={'PLAYERS'}
          rightComponent={
            <Button
              title={'Add Player'}
              titleStyle={theme.styles.buttonScreenHeaderTitle}
              buttonStyle={theme.styles.dividerTextButton}
              onPress={() =>
                navigation.navigate('EnumPicker', {
                  title: 'Players',
                  values: playerEnum,
                  selected: [],
                  eventName: 'player',
                  mode: 'many-or-none',
                })
              }
            />
          }
        />
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
