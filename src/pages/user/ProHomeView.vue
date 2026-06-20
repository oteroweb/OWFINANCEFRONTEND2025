<template>
  <q-page class="pro-page">
    <div class="pro-page__container">
      <!-- KPI strip -->
      <div class="kpi-grid">
        <div v-for="(kpi, i) in kpis" :key="i" class="kpi-card">
          <div class="kpi-card__header">
            <div class="kpi-card__icon" :style="{ background: kpi.softColor }">
              <q-icon :name="kpi.icon" size="18px" :style="{ color: kpi.color }" />
            </div>
            <span class="kpi-card__delta" :style="{ background: kpi.deltaSoft, color: kpi.deltaColor }">
              {{ kpi.delta }}
            </span>
          </div>
          <div>
            <span class="t-eyebrow" style="margin-bottom: 4px; display: block;">{{ kpi.label }}</span>
            <span v-if="kpi.text" class="t-amount-lg">{{ isHidden ? '••%' : kpi.text }}</span>
            <span v-else class="t-amount-lg" :style="{ color: kpi.valueColor }">
              {{ isHidden ? '••••••' : formatMoney(kpi.value) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Mid row -->
      <div class="mid-row">
        <!-- Spending breakdown -->
        <div class="pro-card">
          <div class="pro-card__header">
            <span class="t-h3">Gastos por categoría</span>
            <button class="ghost-btn" @click="router.push('/user/expense-analysis')">Ver análisis</button>
          </div>
          <div class="breakdown">
            <div v-for="cat in spendingBreakdown" :key="cat.name" class="breakdown__row">
              <span class="breakdown__label">{{ cat.name }}</span>
              <div class="breakdown__bar">
                <div class="breakdown__fill" :style="{ width: `${cat.pct}%`, background: 'var(--info)' }" />
              </div>
              <span class="t-amount-sm" style="color: var(--expense-fg);">
                {{ isHidden ? '••••••' : formatMoney(-cat.amount) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Jars summary -->
        <div class="pro-card">
          <div class="pro-card__header">
            <span class="t-h3">Cántaros</span>
            <button class="ghost-btn" @click="router.push('/user/jars')">Ver todos</button>
          </div>
          <div class="jars-summary">
            <div v-for="jar in jarSummary" :key="jar.id" class="jars-summary__row">
              <span class="jars-summary__label">{{ jar.name }}</span>
              <div class="jars-summary__bar">
                <div class="jars-summary__fill" :style="{ width: `${jar.progress}%`, background: jar.barColor }" />
              </div>
              <span class="jars-summary__pct">{{ jar.progress }}%</span>
              <span class="t-amount-sm">{{ isHidden ? '••••••' : formatMoney(jar.balance) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions dense -->
      <div>
        <div class="pro-card__header" style="margin-bottom: 12px;">
          <span class="t-h3">Movimientos recientes</span>
          <button class="ghost-btn" @click="router.push('/user/transactions')">Ver todos</button>
        </div>
        <div class="pro-card" style="padding: 0;">
          <div
            v-for="(tx, i) in recentTransactions"
            :key="tx.id"
            class="tx-dense"
            :class="{ 'tx-dense--first': i === 0 }"
          >
            <div class="tx-dense__icon" :class="tx.type === 'income' ? 'tx-dense__icon--income' : 'tx-dense__icon--expense'">
              <q-icon :name="tx.type === 'income' ? 'arrow_downward' : 'arrow_outward'" size="16px" />
            </div>
            <div class="tx-dense__info">
              <span class="tx-dense__name">{{ tx.name }}</span>
              <span class="tx-dense__date">{{ formatDateShort(tx.date) }}</span>
            </div>
            <span class="tx-dense__tag">{{ tx.category }}</span>
            <span class="tx-dense__amount" :style="{ color: tx.type === 'income' ? 'var(--income-fg)' : 'var(--expense-fg)' }">
              {{ tx.type === 'income' ? '+' : '-' }}{{ isHidden ? '••••••' : formatMoney(Math.abs(tx.amount)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Exchange Rates Widget -->
      <div v-if="userRates.length" class="pro-card er-card">
        <div class="pro-card__header" style="margin-bottom: 0;">
          <div>
            <span class="t-h3">Tipos de cambio</span>
            <p class="er-card__hint">Tasa manual · 1 USD =</p>
          </div>
        </div>
        <div>
          <div
            v-for="(rate, i) in userRates"
            :key="rate.id"
            class="er-row"
            :class="{ 'er-row--first': i === 0 }"
          >
            <div class="er-row__flag">{{ rate.currency?.code?.slice(0, 2) }}</div>
            <div class="er-row__info">
              <span class="er-row__code">{{ rate.currency?.code }}</span>
              <span class="er-row__name">{{ rate.currency?.name }}</span>
            </div>
            <span class="er-row__eq">1 USD =</span>
            <div class="er-row__input-wrap" :class="{ 'er-row__input-wrap--focus': rateEditId === rate.id }">
              <input
                type="number"
                min="0"
                step="any"
                class="er-row__input"
                :value="rate.current_rate"
                @focus="rateEditId = rate.id"
                @blur="rateEditId = null"
                @change="updateRate(rate, ($event.target as HTMLInputElement).valueAsNumber)"
              />
              <span class="er-row__code-suffix">{{ rate.currency?.code }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI advisor prompt strip -->
      <button class="ai-strip" @click="openAssistant">
        <div class="ai-strip__avatar">
          <q-icon name="auto_awesome" size="22px" color="#fff" />
        </div>
        <div class="ai-strip__body">
          <div class="ai-strip__title">Asesor Financiero IA</div>
          <div class="ai-strip__hint">{{ aiHint }}</div>
        </div>
        <q-icon name="chevron_right" size="20px" color="var(--fg-3)" />
      </button>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useUiStore } from 'stores/ui';

defineOptions({ name: 'ProHomeView' });

const router = useRouter();
const ui = useUiStore();
const isHidden = computed(() => ui.hideValues);

interface Kpi {
  label: string;
  value: number;
  text?: string;
  icon: string;
  color: string;
  softColor: string;
  delta: string;
  deltaColor: string;
  deltaSoft: string;
  valueColor?: string;
}

const kpis = computed<Kpi[]>(() => [
  {
    label: 'Disponible',
    value: balanceSummary.value.total_global_balance,
    icon: 'account_balance',
    color: 'var(--info)',
    softColor: 'var(--info-soft)',
    delta: '+4.2%',
    deltaColor: 'var(--income-fg)',
    deltaSoft: 'var(--income-soft)',
    valueColor: 'var(--fg-1)',
  },
  {
    label: 'Ingresos · mes',
    value: monthlyIncome.value,
    icon: 'arrow_downward',
    color: 'var(--income)',
    softColor: 'var(--income-soft)',
    delta: '+8.1%',
    deltaColor: 'var(--income-fg)',
    deltaSoft: 'var(--income-soft)',
    valueColor: 'var(--income-fg)',
  },
  {
    label: 'Gastos · mes',
    value: -monthlyExpense.value,
    icon: 'arrow_outward',
    color: 'var(--expense)',
    softColor: 'var(--expense-soft)',
    delta: '-2.3%',
    deltaColor: 'var(--expense-fg)',
    deltaSoft: 'var(--expense-soft)',
    valueColor: 'var(--expense-fg)',
  },
  {
    label: 'Tasa de ahorro',
    value: 0,
    text: savingsRate.value,
    icon: 'trending_up',
    color: 'var(--income)',
    softColor: 'var(--income-soft)',
    delta: 'Meta: 40%',
    deltaColor: 'var(--income-fg)',
    deltaSoft: 'var(--income-soft)',
    valueColor: 'var(--fg-1)',
  },
]);

const balanceSummary = ref({ total_all: 0, total_global_balance: 0 });
const monthlyIncome = ref(0);
const monthlyExpense = ref(0);
const savingsRate = ref('0%');
const aiHint = ref('Tu tasa de ahorro es saludable. Revisa los movimientos recientes para optimizar.');

interface SpendingItem { name: string; amount: number; pct: number }
const spendingBreakdown = ref<SpendingItem[]>([]);

interface JarSummary { id: number; name: string; balance: number; progress: number; barColor: string }
const jarSummary = ref<JarSummary[]>([]);

interface TxItem {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}
const recentTransactions = ref<TxItem[]>([]);

function formatMoney(n: number): string {
  const abs = Math.abs(n);
  return `$ ${abs.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

function classifyTx(tx: Record<string, unknown>, amount: number): 'income' | 'expense' {
  const rawType = tx.transaction_type as Record<string, unknown> | undefined;
  const name = typeof rawType?.name === 'string' ? rawType.name.toLowerCase() : '';
  const slug = typeof rawType?.slug === 'string' ? rawType.slug.toLowerCase() : '';
  const typeText = `${name} ${slug}`;
  if (typeText.includes('income') || typeText.includes('ingreso')) return 'income';
  if (typeText.includes('expense') || typeText.includes('gasto')) return 'expense';
  return amount >= 0 ? 'income' : 'expense';
}

function openAssistant() {
  // TODO: implement assistant modal
}

async function loadBalanceSummary() {
  try {
    const res = await api.get('/accounts/summary/global-balance');
    const data = res.data?.data || {};
    balanceSummary.value = {
      total_all: Number(data.total_all ?? 0),
      total_global_balance: Number(data.total_global_balance ?? 0),
    };
  } catch (err) {
    console.warn('[ProHome] Balance error:', err);
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
    const categoryTotals: Record<string, number> = {};
    for (const tx of list) {
      const amount = Number(tx.amount ?? 0);
      const absAmount = Math.abs(amount);
      const txClass = classifyTx(tx, amount);
      if (txClass === 'income') income += absAmount;
      if (txClass === 'expense') {
        expense += absAmount;
        const cat = ((tx.transaction_type as Record<string, unknown> | undefined)?.name as string) || 'General';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + absAmount;
      }
    }
    monthlyIncome.value = income;
    monthlyExpense.value = expense;
    const total = income + expense;
    const rate = total > 0 ? ((income - expense) / income) * 100 : 0;
    savingsRate.value = `${Math.max(0, Math.min(100, rate)).toFixed(0)}%`;

    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxCat = sortedCats[0]?.[1] || 1;
    spendingBreakdown.value = sortedCats.map(([name, amt]) => ({
      name,
      amount: amt,
      pct: Math.max(5, Math.round((amt / maxCat) * 100)),
    }));
  } catch (err) {
    console.warn('[ProHome] Month summary error:', err);
  }
}

async function loadJars() {
  try {
    const jarsRes = await api.get('/jars', { params: { per_page: 100 } });
    const raw = jarsRes.data?.data;
    const jarsData: Record<string, unknown>[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? (raw.data as Record<string, unknown>[]) : [];
    const now = new Date();
    const balDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const results = await Promise.all(
      jarsData.map(async (jar): Promise<JarSummary | null> => {
        try {
          const jarId = Number(jar.id);
          const balRes = await api.get(`/jars/${jarId}/balance`, { params: { date: balDate } });
          const bal = balRes.data?.data || {};
          const assigned = Number(bal.allocated_amount || 0);
          const balance = Number(bal.available_balance || 0);
          const progress = assigned > 0 ? Math.min(100, Math.round((assigned - balance) / assigned * 100)) : 0;
          const tone = (jar.tone as string) || 'neutral';
          const barColor = tone === 'warn' ? 'var(--warning)' : tone === 'income' ? 'var(--income)' : 'var(--info)';
          return {
            id: jarId,
            name: typeof jar.name === 'string' ? jar.name : 'Cántaro',
            balance,
            progress,
            barColor,
          };
        } catch { return null; }
      })
    );
    jarSummary.value = results.filter((j): j is JarSummary => j !== null);
  } catch (err) {
    console.warn('[ProHome] Jars error:', err);
  }
}

async function loadRecentTransactions() {
  try {
    const now = new Date();
    const params = {
      period: 'month',
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1),
      per_page: '6',
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

    recentTransactions.value = sortedList.slice(0, 6).map((tx) => {
      const amount = Number(tx.amount ?? 0);
      return {
        id: Number(tx.id),
        name: typeof tx.name === 'string' ? tx.name : (typeof tx.description === 'string' ? tx.description : 'Transacción'),
        amount: Math.abs(amount),
        date: typeof tx.date === 'string' ? tx.date : new Date().toISOString(),
        category: ((tx.transaction_type as Record<string, unknown> | undefined)?.name as string | undefined) ?? 'General',
        type: classifyTx(tx, amount),
      };
    });
  } catch (err) {
    console.warn('[ProHome] Transactions error:', err);
  }
}

// ── Exchange Rates ─────────────────────────────────────────────────────
interface UserRate {
  id: number;
  currency_id: number;
  currency?: { id: number; name: string; code: string };
  current_rate: number;
  is_current: boolean;
  is_official: boolean;
}

const userRates = ref<UserRate[]>([]);
const rateEditId = ref<number | null>(null);

async function loadUserRates() {
  try {
    const res = await api.get('/user_currencies', { params: { per_page: 50 } });
    const compact = res.data?.rates;
    if (Array.isArray(compact) && compact.length) {
      userRates.value = compact as UserRate[];
      return;
    }
    const raw = res.data?.data?.data || res.data?.data || [];
    userRates.value = Array.isArray(raw) ? (raw as UserRate[]) : [];
  } catch { /* silent */ }
}

async function updateRate(rate: UserRate, newVal: number) {
  if (!isFinite(newVal) || newVal <= 0) return;
  const prev = rate.current_rate;
  rate.current_rate = newVal;
  try {
    await api.put(`/user_currencies/${rate.id}`, { current_rate: newVal, is_current: true });
  } catch {
    rate.current_rate = prev;
  }
}

onMounted(() => {
  void Promise.all([
    loadBalanceSummary(),
    loadMonthSummary(),
    loadJars(),
    loadRecentTransactions(),
    loadUserRates(),
  ]);
});
</script>

<style scoped lang="scss">
.pro-page {
  background: var(--bg-canvas);
  min-height: 100vh;

  &__container {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 24px 32px 32px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__delta {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: var(--radius-pill);
  }
}

.mid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.pro-card {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-card);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
}

.ghost-btn {
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

.breakdown {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--fg-1);
    width: 110px;
    flex-shrink: 0;
  }

  &__bar {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 3px;
    transition: width var(--dur-slow) var(--ease-out);
  }
}

.jars-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--fg-1);
    width: 130px;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__bar {
    flex: 1;
    height: 5px;
    border-radius: 3px;
    background: var(--surface-2);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 3px;
    transition: width var(--dur-slow) var(--ease-out);
  }

  &__pct {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--fg-2);
    width: 26px;
    text-align: right;
  }
}

.tx-dense {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 14px;
  align-items: center;
  padding: 11px 20px;
  border-top: 1px solid var(--border-hairline);
  transition: background var(--dur-base) var(--ease-out);

  &--first {
    border-top: none;
  }

  &:hover {
    background: var(--surface-2);
  }

  &__icon {
    width: 34px;
    height: 34px;
    border-radius: 17px;
    display: flex;
    align-items: center;
    justify-content: center;

    &--income {
      background: var(--income-soft);
      color: var(--income-fg);
    }

    &--expense {
      background: var(--expense-soft);
      color: var(--expense-fg);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--fg-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__date {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--fg-2);
  }

  &__tag {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    color: var(--fg-2);
    white-space: nowrap;
  }

  &__amount {
    font-family: var(--font-money);
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
  }
}

.ai-strip {
  border: 0;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, rgba(124, 58, 237, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%);
  border: 1px solid rgba(124, 58, 237, 0.15);
  transition: background 160ms ease;

  &:hover {
    background: linear-gradient(90deg, rgba(124, 58, 237, 0.14) 0%, rgba(14, 165, 233, 0.14) 100%);
  }

  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(135deg, #7C3AED, #0EA5E9);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
  }

  &__title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 15px;
    color: var(--fg-1);
  }

  &__hint {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--fg-2);
  }
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .mid-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .pro-page__container {
    padding: 16px 16px 24px;
    gap: 20px;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tx-dense {
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    padding: 12px 16px;

    &__tag {
      display: none;
    }
  }
}

// ── Exchange Rates ──
.er-card {
  padding: 20px 0 0;

  .pro-card__header {
    padding: 0 22px 14px;
    border-bottom: 1px solid var(--border-hairline);
  }

  &__hint {
    font-size: 12px;
    color: var(--fg-2);
    margin: 2px 0 0;
  }
}

.er-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 22px;
  border-top: 1px solid var(--border-hairline);

  &--first { border-top: none; }

  &__flag {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--surface-2);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-size: 10px; font-weight: 700; color: var(--fg-2);
    letter-spacing: 0.04em; flex-shrink: 0;
  }

  &__info {
    flex: 1; display: flex; flex-direction: column; gap: 1px;
  }

  &__code {
    font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--fg-1);
  }

  &__name {
    font-family: var(--font-body); font-size: 11px; color: var(--fg-2);
  }

  &__eq {
    font-family: var(--font-body); font-size: 12px; color: var(--fg-2); flex-shrink: 0;
  }

  &__input-wrap {
    display: flex; align-items: center; gap: 6px;
    background: var(--surface-2); border: 1px solid var(--border-hairline);
    border-radius: var(--radius-sm); padding: 7px 12px;
    transition: all 160ms; min-width: 130px;

    &--focus {
      background: var(--surface-1); border-color: var(--brand-primary);
    }
  }

  &__input {
    border: 0; background: transparent;
    font-family: var(--font-money); font-size: 14px; font-weight: 600; color: var(--fg-1);
    outline: none; width: 80px; font-variant-numeric: tabular-nums;
    &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { opacity: 0; }
  }

  &__code-suffix {
    font-family: var(--font-body); font-size: 12px; font-weight: 600; color: var(--fg-2);
  }
}
</style>
