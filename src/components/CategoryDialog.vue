<template>
  <q-dialog v-model="modelValue">
    <q-card style="min-width: 420px; max-width: 600px">
      <q-card-section class="row items-center q-gutter-sm">
        <div class="text-subtitle1">{{ title }}</div>
        <q-space />
        <q-badge v-if="form.isFolder" color="grey-7" text-color="white" label="Carpeta" />
        <q-badge v-else color="primary" text-color="white" label="Categoría" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-md">
        <q-input v-model="form.name" label="Nombre" dense outlined autofocus />

        <!-- Radios: Gasto, Ingreso, Ambas en una sola línea -->
        <div class="q-mb-sm">
          <div class="text-caption text-grey-7 q-mb-xs">Tipo de transacción</div>
          <div class="tx-inline">
            <q-radio
              v-model="form.type_transaction"
              val="expense"
              label="Gasto"
              :disable="form.isFolder"
            />
            <q-radio
              v-model="form.type_transaction"
              val="income"
              label="Ingreso"
              :disable="form.isFolder"
            />
            <q-radio
              v-model="form.type_transaction"
              val="both"
              label="Ambas"
              :disable="form.isFolder"
            />
          </div>
        </div>

        <!-- Toggle debajo -->
        <div>
          <q-toggle
            v-model="form.include_in_balance"
            :disable="form.isFolder"
            label="Incluir en balance"
          />
        </div>

        <div class="row items-center q-gutter-sm">
          <q-avatar size="40px" square>
            <q-icon :name="form.isFolder ? 'folder' : form.icon || 'sell'" size="24px" />
          </q-avatar>
          <q-btn
            flat
            color="primary"
            label="Catálogo"
            :disable="form.isFolder"
            @click="showIconCatalog = true"
          />
        </div>

        <q-input v-model="form.date" label="Fecha" dense outlined type="date" />
        <q-toggle v-model="form.active" label="Activo" />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" v-close-popup />
        <q-btn flat :label="submitLabel" color="primary" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Icon catalog dialog -->
  <q-dialog v-model="showIconCatalog">
    <q-card style="min-width: 700px; max-width: 1000px">
      <q-bar>
        <div>Seleccione un icono</div>
        <q-space />
        <q-btn flat dense icon="close" v-close-popup />
      </q-bar>
      <q-separator />
      <q-card-section class="q-gutter-sm">
        <q-input v-model="iconSearch" dense outlined label="Buscar icono" clearable />
      </q-card-section>
      <q-card-section>
        <div class="icons-grid">
          <div v-for="i in filteredIcons" :key="i" class="icon-cell" @click="selectIcon(i)">
            <q-icon :name="i" size="28px" />
            <div class="text-caption ellipsis">{{ i }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  mode: 'create' | 'edit';
  isFolder?: boolean;
  initialData?: {
    name?: string;
    date?: string | null;
    active?: boolean;
    parent_id?: string | null;
    icon?: string | null;
    type_transaction?: 'income' | 'expense' | 'both' | null;
    include_in_balance?: boolean | null;
  } | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (
    e: 'submit',
    payload: {
      name: string;
      active: boolean;
      date: string | null;
      parent_id?: string | null;
      isFolder?: boolean;
      icon?: string | null;
      type_transaction?: 'income' | 'expense' | 'both' | null;
      include_in_balance?: boolean;
    }
  ): void;
}>();

const modelValue = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const form = ref({
  name: props.initialData?.name || '',
  date: props.initialData?.date || '',
  active: props.initialData?.active ?? true,
  parent_id: props.initialData?.parent_id ?? null,
  isFolder: props.isFolder ?? false,
  icon: props.initialData?.icon || null,
  type_transaction: props.initialData?.type_transaction ?? 'both',
  include_in_balance: props.initialData?.include_in_balance ?? true,
});

watch(
  () => props.initialData,
  (val) => {
    form.value = {
      name: val?.name || '',
      date: val?.date || '',
      active: val?.active ?? true,
      parent_id: val?.parent_id ?? null,
      isFolder: props.isFolder ?? false,
      icon: val?.icon || null,
      type_transaction: (val?.type_transaction as 'income' | 'expense' | 'both' | null) ?? 'both',
      include_in_balance: val?.include_in_balance ?? true,
    };
  }
);

const title = computed(() =>
  props.mode === 'edit' ? 'Editar' : form.value.isFolder ? 'Nueva carpeta' : 'Nueva categoría'
);
const submitLabel = computed(() => (props.mode === 'edit' ? 'Actualizar' : 'Crear'));

// Radios are rendered inline manually; no options array needed

// Basic Material Icons picker
const ALL_ICONS = [
  'sell',
  'attach_money',
  'savings',
  'request_quote',
  'shopping_cart',
  'restaurant',
  'local_gas_station',
  'receipt_long',
  'local_grocery_store',
  'payments',
  'price_check',
  'work',
  'home',
  'school',
  'flight',
  'favorite',
  'celebration',
  'directions_car',
  'pets',
  'medical_services',
  'sports_soccer',
  'movie',
  'music_note',
  'redeem',
  'card_giftcard',
  'shopping_bag',
  'trending_up',
  'trending_down',
  'euro',
  'currency_bitcoin',
  'currency_exchange',
];
const showIconCatalog = ref(false);
const iconSearch = ref('');
const filteredIcons = computed(() => {
  const q = iconSearch.value.trim().toLowerCase();
  const pool = ALL_ICONS;
  if (!q) return pool;
  return pool.filter((i) => i.toLowerCase().includes(q));
});
function selectIcon(i: string) {
  form.value.icon = i;
  showIconCatalog.value = false;
}

function onSubmit() {
  emit('submit', {
    name: form.value.name,
    active: form.value.active,
    date: form.value.date || null,
    parent_id: form.value.parent_id ?? null,
    isFolder: form.value.isFolder,
    icon: form.value.icon || null,
    type_transaction: form.value.isFolder ? null : form.value.type_transaction,
    include_in_balance: !!form.value.include_in_balance,
  });
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'CategoryDialog' });
</script>

<style scoped>
.q-badge + .q-badge {
  margin-left: 4px;
}
.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}
.icon-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  cursor: pointer;
}
.icon-cell:hover {
  background: rgba(0, 0, 0, 0.04);
}
.tx-inline {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
}
.tx-inline :deep(.q-radio) {
  margin-right: 0;
}
</style>
