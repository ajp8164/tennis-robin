import React from 'react';
import { Alert, Platform, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  Divider,
  ThemeManager,
  getColoredSvg,
  getSvg,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import {
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
} from 'lib/auth';
import { AuthenticationNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  AuthenticationNavigatorParamList,
  'ChooseSignIn'
>;

const ChooseSignInScreen = ({ navigation, route }: Props) => {
  const { returning } = route.params;

  const theme = useTheme();
  const s = useStyles();

  return (
    <View style={theme.styles.view}>
      <SvgXml
        xml={getSvg('brandIcon')}
        width={s.icon.width}
        height={s.icon.width}
        style={s.icon}
      />
      <Divider />
      {!returning ? (
        <Text style={s.footer}>
          {'By signing up you agree to our Terms and Privacy Policy'}
        </Text>
      ) : null}
      <Button
        title={returning ? 'Sign In with Google' : 'Connect with Google'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={{ ...theme.styles.buttonOutline, ...s.button }}
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
        title={returning ? 'Sign In with Facebook' : 'Connect with Facebook'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={{ ...theme.styles.buttonOutline, ...s.button }}
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
        title={returning ? 'Sign In with Twitter' : 'Connect with Twitter'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={{ ...theme.styles.buttonOutline, ...s.button }}
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
          title={returning ? 'Sign In with Apple' : 'Connect with Apple'}
          titleStyle={theme.styles.buttonOutlineTitle}
          buttonStyle={{ ...theme.styles.buttonOutline, ...s.button }}
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
      <Divider
        note
        text={'or'}
        style={s.dividerStyle}
        subHeaderStyle={s.dividerText}
      />
      <Button
        title={returning ? 'Sign In with Email' : 'Join with Email'}
        titleStyle={theme.styles.buttonOutlineTitle}
        buttonStyle={{ ...theme.styles.buttonOutline, ...s.button }}
        containerStyle={s.signInButtonContainer}
        onPress={() =>
          returning
            ? navigation.navigate('EmailSignIn')
            : navigation.navigate('CreateAccount')
        }
      />
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device, theme }) => ({
  appleIcon: {
    top: -4,
    left: -7,
  },
  button: {
    width: '100%',
  },
  description: {
    ...theme.text.normal,
    ...theme.styles.textDim,
    textAlign: 'center',
    marginHorizontal: 40,
  },
  dividerText: {
    alignSelf: 'center',
    marginTop: -12,
    paddingHorizontal: 10,
    color: theme.colors.lightGray,
    backgroundColor: theme.colors.viewBackground,
  },
  dividerStyle: {
    borderBottomWidth: 1,
    width: '50%',
    alignSelf: 'center',
    marginTop: -15,
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
  icon: {
    width: device.screen.width * 0.3,
    alignSelf: 'center',
    marginTop: 40,
  },
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
}));

export default ChooseSignInScreen;
