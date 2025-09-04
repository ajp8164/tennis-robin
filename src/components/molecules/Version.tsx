import React from 'react';
import { Text, ViewStyle } from 'react-native';
import VersionNumber from 'react-native-version-number';

import { ThemeManager, useDevice } from '@react-native-hello/ui';

export interface Props {
  style?: ViewStyle | ViewStyle[];
}

const Version = () => {
  const s = useStyles();
  const device = useDevice();

  return (
    <Text
      style={[
        s.version,
        { bottom: device.bottomTabBarHeight - device.insets.bottom + 15 },
      ]}>
      {`Release ${VersionNumber.appVersion} (${VersionNumber.buildVersion})`}
    </Text>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  version: {
    position: 'absolute',
    ...theme.text.small,
    alignSelf: 'center',
    marginTop: 25,
  },
}));

export default Version;
