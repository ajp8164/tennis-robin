import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import ErrorBoundary from 'react-native-error-boundary';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { EventProvider, NetworkProvider, log } from '@react-native-hello/core';
import { CameraProvider, ThemeManager } from '@react-native-hello/ui';
import {
  DarkTheme,
  DefaultTheme,
  LinkingOptions,
  NavigationContainer,
} from '@react-navigation/native';
import { InitStatus, useInitApp } from 'app';
import { BackdropProvider } from 'components/atoms/Backdrop';
import { ColorModeSwitch } from 'components/atoms/ColorModeSwitch';
import NetworkConnectionBar from 'components/atoms/NetworkConnnectionBar';
import MainNavigator from 'components/navigation/MainNavigator';
import { AuthProvider } from 'lib/auth/AuthProvider';
import { AppError } from 'lib/errors';
import { MainNavigatorParamList, StartupScreen } from 'types/navigation';

// See https://reactnavigation.org/docs/configuring-links
const linking: LinkingOptions<MainNavigatorParamList> = {
  prefixes: ['tennisrobin://', 'https://tennisrobin.app'],
  config: {
    screens: {},
  },
};

const AppMain = () => {
  const themeName = ThemeManager.name;
  const initApp = useInitApp();

  const [startupScreen, setStartupScreen] = useState<StartupScreen>(
    StartupScreen.None,
  );
  const [fatal, setFatal] = useState<string | undefined>(undefined);

  useEffect(() => {
    const hideSplashScreen = () => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          RNBootSplash.hide({ fade: true });
          StatusBar.setHidden(false);
          resolve();
        }, 200);
      });
    };

    (async () => {
      try {
        // Main application initialization.
        const status = await initApp();
        log.info(`Initialization status: ${status}`);

        switch (status) {
          case InitStatus.Success:
          case InitStatus.NotAuthorized:
            // The destination should handle condition NotAuthorized.
            setStartupScreen(StartupScreen.Home);
            break;
          case InitStatus.NotVerified:
          default:
            setStartupScreen(StartupScreen.Welcome);
        }

        hideSplashScreen();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        log.error(e.message);
        // Expose any initialization error.
        setFatal(e.message);
        hideSplashScreen();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fatal) {
    throw new AppError(fatal);
  }

  const onError = (error: Error, stack: string) => {
    log.fatal(`Unhandled app error: ${error.message}\n${stack}`);
  };

  if (startupScreen === StartupScreen.None) {
    return null;
  }

  return (
    <NavigationContainer
      linking={linking}
      // Removes default background (white) flash on tab change when in dark mode.
      theme={themeName === 'dark' ? DarkTheme : DefaultTheme}>
      <ColorModeSwitch>
        <ActionSheetProvider>
          <BottomSheetModalProvider>
            <ErrorBoundary onError={onError}>
              <NetworkProvider>
                <NetworkConnectionBar />
                <AuthProvider>
                  <CameraProvider>
                    <EventProvider>
                      <BackdropProvider>
                        <MainNavigator startupScreen={startupScreen} />
                      </BackdropProvider>
                    </EventProvider>
                  </CameraProvider>
                </AuthProvider>
              </NetworkProvider>
            </ErrorBoundary>
          </BottomSheetModalProvider>
        </ActionSheetProvider>
      </ColorModeSwitch>
    </NavigationContainer>
  );
};

export default AppMain;
