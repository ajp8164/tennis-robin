import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { ThemeManager, getSvg, useTheme } from '@react-native-hello/ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TournamentsNavigatorParamList } from 'types/navigation';

export type Props = NativeStackScreenProps<
  TournamentsNavigatorParamList,
  'Tournaments'
>;

const TournamentsScreen = () => {
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
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ device }) => ({
  icon: {
    width: device.screen.width * 0.5,
    alignSelf: 'center',
    marginTop: '60%',
  },
}));

export default TournamentsScreen;
