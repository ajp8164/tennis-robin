import React from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { biometricAuthentication } from 'lib/biometricAuthentication';
import { ScanFace } from 'lucide-react-native';
import { saveBiometrics } from 'store/slices/appSettings';
import { AuthenticationNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  AuthenticationNavigatorParamList,
  'OnboardBiometrics'
>;

const OnboardBiometricsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const dispatch = useDispatch();

  const skipBiometrics = () => {
    advance();
  };

  const enableBiometrics = () => {
    // Require biometrics to turn on feature.
    biometricAuthentication({ require: true })
      .then(() => {
        dispatch(saveBiometrics({ value: true }));
        advance();
      })
      .catch(() => {
        //
      });
  };

  const advance = () => {
    navigation.navigate('OnboardNotifications');
  };

  return (
    <View style={[theme.styles.viewAlt, s.container]}>
      <ScanFace color={theme.colors.listItemIcon} size={100} style={s.icon} />
      <Text style={s.title} allowFontScaling={false}>
        {'Enable Face ID'}
      </Text>
      <Text style={s.subtitle} allowFontScaling={false}>
        {
          'Protect your financial information by enabling Face ID. You can turn this feature on or off at any time under Settings.'
        }
      </Text>
      <View style={[theme.styles.buttonBottomContainer]}>
        <Button
          title={'Enable Face ID'}
          containerStyle={s.button}
          titleProps={{ allowFontScaling: false }}
          onPress={enableBiometrics}
        />
        <Button
          title={'Maybe Later'}
          outline
          containerStyle={s.button}
          titleProps={{ allowFontScaling: false }}
          onPress={skipBiometrics}
        />
      </View>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  button: {
    marginTop: 15,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: theme.colors.screenHeaderBackground,
  },
  icon: {
    marginTop: '15%',
  },
  subtitle: {
    ...theme.text.normal,
    textAlign: 'center',
    marginTop: 30,
  },
  title: {
    ...theme.text.h3,
    marginTop: 30,
  },
}));

export default OnboardBiometricsScreen;
