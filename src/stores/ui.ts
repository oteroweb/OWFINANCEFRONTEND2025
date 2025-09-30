import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    showDialogNewTransaction: false as boolean,
    showDialogEditTransaction: false as boolean,
    editTransactionId: null as number | null,
    prefillTransactionId: null as number | null,
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
      // Reutilizar el mismo diálogo de creación para editar (prefill + PUT en guardado)
      this.prefillTransactionId = id;
      this.showDialogNewTransaction = true;
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
