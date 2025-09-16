import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';

export async function bootstrapIOS(): Promise<void> {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {}

  Keyboard.setAccessoryBarVisible({ isVisible: true }).catch(() => {});

  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      // resume hooks
    } else {
      // background hooks
    }
  });
}

