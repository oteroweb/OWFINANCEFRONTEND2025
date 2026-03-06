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
    <div class="dashboard-grid">
      <q-card class="widget">
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle2 text-weight-medium">Ahorro teórico</div>
          <div class="text-h6 q-mt-xs">{{ masked(theoreticalSavings.total_theoretical) }}</div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Sin usar este mes: {{ masked(theoreticalSavings.total_unused) }}
          </div>
          <div class="text-caption text-grey-7">
            Cuentas de ahorro: {{ masked(theoreticalSavings.total_savings_accounts) }}
          </div>
          <div class="text-caption text-warning q-mt-xs">
            Ocioso acumulado: {{ masked(theoreticalSavings.accumulated_unused) }}
          </div>
        </q-card-section>
      </q-card>
      <q-card v-for="w in widgets" :key="w" class="widget">
        <q-card-section class="q-pa-sm">{{ w }}</q-card-section>
      </q-card>
    </div>

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
const HIDDEN = '••••••';
import { api } from 'boot/axios';
import { computed, onMounted, ref, watch } from 'vue';
import { usePeriodStore } from 'stores/period';

defineOptions({ name: 'user_dashboard' });
const auth = useAuthStore();
const ui = useUiStore();
const widgets = ['Balance', 'Distribución', 'Presupuestos', 'Evolución', 'Vencimientos'];
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
