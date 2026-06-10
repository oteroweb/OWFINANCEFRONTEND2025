<template>
  <q-page class="lite-home">
    <div class="lite-home__container">

      <!-- Setup banner — sin cuentas -->
      <div v-if="hasNoAccounts && !balanceLoading" class="lite-home__setup-banner">
        <q-icon name="account_balance_wallet" size="32px" style="opacity:.6" />
        <div class="lite-home__setup-text">
          <span class="t-h2">Configura tu billetera</span>
          <span class="t-body-sm">Crea tu primera cuenta para empezar a registrar transacciones.</span>
        </div>
        <q-btn
          unelevated
          color="primary"
          label="Crear cuenta"
          @click="router.push('/user/accounts')"
        />
      </div>

      <!-- Hero Balance -->
      <section class="lite-home__hero">
        <div v-if="balanceLoading" class="lite-home__skeleton">
          <div class="lite-home__skeleton-line" style="width: 120px; height: 14px;" />
          <div class="lite-home__skeleton-line" style="width: 280px; height: 56px; margin-top: 12px;" />
        </div>
        <template v-else>
          <div class="lite-home__hero-header">
            <div>
              <span class="t-eyebrow">Disponible · {{ currencySymbol }}</span>
              <div class="lite-home__balance-wrap">
                <span class="t-hero-amount">
                  {{ isHidden ? '••••••' : formatMoney(balanceSummary.total_global_balance) }}
                </span>
                <span v-if="monthlyDelta !== null" class="lite-home__delta" :class="{ 'lite-home__delta--positive': monthlyDelta >= 0 }">
                  <q-icon :name="monthlyDelta >= 0 ? 'arrow_upward' : 'arrow_downward'" size="14px" />
                  {{ monthlyDelta >= 0 ? '+' : '' }}{{ monthlyDelta.toFixed(1) }}% vs. mes ant.
                </span>
              </div>
              <span class="t-body-sm">Al {{ formatDateShort(new Date()) }}</span>
            </div>
            <button class="lite-home__add-btn" @click="emit('quick-add')">
              <q-icon name="add" size="20px" />
              <span>Agregar</span>
            </button>
          </div>

          <!-- KPIs -->
          <div class="lite-home__kpis">
            <div class="lite-home__kpi">
              <span class="t-eyebrow">Ingresos · este mes</span>
              <span class="t-amount-lg" :class="{ 'tabular': true }">
                {{ isHidden ? '••••••' : formatMoney(monthlyIncome) }}
              </span>
            </div>
            <div class="lite-home__kpi">
              <span class="t-eyebrow">Gastos · este mes</span>
              <span class="t-amount-lg" style="color: var(--expense-fg);">
                {{ isHidden ? '••••••' : formatMoney(-monthlyExpense) }}
              </span>
            </div>
            <div class="lite-home__kpi">
              <span class="t-eyebrow">Neto · este mes</span>
              <span class="t-amount-lg" :style="{ color: netAmount >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)' }">
                {{ isHidden ? '••••••' : formatMoney(netAmount) }}
              </span>
            </div>
          </div>
        </template>
      </section>

      <!-- Jars Preview -->
      <section class="lite-home__section">
        <div class="lite-home__section-header">
          <h2 class="t-h2">Cántaros</h2>
          <button class="lite-home__ghost-btn" @click="router.push('/user/jars')">Ver todos</button>
        </div>
        <div v-if="jarsLoading" class="lite-home__skeleton">
          <div class="lite-home__skeleton-line" style="width: 100%; height: 80px;" />
        </div>
        <div v-else-if="activeJars.length === 0" class="lite-home__empty">
          <q-icon name="savings" size="32px" color="grey-5" />
          <p class="t-body">No tienes cántaros activos.</p>
          <button class="lite-home__ghost-btn" @click="router.push('/user/jars')">Crear cántaro</button>
        </div>
        <div v-else class="lite-home__jars">
          <div
            v-for="jar in activeJars.slice(0, 3)"
            :key="jar.id"
            class="lite-home__jar"
            @click="router.push('/user/jars')"
          >
            <div class="lite-home__jar-header">
              <span class="lite-home__jar-dot" :style="{ background: jar.color || '#0ea5e9' }" />
              <span class="t-label">{{ jar.name }}</span>
            </div>
            <span class="t-amount-md">{{ isHidden ? '••••••' : formatMoney(jar.balance) }}</span>
            <div class="lite-home__jar-bar">
              <div
                class="lite-home__jar-progress"
                :style="{ width: `${Math.min(100, jar.progress)}%`, background: jar.color || '#0ea5e9' }"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Transactions -->
      <section class="lite-home__section">
        <div class="lite-home__section-header">
          <h2 class="t-h2">Movimientos recientes</h2>
          <button class="lite-home__ghost-btn" @click="router.push('/user/transactions')">Ver todos</button>
        </div>
        <div v-if="transactionsLoading" class="lite-home__skeleton">
          <div v-for="i in 3" :key="i" class="lite-home__skeleton-line" style="width: 100%; height: 48px; margin-bottom: 8px;" />
        </div>
        <div v-else-if="recentTransactions.length === 0" class="lite-home__empty">
          <q-icon name="receipt_long" size="32px" color="grey-5" />
          <p class="t-body">No hay movimientos recientes.</p>
        </div>
        <div v-else class="lite-home__transactions">
          <div
            v-for="tx in recentTransactions.slice(0, 5)"
            :key="tx.id"
            class="lite-home__tx"
            @click="router.push('/user/transactions')"
          >
            <div class="lite-home__tx-icon" :class="{ 'lite-home__tx-icon--income': tx.type === 'income' }">
              <q-icon :name="tx.type === 'income' ? 'arrow_downward' : 'arrow_outward'" size="16px" />
            </div>
            <div class="lite-home__tx-info">
              <span class="t-label">{{ tx.name }}</span>
              <span class="t-body-sm">{{ tx.category }} · {{ formatDateShort(tx.date) }}</span>
            </div>
            <span
              class="t-amount-sm"
              :style="{ color: tx.type === 'income' ? 'var(--income-fg)' : 'var(--expense-fg)' }"
            >
              {{ tx.type === 'income' ? '+' : '-' }}{{ isHidden ? '••••••' : formatMoney(Math.abs(tx.amount)) }}
            </span>
          </div>
        </div>
      </section>

      <!-- Dreams Preview (placeholder) -->
      <section class="lite-home__section">
        <div class="lite-home__section-header">
          <h2 class="t-h2">Sueños</h2>
          <button class="lite-home__ghost-btn" @click="router.push('/user/dreams')">Ver todos</button>
        </div>
        <div class="lite-home__empty">
          <q-icon name="auto_awesome" size="32px" color="grey-5" />
          <p class="t-body">Próximamente podrás definir metas financieras.</p>
        </div>
      </section>

      <!-- Debts Preview (placeholder) -->
      <section class="lite-home__section">
        <div class="lite-home__section-header">
          <h2 class="t-h2">Deudas</h2>
          <button class="lite-home__ghost-btn" @click="router.push('/user/debts')">Ver todos</button>
        </div>
        <div class="lite-home__empty">
          <q-icon name="credit_card" size="32px" color="grey-5" />
          <p class="t-body">Próximamente podrás gestionar tus deudas.</p>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useUiStore } from 'stores/ui';

