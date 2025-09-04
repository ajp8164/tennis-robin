import { ThemeManager } from '@react-native-hello/ui';

import { darkTheme } from './dark-theme';
import { lightTheme } from './light-theme';

ThemeManager.update({
  light: lightTheme,
  dark: darkTheme,
});
