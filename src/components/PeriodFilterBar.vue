<template>
  <div class="period-bar q-px-md q-py-sm bg-white text-dark shadow-1">
    <div class="inner row items-center no-wrap">
      <div class="tabs-scroll row no-wrap items-center q-gutter-xs">
        <q-btn
          v-for="t in tabs"
          :key="t.type"
          dense
          no-caps
          :label="t.label"
          :color="period.state.type === t.type ? 'primary' : 'grey-7'"
          :flat="period.state.type !== t.type"
          :unelevated="period.state.type === t.type"
          size="sm"
          class="period-tab"
          @click="handleTab(t.type)"
        />
      </div>
      <div class="spacer" />
      <div class="nav row items-center q-gutter-xs">
        <q-btn dense flat icon="chevron_left" @click="period.shift(-1)" />
        <div class="label text-body2 text-weight-bold">{{ period.label }}</div>
        <q-btn dense flat icon="chevron_right" @click="period.shift(1)" />
        <q-btn
          v-if="period.state.type === 'custom'"
          dense
          flat
          icon="edit_calendar"
          size="sm"
          @click="openCustom()"
        />
      </div>
    </div>
  </div>

  <q-dialog v-model="showCustom" persistent>
    <q-card style="min-width: 380px; max-width: 440px" class="q-pa-md">
      <q-card-section class="q-pt-none q-pb-sm">
        <div class="text-h6">Selección de fecha</div>
      </q-card-section>
      <q-separator inset />
      <q-card-section class="q-gutter-md">
        <div>
          <div class="text-caption text-weight-medium q-mb-xs">Desde</div>
          <q-input dense filled v-model="tmpFrom" type="date" />
        </div>
        <div>
          <div class="text-caption text-weight-medium q-mb-xs">Hasta</div>
          <q-input dense filled v-model="tmpTo" type="date" />
        </div>
        <q-banner v-if="errorMsg" class="bg-negative text-white q-pa-sm" rounded>
          {{ errorMsg }}
        </q-banner>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="secondary" @click="cancelCustom" />
        <q-btn unelevated color="primary" label="Aceptar" @click="applyCustom" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { usePeriodStore, type PeriodType } from 'stores/period';
import { ref } from 'vue';
const period = usePeriodStore();

interface TabDef {
  label: string;
  type: PeriodType;
}
const tabs: TabDef[] = [
  { label: 'Todo', type: 'all' },
  { label: 'Anual', type: 'year' },
  { label: 'Semestral', type: 'semester' },
  { label: 'Trimestral', type: 'quarter' },
  { label: 'Mensual', type: 'month' },
  { label: 'Quincenal', type: 'fortnight' },
  { label: 'Semanal', type: 'week' },
  { label: 'Diario', type: 'day' },
  { label: 'Personalizado', type: 'custom' },
];

const showCustom = ref(false);
const tmpFrom = ref('');
const tmpTo = ref('');
const errorMsg = ref('');

function defaultMonthRange() {
  const anchor = new Date(period.state.anchor + 'T00:00:00');
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const first = new Date(y, m, 1);
  const nextMonth = new Date(y, m + 1, 1);
  const last = new Date(nextMonth.getTime() - 86400000);
  tmpFrom.value = first.toISOString().slice(0, 10);
  tmpTo.value = last.toISOString().slice(0, 10);
}

function handleTab(t: PeriodType) {
  if (t === 'custom') {
    openCustom();
    return;
  }
  period.setType(t);
}

function openCustom() {
  period.setType('custom');
  if (!tmpFrom.value || !tmpTo.value) defaultMonthRange();
  errorMsg.value = '';
  showCustom.value = true;
}

function cancelCustom() {
  // Si no había rango previo, volver a mes
  if (!period.state.customFrom || !period.state.customTo) {
    period.setType('month');
  }
  showCustom.value = false;
}

function applyCustom() {
  errorMsg.value = '';
  if (!tmpFrom.value || !tmpTo.value) {
    errorMsg.value = 'Ambas fechas son requeridas';
    return;
  }
  if (tmpFrom.value > tmpTo.value) {
    errorMsg.value = 'Desde no puede ser mayor que Hasta';
    return;
  }
  period.setCustomRange(tmpFrom.value, tmpTo.value);
  showCustom.value = false;
}

// noop
</script>

<style scoped>
.period-bar {
  border-bottom: 1px solid var(--q-color-grey-4);
  overflow-x: auto;
  position: relative;
}
.inner {
  width: 100%;
  display: flex;
  align-items: center;
}
.tabs-scroll {
  flex: 1 1 auto;
}
.spacer {
  width: 24px;
}
.label {
  min-width: 220px;
  text-align: center;
  font-size: 15px;
}
.period-tab {
  min-width: 90px;
}
</style>
