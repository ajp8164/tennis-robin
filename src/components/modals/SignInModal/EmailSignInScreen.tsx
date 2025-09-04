import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Text, View } from 'react-native';

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
import { signInwithEmailAndPassword } from 'lib/auth';
import * as Yup from 'yup';

import { SignInNavigatorParamList } from './types';

enum Fields {
  email,
  password,
}

type FormValues = {
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
  'EmailSignInScreen'
>;

const EmailSignInScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const [formikCanSubmit, setFormikCanSubmit] = useState(false);
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

  // Supports keyboard accessory view.
  // Ensures all refs are set.
  useEffect(() => {
    setResolvedRefs(
      [emailFieldRef.current, passwordFieldRef.current].filter(Boolean),
    );
  }, []);

  const initialValues = {
    email: '',
    password: '',
  } as FormValues;

  const schema = Yup.object().shape({
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

  const signIn = (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>,
  ) => {
    Keyboard.dismiss();
    setEditorState({ isSubmitting: true });
    signInwithEmailAndPassword(values.email, values.password)
      .then(() => {
        setEditorState({ isSubmitting: false });
        resetForm({ values });
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((e: any) => {
        setEditorState({ isSubmitting: false });
        Alert.alert('Sign In Error', e.message, [{ text: 'OK' }], {
          cancelable: false,
        });
      });
  };

  const onFormikWatcherStateChange = (
    state: FormikWatcherState<FormValues>,
  ) => {
    const { next, isValid = false } = state;
    const canSubmit = next.dirty && isValid;
    setFormikCanSubmit(canSubmit);
  };

  return (
    <>
      <Formik
        innerRef={formik => {
          if (formik) {
            formikRef.current = formik;
          }
        }}
        initialValues={initialValues}
        validateOnMount
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
                ref={emailFieldRef}
                error={!!errors.email}
                errorMessage={errors.email}
                position={['first']}
                inputProps={{
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('email'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.email),
                  value: values.email,
                  label: 'Email',
                  placeholder: 'Email',
                  insideModal: true,
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
                  inputAccessoryViewID: 'keyboardAccessory',
                  onChangeText: handleChange('password'),
                  onFocus: () =>
                    keyboardAccessory.current?.focusedField(Fields.password),
                  value: values.password,
                  label: 'Password',
                  placeholder: 'Password',
                  insideModal: true,
                  autoCorrect: false,
                  secureTextEntry: true,
                }}
              />
              <Divider />
              <Button
                title={'Continue'}
                titleStyle={theme.styles.buttonTitle}
                buttonStyle={theme.styles.button}
                containerStyle={theme.styles.buttonContainer}
                disabled={!(dirty && isValid)}
                loading={editorState.isSubmitting}
                onPress={() => submitForm()}
              />
              <Divider />
              <Button
                title={'Forgot Password?'}
                titleStyle={s.forgotPassword}
                buttonStyle={theme.styles.buttonClear}
                containerStyle={theme.styles.buttonContainer}
                onPress={() => navigation.navigate('ForgotPasswordScreen')}
              />
              <Text style={s.footer}>
                {'By signing up you agree to our Terms and Privacy Policy'}
              </Text>
            </View>
          </View>
        )}
      </Formik>
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
  forgotPassword: {
    ...theme.text.normal,
    color: theme.colors.button,
  },
  footer: {
    ...theme.text.small,
    ...theme.styles.textDim,
    alignSelf: 'center',
    textAlign: 'center',
    marginHorizontal: 40,
  },
}));

export default EmailSignInScreen;