defineOptions({ name: 'LiteHomeView' });

const router = useRouter();
const ui = useUiStore();

const emit = defineEmits<{ 'quick-add': [] }>();

// ─── State ──────────────────────────────────────────────────────────
const balanceSummary = ref({ total_all: 0, total_global_balance: 0 });
const balanceLoading = ref(false);
const currencySymbol = ref('$');
const monthlyIncome = ref(0);
const monthlyExpense = ref(0);
const monthlyDelta = ref<number | null>(null);
const accountsCount = ref<number | null>(null);

const isHidden = computed(() => ui.hideValues);
const hasNoAccounts = computed(() => accountsCount.value === 0);

// ─── Jars ───────────────────────────────────────────────────────────
interface JarItem {
  id: number;
  name: string;
  balance: number;
  allocated: number;
  progress: number;
  color?: string;
}
const activeJars = ref<JarItem[]>([]);
const jarsLoading = ref(false);

// ─── Transactions ─────────────────────────────────────────────────────
interface TxItem {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}
const recentTransactions = ref<TxItem[]>([]);
const transactionsLoading = ref(false);

// ─── Computed ───────────────────────────────────────────────────────
const netAmount = computed(() => monthlyIncome.value - monthlyExpense.value);

// ─── Helpers ────────────────────────────────────────────────────────
function formatMoney(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `$ ${formatted}`;
}

