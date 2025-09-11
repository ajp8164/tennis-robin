import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  ThemeManager,
  getSvg,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import Version from 'components/molecules/Version';
import { AuthenticationNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  AuthenticationNavigatorParamList,
  'OnboardWelcome'
>;

const OnboardWelcomeScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  const svg = getSvg(
    ThemeManager.name === 'light' ? 'welcomeLight' : 'welcomeDark',
  );

  return (
    <View style={[theme.styles.viewAlt, s.container]}>
      <SvgXml
        xml={svg}
        width={device.screen.height}
        height={device.screen.height}
        style={s.brandImage}
      />
      <View style={[theme.styles.buttonBottomContainer, s.buttonView]}>
        <Button
          title={'Create Account'}
          titleProps={{ allowFontScaling: false }}
          buttonStyle={theme.styles.button}
          onPress={() => navigation.navigate('ChooseSignIn', {})}
        />
        <Button
          title={'Already have an account? Log In'}
          outline
          buttonStyle={theme.styles.buttonOutline}
          containerStyle={s.button}
          titleProps={{ allowFontScaling: false }}
          onPress={() =>
            navigation.navigate('ChooseSignIn', { returning: true })
          }
        />
      </View>
      <Version withInset />
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  brandImage: {
    alignSelf: 'center',
  },
  button: {
    marginTop: 15,
  },
  buttonView: {
    paddingHorizontal: 15,
  },
  container: {
    backgroundColor: theme.colors.screenHeaderBackground,
  },
}));

export default OnboardWelcomeScreen;
