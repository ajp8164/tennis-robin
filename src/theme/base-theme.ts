import { DeepPartial } from 'react-native-theme-mk';

import { IBaseThemeSchema } from '@react-native-hello/ui';

import { fonts } from './fonts';

export const baseTheme: DeepPartial<IBaseThemeSchema> = {
  radius: {},
  fontSize: {
    giant: 54,
    medium: 14,
    micro: 10,
  },
  fonts: {
    bold: fonts.bold,
    semiBold: fonts.semiBold,
    medium: fonts.medium,
    regular: fonts.regular,
    light: fonts.light,
  },
  letterSpacing: {
    giant: 0,
    medium: 0,
    micro: 0,
  },
  lineHeight: {
    giant: 56,
    medium: 18,
    micro: 12,
  },
  spacing: {},
};
