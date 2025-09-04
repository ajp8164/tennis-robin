import { Platform } from 'react-native';
import { DeepPartial } from 'react-native-theme-mk';

import {
  IBaseThemeSchema,
  IColor,
  IThemeManagerSchema,
  ThemeManager,
} from '@react-native-hello/ui';
import lodash from 'lodash';

import { baseTheme } from './base-theme';
import { palette } from './palette';
import { shadow } from './shadow';
import { createElementsStyles } from './styles';
import { createTextStyles } from './text';

export const themeBase: DeepPartial<IBaseThemeSchema> = {
  // Merge the parent theme for our styles to use while building.
  ...lodash.merge({}, ThemeManager.get('dark'), baseTheme, {
    colors: {
      assertiveMuted: '#802539',
      avatarColors: [
        '#ff6767',
        '#66e0da',
        '#f5a2d9',
        '#f0c722',
        '#6a85e5',
        '#fd9a6f',
        '#92db6e',
        '#73b8e5',
        '#fd7590',
        '#c78ae5',
      ],
      brandPrimary: palette.secondary,
      brandSecondary: palette.primary,
      button: palette.primary,
      disabled: '#787878',
      listItemBackgroundAlt: '#101010',
      listItemIcon: palette.primary,
      listItemIconNav: palette.primary,
      screenHeaderButtonText: palette.primary,
      stickyText: '#303030',
      tabBarActiveTint: palette.primary,
      tabBarBackgroundActive: palette.black,
      tabBarBackgroundInactive: palette.black,
      tabBarBorder: '#787878',
      tabBarInactiveTint: '#787878',

      // iOS
      clearButtonText: palette.primary,
      switchOffThumb: palette.white,
      switchOnThumb: palette.white,
      switchOffTrack: '#e5e5e5',
      switchOnTrack: palette.primary,
      ...Platform.select({
        android: {
          clearButtonText: palette.white,
          switchOffThumb: '#787878',
          switchOnThumb: palette.primary,
          switchOffTrack: '#e5e5e5',
          switchOnTrack: `${palette.primary}40`,
        },
      }),
    } as IColor,
  }),
};

export const darkTheme: DeepPartial<IThemeManagerSchema> = {
  ...themeBase,
  palette,
  text: createTextStyles({
    theme: themeBase as IBaseThemeSchema,
  }),
  styles: createElementsStyles({
    theme: themeBase as IBaseThemeSchema,
  }),
  shadow,
};
