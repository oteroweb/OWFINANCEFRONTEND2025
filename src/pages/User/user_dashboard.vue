<template>
  <q-page class="q-pa-md column q-gutter-md">
    <q-card flat class="glass-panel text-white">
      <q-card-section class="hero-card__section">
        <div class="hero-copy-wrap">
          <div class="text-overline text-white" style="opacity: 0.8">Centro financiero</div>
          <div class="text-h4 text-weight-bold">Hola, {{ auth.user?.name || 'Usuario' }}</div>
          <div class="text-body2 hero-copy" style="opacity: 0.9">
            Visualiza distribucion por cántaro, balance global y comportamiento del periodo con una vista más clara y accionable.
          </div>
        </div>
        <div class="hero-actions">
          <q-btn color="white" text-color="primary" icon="add" label="Nueva transacción" @click="ui.openNewTransactionDialog()" class="shadow-1" />
          <q-btn outline color="white" icon="insights" label="Analizar gastos" @click="openExpenseAnalysis()" />
        </div>
      </q-card-section>
    </q-card>
    <!-- Moneda por defecto + tasas actuales -->
    <div class="row items-center q-gutter-xs q-mt-sm rates-row">
      <q-chip dense color="grey-2" text-color="dark" class="text-weight-medium">
        {{ defaultCurrencyCode || 'USD' }}
      </q-chip>
      <q-chip
        v-for="r in currentRates"
        :key="r.code"
        dense
        color="blue-1"
        text-color="primary"
        class="rate-chip-item"
      >
        {{ r.code }}: {{ r.rateLabel }}
        <q-badge v-if="r.is_official" color="teal" class="q-ml-xs">oficial</q-badge>
      </q-chip>
    </div>
    <!-- Balance global de cuentas -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <q-card flat class="glass-panel metric-card">
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
        <q-card flat class="glass-panel metric-card">
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
                <template v-for="a in accountsSummary">
                  <div :key="a.id" v-if="a.include_in_global_balance" class="row items-center justify-between q-gutter-x-sm">
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
      <div class="col-auto">
        <q-btn outline color="primary" icon="travel_explore" label="Ir al navegador de gastos" @click="openExpenseAnalysis()" />
      </div>
    </div>

    <ExpenseDistributionChart
      v-if="jarMonthlySummary.length"
      :rows="jarMonthlySummary"
      :currency-code="currencyCode"
      :hide-values="ui.hideValues"
      class="q-mb-md"
    />

    <q-card v-else flat class="glass-panel q-mb-md metric-card">
      <q-card-section class="text-center q-py-xl text-grey-6">
        Sin datos de cántaros para graficar en este periodo.
      </q-card-section>
    </q-card>

    <!-- Resumen mensual de cántaros (tabla) -->
    <q-card flat class="glass-panel q-mb-md summary-card">
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
              <tr v-for="row in jarMonthlySummary" :key="row.id" class="summary-row-clickable" @click="openExpenseAnalysis(row.id)">
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
    <q-card v-if="idleMonths.length > 0" flat class="glass-panel summary-card">
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
import { api } from '../../boot/axios';
import { ExpenseDistributionChart } from '../../components';
import { computed, onMounted, ref, watch } from 'vue';
import { useUserRates } from '../../composables/useUserRates';
import { useAuthStore } from '../../stores/auth';
import { usePeriodStore } from '../../stores/period';
import { useUiStore } from '../../stores/ui';
import { PeriodFilterBar } from '../../components/models';
import { useRouter } from 'vue-router';

defineOptions({ name: 'user_dashboard' });

const HIDDEN = '••••••';
const auth = useAuthStore();
const ui = useUiStore();
const periodStore = usePeriodStore();
const router = useRouter();
const { defaultCurrencyCode, currentRates } = useUserRates();

const balanceSummary = ref({ total_all: 0, total_global_balance: 0 });
const balanceSummaryLoading = ref(false);
const theoreticalSavings = ref({
  total_unused: 0,
  total_savings_accounts: 0,
  total_theoretical: 0,
  accumulated_unused: 0,
});

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

type IdleMonth = {
  month: string;
  unused: number;
  accumulated: number;
};

type JarBasic = {
  id: number;
  name: string;
  color?: string | null;
};

type JarBalanceResponse = {
  allocated_amount: number;
  spent_amount: number;
  adjustment: number;
  available_balance: number;
};

type JarSummaryRow = {
  id: number;
  name: string;
  color: string;
  assignedExpected: number;
  spent: number;
  adjustment: number;
  balance: number;
};

const accountsSummary = ref<AccountSummaryItem[]>([]);
const idleMonths = ref<IdleMonth[]>([]);
const jarMonthlySummary = ref<JarSummaryRow[]>([]);

