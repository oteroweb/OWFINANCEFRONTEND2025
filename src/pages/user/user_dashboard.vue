<template>
  <q-page class="dash-page">
    <div class="dash-container">

      <!-- Hero Balance Card (full width) -->
      <HomeHeroCard
        :balance="balanceSummary.total_global_balance"
        :income="monthlyIncome"
        :expense="monthlyExpense"
        :currency="currencySymbol"
        :is-loading="balanceLoading"
        :is-hidden="isHidden"
        :active-period="activePeriod"
        class="dash-hero"
        @toggle-hidden="ui.toggleHideValues()"
        @period-change="onPeriodChange"
      />

      <div class="dash-period-row">
        <HomePeriodSelectorCompact v-model="activeInterval" @shift="onShiftInterval" />
        <q-btn
          no-caps
          unelevated
          color="primary"
          label="Personalizado"
          icon="tune"
          class="dash-period-row__custom-btn"
          @click="showCustomPeriodModal = true"
        />
      </div>

      <q-dialog v-model="showCustomPeriodModal">
        <q-card class="dash-period-modal">
          <q-card-section>
            <div class="dash-period-modal__title">Personalizado</div>
            <p class="dash-period-modal__text">
              Configuración personalizada disponible pronto.
            </p>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" @click="showCustomPeriodModal = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div class="dash-components-entry">
        <q-btn
          no-caps
          unelevated
          color="primary"
          icon="widgets"
          label="Ver Componentes de Intervalos"
          class="dash-components-entry__btn"
          @click="router.push('/user/home-components')"
        />
      </div>

      <!-- Two-column grid: Jars (5) | Transactions (7) -->
      <div class="dash-grid">
        <HomeJarsSection
          :jars="activeJars"
          :is-loading="jarsLoading"
          :currency="currencySymbol"
          :is-hidden="isHidden"
          :total-available="jarStatus.totalAvailable"
          :availability-percent="jarStatus.availabilityPercent"
        />
        <HomeTransactionsSection
          :transactions="formattedTransactions"
          :is-loading="transactionsLoading"
          :currency="currencySymbol"
          :current-page="txCurrentPage"
          :total-pages="txTotalPages"
          :is-hidden="isHidden"
          @page-change="onTxPageChange"
        />
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useUiStore } from 'stores/ui';
import HomeHeroCard from 'src/components/home/HomeHeroCard.vue';
import HomeJarsSection from 'src/components/home/HomeJarsSection.vue';
import HomeTransactionsSection from 'src/components/home/HomeTransactionsSection.vue';
import HomePeriodSelectorCompact from 'src/components/home/periods/HomePeriodSelectorCompact.vue';
import type { HomeIntervalKey } from 'src/components/home/periods/HomePeriodSelectorCompact.vue';

defineOptions({ name: 'LiteHomePage' });

const router = useRouter();
const ui = useUiStore();

type Period = 'monthly' | 'weekly' | 'yearly';

// ─── Balance ──────────────────────────────────────────────────────────────────
const balanceSummary = ref({ total_all: 0, total_global_balance: 0 });
const balanceLoading = ref(false);
const currencySymbol = ref('$');

// ─── Monthly income / expense ─────────────────────────────────────────────────
const monthlyIncome = ref(0);
const monthlyExpense = ref(0);

// ─── Period / visibility UI state ────────────────────────────────────────────
const isHidden = computed(() => ui.hideValues);
const activePeriod = ref<Period>('monthly');
const activeInterval = ref<HomeIntervalKey>('month');
const periodAnchor = ref(new Date());
const showCustomPeriodModal = ref(false);

function intervalToPeriod(interval: HomeIntervalKey): Period {
  if (interval === 'year') return 'yearly';
  if (interval === 'week') return 'weekly';
  return 'monthly';
}

function shiftAnchorByInterval(direction: -1 | 1, interval: HomeIntervalKey) {
  const next = new Date(periodAnchor.value);

  if (interval === 'year') {
    next.setFullYear(next.getFullYear() + direction);
  } else if (interval === 'week') {
    next.setDate(next.getDate() + (7 * direction));
  } else {
    next.setMonth(next.getMonth() + direction);
  }

  periodAnchor.value = next;
}

function onShiftInterval(direction: -1 | 1) {
  shiftAnchorByInterval(direction, activeInterval.value);
  txCurrentPage.value = 1;
  const mapped = intervalToPeriod(activeInterval.value);
  activePeriod.value = mapped;
  void Promise.all([
    loadMonthSummary(mapped),
    loadRecentTransactions(1, mapped),
  ]);
}

watch(activeInterval, (interval) => {
  const mapped = intervalToPeriod(interval);
  activePeriod.value = mapped;
  txCurrentPage.value = 1;
  void Promise.all([
    loadMonthSummary(mapped),
    loadRecentTransactions(1, mapped),
  ]);
});

