<template>
  <form @submit.prevent="onSubmit">
    <!-- Ejemplo de campos básicos, puedes expandir según tu lógica -->
    <q-input v-model="localForm.name" label="Concepto" required />
    <q-input v-model.number="localForm.amount" label="Monto" type="number" required />
    <q-input v-model="localForm.datetime" label="Fecha y hora" type="datetime-local" required />
    <!-- Agrega aquí los demás campos necesarios -->
    <div class="q-mt-md">
      <q-btn
        type="submit"
        color="primary"
        :label="editMode ? 'Guardar cambios' : 'Crear'"
        :disable="isSaveDisabled"
      />
      <q-btn flat color="secondary" label="Cancelar" @click="$emit('cancel')" />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
export interface TransactionForm {
  id?: number;
  name: string;
  amount: number | null;
  datetime: string;
  provider_id: number | null;
  account_id: number | null;
  rate?: number | null;
  transaction_type_id?: string | null;
  account_from_id?: number | null;
  account_to_id?: number | null;
  url_file: string;
}
const props = defineProps<{ form: Partial<TransactionForm>; editMode?: boolean }>();
const emit = defineEmits(['save', 'cancel']);

const localForm = ref({ ...props.form });
watch(
  () => props.form,
  (val) => {
    localForm.value = { ...val };
  },
  { immediate: true }
);

const isSaveDisabled = computed(() => {
  // Puedes agregar validaciones adicionales aquí
  return !localForm.value.name || !localForm.value.amount;
});

function onSubmit() {
  emit('save', { ...localForm.value });
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'TransactionForm' });
</script>
