<template>
  <q-page :class="dashboardPageClasses">
    <q-card flat class="glass-panel dashboard-page__hero">
      <q-card-section class="dashboard-page__hero-section">
        <div class="dashboard-page__hero-copy">
          <div class="text-overline dashboard-page__eyebrow">{{ dashboardModeLabel }}</div>
          <div class="text-h4 text-weight-bold">{{ dashboardHeroTitle }}</div>
          <div class="text-body2 dashboard-page__hero-text">
            {{ dashboardHeroDescription }}
          </div>
          <div class="row items-center q-col-gutter-sm q-mt-sm">
            <div class="col-auto">
              <div class="text-caption text-grey-7">Balance global</div>
              <div class="text-h5 text-weight-bold">{{ heroBalanceLabel }}</div>
            </div>
            <div class="col-auto">
              <div class="dashboard-page__focus-chip">
                <div class="text-caption text-grey-7">{{ dashboardFocusChip.label }}</div>
                <div class="text-subtitle2 text-weight-medium">{{ dashboardFocusChip.value }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-page__hero-actions">
          <q-btn
            color="primary"
            icon="add"
            label="Agregar movimiento"
            class="dashboard-page__cta"
            @click="ui.openNewTransactionDialog()"
          />
          <q-btn
            flat
            color="primary"
            :label="dashboardSecondaryActionLabel"
            @click="openTransactions()"
          />
        </div>
      </q-card-section>

      <q-card-section v-if="showModeStats" class="q-pt-none">
        <div class="dashboard-page__stats-grid">
          <div
            v-for="stat in dashboardStats"
            :key="stat.label"
            class="dashboard-page__stat-card shell-surface shell-surface--subtle"
          >
            <div class="text-caption text-grey-7">{{ stat.label }}</div>
            <div class="text-h6 text-weight-bold q-mt-xs">{{ stat.value }}</div>
            <div class="text-caption text-grey-7 q-mt-xs">{{ stat.caption }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="dashboard-page__toolbar">
      <div class="dashboard-page__period-wrap">
        <PeriodFilterBar />
      </div>

      <div v-if="isLiteLayout" class="dashboard-page__rates row justify-end q-gutter-xs">
        <q-chip dense color="grey-2" text-color="dark" class="text-weight-medium">
          {{ defaultCurrencyCode || 'USD' }}
        </q-chip>
        <q-chip
          v-for="rate in ratePreviewRows"
          :key="rate.code"
          dense
          color="blue-1"
          text-color="primary"
        >
          {{ rate.code }}: {{ rate.rateLabel }}
        </q-chip>
      </div>

      <div v-else class="dashboard-page__market-card shell-surface shell-surface--subtle">
        <div class="text-caption text-grey-7">Pulso de mercado</div>
        <div class="dashboard-page__market-row">
          <q-chip dense color="grey-2" text-color="dark" class="text-weight-medium">
            {{ defaultCurrencyCode || 'USD' }}
          </q-chip>
          <q-chip
            v-for="rate in ratePreviewRows"
            :key="rate.code"
            dense
            color="blue-1"
            text-color="primary"
          >
            {{ rate.code }}: {{ rate.rateLabel }}
          </q-chip>
        </div>
        <div class="text-caption text-grey-7 q-mt-sm">
          {{ dashboardMarketCaption }}
        </div>
      </div>
    </div>

    <div :class="dashboardMainGridClasses">
      <q-card
        v-if="showOverviewCard"
        flat
        class="glass-panel dashboard-page__section-card dashboard-page__overview-card"
      >
        <q-card-section class="q-pb-sm">
          <div class="text-subtitle1 text-weight-bold">Contexto del modo</div>
          <div class="text-caption text-grey-7">{{ dashboardOverviewDescription }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none column q-gutter-sm">
          <div
            v-for="item in dashboardOverviewItems"
            :key="item.label"
            class="dashboard-page__context-item shell-surface shell-surface--subtle"
          >
            <div class="text-caption text-grey-7">{{ item.label }}</div>
            <div class="text-body1 text-weight-medium">{{ item.value }}</div>
            <div class="text-caption text-grey-7 q-mt-xs">{{ item.caption }}</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card
        flat
        class="glass-panel dashboard-page__section-card dashboard-page__section-card--jars"
      >
        <q-card-section class="dashboard-page__section-header q-pb-sm">
          <div>
            <div class="text-subtitle1 text-weight-bold">Cantaros</div>
            <div class="text-caption text-grey-7">{{ dashboardJarsDescription }}</div>
          </div>
          <q-btn flat color="primary" label="Abrir analisis" @click="openExpenseAnalysis()" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-if="jarPreviewRows.length" class="dashboard-page__jar-grid">
            <button
              v-for="jar in jarPreviewRows"
              :key="jar.id"
              type="button"
              class="dashboard-page__jar-card shell-surface shell-surface--subtle"
              @click="openExpenseAnalysis(jar.id)"
            >
              <div class="row items-start justify-between q-gutter-sm">
                <div>
                  <div class="row items-center q-gutter-xs">
                    <span class="dashboard-page__jar-dot" :style="{ background: jar.color }"></span>
                    <span class="text-subtitle2 text-weight-medium">{{ jar.name }}</span>
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs">
                    Asignado {{ masked(jar.assignedExpected) }}
                  </div>
                </div>
                <q-badge :color="jar.balance >= 0 ? 'positive' : 'negative'" rounded>
                  {{ jar.balance >= 0 ? 'en rango' : 'ajustar' }}
                </q-badge>
              </div>
              <div class="row q-col-gutter-sm q-mt-md text-caption">
                <div class="col-6">
                  <div class="text-grey-7">Gastado</div>
                  <div class="text-weight-medium">{{ masked(jar.spent) }}</div>
                </div>
                <div class="col-6 text-right">
                  <div class="text-grey-7">Disponible</div>
                  <div class="text-weight-bold" :class="jar.balance < 0 ? 'text-negative' : 'text-positive'">
                    {{ masked(jar.balance) }}
                  </div>
                </div>
              </div>
            </button>
          </div>
          <div v-else class="dashboard-page__empty text-caption text-grey-7">
            No hay cantaros con datos en este periodo.
          </div>
        </q-card-section>
      </q-card>

      <q-card
        flat
        class="glass-panel dashboard-page__section-card dashboard-page__section-card--activity"
      >
        <q-card-section class="dashboard-page__section-header q-pb-sm">
          <div>
            <div class="text-subtitle1 text-weight-bold">Actividad reciente</div>
            <div class="text-caption text-grey-7">{{ dashboardActivityDescription }}</div>
          </div>
          <q-btn flat color="primary" label="Ver todo" @click="openTransactions()" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-if="visibleRecentActivity.length" class="column q-gutter-sm">
            <button
              v-for="tx in visibleRecentActivity"
              :key="tx.id"
              type="button"
              class="dashboard-page__activity-row"
              @click="openTransactions()"
            >
              <div class="row items-center q-gutter-sm no-wrap">
                <div class="dashboard-page__activity-icon" :class="activityTone(tx)">
                  <q-icon :name="activityIcon(tx)" size="18px" />
                </div>
                <div class="dashboard-page__activity-copy">
                  <div class="text-body2 text-weight-medium">{{ tx.name || 'Movimiento' }}</div>
                  <div class="text-caption text-grey-7">
                    {{ activityTypeLabel(tx) }}
                    <span v-if="tx.account?.name"> · {{ tx.account.name }}</span>
                    <span v-if="tx.date"> · {{ formatShortDate(tx.date) }}</span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-body2 text-weight-bold" :class="activityAmountClass(tx)">
                  {{ formatTransactionAmount(tx) }}
                </div>
              </div>
            </button>
          </div>
          <div v-else class="dashboard-page__empty text-caption text-grey-7">
            Aun no hay movimientos recientes para mostrar.
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { api } from '../../boot/axios';
import { computed, onMounted, ref, watch } from 'vue';
import { useUserRates } from '../../composables/useUserRates';
import { useAuthStore } from '../../stores/auth';
import { usePeriodStore } from '../../stores/period';
import { useUiStore } from '../../stores/ui';
import { PeriodFilterBar } from '../../components/models';
import { useRouter } from 'vue-router';
import type { Transaction } from '../../stores/transactions';
import { layoutModeOptions, normalizeLayoutMode, type UserLayoutMode } from '../../utils/layoutMode';

defineOptions({ name: 'user_dashboard' });

const HIDDEN = '••••••';
const auth = useAuthStore();
const ui = useUiStore();
const periodStore = usePeriodStore();
const router = useRouter();
const { defaultCurrencyCode, currentRates } = useUserRates();

const balanceSummary = ref({ total_all: 0, total_global_balance: 0 });
const balanceSummaryLoading = ref(false);

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

const jarMonthlySummary = ref<JarSummaryRow[]>([]);
const recentActivity = ref<Transaction[]>([]);

const activeLayoutMode = computed<UserLayoutMode>(() => normalizeLayoutMode(auth.user?.layout_mode));
const isLiteLayout = computed(() => activeLayoutMode.value === 'lite');
const showModeStats = computed(() => activeLayoutMode.value !== 'lite');
const showOverviewCard = computed(() => activeLayoutMode.value !== 'lite');
const dashboardPageClasses = computed(() => [
  'dashboard-page',
  'q-pa-md',
  'column',
  `dashboard-page--${activeLayoutMode.value}`,
]);
const dashboardMainGridClasses = computed(() => [
  'dashboard-page__main-grid',
  `dashboard-page__main-grid--${activeLayoutMode.value}`,
]);

const currentMonth = computed(() => {
  const anchor = periodStore.state.anchor;
  if (/^\d{4}-\d{2}-\d{2}$/.test(anchor)) return anchor.slice(0, 7);
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
});

const currencyCode = computed(() => defaultCurrencyCode.value || 'USD');

const heroBalanceLabel = computed(() =>
  balanceSummaryLoading.value ? '...' : masked(balanceSummary.value.total_global_balance)
);

const totalAccountsLabel = computed(() =>
  balanceSummaryLoading.value ? '...' : masked(balanceSummary.value.total_all)
);

const jarPreviewRows = computed(() => {
  if (activeLayoutMode.value === 'legacy') return jarMonthlySummary.value.slice(0, 6);
  if (activeLayoutMode.value === 'pro') return jarMonthlySummary.value.slice(0, 4);
  return jarMonthlySummary.value.slice(0, 3);
});

const visibleRecentActivity = computed(() => {
  if (activeLayoutMode.value === 'lite') return recentActivity.value.slice(0, 4);
  return recentActivity.value.slice(0, 5);
});

const ratePreviewRows = computed(() =>
  currentRates.value.slice(0, activeLayoutMode.value === 'legacy' ? 4 : 3)
);

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

function formatTransactionAmount(tx: Transaction) {
  const value = Number(tx.amount || 0);
  if (ui.hideValues) return HIDDEN;
  const formatted = formatAmount(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function formatShortDate(value?: string) {
  if (!value) return 'Sin fecha';
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function activityTypeLabel(tx: Transaction) {
  const name = (tx.transaction_type?.name || '').toLowerCase();
  if (name.includes('transfer')) return 'Transferencia';
  if (name.includes('ingreso')) return 'Ingreso';
  if (name.includes('egreso') || Number(tx.amount || 0) < 0) return 'Egreso';
  return 'Movimiento';
}

function activityIcon(tx: Transaction) {
  const type = activityTypeLabel(tx);
  if (type === 'Ingreso') return 'south_west';
  if (type === 'Transferencia') return 'swap_horiz';
  return 'north_east';
}

function activityTone(tx: Transaction) {
  const type = activityTypeLabel(tx);
  if (type === 'Ingreso') return 'dashboard-page__activity-icon--positive';
  if (type === 'Transferencia') return 'dashboard-page__activity-icon--neutral';
  return 'dashboard-page__activity-icon--negative';
}

function activityAmountClass(tx: Transaction) {
  const value = Number(tx.amount || 0);
  if (value > 0) return 'text-positive';
  if (value < 0) return 'text-negative';
  return 'text-grey-7';
}

function openExpenseAnalysis(jarId?: number) {
  if (jarId) {
    void router.push({
      path: '/app/expense-analysis',
      query: { jar: String(jarId) },
    });
    return;
  }
  void router.push({ path: '/app/expense-analysis' });
}

function openTransactions() {
  void router.push({ path: '/user/transactions' });
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
  } catch (err) {
    console.warn('[Dashboard] Error loading account summary:', err);
    balanceSummary.value = { total_all: 0, total_global_balance: 0 };
  } finally {
    balanceSummaryLoading.value = false;
  }
}

async function loadJarMonthlySummary() {
  try {
    const jarsRes = await api.get('/jars', { params: { per_page: 100 } });
    const raw = jarsRes.data?.data;
    const jarsData = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
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
          name: j.rawName || 'Cantaro',
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

    jarMonthlySummary.value = balances
      .map(({ jar, bal }) => ({
        id: jar.id,
        name: jar.name,
        color: jar.color || '#6b7280',
        assignedExpected: Number(bal.allocated_amount || 0),
        spent: Number(bal.spent_amount || 0),
        adjustment: Number(bal.adjustment || 0),
        balance: Number(bal.available_balance || 0),
      }))
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  } catch (err) {
    console.warn('[Dashboard] Error loading jars summary:', err);
    jarMonthlySummary.value = [];
  }
}

async function loadRecentActivity() {
  try {
    const res = await api.get('/transactions', { params: { per_page: 5, page: 1 } });
    const payload = res.data?.data;
    const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
    recentActivity.value = rows as Transaction[];
  } catch (err) {
    console.warn('[Dashboard] Error loading recent activity:', err);
    recentActivity.value = [];
  }
}

async function refreshDashboardData() {
  await Promise.all([loadBalanceSummary(), loadJarMonthlySummary(), loadRecentActivity()]);
}

function formatSummaryMoney(amount: number) {
  return ui.hideValues ? HIDDEN : formatMoney(amount);
}

const dashboardModeLabel = computed(() => {
  const option = layoutModeOptions.find((item) => item.value === activeLayoutMode.value);
  if (!option) return 'Home';
  return `${option.label} home`;
});

const dashboardHeroTitle = computed(() => {
  const userName = auth.user?.name || 'Usuario';
  if (activeLayoutMode.value === 'legacy') return `Panorama completo, ${userName}`;
  if (activeLayoutMode.value === 'lite') return `Hola, ${userName}`;
  return `Centro de control, ${userName}`;
});

const dashboardHeroDescription = computed(() => {
  if (activeLayoutMode.value === 'legacy') {
    return 'Mantiene mas contexto operativo en una sola pantalla: periodo, balance, cantaros y actividad reciente sin perder lectura.';
  }
  if (activeLayoutMode.value === 'lite') {
    return 'Revisa tu balance, ubica tus cantaros clave y agrega un movimiento sin entrar en una vista pesada.';
  }
  return 'Equilibra decision rapida y visibilidad: un hero sintetico arriba y paneles accionables para seguir el periodo activo.';
});

const dashboardSecondaryActionLabel = computed(() =>
  activeLayoutMode.value === 'legacy' ? 'Abrir movimientos' : 'Ver actividad'
);

const dashboardFocusChip = computed(() => {
  if (activeLayoutMode.value === 'legacy') {
    return {
      label: 'Periodo activo',
      value: periodStore.label,
    };
  }
  if (activeLayoutMode.value === 'lite') {
    return {
      label: 'Todas las cuentas',
      value: totalAccountsLabel.value,
    };
  }
  return {
    label: 'Modo de trabajo',
    value: 'Panel balanceado',
  };
});

const dashboardStats = computed(() => [
  {
    label: 'Balance global',
    value: heroBalanceLabel.value,
    caption: 'Saldo consolidado del espacio visible.',
  },
  {
    label: 'Total en cuentas',
    value: totalAccountsLabel.value,
    caption: 'Referencia consolidada de todas las cuentas.',
  },
  {
    label: 'Cantaros en foco',
    value: String(jarMonthlySummary.value.length),
    caption:
      activeLayoutMode.value === 'legacy'
        ? 'La vista amplia muestra mas cantaros prioritarios.'
        : 'Vista resumida de tus prioridades del periodo.',
  },
  {
    label: 'Movimientos recientes',
    value: String(recentActivity.value.length),
    caption: 'Continuidad rapida desde la actividad mas cercana.',
  },
]);

const dashboardMarketCaption = computed(() => {
  if (!ratePreviewRows.value.length) return 'Sin tasas visibles en este momento.';
  if (activeLayoutMode.value === 'legacy') {
    return 'El modo Legacy deja este pulso a mano para revisar mercado sin abandonar el panorama.';
  }
  return 'El modo Pro conserva el pulso de tasas en una tarjeta compacta junto al filtro del periodo.';
});

const dashboardOverviewDescription = computed(() => {
  if (activeLayoutMode.value === 'legacy') {
    return 'El bloque lateral agrega contexto operativo para decidir sin saltar a otras vistas.';
  }
  return 'El bloque inferior resume lo esencial mientras el foco principal queda en cantaros y actividad.';
});

const dashboardOverviewItems = computed(() => [
  {
    label: 'Periodo',
    value: periodStore.label,
    caption: 'Recorte activo para balances y actividad visible.',
  },
  {
    label: 'Moneda base',
    value: defaultCurrencyCode.value || 'USD',
    caption: 'Referencia principal para leer balances y tasas.',
  },
  {
    label: 'Balance del flujo',
    value: formatSummaryMoney(summary.value.balance),
    caption: `${summary.value.count} movimiento(s) visibles en la vista actual.`,
  },
]);

const dashboardJarsDescription = computed(() => {
  if (activeLayoutMode.value === 'legacy') {
    return 'Vista comparativa mas amplia para detectar desviaciones y decidir donde profundizar.';
  }
  if (activeLayoutMode.value === 'lite') {
    return 'Vista rapida del periodo para decidir donde mirar.';
  }
  return 'Resumen operativo de los cantaros con mejor señal para seguir el periodo.';
});

const dashboardActivityDescription = computed(() => {
  if (activeLayoutMode.value === 'legacy') {
    return 'Columna lateral para continuar desde el ultimo movimiento sin perder el resto del contexto.';
  }
  if (activeLayoutMode.value === 'lite') {
    return 'Tus ultimos movimientos para continuar rapido.';
  }
  return 'Actividad reciente alineada al panel principal para revisar continuidad y siguientes pasos.';
});

onMounted(() => {
  void refreshDashboardData();
});

watch(
  () => [periodStore.state.type, periodStore.state.anchor],
  () => {
    void refreshDashboardData();
  }
);

const summary = computed(() => {
  let gastos = 0;
  let ingresos = 0;
  let impuestos = 0;
  const count = recentActivity.value.length;

  for (const tx of recentActivity.value) {
    const amount = Number(tx.amount || 0);
    const tax = Number((tx as Transaction & { amount_tax?: number | string }).amount_tax || 0);
    if (amount < 0) gastos += Math.abs(amount);
    else if (amount > 0) ingresos += amount;
    if (tax) impuestos += Math.abs(tax);
  }

  return {
    count,
    gastos,
    ingresos,
    impuestos,
    balance: ingresos - gastos,
  };
});

function formatMoney(n: number): string {
  const val = Number(n || 0);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode.value,
    maximumFractionDigits: 2,
  }).format(val);
}
</script>

<style scoped>
.dashboard-page {
  gap: 16px;
}

.dashboard-page__hero,
.dashboard-page__section-card {
  border-radius: var(--radius-lg) !important;
}

.dashboard-page__hero {
  overflow: hidden;
}

.dashboard-page--lite .dashboard-page__hero {
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.24), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(239, 246, 255, 0.92)) !important;
}

.dashboard-page--pro .dashboard-page__hero {
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.24), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 249, 0.96)) !important;
}

