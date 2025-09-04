import React, { useEffect, useState } from 'react';
import { AppState, Linking, ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  Divider,
  ListItem,
  ListItemSwitch,
  ThemeManager,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { biometricAuthentication } from 'lib/biometricAuthentication';
import { hasPushNotificationsPermission } from 'lib/notifications';
import {
  selectBiometrics,
  selectThemeSettings,
} from 'store/selectors/appSettingsSelectors';
import {
  saveBiometrics,
  saveThemeSettings,
} from 'store/slices/appSettings';
import { SetupNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  SetupNavigatorParamList,
  'AppSettings'
>;

const AppSettings = () => {
  const theme = ThemeManager.useTheme();

  const dispatch = useDispatch();
  const themeSettings = useSelector(selectThemeSettings);
  const biometrics = useSelector(selectBiometrics);

  const [biometricsValue, setBiometricsValue] = useState(biometrics);
  const [hasPNPermission, setHasPNPermission] = useState(false);

  useEffect(() => {
    hasPushNotificationsPermission().then(permission => {
      setHasPNPermission(permission);
    });

    const listener = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        hasPushNotificationsPermission().then(permission => {
          setHasPNPermission(permission);
        });
      }
    });

    return () => {
      listener.remove();
    };
  }, []);

  const toggleAppearance = (value: boolean) => {
    dispatch(
      saveThemeSettings({
        themeSettings: { ...themeSettings, app: value ? 'dark' : 'light' },
      }),
    );
    ThemeManager.set(value ? 'dark' : 'light');
  };

  const toggleBiometrics = async (value: boolean) => {
    setBiometricsValue(value);
    if (value === false) {
      // Require biometrics to turn off feature.
      await biometricAuthentication()
        .then(() => {
          dispatch(saveBiometrics({ value }));
        })
        .catch(() => {
          setBiometricsValue(true);
        });
    } else {
      dispatch(saveBiometrics({ value }));
    }
  };

  const toggleUseDevice = (value: boolean) => {
    dispatch(
      saveThemeSettings({
        themeSettings: { ...themeSettings, followDevice: value },
      }),
    );
  };

  return (
    <View style={theme.styles.view}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior={'automatic'}>
        <Divider text={'NOTIFICATIONS'} />
        <ListItem
          title={'Push Notifications'}
          value={hasPNPermission ? 'On' : 'Off'}
          position={['first', 'last']}
          rightContent={'chevron-right'}
          onPress={Linking.openSettings}
        />
        <Divider text={'SECURITY'} />
        <ListItemSwitch
          title={'Use Biometrics ID'}
          value={biometricsValue}
          position={['first', 'last']}
          onValueChange={toggleBiometrics}
        />
        <Divider
          note
          light
          subHeaderStyle={theme.text.medium}
          text={
            'Biometrics enable face recognition or fingerprint. When enabled biometrics protects changes to your information.'
          }
        />
        <Divider text={'APPEARANCE'} />
        <ListItemSwitch
          title={'Dark Appearance'}
          value={themeSettings.app === 'dark'}
          disabled={themeSettings.followDevice}
          position={['first']}
          onValueChange={toggleAppearance}
        />
        <ListItemSwitch
          title={'Use Device Setting'}
          value={themeSettings.followDevice}
          position={['last']}
          onValueChange={toggleUseDevice}
        />
        <Divider />
      </ScrollView>
    </View>
  );
};

export default AppSettings;
