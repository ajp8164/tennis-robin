import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { ThemeProvider } from '@react-native-hello/ui';
import AppMain from 'components/AppMain';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from 'store';

import 'react-native-gesture-handler';
import 'theme'; // Update the ThemeManager with our local themes.


LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  "The provided value 'moz",
  "The provided value 'ms-stream",
]);

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <ReduxProvider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                  <AppMain />
              </PersistGate>
            </ReduxProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
