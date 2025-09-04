import React, { ReactNode, createContext, useState } from 'react';
import { View } from 'react-native';

import { ThemeManager } from '@react-native-hello/ui';

export type BackdropContext = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

export const BackdropContext = createContext<BackdropContext>({
  enabled: false,
  setEnabled: () => {
    return;
  },
});

export const BackdropProvider = ({
  children,
}: {
  children: ReactNode;
}): ReactNode => {
  const s = useStyles();

  const [enabled, setEnabled] = useState(false);

  return (
    <BackdropContext.Provider
      value={{
        enabled,
        setEnabled,
      }}>
      <View style={enabled ? s.enabled : s.disabled}>{children}</View>
    </BackdropContext.Provider>
  );
};

const useStyles = ThemeManager.createStyleSheet(() => ({
  disabled: {
    width: '100%',
    height: '100%',
  },
  enabled: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
}));
