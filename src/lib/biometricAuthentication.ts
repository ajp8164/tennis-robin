import { biometricAuthentication as RNXEBiometricAuthentication } from '@react-native-hello/core';
import { store } from 'store';

export const biometricAuthentication = async (): Promise<void> => {
  if (store.getState().appSettings.biometrics) {
    return RNXEBiometricAuthentication();
  }
};
