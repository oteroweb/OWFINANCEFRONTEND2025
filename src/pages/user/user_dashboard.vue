<template>
  <q-page class="lite-home-page" :class="$q.screen.lt.md ? 'mobile' : 'desktop'">
    <div class="lite-container">
      <!-- Hero Balance Card -->
      <LiquidBalanceCard
        label="Balance Total"
        :name="auth.user?.name || 'Usuario'"
        :amount="balanceSummary.total_global_balance"
        :currency="currencySymbol"
        icon="solar:wallet-bold-duotone"
        :trend-value="balanceTrend"
      />

      <!-- Mis Cantaros Section -->
      <section class="jars-section q-mt-xl">
        <div class="section-header row items-center justify-between q-mb-md">
          <div>
            <h2 class="section-title">Mis Cántaros</h2>
            <p class="section-subtitle">Gestiona tus presupuestos y objetivos</p>
          </div>
          <q-btn
            flat
            dense
            color="primary"
            label="Ver detalles"
            icon-right="arrow_forward"
            @click="router.push('/user/jars')"
          />
        </div>
        
        <div v-if="jarsLoading" class="jars-grid">
          <q-skeleton v-for="i in 3" :key="i" type="rect" height="200px" class="jar-skeleton" />
        </div>
        
        <div v-else-if="activeJars.length" class="jars-grid">
          <LiquidJarCard
            v-for="jar in activeJars.slice(0, 6)"
            :key="jar.id"
            :label="jar.name"
            :amount="formatJarAmount(jar.balance)"
            :progress="jar.progress"
            :currency="currencySymbol"
            icon="solar:jar-bold-duotone"
            @click="router.push(`/user/jars/${jar.id}`)"
          />
        </div>
        
        <div v-else class="empty-state">
          <q-icon name="solar:jar-bold-duotone" size="64px" color="grey-4" />
          <p class="text-grey-6 q-mt-md">No tienes cántaros configurados</p>
          <q-btn
            color="primary"
            label="Crear primer cántaro"
            @click="router.push('/user/jars')"
          />
        </div>
      </section>

      <!-- Ultimos Movimientos Section -->
      <section class="transactions-section q-mt-xl">
        <div class="section-header row items-center justify-between q-mb-md">
          <div>
            <h2 class="section-title">Últimos Movimientos</h2>
            <p class="section-subtitle">Tu actividad reciente</p>
          </div>
          <q-btn
            flat
            dense
            color="primary"
            label="Historial completo"
            icon-right="arrow_forward"
            @click="router.push('/user/transactions')"
          />
        </div>
        
        <div v-if="transactionsLoading" class="transactions-list">
          <q-skeleton v-for="i in 5" :key="i" type="rect" height="80px" class="transaction-skeleton q-mb-sm" />
        </div>
        
        <div v-else-if="recentTransactions.length" class="transactions-list">
          <LiquidTransactionItem
            v-for="tx in recentTransactions"
            :key="tx.id"
            :label="tx.name"
            :amount="formatTransactionAmount(tx.amount)"
            :date="formatDate(tx.date)"
            :category="tx.category || 'Sin categoría'"
            :is-income="tx.type === 'income'"
            :currency="currencySymbol"
            v-bind="tx.accountName ? { account: tx.accountName } : {}"
            icon="solar:card-2-bold-duotone"
            @click="router.push(`/user/transactions/${tx.id}`)"
          />
        </div>
        
        <div v-else class="empty-state">
          <q-icon name="solar:card-2-bold-duotone" size="64px" color="grey-4" />
          <p class="text-grey-6 q-mt-md">No hay transacciones recientes</p>
          <q-btn
            color="primary"
            label="Agregar transacción"
            @click="ui.openNewTransactionDialog()"
          />
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';
import { useUiStore } from 'src/stores/ui';
import LiquidBalanceCard from 'src/components/liquid/LiquidBalanceCard.vue';
import LiquidJarCard from 'src/components/liquid/LiquidJarCard.vue';
import LiquidTransactionItem from 'src/components/liquid/LiquidTransactionItem.vue';

defineOptions({ name: 'LiteHomePage' });

const router = useRouter();
const $q = useQuasar();
const auth = useAuthStore();
const ui = useUiStore();

const balanceSummary = ref({ total_all: 0, total_global_balance: 0 });
const balanceTrend = ref(0);
const currencySymbol = ref('$');

type JarItem = {
  id: number;
  name: string;
  balance: number;
  progress: number;
  color?: string;
};

const activeJars = ref<JarItem[]>([]);
const jarsLoading = ref(false);

