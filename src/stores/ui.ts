import { defineStore } from 'pinia';
import { Dialog } from 'quasar';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from 'capacitor-native-biometric';

const HIDE_KEY = 'ow_hide_values';
const LOCK_KEY = 'ow_privacy_lock';

// Privacidad de montos activada por defecto: si el usuario nunca tocó el
// setting, la app arranca con los saldos ocultos (no expuestos "al aire").
function readPrivacyLock(): boolean {
  const raw = localStorage.getItem(LOCK_KEY);
  return raw === null ? true : raw === 'true';
}

async function verifyBiometric(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const avail = await NativeBiometric.isAvailable();
    if (!avail.isAvailable) return false;
    await NativeBiometric.verifyIdentity({
      reason: 'Confirmá tu identidad para ver tus montos',
      title: 'Privacidad de montos',
    });
    return true;
  } catch {
    return false;
  }
}

function verifyPinDialog(): Promise<boolean> {
  return new Promise((resolve) => {
    Dialog.create({
      title: 'Ingresá tu PIN',
      message: 'Confirmá tu PIN de seguridad para ver tus montos.',
      prompt: {
        model: '',
        type: 'password',
        isValid: (v: string) => /^[0-9]{4,6}$/.test(v),
      },
      cancel: true,
      persistent: true,
    })
      .onOk((pin: string) => {
        void (async () => {
          try {
            const { verifyPin } = await import('src/composables/useSecurityPin');
            resolve(await verifyPin(pin));
          } catch {
            resolve(false);
          }
        })();
      })
      .onCancel(() => resolve(false));
  });
}

function verifyPassword(): Promise<boolean> {
  return new Promise((resolve) => {
    Dialog.create({
      title: 'Confirmá tu contraseña',
      message: 'Por seguridad, ingresá tu contraseña para ver tus montos.',
      prompt: {
        model: '',
        type: 'password',
        isValid: (v: string) => v.length > 0,
      },
      cancel: true,
      persistent: true,
    })
      .onOk((password: string) => {
        void (async () => {
          try {
            const { useAuthStore } = await import('src/stores/auth');
            const authStore = useAuthStore();
            const email = authStore.user?.email;
            if (!email) {
              resolve(false);
              return;
            }
            await authStore.login(email, password);
            resolve(true);
          } catch {
            resolve(false);
          }
        })();
      })
      .onCancel(() => resolve(false));
  });
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    showDialogNewTransaction: false as boolean,
    showDialogEditTransaction: false as boolean,
    editTransactionId: null as number | null,
    prefillTransactionId: null as number | null,
    prefillTypeSlug: null as string | null,
    // AI extraction prefill fields
    prefillAmount: null as number | null,
    prefillName: null as string | null,
    prefillDate: null as string | null,
    // Smart Transaction Modal
    showSmartModal: false as boolean,
    smartModalTab: 'write' as 'write' | 'voice' | 'photo' | 'autoai',
    smartModalType: 'expense' as 'expense' | 'income' | 'transfer' | 'ajuste',
    hideValues: readPrivacyLock() ? true : localStorage.getItem(HIDE_KEY) === 'true',
    privacyLockEnabled: readPrivacyLock(),
    hasPin: null as boolean | null,
    jarStatus: {
      totalAvailable: 0,
      totalAllocated: 0,
      availabilityPercent: 0,
      usedPercent: 0,
      jarCount: 0,
    } as {
      totalAvailable: number;
      totalAllocated: number;
      availabilityPercent: number;
      usedPercent: number;
      jarCount: number;
    },
  }),
  actions: {
    toggleHideValues() {
      if (this.hideValues) {
        void this.revealValues();
        return;
      }
      this.hideValues = true;
      localStorage.setItem(HIDE_KEY, 'true');
    },
    async refreshPinStatus() {
      try {
        const { fetchPinStatus } = await import('src/composables/useSecurityPin');
        this.hasPin = await fetchPinStatus();
      } catch {
        this.hasPin = false;
      }
      return this.hasPin;
    },
    async revealValues() {
      if (this.privacyLockEnabled) {
        let ok = await verifyBiometric();
        if (!ok) {
          if (this.hasPin === null) await this.refreshPinStatus();
          if (this.hasPin) ok = await verifyPinDialog();
        }
        if (!ok) ok = await verifyPassword();
        if (!ok) return;
      }
      this.hideValues = false;
      localStorage.setItem(HIDE_KEY, 'false');
    },
    togglePrivacyLock() {
      this.privacyLockEnabled = !this.privacyLockEnabled;
      localStorage.setItem(LOCK_KEY, String(this.privacyLockEnabled));
      if (this.privacyLockEnabled) {
        this.hideValues = true;
        localStorage.setItem(HIDE_KEY, 'true');
      }
    },
    setJarStatus(payload: {
      totalAvailable: number;
      totalAllocated: number;
      availabilityPercent: number;
      usedPercent: number;
      jarCount: number;
    }) {
      this.jarStatus = {
        totalAvailable: Number(payload.totalAvailable || 0),
        totalAllocated: Number(payload.totalAllocated || 0),
        availabilityPercent: Number(payload.availabilityPercent || 0),
        usedPercent: Number(payload.usedPercent || 0),
        jarCount: Number(payload.jarCount || 0),
      };
    },
    openSmartModal(tab: 'write' | 'voice' | 'photo' | 'autoai' = 'write', type: 'expense' | 'income' | 'transfer' | 'ajuste' = 'expense') {
      this.smartModalTab = tab;
      this.smartModalType = type;
      this.showSmartModal = true;
    },
    closeSmartModal() {
      this.showSmartModal = false;
    },
    openNewTransactionDialog(typeSlug?: string) {
      this.prefillTransactionId = null;
      this.editTransactionId = null;
      this.prefillTypeSlug = typeSlug ?? null;
      this.prefillAmount = null;
      this.prefillName = null;
      this.prefillDate = null;
      this.showDialogNewTransaction = true;
    },
    openNewTransactionDialogWithAi(payload: {
      typeSlug?: string | null;
      amount?: number | null;
      name?: string | null;
      date?: string | null;
    }) {
      this.prefillTransactionId = null;
      this.editTransactionId = null;
      this.prefillTypeSlug = payload.typeSlug ?? null;
      this.prefillAmount = payload.amount ?? null;
      this.prefillName = payload.name ?? null;
      this.prefillDate = payload.date ?? null;
      this.showDialogNewTransaction = true;
    },
    closeNewTransactionDialog() {
      this.showDialogNewTransaction = false;
    },
    toggleNewTransactionDialog() {
      this.showDialogNewTransaction = !this.showDialogNewTransaction;
    },
    openEditTransactionDialog(id: number) {
      this.prefillTransactionId = id;
      this.showDialogNewTransaction = true;
      this.showDialogEditTransaction = false;
      this.editTransactionId = null;
    },
    closeEditTransactionDialog() {
      this.showDialogEditTransaction = false;
      this.editTransactionId = null;
    },
    toggleEditTransactionDialog() {
      this.showDialogEditTransaction = !this.showDialogEditTransaction;
    },
  },
});
