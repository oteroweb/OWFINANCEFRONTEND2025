<template>
  <q-dialog :model-value="modelValue" @update:model-value="(v) => $emit('update:modelValue', v)">
    <q-card style="min-width: 520px; max-width: 720px">
      <q-card-section class="row items-center q-gutter-sm">
        <div class="text-h6 col">{{ account?.name || 'Cuenta' }}</div>
        <q-space />
        <q-btn dense round flat icon="close" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="q-gutter-md">
          <div class="row items-center">
            <div class="col-5 text-grey-8">Descripción:</div>
            <div class="col">{{ account?.name || '-' }}</div>
          </div>
          <div class="row items-center">
            <div class="col-5 text-grey-8">Saldo actual:</div>
            <div class="col text-positive">
              <span v-if="account?.balance != null">{{ account.balance.toLocaleString() }}</span>
              <span v-else>-</span>
            </div>
          </div>
          <div class="row items-center">
            <div class="col-5 text-grey-8">Moneda por defecto:</div>
            <div class="col">{{ account?.currency_label || '-' }}</div>
          </div>
          <div class="row items-center">
            <div class="col-5 text-grey-8">Fecha de apertura:</div>
            <div class="col">{{ account?.opening_date || '-' }}</div>
          </div>
          <div class="row items-center">
            <div class="col-5 text-grey-8">Imagen:</div>
            <div class="col">
              <q-img v-if="account?.image_url" :src="account.image_url" style="max-width: 120px" />
              <span v-else>-</span>
            </div>
          </div>
          <div class="row items-center">
            <div class="col-5 text-grey-8">Contabilizar en balance:</div>
            <div class="col">{{ account?.active ? 'Sí' : 'No' }}</div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat color="negative" icon="delete" label="Eliminar" @click="confirmDelete" />
        <q-btn flat color="primary" icon="edit" label="Editar" @click="() => $emit('edit')" />
        <q-btn flat color="primary" label="Cerrar" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export type ViewerAccount = {
  id: string;
  name: string;
  balance?: number | null;
  currency_label?: string | null;
  opening_date?: string | null; // ISO or formatted
  image_url?: string | null;
  active?: boolean | null;
};

export default defineComponent({
  name: 'AccountViewerDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    account: { type: Object as () => ViewerAccount | null, default: null },
  },
  emits: ['update:modelValue', 'edit', 'delete'],
  setup(_, { emit }) {
    function confirmDelete() {
      emit('delete');
    }
    return { confirmDelete };
  },
});
</script>

<style scoped>
</style>
