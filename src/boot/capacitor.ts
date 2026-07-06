import { boot } from 'quasar/wrappers';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export default boot(async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Fondo oscuro (--bg-canvas) → íconos claros, si no quedan invisibles sobre el navy.
    await StatusBar.setStyle({ style: Style.Light });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0f172a' });
    }
  } catch (e) {
    console.warn('No se pudo configurar la StatusBar nativa:', e);
  }
});
