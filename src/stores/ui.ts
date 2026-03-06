import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    showDialogNewTransaction: false as boolean,
    showDialogEditTransaction: false as boolean,
    editTransactionId: null as number | null,
    prefillTransactionId: null as number | null,
    hideValues: localStorage.getItem('ow_hide_values') === 'true',
  }),
  actions: {
    toggleHideValues() {
      this.hideValues = !this.hideValues;
      localStorage.setItem('ow_hide_values', String(this.hideValues));
    },
    openNewTransactionDialog() {
      this.prefillTransactionId = null;
      this.editTransactionId = null;
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
