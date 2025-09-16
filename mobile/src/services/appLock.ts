import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_LOCK_KEY = 'app-lock-enabled';

export const AppLock = {
  async isEnabled(): Promise<boolean> {
    const v = await AsyncStorage.getItem(APP_LOCK_KEY);
    return v === '1';
  },

  async setEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(APP_LOCK_KEY, enabled ? '1' : '0');
  },

  async authenticateIfEnabled(): Promise<boolean> {
    const enabled = await this.isEnabled();
    if (!enabled) return true;
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return true;
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) return true;
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Pile',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return res.success === true;
  },
};