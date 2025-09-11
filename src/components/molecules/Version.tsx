import React from 'react';
import { Text } from 'react-native';
import VersionNumber from 'react-native-version-number';

import { ThemeManager, useDevice } from '@react-native-hello/ui';

export interface Props {
  withInset?: boolean;
}

const Version = (props: Props) => {
  const { withInset } = props;

  const s = useStyles();
  const device = useDevice();

  return (
    <Text
      style={[
        s.version,
        {
          bottom: withInset ? device.insets.bottom + 15 : 15,
        },
      ]}>
      {`Version ${VersionNumber.appVersion} (${VersionNumber.buildVersion})`}
    </Text>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  version: {
    ...theme.text.small,
    position: 'absolute',
    alignSelf: 'center',
    color: theme.colors.brandSecondary,
  },
}));

export default Version;
