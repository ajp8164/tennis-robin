import React from 'react';
import { Text, View } from 'react-native';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from 'components/atoms/Button';
import { useUserProfile } from 'lib/auth';
import { initPushNotifications } from 'lib/notifications';
import { BellRing } from 'lucide-react-native';
import { AuthenticationNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  AuthenticationNavigatorParamList,
  'OnboardNotifications'
>;

const OnboardNotificationsScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();

  const userProfile = useUserProfile();

  const skipNotifications = () => {
    advance();
  };

  const enableNotifications = async () => {
    if (userProfile) {
      await initPushNotifications(userProfile);
    }
    advance();
  };

  const advance = () => {
    navigation.navigate('Tabs', { screen: 'HomeTab' });
  };

  return (
    <View style={[theme.styles.viewAlt, s.container]}>
      <BellRing color={theme.colors.listItemIcon} size={100} style={s.icon} />
      <Text style={s.title} allowFontScaling={false}>
        {'Enable Push Notifications'}
      </Text>
      <Text style={s.subtitle} allowFontScaling={false}>
        {
          'Enable Push Notifications to receive sportEvent updates. You can turn this feature on or off at any time under Settings.'
        }
      </Text>
      <View style={[theme.styles.buttonBottomContainer]}>
        <Button
          title={'Enable Push Notifications'}
          containerStyle={s.button}
          titleProps={{ allowFontScaling: false }}
          onPress={enableNotifications}
        />
        <Button
          title={'Maybe Later'}
          outline
          containerStyle={s.button}
          titleProps={{ allowFontScaling: false }}
          onPress={skipNotifications}
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

export default OnboardNotificationsScreen;
