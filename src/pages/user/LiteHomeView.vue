<template>
  <q-page class="lite-home">
    <div class="lite-home__container">

      <!-- Greeting header (spec: HomeHeader with visibility toggle + notifications) -->
      <div class="lite-home__greeting">
        <div class="lite-home__greeting-left">
          <span class="t-eyebrow">Hola,</span>
          <span class="lite-home__greeting-name">{{ firstName }}</span>
        </div>
        <div class="lite-home__greeting-actions">
          <button
            class="lite-home__icon-btn"
            :title="isHidden ? 'Mostrar saldos' : 'Ocultar saldos'"
            @click="ui.toggleHideValues()"
          >
            <q-icon :name="isHidden ? 'visibility_off' : 'visibility'" size="22px" />
          </button>
          <button class="lite-home__icon-btn" title="Notificaciones" @click="router.push('/user/notifications')">
            <q-icon name="notifications" size="22px" />
          </button>
        </div>
      </div>

      <!-- Hero Balance (spec: BalanceCard — amount, delta MoM, asOf) -->
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
                <span
                  v-if="monthlyDelta !== null"
                  class="lite-home__delta"
                  :class="{ 'lite-home__delta--positive': monthlyDelta >= 0 }"
                >
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

          <!-- Timestamp asOf -->
          <p v-if="lastUpdated" class="lite-home__as-of">Actualizado · {{ lastUpdated }}</p>

          <!-- KPIs: ingresos / gastos / neto este mes -->
          <div class="lite-home__kpis">
            <div class="lite-home__kpi">
              <span class="t-eyebrow">Ingresos · este mes</span>
              <span class="t-amount-lg">
                {{ isHidden ? '••••••' : formatMoney(monthlyIncome) }}
              </span>
            </div>
            <div class="lite-home__kpi">
              <span class="t-eyebrow">Gastos · este mes</span>
              <span class="t-amount-lg" style="color: var(--expense-fg);">
                {{ isHidden ? '••••••' : formatMoney(monthlyExpense) }}
              </span>
            </div>
            <div class="lite-home__kpi">
              <span class="t-eyebrow">Neto · este mes</span>
              <span
                class="t-amount-lg"
                :style="{ color: netAmount >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)' }"
              >
                {{ isHidden ? '••••••' : formatMoney(netAmount) }}
              </span>
            </div>
          </div>
          <q-btn flat dense size="sm" color="primary" label="Configurar ingreso mensual" icon="settings" class="q-mt-sm" @click="openIncomeDialog" />
        </template>
      </section>

      <!-- Expected Monthly Income -->
      <section class="lite-home__section">
        <div class="lite-home__section-header">
          <h2 class="t-h2">Ingreso esperado</h2>
          <button
            v-if="!editingExpectedIncome"
            class="lite-home__icon-btn"
            title="Editar ingreso esperado"
            @click="startEditExpectedIncome"
          >
            <q-icon name="edit" size="18px" />
          </button>
        </div>
        <div class="lite-home__income-card">
          <template v-if="!editingExpectedIncome">
            <div class="lite-home__income-display">
              <span class="t-eyebrow">Mensual · {{ currencySymbol }}</span>
              <span class="t-amount-lg">
                {{ expectedIncome > 0 ? (isHidden ? '••••••' : formatMoney(expectedIncome)) : '—' }}
              </span>
              <span v-if="expectedIncome === 0" class="t-body-sm lite-home__income-hint">
                Configura tu ingreso para ver proyecciones en cántaros
              </span>
            </div>
          </template>
          <template v-else>
            <div class="lite-home__income-edit">
              <q-input
                v-model.number="newExpectedIncome"
                type="number"
                outlined
                dense
                :prefix="currencySymbol"
                min="0"
                autofocus
                style="flex: 1;"
                @keyup.enter="void saveExpectedIncome()"
                @keyup.escape="cancelEditExpectedIncome"
              />
              <div class="lite-home__income-edit-btns">
                <q-btn
                  flat dense round icon="check" color="positive" size="sm"
                  :loading="savingExpectedIncome"
                  @click="void saveExpectedIncome()"
                />
                <q-btn
                  flat dense round icon="close" color="negative" size="sm"
                  :disable="savingExpectedIncome"
                  @click="cancelEditExpectedIncome"
                />
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- Jars Preview (spec: JarsRow — up to 4 jars, horizontal scroll on mobile) -->
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
        <template v-else>
          <!-- Desktop grid -->
          <div class="lite-home__jars lite-home__jars--desktop">
            <div
              v-for="jar in activeJars.slice(0, 4)"
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
          <!-- Mobile horizontal scroll row (spec: JarsRow) -->
          <div class="lite-home__jars-row lite-home__jars--mobile">
            <div
              v-for="jar in activeJars.slice(0, 4)"
              :key="jar.id"
              class="lite-home__jar-chip"
              @click="router.push('/user/jars')"
            >
              <div class="lite-home__jar-chip-dot" :style="{ background: jar.color || '#0ea5e9' }" />
              <span class="lite-home__jar-chip-name">{{ jar.name }}</span>
              <span class="lite-home__jar-chip-balance">
                {{ isHidden ? '••••' : formatMoney(jar.balance) }}
              </span>
              <div class="lite-home__jar-bar" style="margin-top: 8px;">
                <div
                  class="lite-home__jar-progress"
                  :style="{ width: `${Math.min(100, jar.progress)}%`, background: jar.color || '#0ea5e9' }"
                />
              </div>
            </div>
          </div>
        </template>
      </section>

      <!-- Dreams Preview (spec: DreamSummaryCard — Sueños ANTES que Deudas) -->
      <section class="lite-home__section">
        <div class="lite-home__section-header">
          <h2 class="t-h2">Sueños</h2>
          <button class="lite-home__ghost-btn" @click="router.push('/user/dreams')">Ver todos</button>
        </div>
        <div v-if="dreamsLoading" class="lite-home__skeleton" style="height: 80px;" />
        <div v-else-if="dreamsPreview.length === 0" class="lite-home__empty">
          <q-icon name="star_outline" size="32px" color="grey-5" />
          <p class="t-body">Sin sueños registrados.</p>
          <button class="lite-home__ghost-btn" @click="router.push('/user/dreams')">Crear sueño</button>
        </div>
        <div v-else class="home-dreams">
          <div
            v-for="dream in dreamsPreview"
            :key="dream.id"
            class="home-dream-card"
            @click="router.push('/user/dreams')"
          >
            <div class="home-dream-card__top">
              <span class="home-dream-card__name">{{ dream.name }}</span>
              <span class="home-dream-card__pct">{{ dream.progress }}%</span>
            </div>
            <div class="home-dream-card__bar">
              <div class="home-dream-card__fill" :style="{ width: `${dream.progress}%` }" />
            </div>
            <div class="home-dream-card__amounts">
              <span class="t-body-sm" style="color: var(--income-fg);">
                {{ isHidden ? '••••••' : formatMoney(dream.current_amount) }}
              </span>
              <span class="t-body-sm">/ {{ isHidden ? '••••••' : formatMoney(dream.target_amount) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Debts Preview (spec: DebtSummaryCard — Deudas DESPUÉS de Sueños) -->
      <section class="lite-home__section">
        <div class="lite-home__section-header">
          <h2 class="t-h2">Deudas</h2>
          <button class="lite-home__ghost-btn" @click="router.push('/user/debts')">Ver todos</button>
        </div>
        <div v-if="debtsLoading" class="lite-home__skeleton" style="height: 80px;" />
        <div v-else-if="debtsPreview.length === 0" class="lite-home__empty">
          <q-icon name="credit_card" size="32px" color="grey-5" />
          <p class="t-body">Sin deudas registradas.</p>
          <button class="lite-home__ghost-btn" @click="router.push('/user/debts')">Agregar deuda</button>
        </div>
        <div v-else class="home-debts">
          <div
            v-for="debt in debtsPreview"
            :key="debt.id"
            class="home-debt-row"
            @click="router.push('/user/debts')"
          >
            <div class="home-debt-row__icon" :class="`home-debt-row__icon--${debt.provider}`">
              <q-icon name="credit_card" size="16px" />
            </div>
            <div class="home-debt-row__info">
              <span class="home-debt-row__name">{{ debt.name }}</span>
              <span class="home-debt-row__provider">{{ debt.provider }}</span>
            </div>
            <div class="home-debt-row__right">
              <span class="home-debt-row__balance" style="color: var(--expense-fg);">
                {{ isHidden ? '••••••' : formatMoney(debt.balance) }}
              </span>
              <span class="home-debt-row__status" :class="`home-debt-row__status--${debt.status}`">
                {{ debt.status === 'late' ? 'Atrasada' : debt.status === 'due-soon' ? 'Por vencer' : 'Al día' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Transactions (spec: TransactionList — last section, limit 4 mobile / 5 desktop) -->
      <section class="lite-home__section">
        <div class="lite-home__section-header">
          <h2 class="t-h2">Recientes</h2>
          <button class="lite-home__ghost-btn" @click="router.push('/user/transactions')">Ver todos</button>
        </div>
        <div v-if="transactionsLoading" class="lite-home__skeleton">
          <div
            v-for="i in 3"
            :key="i"
            class="lite-home__skeleton-line"
            style="width: 100%; height: 48px; margin-bottom: 8px;"
          />
        </div>
        <div v-else-if="recentTransactions.length === 0" class="lite-home__empty">
          <q-icon name="receipt_long" size="32px" color="grey-5" />
          <p class="t-body">No hay movimientos recientes.</p>
        </div>
        <div v-else class="lite-home__transactions">
          <div
            v-for="tx in recentTransactions.slice(0, txLimit)"
            :key="tx.id"
            class="lite-home__tx"
            @click="openEditTx(tx.id)"
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
    </div>

    <TxDetailModal
      v-model="showEditDialog"
      :tx-id="editTxId"
      layout-mode="lite"
      @saved="loadRecentTransactions"
      @deleted="loadRecentTransactions"
    />

    <q-dialog v-model="incomeDialog">
      <q-card style="min-width: 300px;">
        <q-card-section><div class="text-h6">Ingreso mensual</div></q-card-section>
        <q-card-section>
          <q-input v-model.number="incomeDialogValue" type="number" outlined dense label="Ingreso mensual" autofocus @keyup.enter="void saveIncomeDialog()" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Guardar" color="primary" :loading="savingIncome" @click="void saveIncomeDialog()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useUiStore } from 'stores/ui';
import { useAuthStore } from 'stores/auth';
import TxDetailModal from 'components/TxDetailModal.vue';

defineOptions({ name: 'LiteHomeView' });

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();
const ui = useUiStore();
const auth = useAuthStore();
const firstName = computed(() => (auth.user?.name || '').split(' ')[0] || 'tú');

const emit = defineEmits<{ 'quick-add': [] }>();

// ─── State ──────────────────────────────────────────────────────────
const balanceSummary = ref({ total_all: 0, total_global_balance: 0 });
const balanceLoading = ref(false);
const currencySymbol = computed(() => { const c = authStore.defaultCurrencyCode; return c === 'VES' ? 'Bs' : c === 'EUR' ? '€' : c === 'COP' ? '$' : '$'; });
const monthlyIncome = ref(0);
const monthlyExpense = ref(0);
const monthlyDelta = ref<number | null>(null);
const lastUpdated = ref<string | null>(null);

const isHidden = computed(() => ui.hideValues);

// spec: 5 tx on desktop, 4 on mobile
const txLimit = computed(() => ($q.screen.lt.md ? 4 : 5));

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

// ─── Dreams preview ─────────────────────────────────────────────────
interface DreamItem {
  id: number;
  name: string;
  current_amount: number;
  target_amount: number;
  progress: number;
}
const dreamsPreview = ref<DreamItem[]>([]);
const dreamsLoading = ref(false);

// ─── Debts preview ──────────────────────────────────────────────────
interface DebtItem {
  id: number;
  name: string;
  provider: string;
  balance: number;
  status: string;
}
const debtsPreview = ref<DebtItem[]>([]);
const debtsLoading = ref(false);

// ─── Transactions ────────────────────────────────────────────────────
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
const editTxId = ref<number | null>(null);
const showEditDialog = ref(false);

function openEditTx(id: number) {
  editTxId.value = id;
  showEditDialog.value = true;
}

watch(showEditDialog, (v) => {
  if (!v) editTxId.value = null;
});

// ─── Income dialog ──────────────────────────────────────────────────
const incomeDialog = ref(false);
const incomeDialogValue = ref<number>(0);
const savingIncome = ref(false);

function openIncomeDialog() {
  incomeDialogValue.value = Number(authStore.user?.monthly_income ?? 0);
  incomeDialog.value = true;
}

async function saveIncomeDialog() {
  savingIncome.value = true;
  try {
    await api.put('/user', { monthly_income: incomeDialogValue.value });
    if (authStore.user) authStore.user.monthly_income = incomeDialogValue.value;
    expectedIncome.value = incomeDialogValue.value;
    incomeDialog.value = false;
    $q.notify({ type: 'positive', message: 'Ingreso actualizado', timeout: 2000 });
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo guardar' });
  } finally {
    savingIncome.value = false;
  }
}

// ─── Expected Monthly Income ─────────────────────────────────────────
const expectedIncome = ref<number>(Number(authStore.user?.monthly_income ?? 0));
const editingExpectedIncome = ref(false);
const newExpectedIncome = ref<number>(0);
const savingExpectedIncome = ref(false);

function startEditExpectedIncome() {
  newExpectedIncome.value = expectedIncome.value;
  editingExpectedIncome.value = true;
}

function cancelEditExpectedIncome() {
  editingExpectedIncome.value = false;
}

async function saveExpectedIncome() {
  savingExpectedIncome.value = true;
  try {
    await api.put('/user/profile', { monthly_income: newExpectedIncome.value });
    expectedIncome.value = newExpectedIncome.value;
    if (authStore.user) authStore.user.monthly_income = newExpectedIncome.value;
    editingExpectedIncome.value = false;
    $q.notify({ type: 'positive', message: 'Ingreso actualizado', timeout: 2000 });
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo guardar el ingreso' });
  } finally {
    savingExpectedIncome.value = false;
  }
}

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

function _sumMonthTxs(list: Record<string, unknown>[]): { income: number; expense: number } {
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
  return { income, expense };
}

async function loadMonthSummary() {
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const paramsNow = {
    period: 'month',
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1),
    per_page: '500',
  };
  const paramsPrev = {
    period: 'month',
    year: String(prevDate.getFullYear()),
    month: String(prevDate.getMonth() + 1),
    per_page: '500',
  };
  try {
    const [resNow, resPrev] = await Promise.allSettled([
      api.get('/transactions', { params: paramsNow }),
      api.get('/transactions', { params: paramsPrev }),
    ]);

    const dataNow = resNow.status === 'fulfilled' ? resNow.value.data?.data : null;
    const listNow: Record<string, unknown>[] = Array.isArray(dataNow) ? dataNow : Array.isArray(dataNow?.data) ? (dataNow.data as Record<string, unknown>[]) : [];
    const { income, expense } = _sumMonthTxs(listNow);
    monthlyIncome.value = income;
    monthlyExpense.value = expense;

    // Real MoM delta on net (income - expense)
    if (resPrev.status === 'fulfilled') {
      const dataPrev = resPrev.value.data?.data;
      const listPrev: Record<string, unknown>[] = Array.isArray(dataPrev) ? dataPrev : Array.isArray(dataPrev?.data) ? (dataPrev.data as Record<string, unknown>[]) : [];
      const { income: incPrev, expense: expPrev } = _sumMonthTxs(listPrev);
      const netNow = income - expense;
      const netPrev = incPrev - expPrev;
      if (netPrev !== 0) {
        monthlyDelta.value = ((netNow - netPrev) / Math.abs(netPrev)) * 100;
      } else {
        monthlyDelta.value = null;
      }
    } else {
      monthlyDelta.value = null;
    }

    lastUpdated.value = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
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

async function loadDreams() {
  dreamsLoading.value = true;
  try {
    const res = await api.get('/dreams', { params: { per_page: 3, sort_by: 'progress', descending: 'false' } });
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
    dreamsPreview.value = (Array.isArray(raw) ? raw : []).slice(0, 3).map((d: Record<string, unknown>) => ({
      id: Number(d.id),
      name: typeof d.name === 'string' ? d.name : '',
      current_amount: Number(d.current_amount ?? d.amount ?? 0),
      target_amount: Number(d.target_amount ?? d.goal ?? 0),
      progress: Number(d.progress ?? 0),
    }));
  } catch { /* silent */ }
  finally { dreamsLoading.value = false; }
}

async function loadDebts() {
  debtsLoading.value = true;
  try {
    const res = await api.get('/debts', { params: { per_page: 3 } });
    const raw = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
    debtsPreview.value = (Array.isArray(raw) ? raw : []).slice(0, 3).map((d: Record<string, unknown>) => ({
      id: Number(d.id),
      name: typeof d.name === 'string' ? d.name : '',
      provider: typeof d.provider === 'string' ? d.provider : 'loan',
      balance: Number(d.balance ?? 0),
      status: typeof d.status === 'string' ? d.status : 'on-track',
    }));
  } catch { /* silent */ }
  finally { debtsLoading.value = false; }
}

onMounted(() => {
  void Promise.all([
    loadBalanceSummary(),
    loadMonthSummary(),
    loadJars(),
    loadRecentTransactions(),
    loadDreams(),
    loadDebts(),
  ]);
});
</script>

<style scoped lang="scss">
.lite-home {
  background: var(--bg-canvas);
  min-height: 100vh;

  &__greeting {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__greeting-left {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__greeting-name {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
    color: var(--fg-1);
    line-height: 1.2;
    text-transform: capitalize;
  }

  &__greeting-actions {
    display: flex;
    gap: 4px;
  }

  &__icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--fg-2);
    transition: background 0.15s;
    &:hover { background: var(--surface-2); }
  }

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

    &:hover { background: var(--brand-primary-hover); }
    &:active { transform: scale(0.98); }
  }

  &__as-of {
    margin: 0 0 16px;
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 500;
    color: var(--fg-3);
    letter-spacing: 0.02em;
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
    min-width: 0;
    overflow: hidden;

    .t-amount-lg {
      font-size: clamp(16px, 4vw, 28px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
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

    &:hover { background: var(--brand-primary-soft); }
  }

  // Desktop jars grid (hidden on mobile, shown via media query below)
  &__jars--desktop {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  // Mobile jars row (hidden on desktop, shown on mobile)
  &__jars--mobile {
    display: none;
  }

  &__jar {
    background: var(--surface-1);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-card);
    cursor: pointer;
    transition: box-shadow var(--dur-base) var(--ease-out);

    &:hover { box-shadow: var(--shadow-hover); }
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

  // Mobile jar horizontal scroll container
  &__jars-row {
    display: flex;
    flex-direction: row;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  &__jar-chip {
    flex: 0 0 140px;
    background: var(--surface-1);
    border-radius: var(--radius-md);
    padding: 14px;
    box-shadow: var(--shadow-card);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: box-shadow var(--dur-base) var(--ease-out);

    &:hover { box-shadow: var(--shadow-hover); }
  }

  &__jar-chip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-bottom: 4px;
  }

  &__jar-chip-name {
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 600;
    color: var(--fg-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__jar-chip-balance {
    font-family: var(--font-money);
    font-size: 13px;
    font-weight: 700;
    color: var(--fg-1);
    font-variant-numeric: tabular-nums;
  }

  &__income-card {
    background: var(--surface-1);
    border-radius: var(--radius-lg);
    padding: 20px 24px;
    box-shadow: var(--shadow-card);
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__income-display {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  &__income-hint {
    color: var(--fg-3);
    margin-top: 2px;
  }

  &__income-edit {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  &__income-edit-btns {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
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

    &:first-child { border-top: none; }
    &:hover { background: var(--surface-2); }
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

// ── Dreams preview ──
.home-dreams {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.home-dream-card {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: box-shadow 150ms;
  &:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__name {
    font-family: var(--font-display, sans-serif);
    font-size: 14px;
    font-weight: 600;
    color: var(--fg-1);
  }

  &__pct {
    font-size: 12px;
    font-weight: 700;
    color: #8b5cf6;
    background: rgba(139, 92, 246, 0.1);
    padding: 2px 8px;
    border-radius: 999px;
  }

  &__bar {
    height: 5px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, #8b5cf6, #ec4899);
    transition: width 500ms ease-out;
  }

  &__amounts {
    display: flex;
    gap: 4px;
    font-variant-numeric: tabular-nums;
  }
}

// ── Debts preview ──
.home-debts {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.home-debt-row {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  padding: 12px 16px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: box-shadow 150ms;
  &:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); }

  &__icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &--cashea   { background: rgba(249, 115, 22, 0.12); color: #f97316; }
    &--card     { background: rgba(239, 68, 68, 0.12);  color: #ef4444; }
    &--loan     { background: rgba(139, 92, 246, 0.12); color: #8b5cf6; }
    &--personal { background: rgba(14, 165, 233, 0.12); color: #0ea5e9; }
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--fg-1);
  }

  &__provider {
    font-size: 11px;
    color: var(--fg-2);
    text-transform: capitalize;
  }

  &__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
  }

  &__balance {
    font-family: var(--font-money, monospace);
    font-size: 14px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  &__status {
    font-size: 10.5px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 999px;
    &--on-track { background: var(--income-soft);   color: var(--income-fg); }
    &--due-soon { background: var(--warning-soft);  color: var(--warning-fg); }
    &--late     { background: var(--expense-soft);  color: var(--expense-fg); }
    &--paid     { background: var(--surface-2);     color: var(--fg-3); }
  }
}

// ── Mobile breakpoint ──
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

    // Switch jars layout: hide desktop grid, show mobile row
    &__jars--desktop {
      display: none;
    }

    &__jars--mobile {
      display: flex;
    }
  }
}
</style>
