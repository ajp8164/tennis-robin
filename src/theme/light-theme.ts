import { Platform } from 'react-native';

import {
  IBaseThemeSchema,
  IColor,
  IThemeManagerSchema,
  ThemeManager,
  type IBaseThemeSchema as IParentBaseThemeSchema,
} from '@react-native-hello/ui';
import lodash from 'lodash';
import { DeepPartial } from 'types/custom';

import { baseTheme } from './base-theme';
import { palette } from './palette';
import { shadow } from './shadow';
import { createElementsStyles } from './styles';
import { createTextStyles } from './text';

export const themeBase: DeepPartial<IBaseThemeSchema> = {
  // Merge the parent theme for our styles to use while building.
  ...lodash.merge({}, ThemeManager.get('light'), baseTheme, {
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
      disabled: '#787878',
      listItemBackgroundAlt: '#f7f7f7',
      listItemIcon: palette.primary,
      listItemIconNav: palette.primary,
      screenHeaderButtonText: palette.primary,
      stickyText: '#303030',
      tabBarActiveTint: palette.primary,
      tabBarBackgroundActive: palette.white,
      tabBarBackgroundInactive: palette.white,
      tabBarBorder: '#aaaaaa',
      tabBarInactiveTint: '#aaaaaa',

      // iOS
      clearButtonText: palette.primary,
      switchOffThumb: palette.white,
      switchOnThumb: palette.white,
      switchOffTrack: '#787878',
      switchOnTrack: palette.primary,
      ...Platform.select({
        android: {
          clearButtonText: palette.black,
          switchOffThumb: '#cccccc',
          switchOnThumb: palette.primary,
          switchOffTrack: '#787878',
          switchOnTrack: `${palette.primary}40`,
        },
      }),
    } as IColor,
  }),
};

export const lightTheme: DeepPartial<IThemeManagerSchema> = {
  ...themeBase,
  palette,
  text: createTextStyles({
    theme: themeBase as IParentBaseThemeSchema & IBaseThemeSchema,
  }),
  styles: createElementsStyles({
    theme: themeBase as IParentBaseThemeSchema & IBaseThemeSchema,
  }),
  shadow,
};
