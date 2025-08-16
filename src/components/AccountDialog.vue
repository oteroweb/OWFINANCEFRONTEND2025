<template>
  <q-dialog :model-value="modelValue" @update:model-value="(val) => emit('update:modelValue', val)">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Nueva Cuenta</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="accountName" label="Nombre de la Cuenta" filled dense />
        <q-input
          v-model.number="initialAmount"
          label="Monto Inicial"
          type="number"
          filled
          dense
          class="q-mt-sm"
        />
        <q-select
          v-model="accountType"
          :options="accountTypeOptions"
          label="Tipo de Cuenta"
          filled
          dense
          class="q-mt-sm"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="secondary" v-close-popup @click="cancel" />
        <q-btn flat label="Agregar" color="primary" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  accountTypeOptions: {
    type: Array,
    default: () => [
      { label: 'Ahorro', value: 'savings' },
      { label: 'Corriente', value: 'checking' },
      { label: 'Inversión', value: 'investment' },
    ],
  },
});
const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const accountName = ref('');
const initialAmount = ref<number | null>(null);
const accountType = ref('');

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      accountName.value = '';
      initialAmount.value = null;
      accountType.value = '';
    }
  }
);

function submit() {
  emit('submit', {
    name: accountName.value,
    initialAmount: initialAmount.value,
    type: accountType.value,
  });
  emit('update:modelValue', false);
}
function cancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>
