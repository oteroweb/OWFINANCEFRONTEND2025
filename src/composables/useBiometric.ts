import { ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';

const SERVER_ID = 'com.owfinance.app';

const isAvailable = ref(false);
const biometryType = ref<BiometryType>(BiometryType.NONE);
const hasCredentials = ref(false);

export function useBiometric() {
  async function checkAvailability() {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const result = await NativeBiometric.isAvailable();
      isAvailable.value = result.isAvailable;
      biometryType.value = result.biometryType;
      return result.isAvailable;
    } catch {
      isAvailable.value = false;
      return false;
    }
  }

  async function checkStoredCredentials(): Promise<boolean> {
    if (!isAvailable.value) return false;
    try {
      await NativeBiometric.getCredentials({ server: SERVER_ID });
      hasCredentials.value = true;
      return true;
    } catch {
      hasCredentials.value = false;
      return false;
    }
  }

  async function saveCredentials(email: string, password: string) {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await NativeBiometric.setCredentials({
        username: email,
        password: password,
        server: SERVER_ID,
      });
      hasCredentials.value = true;
    } catch (e) {
      console.warn('No se pudieron guardar credenciales biométricas:', e);
    }
  }

  async function authenticate(): Promise<{ email: string; password: string } | null> {
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Accede a OWFinance con tu huella',
        title: 'Autenticación biométrica',
        subtitle: 'Usa tu huella para iniciar sesión',
      });
      const creds = await NativeBiometric.getCredentials({ server: SERVER_ID });
      return { email: creds.username, password: creds.password };
    } catch {
      return null;
    }
  }

  async function deleteCredentials() {
    try {
      await NativeBiometric.deleteCredentials({ server: SERVER_ID });
      hasCredentials.value = false;
    } catch {
      // ignore
    }
  }

  return {
    isAvailable,
    biometryType,
    hasCredentials,
    checkAvailability,
    checkStoredCredentials,
    saveCredentials,
    authenticate,
    deleteCredentials,
  };
}
