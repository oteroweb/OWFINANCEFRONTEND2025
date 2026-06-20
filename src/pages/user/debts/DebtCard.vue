<template>
  <div class="dc-card" :class="{ 'dc-card--cashea': isCashea }">
    <!-- Cashea badge -->
    <div v-if="isCashea" class="dc-cashea-badge">Cashea</div>

    <!-- Header -->
    <div class="dc-header">
      <div class="dc-icon" :style="{ background: providerMeta.tint, color: providerMeta.accent }">
        <q-icon :name="providerMeta.icon" size="20px" />
      </div>
      <div class="dc-info" :style="{ paddingRight: isCashea ? '46px' : '0' }">
        <div class="dc-name">{{ debt.name }}</div>
        <div class="dc-sub">{{ debt.merchant ?? providerMeta.label }} <span v-if="debt.rate">· {{ debt.rate }}</span></div>
      </div>
      <div class="dc-actions">
        <button class="dc-icon-btn" title="Pagar cuota" @click.stop="$emit('pay', debt)">
          <q-icon name="payments" size="17px" />
        </button>
        <button class="dc-icon-btn" title="Editar" @click.stop="$emit('edit', debt)">
          <q-icon name="edit" size="17px" />
        </button>
        <button class="dc-icon-btn dc-icon-btn--danger" title="Eliminar" @click.stop="$emit('delete', debt)">
          <q-icon name="delete_outline" size="17px" />
        </button>
      </div>
    </div>

    <!-- Balance + status -->
    <div class="dc-balance-row">
      <div class="dc-balance-col">
        <div class="dc-balance-label">Pendiente</div>
        <div class="dc-balance-amount">
          <span v-if="hideValues">$ ••••</span>
          <span v-else>$ {{ fmtN(debt.balance) }}</span>
        </div>
      </div>
      <span class="dc-status-chip" :class="`dc-status-chip--${statusMeta.variant}`">
        {{ statusMeta.label }}
      </span>
    </div>

    <!-- Progress bar -->
    <div class="dc-progress-track">
      <div class="dc-progress-fill"
        :style="{ width: `${Math.min(100, debt.progress)}%`, background: statusMeta.color }" />
    </div>

    <!-- Footer -->
    <div class="dc-footer">
      <span v-if="debt.total_installments">
        Cuota <strong>{{ debt.paid_installments }}/{{ debt.total_installments }}</strong>
      </span>
      <span v-else>{{ Math.round(debt.progress) }}% pagado</span>
      <span v-if="debt.next_due_date">
        Próxima: <strong>$ {{ fmtN(debt.next_due_amount) }}</strong> · {{ debt.next_due_date }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUiStore } from 'stores/ui';

interface Debt {
  id: number;
  name: string;
  provider: string;
  merchant: string | null;
  original_amount: number;
  balance: number;
  next_due_amount: number;
  next_due_date: string | null;
  total_installments: number | null;
  paid_installments: number;
  rate: string | null;
  status: string;
  notes: string | null;
  progress: number;
}

defineOptions({ name: 'DebtCard' });
const props = defineProps<{ debt: Debt }>();
defineEmits<{ pay: [d: Debt]; edit: [d: Debt]; delete: [d: Debt] }>();

const ui = useUiStore();
const hideValues = computed(() => ui.hideValues);

const PROVIDER_META: Record<string, { label: string; icon: string; accent: string; tint: string }> = {
  cashea:   { label: 'Cashea',    icon: 'shopping_bag',    accent: '#F97316', tint: 'rgba(249,115,22,.14)' },
  card:     { label: 'Tarjeta',   icon: 'credit_card',     accent: '#EF4444', tint: 'rgba(239,68,68,.14)'  },
  loan:     { label: 'Préstamo',  icon: 'account_balance', accent: '#8B5CF6', tint: 'rgba(139,92,246,.14)' },
  personal: { label: 'Personal',  icon: 'handshake',       accent: '#0EA5E9', tint: 'rgba(14,165,233,.14)' },
};

const STATUS_META: Record<string, { label: string; variant: string; color: string }> = {
  'on-track': { label: 'Al día',   variant: 'income',  color: 'var(--income, #10b981)' },
  'due-soon': { label: 'Próximo',  variant: 'warning', color: 'var(--warning, #f59e0b)' },
  'late':     { label: 'Atrasado', variant: 'expense', color: 'var(--expense, #ef4444)' },
  'paid':     { label: 'Pagado',   variant: 'income',  color: 'var(--income, #10b981)' },
};

const isCashea     = computed(() => props.debt.provider === 'cashea');
const providerMeta = computed(() => PROVIDER_META[props.debt.provider] ?? PROVIDER_META.loan!);
const statusMeta   = computed(() => STATUS_META[props.debt.status] ?? STATUS_META['on-track']!);

function fmtN(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<style scoped lang="scss">
.dc-card {
  position: relative;
  overflow: hidden;
  background: var(--surface-1, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: 16px;
  box-shadow: var(--shadow-card, 0 1px 4px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06));
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 150ms;
  &:hover { box-shadow: 0 2px 8px rgba(0,0,0,.1), 0 8px 24px rgba(0,0,0,.08); }
}

.dc-cashea-badge {
  position: absolute;
  top: 0; right: 0;
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 3px 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-bottom-left-radius: var(--radius-md, 10px);
}

// ── Header ──
.dc-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dc-icon {
  width: 38px; height: 38px;
  border-radius: var(--radius-md, 10px);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.dc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.dc-name {
  font-family: var(--font-display, 'DM Sans', sans-serif);
  font-size: 14px;
  font-weight: 600;
  color: var(--fg-1, #0f172a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dc-sub {
  font-size: 11px;
  color: var(--fg-2, #64748b);
}

.dc-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 150ms;
  .dc-card:hover & { opacity: 1; }
}

.dc-icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--fg-3, #94a3b8);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  border-radius: 8px;
  transition: background 120ms;
  &:hover { background: var(--surface-2); color: var(--fg-1); }
  &--danger:hover { background: rgba(239,68,68,.1); color: #ef4444; }
}

// ── Balance ──
.dc-balance-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.dc-balance-col { display: flex; flex-direction: column; gap: 2px; }

.dc-balance-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--fg-2);
}

.dc-balance-amount {
  font-family: var(--font-money, monospace);
  font-size: 24px;
  font-weight: 700;
  color: var(--fg-1);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

// ── Status chip ──
.dc-status-chip {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;

  &--income  { background: rgba(16,185,129,.12); color: #065f46; }
  &--warning { background: rgba(245,158,11,.14); color: #92400e; }
  &--expense { background: rgba(239,68,68,.12);  color: #b91c1c; }
}

// ── Progress bar ──
.dc-progress-track {
  height: 5px;
  border-radius: 3px;
  background: var(--surface-2, #f1f4f6);
  overflow: hidden;
}

.dc-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 500ms ease-out;
}

// ── Footer ──
.dc-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--fg-2, #64748b);
  strong { color: var(--fg-1); }
}
</style>
