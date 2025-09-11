import React from 'react';
import { View } from 'react-native';

import { ThemeManager, useTheme } from '@react-native-hello/ui';
import { X } from 'lucide-react-native';

export const IconCloseX = () => {
  const theme = useTheme();
  const s = useStyles();

  return (
    <View style={s.container}>
      <X color={theme.colors.midGray} size={18} strokeWidth={3} />
    </View>
  );
};

const useStyles = ThemeManager.createStyleSheet(({ theme }) => ({
  container: {
    backgroundColor: theme.colors.subtleGray,
    borderRadius: 18,
    padding: 5,
  },
}));

export default IconCloseX;
