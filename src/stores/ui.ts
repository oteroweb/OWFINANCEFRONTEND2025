import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    showDialogNewTransaction: false as boolean,
    showDialogEditTransaction: false as boolean,
    editTransactionId: null as number | null,
  }),
  actions: {
    openNewTransactionDialog() {
      this.showDialogNewTransaction = true;
    },
    closeNewTransactionDialog() {
      this.showDialogNewTransaction = false;
    },
    toggleNewTransactionDialog() {
      this.showDialogNewTransaction = !this.showDialogNewTransaction;
    },
    openEditTransactionDialog(id: number) {
      this.editTransactionId = id;
      this.showDialogEditTransaction = true;
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
