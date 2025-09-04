import React, { useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import { ThemeManager } from '@react-native-hello/ui/';
import { selectThemeSettings } from 'store/selectors/appSettingsSelectors';

interface ColorModeSwitch {
  children: ReactNode;
}

// Handles device level changes filtered by app settings.
const ColorModeSwitch = ({ children }: ColorModeSwitch) => {
  const themeSettings = useSelector(selectThemeSettings);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const control = themeSettings.followDevice
      ? colorScheme
      : themeSettings.app;

    ThemeManager.set(control === 'dark' ? 'dark' : 'light');
  }, [colorScheme, themeSettings]);

  return <>{children}</>;
};

export { ColorModeSwitch };
