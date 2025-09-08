import React, { useEffect } from 'react';
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
import { signOut } from 'lib/auth';
import { biometricAuthentication } from 'lib/biometricAuthentication';
import { AuthenticationNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  AuthenticationNavigatorParamList,
  'BiometricsLogin'
>;

const BiometricsLoginScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  // Fallback
  const svg = getSvg(
    ThemeManager.name === 'light' ? 'welcomeLight' : 'welcomeDark',
  );

  useEffect(() => {
    auth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const auth = () => {
    biometricAuthentication().then(() => {
      navigation.navigate('Tabs', { screen: 'HomeTab' });
    });
  };

  return (
    <View style={theme.styles.viewAlt}>
      <SvgXml
        xml={svg}
        width={device.screen.height}
        height={device.screen.height}
        style={s.brandImage}
      />
      <View style={[theme.styles.buttonBottomContainer, s.buttonView]}>
        <Button
          title={'Continue with FaceID'}
          containerStyle={s.button}
          titleProps={{ allowFontScaling: false }}
          onPress={auth}
        />
        <Button
          title={'Log Out'}
          outline
          containerStyle={s.button}
          titleProps={{ allowFontScaling: false }}
          onPress={() => signOut()}
        />
      </View>
      <Version />
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device }) => ({
  brandImage: {
    alignSelf: 'center',
    width: device.screen.width * 0.5,
  },
  button: {
    marginTop: 15,
  },
  buttonView: {
    paddingHorizontal: 15,
  },
}));

export default BiometricsLoginScreen;
