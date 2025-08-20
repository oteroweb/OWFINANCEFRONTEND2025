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
          v-model="currencyId"
          :options="currencyOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          label="Moneda"
          filled
          dense
          class="q-mt-sm"
        />
        <q-select
          v-model="accountTypeId"
          :options="accountTypeOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
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
      type: Object as () => {
        name?: string;
        initialAmount?: number | null;
        type?: string;
        currency_id?: number | string | null;
        account_type_id?: number | string | null;
      } | null,
      default: null,
    },
    currencyOptions: {
      type: Array as () => Array<{ label: string; value: string | number }>,
      default: () => [],
    },
    accountTypeOptions: {
      type: Array as () => Array<{ label: string; value: string | number }>,
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
    const currencyId = ref<string | number>('');
    const accountTypeId = ref<string | number>('');

    function resetFields() {
      accountName.value = '';
      initialAmount.value = null;
      currencyId.value = '';
      accountTypeId.value = '';
    }

    watch(
      () => props.modelValue,
      (val) => {
        if (val) {
          // opening: prefill if edit mode and initialData provided
          if (props.mode === 'edit' && props.initialData) {
            accountName.value = props.initialData.name ?? '';
            initialAmount.value = props.initialData.initialAmount ?? null;
            currencyId.value = (props.initialData.currency_id as number | string) ?? '';
            accountTypeId.value = (props.initialData.account_type_id as number | string) ?? '';
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
        currency_id: currencyId.value,
        account_type_id: accountTypeId.value,
      });
      emit('update:modelValue', false);
    }
    function cancel() {
      emit('cancel');
      emit('update:modelValue', false);
    }

    return { accountName, initialAmount, currencyId, accountTypeId, submit, cancel };
  },
});
</script>
