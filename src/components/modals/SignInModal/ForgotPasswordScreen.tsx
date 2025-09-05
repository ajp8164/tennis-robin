import React, { useRef } from 'react';
import { Alert, Keyboard, ScrollView, View } from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';

import { useSetState } from '@react-native-hello/core';
import {
  Divider,
  InputMethods,
  ThemeManager,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { ListItemInput } from 'components/atoms/List';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { sendPasswordResetEmail } from 'lib/auth';
import * as Yup from 'yup';

import { SignInNavigatorParamList } from './types';

type FormValues = {
  email: string;
};

export interface EditorState {
  isSubmitting: boolean;
}

export type Props = NativeStackScreenProps<
  SignInNavigatorParamList,
  'ForgotPasswordScreen'
>;

const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const s = useStyles();

  const formikRef = useRef<FormikProps<FormValues>>(null);
  const emailFieldRef = useRef<InputMethods>(null);

  const [editorState, setEditorState] = useSetState<EditorState>({
    isSubmitting: false,
  });

  const sendEmail = (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>,
  ) => {
    Keyboard.dismiss();
    setEditorState({ isSubmitting: true });
    sendPasswordResetEmail(values.email)
      .then(() => {
        setEditorState({ isSubmitting: false });
        resetForm();
        Alert.alert(
          'Email Sent',
          `We have sent a password reset email to ${values.email}. Please check your email to reset your password.`,
          [{ text: 'OK' }],
          { cancelable: false },
        );
      })
      .catch(() => {
        setEditorState({ isSubmitting: false });
        Alert.alert(
          'Account Not Found',
          'There is no account with that address. Please check your email address and try again.',
          [{ text: 'OK' }],
          { cancelable: false },
        );
      });
  };

  const schema = Yup.object().shape({
    email: Yup.string()
      .email('Enter a valid email address')
      .matches(/\..{2,}$/, 'Email domain needs min 2 characters')
      .required('Required field'),
  });

  return (
    <>
      <AvoidSoftInputView style={s.avoidContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.container}>
          <Formik
            innerRef={formikRef}
            initialValues={{
              email: '',
            }}
            validateOnMount={true}
            validationSchema={schema}
            onSubmit={sendEmail}>
            {({ dirty, errors, handleChange, isValid, submitForm, values }) => (
              <View style={theme.styles.view}>
                <Divider
                  note
                  text={
                    "Enter your email address and we'll send a link to reset your password."
                  }
                  style={s.divider}
                />
                <ListItemInput
                  ref={emailFieldRef}
                  error={!!errors.email}
                  errorMessage={errors.email}
                  position={['first', 'last']}
                  inputProps={{
                    value: values.email,
                    onChangeText: handleChange('email'),
                    label: 'Email',
                    placeholder: 'Email',
                    keyboardType: 'email-address',
                    autoCapitalize: 'none',
                    autoCorrect: false,
                  }}
                />
                <Button
                  title={'Send'}
                  titleStyle={theme.styles.buttonTitle}
                  buttonStyle={theme.styles.button}
                  containerStyle={s.sendButtonContainer}
                  disabled={!(dirty && isValid)}
                  loading={editorState.isSubmitting}
                  onPress={() => submitForm()}
                />
              </View>
            )}
          </Formik>
        </ScrollView>
      </AvoidSoftInputView>
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
  divider: {
    marginTop: 30,
  },
  sendButtonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 30,
  },
  description: {
    ...theme.text.normal,
    alignSelf: 'center',
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 30,
  },
}));

export default ForgotPasswordScreen;
