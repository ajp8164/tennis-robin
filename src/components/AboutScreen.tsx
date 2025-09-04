import React from 'react';
import { ScrollView, Text } from 'react-native';
import VersionNumber from 'react-native-version-number';

import {
  Divider,
  ListItem,
  ThemeManager,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import helpContent from 'lib/content/helpContent';
import legalContent from 'lib/content/legalContent';
import { SetupNavigatorParamList } from 'types/navigation';

type Props = NativeStackScreenProps<SetupNavigatorParamList, 'About'>;

const AboutScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  const visibleViewHeight =
    device.screen.height -
    device.bottomTabBarHeight -
    device.headerBarLarge.height;

  return (
    <ScrollView
      style={theme.styles.view}
      contentContainerStyle={{ height: visibleViewHeight }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior={'automatic'}>
      <Divider />
      <ListItem
        title={'Help'}
        position={['first']}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('Content', {
            content: helpContent,
          })
        }
      />
      <ListItem
        title={'Legal'}
        position={['last']}
        rightContent={'chevron-right'}
        onPress={() =>
          navigation.navigate('Content', {
            content: legalContent,
          })
        }
      />
      <Text
        style={[
          s.version,
          { bottom: device.bottomTabBarHeight - device.insets.bottom + 15 },
        ]}>
        {`Release ${VersionNumber.appVersion} (${VersionNumber.buildVersion})`}
      </Text>
    </ScrollView>
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

export default AboutScreen;
