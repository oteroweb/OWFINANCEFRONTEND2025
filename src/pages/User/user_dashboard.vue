<template>
  <q-page class="q-pa-md column q-gutter-md">
    <div class="row items-center q-col-gutter-md">
      <div class="col-grow">
        <div class="text-h5">Hola, {{ auth.user?.name || 'Usuario' }}</div>
        <div class="text-caption text-grey-7">Dashboard limpio.</div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Nueva transacción"
          @click="ui.openNewTransactionDialog()"
        />
      </div>
    </div>
    <!-- Moneda por defecto + tasas actuales -->
    <div class="row items-center q-gutter-xs q-mt-sm rates-row">
      <q-chip dense color="grey-2" text-color="dark" class="text-weight-medium">
        {{ defaultCurrencyCode || 'USD' }}
      </q-chip>
      <template v-for="r in currentRates" :key="r.code">
        <q-chip dense color="blue-1" text-color="primary" class="rate-chip-item">
          {{ r.code }}: {{ r.rateLabel }}
          <q-badge v-if="r.is_official" color="teal" class="q-ml-xs">oficial</q-badge>
        </q-chip>
      </template>
    </div>
    <q-separator spaced />
    <!-- Balance global de cuentas -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-xs">
              <q-icon name="account_balance_wallet" color="primary" size="22px" />
              <div class="text-subtitle2 text-weight-medium">Total todas las cuentas</div>
            </div>
            <div class="text-h5 q-mt-xs text-primary">
              {{ balanceSummaryLoading ? '...' : masked(balanceSummary.total_all) }}
            </div>
            <div class="text-caption text-grey-6">Suma de todas las cuentas activas</div>
            <q-tooltip v-if="accountsSummary.length" max-width="320px">
              <div class="q-gutter-y-xs">
                <div v-for="a in accountsSummary" :key="a.id" class="row items-center justify-between q-gutter-x-sm">
                  <span>{{ a.name }}</span>
                  <span class="text-right">
                    <span v-if="a.currency_code !== 'USD' && a.currency_code !== defaultCurrencyCode">
                      {{ ui.hideValues ? HIDDEN : (a.currency_symbol + a.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })) }}
                      <span class="text-grey-3"> = </span>
                    </span>
                    {{ masked(a.balance_usd) }}
                    <q-icon v-if="!a.has_rate" name="warning" color="warning" size="12px" title="Sin tasa configurada" />
                  </span>
                </div>
              </div>
            </q-tooltip>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="row items-center q-gutter-xs">
              <q-icon name="account_balance" color="teal" size="22px" />
              <div class="text-subtitle2 text-weight-medium">Balance global configurado</div>
            </div>
            <div class="text-h5 q-mt-xs text-teal">
              {{ balanceSummaryLoading ? '...' : masked(balanceSummary.total_global_balance) }}
            </div>
            <div class="text-caption text-grey-6">Solo cuentas marcadas para balance global</div>
            <q-tooltip v-if="accountsSummary.length" max-width="320px">
              <div class="q-gutter-y-xs">
                <template v-for="a in accountsSummary" :key="a.id">
                  <div v-if="a.include_in_global_balance" class="row items-center justify-between q-gutter-x-sm">
                    <span>{{ a.name }}</span>
                    <span class="text-right">
                      <span v-if="a.currency_code !== 'USD' && a.currency_code !== defaultCurrencyCode">
                        {{ ui.hideValues ? HIDDEN : (a.currency_symbol + a.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })) }}
                        <span class="text-grey-3"> = </span>
                      </span>
                      {{ masked(a.balance_usd) }}
                      <q-icon v-if="!a.has_rate" name="warning" color="warning" size="12px" title="Sin tasa configurada" />
                    </span>
                  </div>
                </template>
              </div>
            </q-tooltip>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <q-separator spaced />
    <!-- Filtro de periodo/mes -->
    <div class="row items-center q-gutter-md q-mb-md">
      <div class="col-auto">
        <PeriodFilterBar />
      </div>
    </div>

    <!-- Pie chart de distribución por cántaro -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2">Distribución por cántaro</div>
        <div class="text-caption text-grey-7">Visualiza cómo se distribuyen tus fondos entre cántaros este periodo.</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div style="max-width: 420px; margin: 0 auto;">
          <q-img :src="pieChartUrl" style="width: 100%; max-width: 400px;" v-if="pieChartUrl" />
          <div v-else class="text-grey-5 text-center q-pa-md">Sin datos para graficar</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resumen mensual de cántaros (tabla) -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2">Resumen del mes</div>
        <div class="text-caption text-grey-7">
          Totales de gasto, asignación y ahorro por cántaro.
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <div class="summary-table-wrap">
          <table class="summary-table">
            <thead>
              <tr>
                <th class="text-left">Cántaro</th>
                <th class="text-right">Asignado</th>
                <th class="text-right">Gastado</th>
                <th class="text-right">Ajuste</th>
                <th class="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in jarMonthlySummary" :key="row.id">
                <td>
                  <span class="summary-dot" :style="{ background: row.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', marginRight: '6px' }"></span>
                  {{ row.name }}
                </td>
                <td class="text-right text-info">{{ masked(row.assignedExpected) }}</td>
                <td class="text-right text-negative">{{ masked(row.spent) }}</td>
                <td class="text-right" :class="row.adjustment > 0 ? 'text-positive' : row.adjustment < 0 ? 'text-negative' : ''">
                  {{ row.adjustment !== 0 ? ((row.adjustment > 0 ? '+' : '') + masked(row.adjustment)) : '—' }}
                </td>
                <td class="text-right text-weight-bold" :class="row.balance < 0 ? 'text-negative' : row.balance > 0 ? 'text-positive' : 'text-grey-6'">
                  {{ masked(row.balance) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="summary-total-row">
                <td class="text-weight-bold">Total</td>
                <td class="text-right text-weight-bold text-info">{{ masked(summaryTotals.assignedExpected) }}</td>
                <td class="text-right text-weight-bold text-negative">{{ masked(summaryTotals.spent) }}</td>
                <td class="text-right text-weight-bold" :class="summaryTotals.adjustment >= 0 ? 'text-positive' : 'text-negative'">
                  {{ summaryTotals.adjustment !== 0 ? ((summaryTotals.adjustment > 0 ? '+' : '') + masked(summaryTotals.adjustment)) : '—' }}
                </td>
                <td class="text-right text-weight-bold" :class="summaryTotals.balance < 0 ? 'text-negative' : 'text-positive'">
                  {{ masked(summaryTotals.balance) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla dinero ocioso mensual -->
    <q-card v-if="idleMonths.length > 0" flat bordered>
      <q-card-section class="q-pb-none">
        <div class="text-subtitle2 text-weight-medium">Dinero ocioso en cántaros reset</div>
        <div class="text-caption text-grey-6">Dinero asignado pero no gastado cada mes &mdash; se pierde al resetear</div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <q-markup-table flat dense separator="horizontal">
          <thead>
            <tr class="text-grey-7">
              <th class="text-left">Mes</th>
              <th class="text-right">No usado</th>
              <th class="text-right">Acumulado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in idleMonths"
              :key="row.month"
              :class="row.month === currentMonth ? 'bg-orange-1 text-weight-medium' : ''"
            >
              <td class="text-left">
                {{ new Date(row.month + '-02').toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) }}
                <q-badge v-if="row.month === currentMonth" color="warning" class="q-ml-xs" label="actual" />
              </td>
              <td class="text-right" :class="row.unused > 0 ? 'text-warning' : 'text-grey-5'">{{ masked(row.unused) }}</td>
              <td class="text-right text-weight-bold">{{ masked(row.accumulated) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-grey-2">
              <td class="text-left text-weight-bold">Total 12 meses</td>
              <td></td>
              <td class="text-right text-weight-bold text-warning">{{ masked(theoreticalSavings.accumulated_unused) }}</td>
            </tr>
          </tfoot>
        </q-markup-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>
<script setup lang="ts">

import { useAuthStore } from 'stores/auth';
import { useUiStore } from 'stores/ui';
import { useUserRates } from 'src/composables/useUserRates';
import { api } from 'boot/axios';
import { computed, onMounted, ref, watch } from 'vue';
import { usePeriodStore } from 'stores/period';
import PeriodFilterBar from 'components/PeriodFilterBar.vue';

// --- Jars summary logic (adapted from jars/index.vue) ---
type JarSummary = {
  id: number;
  name: string;
  color: string;
  percent: number;
  assignedExpected: number;
  spent: number;
  adjustment: number;
  balance: number;
};
const jarElements = ref<JarSummary[]>([]);
const periodStore = usePeriodStore();
const expectedIncome = ref(0);
const calculatedIncome = ref(0);
const theoreticalSavings = ref({
  total_unused: 0,
  total_savings_accounts: 0,
  total_theoretical: 0,
  accumulated_unused: 0,
});

function masked(val: number) {
  if (ui.hideValues) return '••••••';
  return typeof val === 'number' ? val.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) : val;
}

// Dummy: in real app, fetch jars and balances from API or Pinia store
onMounted(() => {
  // Simulate API fetch for jars and summary
  // TODO: Replace with real API/store logic
  jarElements.value = [
    { id: 1, name: 'Necesidades', color: '#1976d2', percent: 50, assignedExpected: 500, spent: 400, adjustment: 0, balance: 100 },
    { id: 2, name: 'Ahorro', color: '#43a047', percent: 30, assignedExpected: 300, spent: 100, adjustment: 0, balance: 200 },
    { id: 3, name: 'Ocio', color: '#fbc02d', percent: 20, assignedExpected: 200, spent: 150, adjustment: 0, balance: 50 },
  ];
  expectedIncome.value = 1000;
  calculatedIncome.value = 950;
  theoreticalSavings.value = {
    total_unused: 150,
    total_savings_accounts: 200,
    total_theoretical: 350,
    accumulated_unused: 300,
  };
});

const jarMonthlySummary = computed(() => jarElements.value);
const summaryTotals = computed(() => {
  const rows = jarMonthlySummary.value;
  const spent = rows.reduce((s, r) => s + (r.spent || 0), 0);
  const adjustment = rows.reduce((s, r) => s + (r.adjustment || 0), 0);
  return {
    assignedExpected: rows.reduce((s, r) => s + (r.assignedExpected || 0), 0),
    spent,
    adjustment,
    balance: rows.reduce((s, r) => s + (r.balance || 0), 0),
  };
});

// Pie chart image URL (using quickchart.io for demo)
const pieChartUrl = computed(() => {
  const rows = jarMonthlySummary.value;
  if (!rows.length) return '';
  const labels = rows.map((r) => r.name);
  const data = rows.map((r) => r.assignedExpected);
  const colors = rows.map((r) => r.color || '#888');
  const chart = {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: colors }] },
    options: { plugins: { legend: { position: 'bottom' } } },
  };
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chart))}`;
});

defineOptions({ name: 'user_dashboard' });
const auth = useAuthStore();
const ui = useUiStore();
const { defaultCurrencyCode, currentRates } = useUserRates();
const periodStore = usePeriodStore();

const theoreticalSavings = ref({
  total_unused: 0,
  total_savings_accounts: 0,
  total_theoretical: 0,
  accumulated_unused: 0,
});

const balanceSummary = ref({ total_all: 0, total_global_balance: 0 });
const balanceSummaryLoading = ref(false);

type AccountSummaryItem = {
  id: number;
  name: string;
  balance: number;
  balance_usd: number;
  include_in_global_balance: boolean;
  currency_code: string;
  currency_symbol: string;
  has_rate: boolean;
};
const accountsSummary = ref<AccountSummaryItem[]>([]);

type IdleMonth = {
  month: string;
  unused: number;
  accumulated: number;
};
const idleMonths = ref<IdleMonth[]>([]);

const currentMonth = computed(() => {
  if (periodStore.state.type === 'month') {
    const anchorDate = new Date(periodStore.state.anchor + 'T00:00:00');
    const year = anchorDate.getFullYear();
    const month = String(anchorDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
});

const currencyCode = computed(() => defaultCurrencyCode.value || 'USD');

function formatAmount(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode.value,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function masked(amount: number) {
  return ui.hideValues ? HIDDEN : formatAmount(amount);
}

async function loadTheoreticalSavings() {
  try {
    const balanceDate = `${currentMonth.value}-01`;
    const [summaryRes, accumRes] = await Promise.all([
      api.get('/jars/theoretical-savings', { params: { date: balanceDate } }),
      api.get('/jars/theoretical-savings/accumulated', {
        params: { to: currentMonth.value },
      }),
    ]);
    const data = summaryRes.data?.data || {};
    const accumData = accumRes.data?.data || {};
    theoreticalSavings.value = {
      total_unused: Number(data.total_unused || 0),
      total_savings_accounts: Number(data.total_savings_accounts || 0),
      total_theoretical: Number(data.total_theoretical || 0),
      accumulated_unused: Number(accumData.grand_total_unused || 0),
    };
    idleMonths.value = (accumData.months || []) as IdleMonth[];
  } catch (err) {
    console.warn('[TheoreticalSavings] Error loading data:', err);
    theoreticalSavings.value = {
      total_unused: 0,
      total_savings_accounts: 0,
      total_theoretical: 0,
      accumulated_unused: 0,
    };
    idleMonths.value = [];
  }
}

async function loadBalanceSummary() {
  balanceSummaryLoading.value = true;
  try {
    const res = await api.get('/accounts/summary/global-balance');
    const data = res.data?.data || {};
    balanceSummary.value = {
      total_all: Number(data.total_all ?? 0),
      total_global_balance: Number(data.total_global_balance ?? 0),
    };
    accountsSummary.value = (data.accounts || []) as AccountSummaryItem[];
  } catch (err) {
    console.warn('[BalanceSummary] Error loading data:', err);
    balanceSummary.value = { total_all: 0, total_global_balance: 0 };
    accountsSummary.value = [];
  } finally {
    balanceSummaryLoading.value = false;
  }
}

onMounted(() => {
  void loadTheoreticalSavings();
  void loadBalanceSummary();
});

watch(
  () => periodStore.state.anchor,
  async (newAnchor, oldAnchor) => {
    if (periodStore.state.type !== 'month' || newAnchor === oldAnchor) return;
    await loadTheoreticalSavings();
  }
);
</script>
<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.widget {
  min-height: 100px;
}
.rates-row .q-chip {
  height: 24px;
}
.rate-chip-item {
  white-space: nowrap;
}
</style>
