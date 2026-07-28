<template>
  <q-dialog v-model="show" transition-show="jump-up" transition-hide="jump-down">
    <q-card class="rhp-card">
      <div class="rhp-header">
        <span class="rhp-header__title">
          {{ kind === 'bcv' ? 'Tasas oficiales (BCV) anteriores' : 'Tasas paralelas anteriores' }}
        </span>
        <q-btn flat round dense icon="close" @click="show = false" />
      </div>

      <div class="rhp-body">
        <div v-if="loading" class="rhp-state">Cargando…</div>
        <div v-else-if="error" class="rhp-state rhp-state--error">No se pudo cargar el historial.</div>
        <div v-else-if="!rows.length" class="rhp-state">Sin tasas anteriores guardadas para esta moneda.</div>
        <button
          v-for="row in rows"
          :key="row.id"
          type="button"
          class="rhp-row"
          @click="select(row)"
        >
          <span class="rhp-row__rate">{{ formatRate(row.rate) }}</span>
          <span class="rhp-row__date">{{ formatDate(row.date) }}</span>
        </button>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { api } from 'src/boot/axios';

type RateKind = 'paralela' | 'bcv';
interface HistoryRow { id: number; rate: number; date: string }

const props = defineProps<{
  modelValue: boolean;
  kind: RateKind;
  currencyId: number | null;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'select', row: { rate: number; date: string }): void;
}>();

const show = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const rows = ref<HistoryRow[]>([]);
const loading = ref(false);
const error = ref(false);

async function load() {
  if (!props.currencyId) { rows.value = []; return; }
  loading.value = true;
  error.value = false;
  try {
    const path = props.kind === 'bcv' ? '/user-currencies/official-history' : '/user-currencies/history';
    const res = await api.get<{ data: Record<string, unknown>[] }>(path, { params: { currency_id: props.currencyId } });
    const raw = Array.isArray(res.data?.data) ? res.data.data : [];
    rows.value = raw.map((r) => ({
      id: Number(r['id']),
      rate: props.kind === 'bcv' ? Number(r['rate']) : Number(r['current_rate']),
      date: typeof (props.kind === 'bcv' ? r['fetched_at'] : r['updated_at']) === 'string'
        ? (props.kind === 'bcv' ? r['fetched_at'] : r['updated_at']) as string
        : '',
    })).filter((r) => Number.isFinite(r.rate) && r.rate > 0);
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

watch(() => props.modelValue, (v) => { if (v) void load(); });

function select(row: HistoryRow) {
  emit('select', { rate: row.rate, date: row.date });
  show.value = false;
}

function formatRate(n: number): string {
  return n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.rhp-card {
  width: 100%;
  max-width: 360px;
  background: var(--surface-1);
  border-radius: 12px;
  overflow: hidden;
}
.rhp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-hairline);
}
.rhp-header__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--fg-1);
}
.rhp-body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 8px;
}
.rhp-state {
  padding: 24px 8px;
  text-align: center;
  font-size: 13px;
  color: var(--fg-3);
}
.rhp-state--error {
  color: var(--expense, #ef4444);
}
.rhp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--fg-1);
  cursor: pointer;
  font: inherit;
  text-align: left;
}
.rhp-row:hover {
  background: var(--surface-2);
}
.rhp-row__rate {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.rhp-row__date {
  font-size: 12px;
  color: var(--fg-3);
}
</style>
