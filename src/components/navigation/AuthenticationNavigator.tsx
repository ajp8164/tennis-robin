import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTheme } from '@react-native-hello/ui';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import BiometricsLoginScreen from 'components/BiometricsLoginScreen';
import ChooseSignInScreen from 'components/ChooseSignInScreen';
import CreateAccountScreen from 'components/CreateAccountScreen';
import EmailSignInScreen from 'components/EmailSignInScreen';
import ForgotPasswordScreen from 'components/ForgotPasswordScreen';
import OnboardBiometricsScreen from 'components/OnboardBiometricsScreen';
import OnboardNotificationsScreen from 'components/OnboardNotificationsScreen';
import OnboardWelcomeScreen from 'components/OnboardWelcomeScreen';
import { store } from 'store';
import { selectUser } from 'store/selectors/userSelectors';
import { saveOnboardProgress } from 'store/slices/appSettings';
import {
  AuthenticationNavigatorParamList,
  MainNavigatorParamList,
} from 'types/navigation';

const AuthenticationStack =
  createNativeStackNavigator<AuthenticationNavigatorParamList>();

export type Props = NativeStackScreenProps<
  MainNavigatorParamList,
  'Authentication'
>;

const AuthenticationNavigator = ({ navigation }: Props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { credentials } = useSelector(selectUser);

  // Avoid re-render on change.
  const biometrics = store.getState().appSettings.biometrics;
  const onboardProgress = store.getState().appSettings.onboardProgress;

  useEffect(() => {
    if (credentials?.uid) {
      if (onboardProgress === 'complete') {
        navigation.navigate('Tabs', { screen: 'HomeTab' });
      } else {
        // Done onboarding. Setting complete here allows the next launch directly to home
        // even if the app closes immediately after auth.
        dispatch(saveOnboardProgress({ progress: 'complete' }));
        navigation.navigate('Authentication', { screen: 'OnboardBiometrics' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentials?.uid]);

  return (
    <AuthenticationStack.Navigator
      initialRouteName={biometrics ? 'BiometricsLogin' : 'OnboardWelcome'}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.screenHeaderBackground },
        headerTintColor: theme.colors.screenHeaderButtonText,
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <AuthenticationStack.Screen
        name="BiometricsLogin"
        component={BiometricsLoginScreen}
        options={{
          headerShown: false,
          headerBackVisible: false,
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: theme.colors.screenHeaderBackground,
          },
        }}
      />
      <AuthenticationStack.Screen
        name="OnboardWelcome"
        component={OnboardWelcomeScreen}
        options={{
          headerShown: false,
          headerBackVisible: false,
          gestureEnabled: false,
          headerStyle: {
            backgroundColor: theme.colors.screenHeaderBackground,
          },
        }}
      />
      <AuthenticationStack.Screen
        name="OnboardBiometrics"
        component={OnboardBiometricsScreen}
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.colors.screenHeaderBackground,
          },
          headerBackVisible: false,
        }}
      />
      <AuthenticationStack.Screen
        name="OnboardNotifications"
        component={OnboardNotificationsScreen}
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.colors.screenHeaderBackground,
          },
          headerBackVisible: false,
        }}
      />
      <AuthenticationStack.Screen
        name="ChooseSignIn"
        component={ChooseSignInScreen}
        options={({ route }) => {
          return {
            headerTitle: route.params.returning ? 'Sign In' : 'Create Account',
            headerBackTitle: 'Back',
          };
        }}
      />
      <AuthenticationStack.Screen
        name="EmailSignIn"
        component={EmailSignInScreen}
        options={{
          headerTitle: 'Sign In',
          headerBackTitle: 'Back',
        }}
      />
      <AuthenticationStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerTitle: 'Password Reset',
          headerBackTitle: 'Back',
        }}
      />
      <AuthenticationStack.Screen
        name="CreateAccount"
        component={CreateAccountScreen}
        options={{
          headerTitle: 'Create Account',
          headerBackTitle: 'Back',
        }}
      />
    </AuthenticationStack.Navigator>
  );
};

export default AuthenticationNavigator;
