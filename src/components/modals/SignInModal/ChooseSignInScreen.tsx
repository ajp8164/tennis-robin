import React, { useState } from 'react';
import { Alert, Platform, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  ThemeManager,
  getColoredSvg,
  getSvg,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { appConfig } from 'config';
import {
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
} from 'lib/auth';

import { SignInNavigatorParamList } from './types';

export type Props = NativeStackScreenProps<
  SignInNavigatorParamList,
  'ChooseSignInScreen'
>;

const ChooseSignInScreen = ({ navigation, route }: Props) => {
  const theme = useTheme();
  const s = useStyles();

  const [signInAction, setSignInAction] = useState(true);

  return (
    <View style={theme.styles.view}>
      <Text style={s.title}>{appConfig.appName}</Text>
      {route.params?.msg && (
        <Text style={s.description}>{route.params?.msg}</Text>
      )}
      <Text style={s.subtitle}>
        {signInAction ? 'Sign In' : 'Create Account'}
      </Text>
      <Text style={s.footer}>
        {'By signing up you agree to our Terms and Privacy Policy'}
      </Text>
      <Button
        title={'Continue with Google'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={theme.styles.buttonOutline}
        containerStyle={s.signInButtonContainer}
        iconContainerStyle={s.signInIconContainer}
        icon={
          <SvgXml
            width={28}
            height={28}
            style={s.googleIcon}
            xml={getSvg('googleIcon')}
          />
        }
        onPress={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signInWithGoogle().catch((e: any) => {
            Alert.alert('Sign In Error', e.message, [{ text: 'OK' }], {
              cancelable: false,
            });
          });
        }}
      />
      <Button
        title={'Continue with Facebook'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={theme.styles.buttonOutline}
        containerStyle={s.signInButtonContainer}
        iconContainerStyle={s.signInIconContainer}
        icon={
          <SvgXml
            width={42}
            height={42}
            style={s.facebookIcon}
            xml={getSvg('facebookIcon')}
          />
        }
        onPress={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signInWithFacebook().catch((e: any) => {
            Alert.alert('Sign In Error', e.message, [{ text: 'OK' }], {
              cancelable: false,
            });
          });
        }}
      />
      {/* <Button
        title={'Continue with Twitter'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={theme.styles.buttonOutline}
        containerStyle={s.signInButtonContainer}
        icon={
          <SvgXml
            width={28}
            height={28}
            style={{ position: 'absolute', left: 5 }}
            xml={getSvg('twitterIcon')}
          />
        }
        onPress={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signInWithTwitter().catch((e: any) => {
            Alert.alert('Sign In Error', e.message, [{ text: 'OK' }], {
              cancelable: false,
            });
          });
        }}
      /> */}
      {Platform.OS === 'ios' && (
        <Button
          title={'Continue with Apple'}
          titleStyle={theme.styles.buttonOutlineTitle}
          buttonStyle={theme.styles.buttonOutline}
          containerStyle={s.signInButtonContainer}
          iconContainerStyle={s.signInIconContainer}
          icon={
            <SvgXml
              width={32}
              height={32}
              style={s.appleIcon}
              color={theme.colors.black}
              xml={getColoredSvg('appleIcon')}
            />
          }
          onPress={() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            signInWithApple().catch((e: any) => {
              Alert.alert('Sign In Error', e.message, [{ text: 'OK' }], {
                cancelable: false,
              });
            });
          }}
        />
      )}
      <Button
        title={'Continue with Email'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={theme.styles.buttonOutline}
        containerStyle={s.signInButtonContainer}
        onPress={() =>
          signInAction
            ? navigation.navigate('EmailSignInScreen')
            : navigation.navigate('CreateAccountScreen')
        }
      />
      <Button
        title={signInAction ? 'or Create Account' : 'Have an Account? Sign In'}
        titleStyle={theme.styles.buttonScreenHeaderTitle}
        buttonStyle={theme.styles.buttonClear}
        containerStyle={s.signInButtonContainer}
        onPress={() => setSignInAction(!signInAction)}
      />
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  appleIcon: {
    top: -4,
    left: -7,
  },
  description: {
    ...theme.text.normal,
    ...theme.styles.textDim,
    textAlign: 'center',
    marginHorizontal: 40,
  },
  facebookIcon: {
    top: -8,
    left: -8,
  },
  footer: {
    ...theme.text.medium,
    ...theme.styles.textDim,
    alignSelf: 'center',
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
    marginHorizontal: 40,
  },
  googleIcon: {},
  signInButtonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 15,
  },
  signInIconContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  subtitle: {
    ...theme.text.h4,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    ...theme.text.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
}));

export default ChooseSignInScreen;
