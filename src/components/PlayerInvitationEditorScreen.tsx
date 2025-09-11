import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';

import { useEvent, uuidv4 } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemInputMethods } from 'components/atoms/List';
import { Formik, FormikProps } from 'formik';
import { Contact } from 'types/contact';
import { SetupNavigatorParamList } from 'types/navigation';
import * as Yup from 'yup';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'PlayerInvitationEditor'
>;

// Order of fields for accessory view.
enum Fields {
  firstName,
  lastName,
  email,
}

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
};

const PlayerInvitationEditorScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const event = useEvent();

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
  };

  const schema = Yup.object().shape({
    firstName: Yup.string().required(),
    lastName: Yup.string().required(),
    email: Yup.string()
      .email('Enter a valid email address')
      .matches(/\..{2,}$/, 'Email domain needs min 2 characters')
      .required('Required field'),
  });

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const firstNameFieldRef = useRef<ListItemInputMethods>(null);
  const lastNameFieldRef = useRef<ListItemInputMethods>(null);
  const emailFieldRef = useRef<ListItemInputMethods>(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [
        firstNameFieldRef.current,
        lastNameFieldRef.current,
        emailFieldRef.current,
      ].filter(Boolean),
    );
  }, []);

  const save = () => {
    formikRef.current?.handleSubmit();
    formikRef.current?.resetForm({ values: formikRef.current?.values });
    Keyboard.dismiss();
    navigation.goBack();
  };

  const onSubmit = (values: FormValues) => {
    event.emit('entered-contact', {
      id: uuidv4(),
      type: 'entered',
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
    } as Contact);
  };

  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);

    navigation.setOptions({
      headerLeft: () => {
        return (
          <Button
            title={'Cancel'}
            titleStyle={theme.styles.buttonScreenHeaderTitle}
            buttonStyle={theme.styles.buttonScreenHeader}
            onPress={navigation.goBack}
          />
        );
      },
      headerRight: () => {
        return (
          <Button
            title={'Add'}
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
                ref={firstNameFieldRef}
                position={['first']}
                error={!!errors.firstName}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('firstName'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.firstName),
                  value: values.firstName,
                  label: 'First Name',
                  placeholder: 'First Name',
                  autoCapitalize: 'words',
                }}
              />
              <ListItemInput
                ref={lastNameFieldRef}
                error={!!errors.lastName}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('lastName'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.lastName),
                  value: values.lastName,
                  label: 'Last Name',
                  placeholder: 'Last Name',
                  autoCapitalize: 'words',
                }}
              />
              <ListItemInput
                ref={emailFieldRef}
                position={['last']}
                error={!!errors.email}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('email'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.email),
                  value: values.email,
                  label: 'Email',
                  placeholder: 'Email',
                  autoCapitalize: 'none',
                  keyboardType: 'email-address',
                }}
              />
            </View>
          )}
        </Formik>
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

export default PlayerInvitationEditorScreen;
