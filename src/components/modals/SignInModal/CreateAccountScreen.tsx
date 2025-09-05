import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, ScrollView, Text, View } from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';

import { useSetState } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  KeyboardAccessory,
  KeyboardAccessoryMethods,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import {
  FormikStateWatcher,
  FormikWatcherState,
} from 'components/atoms/FormikStateWatcher';
import { ListItemInput } from 'components/atoms/List';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { useCreateUserWithEmailAndPassword } from 'lib/auth';
import * as Yup from 'yup';

import { SignInNavigatorParamList } from './types';

enum Fields {
  firstName,
  lastName,
  email,
  password,
}

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export interface EditorState {
  isSubmitting: boolean;
  focusedField?: number;
  fieldCount: number;
}

export type Props = NativeStackScreenProps<
  SignInNavigatorParamList,
  'CreateAccountScreen'
>;

const CreateAccountScreen = () => {
  const theme = useTheme();
  const s = useStyles();

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
  const firstNameFieldRef = useRef<InputMethods>(null);
  const lastNameFieldRef = useRef<InputMethods>(null);
  const emailFieldRef = useRef<InputMethods>(null);
  const passwordFieldRef = useRef<InputMethods>(null);
  const keyboardAccessory = useRef<
    KeyboardAccessoryMethods & KeyboardAccessory
  >(null);
  const [resolvedRefs, setResolvedRefs] = useState<(InputMethods | null)[]>([]);

  // Same order as on form.
  const fieldRefs = [emailFieldRef.current, passwordFieldRef.current];

  const [editorState, setEditorState] = useSetState<EditorState>({
    fieldCount: fieldRefs.length,
    focusedField: undefined,
    isSubmitting: false,
  });

  const createUserWithEmailAndPassword = useCreateUserWithEmailAndPassword();

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [
        firstNameFieldRef.current,
        lastNameFieldRef.current,
        emailFieldRef.current,
        passwordFieldRef.current,
      ].filter(Boolean),
    );
  }, []);

  const signIn = (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>,
  ) => {
    Keyboard.dismiss();
    setEditorState({ isSubmitting: true });
    createUserWithEmailAndPassword(
      values.firstName,
      values.lastName,
      values.email,
      values.password,
    )
      .then(() => {
        setEditorState({ isSubmitting: false });
        resetForm({ values });
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => {
        setEditorState({ isSubmitting: false });
        Alert.alert('Account Error', e.message, [{ text: 'OK' }], {
          cancelable: false,
        });
      });
  };

  const schema = Yup.object().shape({
    firstName: Yup.string().required('Required field'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string()
      .email('Enter a valid email address')
      .matches(/\..{2,}$/, 'Email domain needs min 2 characters')
      .required('Required field'),
    password: Yup.string()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])/, 'Include upper/lowercase characters')
      .matches(/^(?=.*[0-9])/, 'Include at least one number')
      .matches(
        /^(?=.*[!@#$%^&*])/,
        'Include at least one special char from !@#$%^&*',
      )
      .min(8, 'Minimum length 8 characters')
      .required('Required field'),
  });

  // Update the header and button states.
  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);
  };

  return (
    <>
      <AvoidSoftInputView style={s.avoidContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.container}>
          <Formik
            innerRef={formikRef}
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
            }}
            validateOnMount={true}
            validationSchema={schema}
            onSubmit={signIn}>
            {({ dirty, errors, handleChange, isValid, submitForm, values }) => (
              <View>
                <FormikStateWatcher<FormValues>
                  onChange={onFormikWatcherStateChange}
                />
                <View style={theme.styles.view}>
                  <Divider />
                  <ListItemInput
                    ref={firstNameFieldRef}
                    error={!!errors.firstName}
                    errorMessage={errors.firstName}
                    position={['first']}
                    inputProps={{
                      value: values.firstName,
                      onChangeText: handleChange('firstName'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(
                          Fields.firstName,
                        ),
                      label: 'First Name',
                      placeholder: 'First Name',
                      autoCorrect: false,
                    }}
                  />
                  <ListItemInput
                    ref={lastNameFieldRef}
                    error={!!errors.lastName}
                    errorMessage={errors.lastName}
                    inputProps={{
                      value: values.lastName,
                      onChangeText: handleChange('lastName'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(
                          Fields.lastName,
                        ),
                      label: 'Last Name',
                      placeholder: 'Last Name',
                      autoCorrect: false,
                    }}
                  />
                  <ListItemInput
                    ref={emailFieldRef}
                    error={!!errors.email}
                    errorMessage={errors.email}
                    inputProps={{
                      value: values.email,
                      onChangeText: handleChange('email'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(Fields.email),
                      label: 'Email',
                      placeholder: 'Email',
                      keyboardType: 'email-address',
                      autoCapitalize: 'none',
                      autoCorrect: false,
                    }}
                  />
                  <ListItemInput
                    ref={passwordFieldRef}
                    error={!!errors.password}
                    errorMessage={errors.password}
                    position={['last']}
                    inputProps={{
                      value: values.password,
                      onChangeText: handleChange('password'),
                      onFocus: () =>
                        keyboardAccessory.current?.focusedField(
                          Fields.password,
                        ),
                      label: 'Password',
                      placeholder: 'Password',
                      secureTextEntry: true,
                    }}
                  />
                  <Button
                    title={'Continue'}
                    titleStyle={theme.styles.buttonTitle}
                    buttonStyle={theme.styles.button}
                    containerStyle={s.continueButtonContainer}
                    disabled={!(dirty && isValid)}
                    loading={editorState.isSubmitting}
                    onPress={() => submitForm()}
                  />
                  <Text style={s.footer}>
                    {'By signing up you agree to our Terms and Privacy Policy'}
                  </Text>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </AvoidSoftInputView>
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

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  avoidContainer: {
    flex: 1,
  },
  container: {
    height: '100%',
  },
  continueButtonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 30,
  },
  forgotPasswordButtonContainer: {
    marginTop: 15,
  },
  forgotPassword: {
    ...theme.text.small,
    ...theme.styles.textDim,
  },
  footer: {
    ...theme.text.small,
    ...theme.styles.textDim,
    alignSelf: 'center',
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
    marginHorizontal: 40,
  },
}));

export default CreateAccountScreen;
