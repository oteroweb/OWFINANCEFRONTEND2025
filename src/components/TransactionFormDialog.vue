<template>
  <q-dialog v-model="ui.showDialogNewTransaction">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Nueva Transacción</div>
      </q-card-section>
      <q-card-section>
        <!-- Mount the UserHome TransactionForm fields via slot or simplified bridge -->
        <!-- For now, we mount a lightweight bridge that emits save/cancel and relies on the same stores -->
        <slot />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="secondary" @click="ui.closeNewTransactionDialog()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useUiStore } from 'stores/ui';
const ui = useUiStore();
</script>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'TransactionFormDialog' });
</script>