const currentMonth = computed(() => {
  const anchor = periodStore.state.anchor;
  if (/^\d{4}-\d{2}-\d{2}$/.test(anchor)) return anchor.slice(0, 7);
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
});

const currencyCode = computed(() => defaultCurrencyCode.value || 'USD');

function formatAmount(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode.value,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function masked(amount: number) {
  return ui.hideValues ? HIDDEN : formatAmount(amount);
}

const summaryTotals = computed(() => {
  const rows = jarMonthlySummary.value;
  return {
    assignedExpected: rows.reduce((sum, row) => sum + row.assignedExpected, 0),
    spent: rows.reduce((sum, row) => sum + row.spent, 0),
    adjustment: rows.reduce((sum, row) => sum + row.adjustment, 0),
    balance: rows.reduce((sum, row) => sum + row.balance, 0),
  };
});

function openExpenseAnalysis(jarId?: number) {
  if (jarId) {
    void router.push({
      path: '/user/expense-analysis',
      query: { jar: String(jarId) },
    });
    return;
  }
  void router.push({ path: '/user/expense-analysis' });
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
    console.warn('[Dashboard] Error loading account summary:', err);
    balanceSummary.value = { total_all: 0, total_global_balance: 0 };
    accountsSummary.value = [];
  } finally {
    balanceSummaryLoading.value = false;
  }
}

async function loadTheoreticalSavings() {
  try {
    const balanceDate = `${currentMonth.value}-01`;
    const [summaryRes, accumRes] = await Promise.all([
      api.get('/jars/theoretical-savings', { params: { date: balanceDate } }),
      api.get('/jars/theoretical-savings/accumulated', { params: { to: currentMonth.value } }),
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
    console.warn('[Dashboard] Error loading theoretical savings:', err);
    theoreticalSavings.value = {
      total_unused: 0,
      total_savings_accounts: 0,
      total_theoretical: 0,
      accumulated_unused: 0,
    };
    idleMonths.value = [];
  }
}

async function loadJarMonthlySummary() {
  try {
    const jarsRes = await api.get('/jars', { params: { per_page: 100 } });
    const raw = jarsRes.data?.data;
    const jarsData = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
    const jars = (jarsData as Array<Record<string, unknown>>)
      .map((j) => {
        const idNum = Number(j.id);
        const rawName = typeof j.name === 'string' ? j.name.trim() : '';
        return {
          idNum,
          rawName,
          color: typeof j.color === 'string' ? j.color : null,
        };
      })
      .filter((j) => Number.isFinite(j.idNum) && j.idNum > 0)
      .map(
        (j): JarBasic => ({
          id: j.idNum,
          name: j.rawName || 'Cántaro',
          color: j.color,
        })
      );

    const balanceDate = `${currentMonth.value}-01`;
    const balances = await Promise.all(
      jars.map(async (jar) => {
        try {
          const res = await api.get(`/jars/${jar.id}/balance`, { params: { date: balanceDate } });
          return {
            jar,
            bal: (res.data?.data || {}) as Partial<JarBalanceResponse>,
          };
        } catch {
          return { jar, bal: {} as Partial<JarBalanceResponse> };
        }
      })
    );

    jarMonthlySummary.value = balances.map(({ jar, bal }) => ({
      id: jar.id,
      name: jar.name,
      color: jar.color || '#6b7280',
      assignedExpected: Number(bal.allocated_amount || 0),
      spent: Number(bal.spent_amount || 0),
      adjustment: Number(bal.adjustment || 0),
      balance: Number(bal.available_balance || 0),
    }));
  } catch (err) {
    console.warn('[Dashboard] Error loading jars summary:', err);
    jarMonthlySummary.value = [];
  }
}

async function refreshDashboardData() {
  await Promise.all([loadBalanceSummary(), loadTheoreticalSavings(), loadJarMonthlySummary()]);
}

onMounted(() => {
  void refreshDashboardData();
});

watch(
  () => [periodStore.state.type, periodStore.state.anchor],
  () => {
    void refreshDashboardData();
  }
);
</script>
<style scoped>
.hero-card,
.metric-card,
.summary-card {
  border-radius: var(--radius-lg) !important;
}

.hero-card {
  background: linear-gradient(135deg, var(--q-primary), var(--q-secondary)) !important;
  color: white;
}

.hero-card__section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
}

.hero-copy-wrap {
  max-width: 760px;
}

.hero-copy {
  margin-top: 6px;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.rates-row .q-chip {
  height: 24px;
}

.rate-chip-item {
  white-space: nowrap;
}

.summary-row-clickable {
  cursor: pointer;
  transition: background-color 160ms ease;
}

.summary-row-clickable:hover {
  background: rgba(56, 189, 248, 0.06);
}

@media (max-width: 768px) {
  .hero-card__section {
    flex-direction: column;
  }
}
</style>