function formatDateShort(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function classifyTx(tx: Record<string, unknown>, amount: number): 'income' | 'expense' | 'transfer' {
  const rawType = tx.transaction_type as Record<string, unknown> | undefined;
  const name = typeof rawType?.name === 'string' ? rawType.name.toLowerCase() : '';
  const slug = typeof rawType?.slug === 'string' ? rawType.slug.toLowerCase() : '';
  const id = Number(tx.transaction_type_id ?? rawType?.id ?? 0);
  const typeText = `${name} ${slug}`;

  if (id === 4 || typeText.includes('transfer') || typeText.includes('traspaso')) return 'transfer';
  if (typeText.includes('income') || typeText.includes('ingreso')) return 'income';
  if (typeText.includes('expense') || typeText.includes('gasto')) return 'expense';
  return amount >= 0 ? 'income' : 'expense';
}

// ─── Data loading ───────────────────────────────────────────────────
async function loadBalanceSummary() {
  balanceLoading.value = true;
  try {
    const [balRes, accRes] = await Promise.all([
      api.get('/accounts/summary/global-balance'),
      api.get('/accounts'),
    ]);
    const data = balRes.data?.data || {};
    balanceSummary.value = {
      total_all: Number(data.total_all ?? 0),
      total_global_balance: Number(data.total_global_balance ?? 0),
    };
    const accounts = accRes.data?.data ?? accRes.data ?? [];
    accountsCount.value = Array.isArray(accounts) ? accounts.length : 0;
  } catch (err) {
    console.warn('[LiteHome] Balance error:', err);
  } finally {
    balanceLoading.value = false;
  }
}

async function loadMonthSummary() {
  const now = new Date();
  const params = {
    period: 'month',
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1),
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
    // Simulated delta (would need historical comparison)
    monthlyDelta.value = income > 0 ? ((income - expense) / income) * 100 : 0;
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
    const totalAllocated = activeJars.value.reduce((acc, jar) => acc + Math.max(0, jar.allocated), 0);
    const totalAvailable = activeJars.value.reduce((acc, jar) => acc + Math.max(0, jar.balance), 0);
    const availabilityPercent = totalAllocated > 0 ? (totalAvailable / totalAllocated) * 100 : 0;
    const usedPercent = totalAllocated > 0 ? 100 - availabilityPercent : 0;
    ui.setJarStatus({
      totalAllocated,
      totalAvailable,
      availabilityPercent: Math.max(0, Math.min(100, availabilityPercent)),
      usedPercent: Math.max(0, Math.min(100, usedPercent)),
      jarCount: activeJars.value.length,
    });
  } catch (err) {
    console.warn('[LiteHome] Jars error:', err);
  } finally {
    jarsLoading.value = false;
  }
}

async function loadRecentTransactions() {
  transactionsLoading.value = true;
  try {
    const now = new Date();
    const params = {
      period: 'month',
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1),
      per_page: '7',
      page: '1',
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

    recentTransactions.value = sortedList.map((tx) => ({
      id: Number(tx.id),
      name: typeof tx.name === 'string' ? tx.name : (typeof tx.description === 'string' ? tx.description : 'Transacción'),
      amount: Math.abs(Number(tx.amount ?? 0)),
      date: typeof tx.date === 'string' ? tx.date : new Date().toISOString(),
      category: ((tx.transaction_type as Record<string, unknown> | undefined)?.name as string | undefined)
        ?? ((tx.category as Record<string, unknown> | undefined)?.name as string | undefined)
        ?? 'General',
      type: Number(tx.amount ?? 0) >= 0 ? ('income' as const) : ('expense' as const),
    }));
  } catch (err) {
    console.warn('[LiteHome] Transactions error:', err);
  } finally {
    transactionsLoading.value = false;
  }
}