.dashboard-page--legacy .dashboard-page__hero {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.12), transparent 36%) !important;
}

.body--dark .dashboard-page--lite .dashboard-page__hero,
.body--dark .dashboard-page--pro .dashboard-page__hero {
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.2), transparent 32%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(8, 47, 73, 0.92)) !important;
}

.body--dark .dashboard-page--legacy .dashboard-page__hero {
  background:
    radial-gradient(circle at top right, rgba(148, 163, 184, 0.16), transparent 34%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94)) !important;
}

.dashboard-page__hero-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px;
}

.dashboard-page__hero-copy {
  max-width: 780px;
}

.dashboard-page__eyebrow {
  color: var(--ow-color-primary-strong);
  letter-spacing: 0.06em;
}

.dashboard-page__hero-text {
  max-width: 640px;
  margin-top: 6px;
  line-height: 1.6;
}

.dashboard-page__hero-actions {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.dashboard-page__cta {
  min-height: 48px;
  min-width: 220px;
}

.dashboard-page__focus-chip,
.dashboard-page__market-card,
.dashboard-page__stat-card,
.dashboard-page__context-item {
  border-radius: var(--radius-md);
}

.dashboard-page__focus-chip {
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.body--dark .dashboard-page__focus-chip {
  background: rgba(15, 23, 42, 0.56);
}

.dashboard-page__stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.dashboard-page__stat-card {
  padding: 14px 16px;
}

.dashboard-page__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.dashboard-page__period-wrap {
  flex: 1 1 auto;
  min-width: 0;
}

.dashboard-page__market-card {
  min-width: 320px;
  padding: 14px 16px;
}

.dashboard-page__market-row,
.dashboard-page__rates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dashboard-page__market-row {
  margin-top: 8px;
}

.dashboard-page__rates {
  align-items: center;
  justify-content: flex-end;
}

.dashboard-page__main-grid {
  display: grid;
  gap: 16px;
  align-items: start;
}

.dashboard-page__main-grid--lite {
  grid-template-columns: 1fr;
}

.dashboard-page__main-grid--pro {
  grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.9fr);
  grid-template-areas:
    'jars activity'
    'overview activity';
}

.dashboard-page__main-grid--legacy {
  grid-template-columns: minmax(240px, 0.85fr) minmax(0, 1.35fr) minmax(280px, 0.95fr);
  grid-template-areas: 'overview jars activity';
}

.dashboard-page__overview-card {
  grid-area: overview;
}

.dashboard-page__section-card--jars {
  grid-area: jars;
}

.dashboard-page__section-card--activity {
  grid-area: activity;
}

.dashboard-page__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dashboard-page__jar-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.dashboard-page__jar-card,
.dashboard-page__activity-row {
  width: 100%;
  border: 0;
  text-align: left;
  cursor: pointer;
}

.dashboard-page__jar-card {
  padding: 16px;
  border-radius: var(--radius-md);
}

.dashboard-page__jar-card:hover,
.dashboard-page__activity-row:hover {
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

.dashboard-page__jar-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.dashboard-page__activity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  background: transparent;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.dashboard-page__activity-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.dashboard-page__activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dashboard-page__activity-icon--positive {
  color: #166534;
  background: rgba(34, 197, 94, 0.14);
}

.dashboard-page__activity-icon--negative {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.14);
}

.dashboard-page__activity-icon--neutral {
  color: var(--ow-color-primary-strong);
  background: rgba(14, 165, 233, 0.14);
}

.dashboard-page__activity-copy {
  min-width: 0;
}

.dashboard-page__context-item {
  padding: 14px 16px;
}

.dashboard-page__empty {
  padding: 8px 0 4px;
}

.dashboard-page--legacy .dashboard-page__jar-grid {
  grid-template-columns: 1fr;
}

@media (max-width: 1280px) {
  .dashboard-page__main-grid--legacy,
  .dashboard-page__main-grid--pro {
    grid-template-columns: 1fr;
    grid-template-areas:
      'overview'
      'jars'
      'activity';
  }

  .dashboard-page__market-card {
    min-width: 280px;
  }
}

@media (max-width: 900px) {
  .dashboard-page__hero-section,
  .dashboard-page__toolbar,
  .dashboard-page__section-header {
    flex-direction: column;
  }

  .dashboard-page__hero-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .dashboard-page__market-card,
  .dashboard-page__rates {
    width: 100%;
    justify-content: flex-start;
  }

  .dashboard-page__jar-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .dashboard-page__activity-row {
    align-items: flex-start;
  }

  .dashboard-page__cta {
    width: 100%;
  }

  .dashboard-page__stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
