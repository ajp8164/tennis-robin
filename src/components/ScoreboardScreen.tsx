import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  ThemeManager,
  getSvg,
  useDevice,
  useTheme,
} from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScoreboardNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  ScoreboardNavigatorParamList,
  'Scoreboard'
>;

const ScoreboardScreen = () => {
  const theme = useTheme();
  const s = useStyles();
  const device = useDevice();

  return (
    <ScrollView style={theme.styles.view}>
      <View
        style={[
          s.content,
          { top: device.insets.top + device.headerBar.height },
        ]}>
        <SvgXml
          xml={getSvg('brandIcon')}
          width={s.icon.width}
          height={s.icon.width}
          style={s.icon}
        />
        <Text style={theme.text.h2}>{'Scoreboard'}</Text>
      </View>
    </ScrollView>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device }) => ({
  content: {
    position: 'absolute',
    paddingHorizontal: 17,
    width: '100%',
  },
  icon: {
    width: device.screen.width * 0.5,
    alignSelf: 'center',
  },
}));

export default ScoreboardScreen;
