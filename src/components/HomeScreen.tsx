import React from 'react';
import { Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ThemeManager, getSvg, useTheme } from '@react-native-hello/ui';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  HomeNavigatorParamList,
  MainNavigatorParamList,
} from 'types/navigation';

export type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeNavigatorParamList, 'Home'>,
  NativeStackScreenProps<MainNavigatorParamList>
>;

const HomeScreen = () => {
  const theme = useTheme();
  const s = useStyles();

  return (
    <View style={theme.styles.view}>
      <SvgXml
        xml={getSvg('brandIcon')}
        width={s.icon.width}
        height={s.icon.width}
        style={s.icon}
      />
      <Text style={s.text}>{'Hello.'}</Text>
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device, theme }) => ({
  icon: {
    width: device.screen.width * 0.5,
    alignSelf: 'center',
    marginTop: '60%',
  },
  text: {
    ...theme.text.xl,
    textAlign: 'center',
  },
}));

export default HomeScreen;
