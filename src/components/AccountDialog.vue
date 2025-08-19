<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ mode === 'edit' ? 'Editar Cuenta' : 'Nueva Cuenta' }}</div>
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
        <q-btn
          flat
          :label="mode === 'edit' ? 'Guardar' : 'Agregar'"
          color="primary"
          @click="submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'AccountDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    mode: { type: String as () => 'create' | 'edit', default: 'create' },
    initialData: {
      type: Object as () => { name?: string; initialAmount?: number | null; type?: string } | null,
      default: null,
    },
    accountTypeOptions: {
      type: Array as () => Array<{ label: string; value: string }>,
      default: () => [
        { label: 'Ahorro', value: 'savings' },
        { label: 'Corriente', value: 'checking' },
        { label: 'Inversión', value: 'investment' },
      ],
    },
  },
  emits: ['update:modelValue', 'submit', 'cancel'],
  setup(props, { emit }) {
    const accountName = ref('');
    const initialAmount = ref<number | null>(null);
    const accountType = ref('');

    function resetFields() {
      accountName.value = '';
      initialAmount.value = null;
      accountType.value = '';
    }

    watch(
      () => props.modelValue,
      (val) => {
        if (val) {
          // opening: prefill if edit mode and initialData provided
          if (props.mode === 'edit' && props.initialData) {
            accountName.value = props.initialData.name ?? '';
            initialAmount.value = props.initialData.initialAmount ?? null;
            accountType.value = props.initialData.type ?? '';
          } else {
            resetFields();
          }
        } else {
          // closing: reset
          resetFields();
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

    return { accountName, initialAmount, accountType, submit, cancel };
  },
});
</script>
