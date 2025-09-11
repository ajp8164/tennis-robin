import React from 'react';
import { ScrollView } from 'react-native';

import { Divider, ListItem, useDevice, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Version from 'components/molecules/Version';
import helpContent from 'lib/content/helpContent';
import legalContent from 'lib/content/legalContent';
import { SetupNavigatorParamList } from 'types/navigation';

type Props = NativeStackScreenProps<SetupNavigatorParamList, 'About'>;

const AboutScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const device = useDevice();

  const visibleViewHeight =
    device.screen.height -
    device.bottomTabBarHeight -
    device.headerBarLarge.height;

  return (
    <>
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
      </ScrollView>
      <Version />
    </>
  );
};

export default AboutScreen;