type TransactionItem = {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  accountName: string | undefined;
};

const recentTransactions = ref<TransactionItem[]>([]);
const transactionsLoading = ref(false);

function formatJarAmount(amount: number): string {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatTransactionAmount(amount: number): string {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

async function loadBalanceSummary() {
  try {
    const res = await api.get('/accounts/summary/global-balance');
    const data = res.data?.data || {};
    balanceSummary.value = {
      total_all: Number(data.total_all ?? 0),
      total_global_balance: Number(data.total_global_balance ?? 0),
    };
    balanceTrend.value = 0;
  } catch (err) {
    console.warn('[LiteHome] Error loading balance:', err);
  }
}

async function loadJars() {
  jarsLoading.value = true;
  try {
    const jarsRes = await api.get('/jars', { params: { per_page: 100 } });
    const raw = jarsRes.data?.data;
    const jarsData = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const balanceDate = `${currentMonth}-01`;
    const jarsWithBalance = await Promise.all(
      jarsData.map(async (jar: Record<string, unknown>) => {
        try {
          const jarId = Number(jar.id);
          const balRes = await api.get(`/jars/${jarId}/balance`, { params: { date: balanceDate } });
          const bal = balRes.data?.data || {};
          const assigned = Number(bal.allocated_amount || 0);
          const balance = Number(bal.available_balance || 0);
          const progress = assigned > 0 ? Math.min(100, Math.round((assigned - balance) / assigned * 100)) : 0;
          const jarName = typeof jar.name === 'string' ? jar.name : 'Cántaro';
          return { id: jarId, name: jarName, balance, progress, color: (jar.color as string) || '#0ea5e9' };
        } catch { return null; }
      })
    );
    activeJars.value = jarsWithBalance.filter((j): j is JarItem => j !== null);
  } catch (err) {
    console.warn('[LiteHome] Error loading jars:', err);
  } finally {
    jarsLoading.value = false;
  }
}

async function loadRecentTransactions() {
  transactionsLoading.value = true;
  try {
    const res = await api.get('/transactions', { params: { per_page: 5, sort_by: 'date', sort_order: 'desc' } });
    const data = res.data?.data;
    let txList: Record<string, unknown>[] = [];
    if (Array.isArray(data)) txList = data;
    else if (data && Array.isArray(data.data)) txList = data.data;
    recentTransactions.value = txList.map((tx: Record<string, unknown>) => {
      const txName = typeof tx.name === 'string' ? tx.name : (typeof tx.description === 'string' ? tx.description : 'Transacción');
      const txDate = typeof tx.date === 'string' ? tx.date : new Date().toISOString();
      const txCategory = (tx.transaction_type as Record<string, unknown> | undefined)?.name as string | undefined
        || (tx.category as Record<string, unknown> | undefined)?.name as string | undefined
        || 'General';
      const txAccount = (tx.account as Record<string, unknown> | undefined)?.name as string | undefined;
      return {
        id: Number(tx.id),
        name: txName,
        amount: Math.abs(Number(tx.amount || 0)),
        date: txDate,
        category: txCategory,
        type: Number(tx.amount || 0) >= 0 ? ('income' as const) : ('expense' as const),
        accountName: txAccount ?? undefined,
      };
    });
  } catch (err) {
    console.warn('[LiteHome] Error loading transactions:', err);
  } finally {
    transactionsLoading.value = false;
  }
}

async function loadDashboardData() {
  await Promise.all([loadBalanceSummary(), loadJars(), loadRecentTransactions()]);
}

onMounted(() => { void loadDashboardData(); });
</script>

<style lang="scss" scoped>
.lite-home-page {
  background: var(--surface-base, #f8fafc);
  min-height: 100vh;
  padding: 0;
}

.lite-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  @media (min-width: 768px) {
    padding: 32px 24px;
  }
}

.section-header { margin-bottom: 20px; }

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-pure, #0f172a);
  margin: 0 0 4px 0;
  font-family: 'Manrope', 'Satoshi', sans-serif;
}

.section-subtitle {
  font-size: 14px;
  color: var(--text-soft, #64748b);
  margin: 0;
}

.jars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.jar-skeleton { border-radius: 32px; }

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction-skeleton { border-radius: 24px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.lite-home-page.mobile {
  .lite-container { padding: 20px 12px; }
  .section-title { font-size: 20px; }
  .section-subtitle { font-size: 13px; }
}

.lite-home-page.desktop {
  .jars-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    max-width: 100%;
  }
}
</style>
