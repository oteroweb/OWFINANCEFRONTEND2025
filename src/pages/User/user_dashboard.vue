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
    <div class="dashboard-grid">
      <q-card class="widget">
        <q-card-section class="q-pa-sm">
          <div class="text-subtitle2 text-weight-medium">Ahorro teórico</div>
          <div class="text-h6 q-mt-xs">{{ formatAmount(theoreticalSavings.total_theoretical) }}</div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Sin usar: {{ formatAmount(theoreticalSavings.total_unused) }}
          </div>
          <div class="text-caption text-grey-7">
            Cuentas de ahorro: {{ formatAmount(theoreticalSavings.total_savings_accounts) }}
          </div>
        </q-card-section>
      </q-card>
      <q-card v-for="w in widgets" :key="w" class="widget">
        <q-card-section class="q-pa-sm">{{ w }}</q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { useAuthStore } from 'stores/auth';
import { useUiStore } from 'stores/ui';
import { useUserRates } from 'src/composables/useUserRates';
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
});

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

async function loadTheoreticalSavings() {
  try {
    const balanceDate = `${currentMonth.value}-01`;
    const res = await api.get('/jars/theoretical-savings', { params: { date: balanceDate } });
    const data = res.data?.data || {};
    theoreticalSavings.value = {
      total_unused: Number(data.total_unused || 0),
      total_savings_accounts: Number(data.total_savings_accounts || 0),
      total_theoretical: Number(data.total_theoretical || 0),
    };
  } catch (err) {
    console.warn('[TheoreticalSavings] Error loading data:', err);
    theoreticalSavings.value = {
      total_unused: 0,
      total_savings_accounts: 0,
      total_theoretical: 0,
    };
  }
}

onMounted(() => {
  void loadTheoreticalSavings();
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
