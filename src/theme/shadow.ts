import { Platform } from 'react-native';

import { IShadows } from '@react-native-hello/ui';

const light = Platform.select({
  ios: {
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    shadowOpacity: 1,
  },
  android: {
    elevation: 1,
  },
});

export const shadow: Partial<IShadows> = {
  light,
};