function onPeriodChange(p: string) {
  if (p !== 'monthly' && p !== 'weekly' && p !== 'yearly') return;
  activePeriod.value = p;
  txCurrentPage.value = 1;
  void Promise.all([
    loadMonthSummary(activePeriod.value),
    loadRecentTransactions(1, activePeriod.value),
  ]);
}

// ─── Jars ─────────────────────────────────────────────────────────────────────
type JarItem = { id: number; name: string; balance: number; allocated: number; progress: number; color?: string };
const activeJars = ref<JarItem[]>([]);
const jarsLoading = ref(false);

const jarStatus = computed(() => {
  const totalAllocated = activeJars.value.reduce((acc, jar) => acc + Math.max(0, Number(jar.allocated || 0)), 0);
  const totalAvailable = activeJars.value.reduce((acc, jar) => acc + Math.max(0, Number(jar.balance || 0)), 0);
  const availabilityPercent = totalAllocated > 0 ? (totalAvailable / totalAllocated) * 100 : 0;
  const usedPercent = totalAllocated > 0 ? 100 - availabilityPercent : 0;

  return {
    totalAllocated,
    totalAvailable,
    availabilityPercent: Math.max(0, Math.min(100, availabilityPercent)),
    usedPercent: Math.max(0, Math.min(100, usedPercent)),
    jarCount: activeJars.value.length,
  };
});

// ─── Transactions ─────────────────────────────────────────────────────────────
type TxRaw = { id: number; name: string; amount: number; date: string; category: string; type: 'income' | 'expense'; accountName?: string };
const recentTransactions = ref<TxRaw[]>([]);
const transactionsLoading = ref(false);
const txCurrentPage = ref(1);
const txTotalPages = ref(1);
const TX_PER_PAGE = 7;

const formattedTransactions = computed(() =>
  recentTransactions.value.map((tx) => ({
    id: tx.id,
    name: tx.name,
    amount: tx.amount.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    date: formatDate(tx.date),
    category: tx.category,
    isIncome: tx.type === 'income',
    ...(tx.accountName !== undefined ? { account: tx.accountName } : {}),
  }))
);

function parseTxType(tx: Record<string, unknown>): { name: string; slug: string; id: number } {
  const rawType = tx.transaction_type as Record<string, unknown> | undefined;
  const name = typeof rawType?.name === 'string' ? rawType.name.toLowerCase() : '';
  const slug = typeof rawType?.slug === 'string' ? rawType.slug.toLowerCase() : '';
  const id = Number(tx.transaction_type_id ?? rawType?.id ?? 0);
  return { name, slug, id };
}

function classifyTx(tx: Record<string, unknown>, amount: number): 'income' | 'expense' | 'transfer' {
  const { name, slug, id } = parseTxType(tx);
  const typeText = `${name} ${slug}`;

  if (id === 4 || typeText.includes('transfer') || typeText.includes('traspaso') || typeText.includes('transferencia')) {
    return 'transfer';
  }
  if (typeText.includes('income') || typeText.includes('ingreso')) return 'income';
  if (typeText.includes('expense') || typeText.includes('gasto')) return 'expense';

  return amount >= 0 ? 'income' : 'expense';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function buildPeriodParams(period: Period): Record<string, string> {
  const now = periodAnchor.value;

  if (period === 'monthly') {
    return {
      period: 'month',
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1),
    };
  }

  if (period === 'weekly') {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return {
      period: 'week',
      year: String(d.getUTCFullYear()),
      week: String(week),
    };
  }

  return {
    period: 'year',
    year: String(now.getFullYear()),
  };
}

// ─── Data loading ─────────────────────────────────────────────────────────────
async function loadBalanceSummary() {
  balanceLoading.value = true;
  try {
    const res = await api.get('/accounts/summary/global-balance');
    const data = res.data?.data || {};
    balanceSummary.value = {
      total_all: Number(data.total_all ?? 0),
      total_global_balance: Number(data.total_global_balance ?? 0),
    };
  } catch (err) {
    console.warn('[LiteHome] Balance error:', err);
  } finally {
    balanceLoading.value = false;
  }
}

async function loadMonthSummary(period: Period = activePeriod.value) {
  const params: Record<string, string> = {
    ...buildPeriodParams(period),
    per_page: '500',
  };

  try {
    const res = await api.get('/transactions', { params });
    const data = res.data?.data;
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? (data.data as Record<string, unknown>[]) : [];

    let income = 0;
    let expense = 0;

    for (const tx of list) {
      const amount = Number(tx.amount ?? 0);
      const absAmount = Math.abs(amount);
      const txClass = classifyTx(tx, amount);

      if (txClass === 'transfer') continue;
      if (txClass === 'income') income += absAmount;
      if (txClass === 'expense') expense += absAmount;
    }

    monthlyIncome.value = income;
    monthlyExpense.value = expense;
  } catch (err) {
    console.warn('[LiteHome] Month summary error:', err);
  }
}