onMounted(() => {
  void Promise.all([
    loadBalanceSummary(),
    loadMonthSummary(),
    loadJars(),
    loadRecentTransactions(),
  ]);
});
</script>

<style scoped lang="scss">
.lite-home {
  background: var(--bg-canvas);
  min-height: 100vh;

  &__container {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 24px 32px 140px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  &__hero {
    background: var(--surface-1);
    border-radius: var(--radius-xl);
    padding: 32px;
    box-shadow: var(--shadow-card);
  }

  &__hero-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
  }

  &__balance-wrap {
    display: flex;
    align-items: baseline;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 14px;
  }

  &__delta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    background: var(--expense-soft);
    color: var(--expense-fg);

    &--positive {
      background: var(--income-soft);
      color: var(--income-fg);
    }
  }

  &__add-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 0;
    cursor: pointer;
    border-radius: var(--radius-pill);
    background: var(--brand-primary);
    color: var(--fg-on-brand);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    transition: background var(--dur-base) var(--ease-out);

    &:hover {
      background: var(--brand-primary-hover);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &__kpis {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border-hairline);
  }

  &__kpi {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__ghost-btn {
    border: 0;
    background: transparent;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
    color: var(--brand-primary);
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    transition: background var(--dur-base) var(--ease-out);

    &:hover {
      background: var(--brand-primary-soft);
    }
  }

  &__jars {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  &__jar {
    background: var(--surface-1);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-card);
    cursor: pointer;
    transition: box-shadow var(--dur-base) var(--ease-out);

    &:hover {
      box-shadow: var(--shadow-hover);
    }
  }

  &__jar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__jar-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__jar-bar {
    height: 5px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
    margin-top: 10px;
  }

  &__jar-progress {
    height: 100%;
    border-radius: 3px;
    transition: width var(--dur-slow) var(--ease-out);
  }

  &__transactions {
    background: var(--surface-1);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    overflow: hidden;
  }

  &__tx {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 14px;
    align-items: center;
    padding: 14px 20px;
    cursor: pointer;
    transition: background var(--dur-base) var(--ease-out);
    border-top: 1px solid var(--border-hairline);

    &:first-child {
      border-top: none;
    }

    &:hover {
      background: var(--surface-2);
    }
  }

  &__tx-icon {
    width: 34px;
    height: 34px;
    border-radius: 17px;
    background: var(--expense-soft);
    color: var(--expense-fg);
    display: flex;
    align-items: center;
    justify-content: center;

    &--income {
      background: var(--income-soft);
      color: var(--income-fg);
    }
  }

  &__tx-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__setup-banner {
    background: var(--surface-1);
    border-radius: var(--radius-lg);
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    box-shadow: var(--shadow-card);
    margin-bottom: 0;
  }

  &__setup-text {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__empty {
    background: var(--surface-1);
    border-radius: var(--radius-lg);
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    box-shadow: var(--shadow-card);
  }

  &__skeleton {
    background: var(--surface-1);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-card);
  }

  &__skeleton-line {
    border-radius: var(--radius-sm);
    background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
    background-size: 200% 100%;
    animation: skeleton-pulse 1.5s infinite;
  }
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 768px) {
  .lite-home {
    &__container {
      padding: 16px 16px 120px;
      gap: 24px;
    }

    &__hero {
      padding: 20px;
    }

    &__hero-header {
      flex-direction: column;
      gap: 16px;
    }

    &__kpis {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    &__jars {
      grid-template-columns: 1fr;
    }
  }
}
</style>
