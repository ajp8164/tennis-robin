import { biometricAuthentication as RNXEBiometricAuthentication } from '@react-native-hello/core';
// import { store } from 'store';

// export const biometricAuthentication = async (): Promise<void> => {
//   if (store.getState().appSettings.biometrics) {
//     return RNXEBiometricAuthentication();
//   }
// };
import { store } from 'store';

export const biometricAuthentication = async ({
  require,
}: {
  require?: boolean;
} = {}): Promise<void> => {
  if (store.getState().appSettings.biometrics || require) {
    return RNXEBiometricAuthentication();
  }
};
