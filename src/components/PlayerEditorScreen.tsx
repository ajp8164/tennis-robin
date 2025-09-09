import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';

import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ListItemSwitch,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput, ListItemInputMethods } from 'components/atoms/List';
import { addDocument, getDocument, updateDocument } from 'firebase/firestore';
import { Formik, FormikProps } from 'formik';
import { SetupNavigatorParamList } from 'types/navigation';
import { Player, PlayerStatus } from 'types/player';
import * as Yup from 'yup';

// CompositeScreenProps not working here since NewPlayer is also in the SetupNavigator
// just using a different presentation (didn't create a new navigator for a single screen).
export type Props =
  | NativeStackScreenProps<SetupNavigatorParamList, 'PlayerEditor'>
  | NativeStackScreenProps<SetupNavigatorParamList, 'NewPlayer'>;

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
  status: PlayerStatus;
};

const PlayerEditorScreen = ({ navigation, route }: Props) => {
  const { playerId } = route.params || {};

  const theme = useTheme();

  const [initialValues, setInitialValues] = useState<FormValues>({
    firstName: '',
    lastName: '',
    email: '',
    status: PlayerStatus.Inactive,
  });

  useEffect(() => {
    if (playerId) {
      getDocument<Player>('Players', playerId).then(player => {
        if (player) {
          setInitialValues({
            firstName: player.firstName,
            lastName: player.lastName,
            email: player.email,
            status: player.status,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (playerId) {
      updateDocument<Player>('Players', {
        id: playerId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        status: values.status,
      });
    } else {
      addDocument<Player>('Players', {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        status: values.status,
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
    if (
      changedFields?.includes('firstName') ||
      changedFields?.includes('lastName')
    ) {
      navigation.setOptions({
        title: `${next?.values.firstName || ''} ${next?.values.lastName || ''}`,
      });
    }

    navigation.setOptions({
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
          {({ errors, handleChange, setFieldValue, values }) => (
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
              <Divider />
              <ListItemSwitch
                title={'Active'}
                value={values.status === PlayerStatus.Active}
                position={['first', 'last']}
                onValueChange={value =>
                  setFieldValue(
                    'status',
                    value ? PlayerStatus.Active : PlayerStatus.Inactive,
                  )
                }
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

export default PlayerEditorScreen;
