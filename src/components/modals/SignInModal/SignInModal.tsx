import React, { useImperativeHandle, useRef, useState } from 'react';

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Modal, useTheme } from '@react-native-hello/ui';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChooseSignInScreen from './ChooseSignInScreen';
import CreateAccountScreen from './CreateAccountScreen';
import EmailSignInScreen from './EmailSignInScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import {
  SignInModalMethods,
  SignInModalProps,
  SignInNavigatorParamList,
} from './types';

const Stack = createNativeStackNavigator<SignInNavigatorParamList>();

type SignInModal = SignInModalMethods;

const SignInModal = React.forwardRef<SignInModal, SignInModalProps>(
  (_props, ref) => {
    const theme = useTheme();
    const innerRef = useRef<BottomSheetModalMethods>(null);

    const [signInMsg, setSignInMsg] = useState<string>();
    const [bgColor, setBgColor] = useState(theme.colors.viewBackground);

    useImperativeHandle(ref, () => ({
      //  These functions exposed to the parent component through the ref.
      dismiss,
      present,
    }));

    const dismiss = () => {
      innerRef.current?.dismiss();
    };

    const present = (msg?: string) => {
      setSignInMsg(msg);
      innerRef.current?.present();
    };

    return (
      <Modal
        ref={innerRef}
        backgroundStyle={{ backgroundColor: bgColor }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.black }}
        keyboardBehavior="extend">
        <NavigationIndependentTree>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.screenHeaderBackground,
                },
                headerTitleStyle: { color: theme.colors.screenHeaderTitle },
                headerTintColor: theme.colors.screenHeaderButtonText,
              }}>
              <Stack.Screen
                name="ChooseSignInScreen"
                component={ChooseSignInScreen}
                initialParams={{ msg: signInMsg }}
                options={{
                  headerShown: false,
                }}
                listeners={{
                  transitionStart: () =>
                    setBgColor(theme.colors.viewBackground),
                }}
              />
              <Stack.Screen
                name="EmailSignInScreen"
                component={EmailSignInScreen}
                options={{
                  headerTitle: 'Sign In',
                  headerBackTitle: 'Back',
                  headerShadowVisible: false,
                }}
                listeners={{
                  transitionStart: () =>
                    setBgColor(theme.colors.screenHeaderBackground),
                }}
              />
              <Stack.Screen
                name="ForgotPasswordScreen"
                component={ForgotPasswordScreen}
                options={{
                  headerTitle: 'Forgot Password?',
                  headerBackTitle: 'Back',
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="CreateAccountScreen"
                component={CreateAccountScreen}
                options={{
                  headerTitle: 'Create Account',
                  headerBackTitle: 'Back',
                  headerShadowVisible: false,
                }}
                listeners={{
                  transitionStart: () =>
                    setBgColor(theme.colors.screenHeaderBackground),
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </NavigationIndependentTree>
      </Modal>
    );
  },
);

export { SignInModal };
