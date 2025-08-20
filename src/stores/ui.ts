import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    showDialogNewTransaction: false as boolean,
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
  },
});
