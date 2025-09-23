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
// Reutilizable para traducir errores simples cuando este diálogo se use para guardar.
export function translateSimpleTransactionError(raw: string): string {
  const map: Record<string, string> = { name: 'Concepto', amount: 'Monto' };
  let out = raw;
  Object.entries(map).forEach(([k, label]) => {
    const r = new RegExp(`\\b${k}\\b.*is required`, 'i');
    if (r.test(raw)) out = out.replace(r, `${label} es requerido`);
  });
  if (/incorrect params/i.test(raw)) {
    const already = /es requerido/.test(out);
    if (already) return out.replace(/incorrect params/i, 'Parámetros incorrectos');
    return `Parámetros incorrectos. ${out}`;
  }
  return out;
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'TransactionFormDialog' });
</script>
