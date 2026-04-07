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
        @toggle-hidden="isHidden = !isHidden"
        @period-change="onPeriodChange"
      />

      <!-- Two-column grid: Jars (5) | Transactions (7) -->
      <div class="dash-grid">
        <HomeJarsSection
          :jars="activeJars"
          :is-loading="jarsLoading"
          :currency="currencySymbol"
        />
        <HomeTransactionsSection
          :transactions="formattedTransactions"
          :is-loading="transactionsLoading"
          :currency="currencySymbol"
          :current-page="txCurrentPage"
          :total-pages="txTotalPages"
          @page-change="onTxPageChange"
        />
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import HomeHeroCard from 'src/components/home/HomeHeroCard.vue';
import HomeJarsSection from 'src/components/home/HomeJarsSection.vue';
import HomeTransactionsSection from 'src/components/home/HomeTransactionsSection.vue';

defineOptions({ name: 'LiteHomePage' });

const router = useRouter();
void router; // used in child components via inject

type Period = 'monthly' | 'weekly' | 'yearly';

// ─── Balance ──────────────────────────────────────────────────────────────────
const balanceSummary = ref({ total_all: 0, total_global_balance: 0 });
const balanceLoading = ref(false);
const currencySymbol = ref('$');

// ─── Monthly income / expense ─────────────────────────────────────────────────
const monthlyIncome = ref(0);
const monthlyExpense = ref(0);

// ─── Period / visibility UI state ────────────────────────────────────────────
const isHidden = ref(false);
const activePeriod = ref<Period>('monthly');

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
type JarItem = { id: number; name: string; balance: number; progress: number; color?: string };
const activeJars = ref<JarItem[]>([]);
const jarsLoading = ref(false);

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
  const now = new Date();

  if (period === 'monthly') {
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return { month };
  }

  if (period === 'weekly') {
    const day = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { from: fmt(monday), to: fmt(sunday) };
  }

  return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
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
          return { id: jarId, name: typeof jar.name === 'string' ? jar.name : 'Cántaro', balance, progress, color: (jar.color as string) || '#0ea5e9' };
        } catch { return null; }
      })
    );
    activeJars.value = results.filter((j): j is JarItem => j !== null && j !== undefined);
  } catch (err) {
    console.warn('[LiteHome] Jars error:', err);
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
      sort_order: 'desc',
    };
    const res = await api.get('/transactions', { params });
    const data = res.data?.data;
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? (data.data as Record<string, unknown>[]) : [];
    // Read pagination meta (Laravel paginator)
    const meta = (res.data?.meta || data?.meta || {}) as Record<string, unknown>;
    txCurrentPage.value = Number(meta.current_page ?? page);
    txTotalPages.value = Number(meta.last_page ?? 1);
    recentTransactions.value = list.map((tx) => ({
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
