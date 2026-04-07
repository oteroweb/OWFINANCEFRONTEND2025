import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    showDialogNewTransaction: false as boolean,
    showDialogEditTransaction: false as boolean,
    editTransactionId: null as number | null,
    prefillTransactionId: null as number | null,
    prefillTypeSlug: null as string | null,
    hideValues: localStorage.getItem('ow_hide_values') === 'true',
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
      this.hideValues = !this.hideValues;
      localStorage.setItem('ow_hide_values', String(this.hideValues));
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
    openNewTransactionDialog(typeSlug?: string) {
      this.prefillTransactionId = null;
      this.editTransactionId = null;
      this.prefillTypeSlug = typeSlug ?? null;
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