async function loadJars() {
  jarsLoading.value = true;
  try {
    const jarsRes = await api.get('/jars', { params: { per_page: 100 } });
    const raw = jarsRes.data?.data;
    const jarsData: Record<string, unknown>[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? (raw.data as Record<string, unknown>[]) : [];
    const now = new Date();
    const balDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const results = await Promise.all(
      jarsData.map(async (jar): Promise<JarItem | null> => {
        try {
          const jarId = Number(jar.id);
          const balRes = await api.get(`/jars/${jarId}/balance`, { params: { date: balDate } });
          const bal = balRes.data?.data || {};
          const assigned = Number(bal.allocated_amount || 0);
          const balance = Number(bal.available_balance || 0);
          const progress = assigned > 0 ? Math.min(100, Math.round((assigned - balance) / assigned * 100)) : 0;
          return {
            id: jarId,
            name: typeof jar.name === 'string' ? jar.name : 'Cántaro',
            balance,
            allocated: assigned,
            progress,
            color: (jar.color as string) || '#0ea5e9',
          };
        } catch { return null; }
      })
    );
    activeJars.value = results.filter((j): j is JarItem => j !== null && j !== undefined);
    ui.setJarStatus(jarStatus.value);
  } catch (err) {
    console.warn('[LiteHome] Jars error:', err);
    ui.setJarStatus({
      totalAllocated: 0,
      totalAvailable: 0,
      availabilityPercent: 0,
      usedPercent: 0,
      jarCount: 0,
    });
  } finally {
    jarsLoading.value = false;
  }
}

async function loadRecentTransactions(page = 1, period: Period = activePeriod.value) {
  transactionsLoading.value = true;
  try {
    const params: Record<string, string | number> = {
      ...buildPeriodParams(period),
      per_page: TX_PER_PAGE,
      page,
      sort_by: 'date',
      descending: 'true',
    };
    const res = await api.get('/transactions', { params });
    const data = res.data?.data;
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? (data.data as Record<string, unknown>[]) : [];
    const sortedList = [...list].sort((a, b) => {
      const da = typeof a.date === 'string' ? a.date : '';
      const db = typeof b.date === 'string' ? b.date : '';
      return db.localeCompare(da);
    });

    const meta = (res.data?.meta || data?.meta || {}) as Record<string, unknown>;
    txCurrentPage.value = Number(meta.current_page ?? page);
    txTotalPages.value = Number(meta.last_page ?? 1);
    recentTransactions.value = sortedList.map((tx) => ({
      id: Number(tx.id),
      name: typeof tx.name === 'string' ? tx.name : (typeof tx.description === 'string' ? tx.description : 'Transacción'),
      amount: Math.abs(Number(tx.amount ?? 0)),
      date: typeof tx.date === 'string' ? tx.date : new Date().toISOString(),
      category: ((tx.transaction_type as Record<string, unknown> | undefined)?.name as string | undefined)
        ?? ((tx.category as Record<string, unknown> | undefined)?.name as string | undefined)
        ?? 'General',
      type: Number(tx.amount ?? 0) >= 0 ? ('income' as const) : ('expense' as const),
      ...(((tx.account as Record<string, unknown> | undefined)?.name as string | undefined) !== undefined ? { accountName: ((tx.account as Record<string, unknown> | undefined)?.name as string) } : {}),
    }));
  } catch (err) {
    console.warn('[LiteHome] Transactions error:', err);
  } finally {
    transactionsLoading.value = false;
  }
}

function onTxPageChange(page: number) {
  if (page < 1 || page > txTotalPages.value || page === txCurrentPage.value) return;
  void loadRecentTransactions(page, activePeriod.value);
}

onMounted(() => {
  void Promise.all([
    loadBalanceSummary(),
    loadMonthSummary(activePeriod.value),
    loadJars(),
    loadRecentTransactions(1, activePeriod.value),
  ]);
});
</script>

<style lang="scss" scoped>
.dash-page {
  background: #f8fafc;
  min-height: 100vh;

  .body--dark & { background: #0f172a; }
}

.dash-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 32px 120px; /* extra bottom for floating nav */

  @media (max-width: 1023px) { padding: 32px 24px 112px; }
  @media (max-width: 599px)  { padding: 20px 14px 104px; }
}

.dash-hero {
  width: 100%;
  margin-bottom: 40px;

  @media (max-width: 599px) { margin-bottom: 28px; }
}

.dash-components-entry {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 18px;

  &__btn {
    border-radius: 9999px;
  }

  @media (max-width: 899px) {
    justify-content: flex-start;
    margin: 0 0 14px;
  }
}

.dash-period-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;

  &__custom-btn {
    border-radius: 9999px;
    height: 38px;
    box-shadow: 0 4px 18px rgba(14, 165, 233, 0.24);
  }

  @media (max-width: 899px) {
    flex-wrap: wrap;
    gap: 8px;
  }
}

.dash-period-modal {
  border-radius: 20px;
  min-width: 320px;
}

.dash-period-modal__title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  font-family: 'Manrope', 'DM Sans', sans-serif;
}

.dash-period-modal__text {
  margin: 8px 0 0;
  color: #64748b;
}

.dash-grid {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: 32px;
  align-items: start;

  @media (max-width: 899px) {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>
