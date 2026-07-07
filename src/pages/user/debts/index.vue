<template>
  <q-page class="debts-page" padding>

    <!-- Header -->
    <div class="debts-page__header">
      <div>
        <div class="debts-eyebrow">Deudas y planes de pago</div>
        <h1 class="t-h1" style="margin:6px 0 0">Mantén el control de lo que debes</h1>
      </div>
      <button class="debts-add-btn" @click="openForm(null)">
        <q-icon name="add" size="20px" />
        Nuevo plan
      </button>
    </div>

    <!-- Summary card -->
    <div v-if="debts.length" class="debts-summary-card">
      <div class="debts-summary-card__left">
        <div class="debts-summary-card__eyebrow">Total pendiente · USD</div>
        <div class="debts-summary-card__amount">
          <span v-if="ui.hideValues" class="debts-summary-card__amount">$ ••••••</span>
          <span v-else>$ {{ fmtN(meta.total_balance) }}</span>
        </div>
        <div class="debts-summary-card__sub">
          <span v-if="meta.late_count" class="debts-status-badge debts-status-badge--late">
            <q-icon name="warning" size="14px" />
            {{ meta.late_count }} atrasada{{ meta.late_count > 1 ? 's' : '' }}
          </span>
          <span v-else class="debts-status-badge debts-status-badge--ok">
            <q-icon name="check_circle" size="14px" />
            Todo al día
          </span>
          · {{ debts.length }} planes · {{ meta.cashea_count }} en Cashea
        </div>
        <div class="debts-summary-card__sub" style="margin-top:4px">
          Próximas cuotas (30 días): <strong>{{ ui.hideValues ? '$ ••••••' : '$ ' + fmtN(meta.total_monthly) }}</strong>
        </div>
      </div>
      <div class="debts-summary-card__actions">
        <button class="debts-btn debts-btn--ghost" @click="openPayDialog()">
          <q-icon name="payments" size="17px" /> Pagar cuota
        </button>
        <button class="debts-btn debts-btn--primary" @click="openForm(null)">
          <q-icon name="add" size="17px" /> Nuevo plan
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="debts-loading">
      <q-spinner size="28px" color="primary" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!debts.length" class="debts-empty">
      <q-icon name="credit_score" size="56px" class="debts-empty__icon" />
      <div class="debts-empty__title">Sin deudas registradas</div>
      <div class="debts-empty__sub">Registra tarjetas, préstamos o planes Cashea para hacer seguimiento de lo que debes.</div>
      <button class="debts-btn debts-btn--primary" @click="openForm(null)">
        <q-icon name="add" size="18px" /> Agregar primera deuda
      </button>
    </div>

    <!-- Lists -->
    <div v-else class="debts-lists">
      <!-- Cashea group -->
      <div v-if="casheaDebts.length" class="debts-group">
        <div class="debts-group__header">
          <span class="debts-group__title">Planes Cashea</span>
          <span class="debts-chip debts-chip--warning">0% interés</span>
        </div>
        <DebtCard v-for="d in casheaDebts" :key="d.id" :debt="d"
          @pay="openPayDialog(d)" @edit="openForm(d)" @delete="confirmDelete(d)" />
      </div>

      <!-- Other debts group -->
      <div v-if="otherDebts.length" class="debts-group">
        <div class="debts-group__header">
          <span class="debts-group__title">Otras deudas</span>
        </div>
        <DebtCard v-for="d in otherDebts" :key="d.id" :debt="d"
          @pay="openPayDialog(d)" @edit="openForm(d)" @delete="confirmDelete(d)" />
      </div>
    </div>

    <!-- Add / Edit dialog -->
    <q-dialog v-model="showForm" :maximized="$q.screen.lt.md">
      <div class="debts-form-wrap" :class="{ 'debts-form-wrap--mobile': $q.screen.lt.md }">
        <div class="debts-form__header">
          <span class="debts-form__title">{{ editingDebt ? 'Editar' : 'Nueva' }} deuda</span>
          <button class="debts-form__close" @click="showForm = false"><q-icon name="close" size="22px" /></button>
        </div>

        <div class="debts-form__body">
          <!-- Name -->
          <div class="df-field">
            <label class="df-label">Nombre del plan *</label>
            <input v-model="form.name" class="df-input" placeholder="Ej: Cashea Samsung TV, Visa Mercantil…" />
          </div>

          <!-- Provider + Merchant row -->
          <div class="df-row-2">
            <div class="df-field">
              <label class="df-label">Tipo</label>
              <q-select v-model="form.provider" :options="providerOptions" emit-value map-options dense outlined />
            </div>
            <div class="df-field">
              <label class="df-label">Comercio / Entidad</label>
              <input v-model="form.merchant" class="df-input" placeholder="Samsung, Banesco…" />
            </div>
          </div>

          <!-- Original + Balance row -->
          <div class="df-row-2">
            <div class="df-field">
              <label class="df-label">Monto original *</label>
              <input v-model.number="form.original_amount" type="number" step="0.01" min="0" class="df-input" placeholder="0.00" />
            </div>
            <div class="df-field">
              <label class="df-label">Saldo pendiente *</label>
              <input v-model.number="form.balance" type="number" step="0.01" min="0" class="df-input" placeholder="0.00" />
            </div>
          </div>

          <!-- Installments -->
          <div class="df-row-2">
            <div class="df-field">
              <label class="df-label">Total cuotas</label>
              <input v-model.number="form.total_installments" type="number" min="1" class="df-input" placeholder="12" />
            </div>
            <div class="df-field">
              <label class="df-label">Cuotas pagadas</label>
              <input v-model.number="form.paid_installments" type="number" min="0" class="df-input" placeholder="0" />
            </div>
          </div>

          <!-- Due -->
          <div class="df-row-2">
            <div class="df-field">
              <label class="df-label">Próxima cuota ($)</label>
              <input v-model.number="form.next_due_amount" type="number" step="0.01" min="0" class="df-input" placeholder="0.00" />
            </div>
            <div class="df-field">
              <label class="df-label">Fecha de pago</label>
              <input v-model="form.next_due_date" type="date" class="df-input" />
            </div>
          </div>

          <!-- Rate + Status -->
          <div class="df-row-2">
            <div class="df-field">
              <label class="df-label">Tasa / interés</label>
              <input v-model="form.rate" class="df-input" placeholder="0% interés, 24% TEA…" />
            </div>
            <div class="df-field">
              <label class="df-label">Estado</label>
              <q-select v-model="form.status" :options="statusOptions" emit-value map-options dense outlined />
            </div>
          </div>

          <!-- Notes -->
          <div class="df-field">
            <label class="df-label">Notas <span class="df-label--opt">(opcional)</span></label>
            <textarea v-model="form.notes" rows="2" class="df-textarea" placeholder="Detalles adicionales…" />
          </div>

          <div v-if="formError" class="debts-error">{{ formError }}</div>
        </div>

        <div class="debts-form__footer">
          <button class="debts-btn debts-btn--ghost" @click="showForm = false">Cancelar</button>
          <button class="debts-btn debts-btn--primary" :disabled="saving || !form.name || !form.original_amount" @click="saveDebt">
            <q-spinner v-if="saving" size="15px" color="white" />
            <q-icon v-else name="check" size="17px" />
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </div>
    </q-dialog>

    <!-- Pay installment dialog -->
    <q-dialog v-model="showPay">
      <div class="debts-form-wrap" style="max-width:380px">
        <div class="debts-form__header">
          <span class="debts-form__title">Pagar cuota</span>
          <button class="debts-form__close" @click="showPay = false"><q-icon name="close" size="22px" /></button>
        </div>
        <div class="debts-form__body" style="gap:14px">
          <div v-if="payingDebt" class="df-field" style="margin-bottom:4px">
            <div style="font-weight:600;color:var(--fg-1)">{{ payingDebt.name }}</div>
            <div style="font-size:12px;color:var(--fg-2)">Saldo: $ {{ fmtN(payingDebt.balance) }}</div>
          </div>
          <div class="df-field">
            <label class="df-label">Monto a pagar *</label>
            <input v-model.number="payAmount" type="number" step="0.01" min="0.01" class="df-input"
              :placeholder="payingDebt ? payingDebt.next_due_amount.toFixed(2) : '0.00'" />
          </div>
          <div v-if="payError" class="debts-error">{{ payError }}</div>
        </div>
        <div class="debts-form__footer">
          <button class="debts-btn debts-btn--ghost" @click="showPay = false">Cancelar</button>
          <button class="debts-btn debts-btn--primary" :disabled="paying || !payAmount || payAmount <= 0" @click="doPayInstallment">
            <q-spinner v-if="paying" size="15px" color="white" />
            <q-icon v-else name="check" size="17px" />
            {{ paying ? 'Procesando…' : 'Registrar pago' }}
          </button>
        </div>
      </div>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useUiStore } from 'stores/ui';
import DebtCard from './DebtCard.vue';

defineOptions({ name: 'DebtsPage' });

const $q  = useQuasar();
const ui  = useUiStore();

// ── Types ────────────────────────────────────────────────────────────────
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

interface DebtMeta {
  total_balance: number;
  total_monthly: number;
  late_count: number;
  cashea_count: number;
  count: number;
}

// ── State ────────────────────────────────────────────────────────────────
const debts   = ref<Debt[]>([]);
const meta    = ref<DebtMeta>({ total_balance: 0, total_monthly: 0, late_count: 0, cashea_count: 0, count: 0 });
const loading = ref(false);

const casheaDebts = computed(() => debts.value.filter(d => d.provider === 'cashea'));
const otherDebts  = computed(() => debts.value.filter(d => d.provider !== 'cashea'));

// ── Form state ───────────────────────────────────────────────────────────
const showForm    = ref(false);
const saving      = ref(false);
const formError   = ref<string | null>(null);
const editingDebt = ref<Debt | null>(null);

const blankForm = () => ({
  name: '',
  provider: 'loan',
  merchant: '',
  original_amount: null as number | null,
  balance: null as number | null,
  next_due_amount: null as number | null,
  next_due_date: '',
  total_installments: null as number | null,
  paid_installments: 0,
  rate: '',
  status: 'on-track',
  notes: '',
});

const form = ref(blankForm());

const providerOptions = [
  { label: 'Préstamo', value: 'loan' },
  { label: 'Tarjeta de crédito', value: 'card' },
  { label: 'Cashea', value: 'cashea' },
  { label: 'Deuda personal', value: 'personal' },
];

const statusOptions = [
  { label: 'Al día', value: 'on-track' },
  { label: 'Próximo vencimiento', value: 'due-soon' },
  { label: 'Atrasado', value: 'late' },
  { label: 'Pagado', value: 'paid' },
];

// ── Pay state ────────────────────────────────────────────────────────────
const showPay     = ref(false);
const paying      = ref(false);
const payError    = ref<string | null>(null);
const payAmount   = ref<number | null>(null);
const payingDebt  = ref<Debt | null>(null);

// ── Helpers ──────────────────────────────────────────────────────────────
function fmtN(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Load ─────────────────────────────────────────────────────────────────
async function loadDebts() {
  loading.value = true;
  try {
    const res = await api.get<{ data: Debt[]; meta: DebtMeta }>('/debts');
    debts.value = res.data?.data ?? [];
    meta.value  = res.data?.meta ?? meta.value;
  } catch { /* silent */ }
  finally { loading.value = false; }
}

onMounted(() => void loadDebts());

// ── Form open/save ────────────────────────────────────────────────────────
function openForm(debt: Debt | null) {
  editingDebt.value = debt;
  form.value = debt ? {
    name: debt.name,
    provider: debt.provider,
    merchant: debt.merchant ?? '',
    original_amount: debt.original_amount,
    balance: debt.balance,
    next_due_amount: debt.next_due_amount,
    next_due_date: debt.next_due_date ?? '',
    total_installments: debt.total_installments,
    paid_installments: debt.paid_installments,
    rate: debt.rate ?? '',
    status: debt.status,
    notes: debt.notes ?? '',
  } : blankForm();
  formError.value = null;
  showForm.value  = true;
}

async function saveDebt() {
  if (!form.value.name || !form.value.original_amount) return;
  saving.value = true;
  formError.value = null;
  try {
    const payload = {
      ...form.value,
      balance: form.value.balance ?? form.value.original_amount,
      next_due_amount: form.value.next_due_amount ?? 0,
      merchant: form.value.merchant || null,
      rate: form.value.rate || null,
      notes: form.value.notes || null,
      next_due_date: form.value.next_due_date || null,
      total_installments: form.value.total_installments || null,
    };

    if (editingDebt.value) {
      await api.put(`/debts/${editingDebt.value.id}`, payload);
      $q.notify({ type: 'positive', message: 'Deuda actualizada' });
    } else {
      await api.post('/debts', payload);
      $q.notify({ type: 'positive', message: 'Deuda agregada' });
    }
    showForm.value = false;
    void loadDebts();
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    formError.value = e?.response?.data?.message ?? 'Error al guardar';
  } finally {
    saving.value = false;
  }
}

// ── Pay ──────────────────────────────────────────────────────────────────
function openPayDialog(debt?: Debt) {
  payingDebt.value = debt ?? (debts.value[0] ?? null);
  payAmount.value  = payingDebt.value?.next_due_amount ?? null;
  payError.value   = null;
  showPay.value    = true;
}

async function doPayInstallment() {
  if (!payingDebt.value || !payAmount.value) return;
  paying.value = true;
  payError.value = null;
  try {
    await api.post(`/debts/${payingDebt.value.id}/pay`, { amount: payAmount.value });
    $q.notify({ type: 'positive', message: 'Pago registrado' });
    showPay.value = false;
    void loadDebts();
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    payError.value = e?.response?.data?.message ?? 'Error al registrar pago';
  } finally {
    paying.value = false;
  }
}

// ── Delete ───────────────────────────────────────────────────────────────
function confirmDelete(debt: Debt) {
  $q.dialog({
    title: 'Eliminar deuda',
    message: `¿Eliminar "${debt.name}"? Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Eliminar', color: 'negative', flat: true },
  }).onOk(() => {
    void (async () => {
      try {
        await api.delete(`/debts/${debt.id}`);
        $q.notify({ type: 'positive', message: 'Deuda eliminada' });
        void loadDebts();
      } catch { $q.notify({ type: 'negative', message: 'Error al eliminar' }); }
    })();
  });
}
</script>

<style scoped lang="scss">
.debts-page {
  max-width: 860px;
  margin: 0 auto;
}

.debts-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.debts-eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--fg-3, #94a3b8);
}

// ── Summary card ──
.debts-summary-card {
  background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);
  border-radius: var(--radius-xl, 20px);
  padding: 22px 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 28px;
  box-shadow: 0 8px 28px rgba(239, 68, 68, 0.3);

  &__eyebrow {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255,255,255,0.7);
    margin-bottom: 6px;
  }

  &__amount {
    font-family: var(--font-money, monospace);
    font-size: 38px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;
    margin-bottom: 12px;
  }

  &__sub {
    font-size: 12px;
    color: rgba(255,255,255,0.85);
  }

  &__actions { display: flex; gap: 8px; align-items: flex-end; }
}

// ── Groups ──
.debts-lists { display: flex; flex-direction: column; gap: 28px; }

.debts-group {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__title {
    font-family: var(--font-display, 'DM Sans', sans-serif);
    font-size: 15px;
    font-weight: 700;
    color: var(--fg-1, #0f172a);
  }
}

// ── Chips ──
.debts-chip {
  display: inline-flex;
  align-items: center;
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  &--warning { background: rgba(251,191,36,.15); color: #b45309; }
  &--income  { background: rgba(16,185,129,.12); color: #065f46; }
  &--expense { background: rgba(239,68,68,.12);  color: #b91c1c; }
}

.debts-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  &--late { background: rgba(239,68,68,.12); color: #b91c1c; }
  &--ok   { background: rgba(16,185,129,.12); color: #065f46; }
}

// ── Empty state ──
.debts-loading {
  display: flex; justify-content: center; padding: 48px 0;
}

.debts-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 24px;
  gap: 14px;

  &__icon { color: var(--fg-3, #94a3b8); }
  &__title { font-family: var(--font-display, sans-serif); font-size: 18px; font-weight: 700; color: var(--fg-1); }
  &__sub { font-size: 13px; color: var(--fg-2, #64748b); max-width: 360px; }
}

// ── Buttons ──
.debts-add-btn, .debts-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: none;
  border-radius: 999px;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 140ms;
}

.debts-add-btn {
  padding: 10px 18px;
  background: var(--brand-primary, #2d4da6);
  color: #fff;
  box-shadow: 0 4px 14px rgba(45,77,166,.28);
  &:hover { opacity: .9; }
}

.debts-btn {
  padding: 10px 18px;
  &--primary {
    background: var(--brand-primary, #2d4da6);
    color: #fff;
    box-shadow: 0 4px 12px rgba(45,77,166,.28);
    &:hover:not(:disabled) { opacity: .9; }
    &:disabled { opacity: .5; cursor: not-allowed; }
  }
  &--ghost {
    background: var(--surface-2, #f1f4f6);
    color: var(--fg-2, #64748b);
    &:hover { background: var(--surface-3, #e2e8f0); }
  }
}

// ── Error ──
.debts-error {
  padding: 10px 13px;
  border-radius: 8px;
  background: rgba(239,68,68,.1);
  color: #b91c1c;
  font-size: 13px;
}

// ── Form dialog ──
.debts-form-wrap {
  background: var(--surface-1, #fff);
  border-radius: var(--radius-xl, 20px);
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &--mobile {
    border-radius: 22px 22px 0 0;
    max-width: none;
    max-height: 92vh;
    overflow-y: auto;
    align-self: flex-end;
  }
}

.debts-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px 14px;
}

.debts-form__title {
  font-family: var(--font-display, sans-serif);
  font-size: 17px;
  font-weight: 700;
  color: var(--fg-1);
}

.debts-form__close {
  border: none; background: transparent; cursor: pointer;
  color: var(--fg-3); display: flex; padding: 4px;
  border-radius: 8px;
  &:hover { background: var(--surface-2); }
}

.debts-form__body {
  padding: 0 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.debts-form__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 22px 22px;
  border-top: 1px solid var(--border-hairline, #e2e8f0);
}

// ── Form fields ──
.df-field { display: flex; flex-direction: column; gap: 5px; }

.df-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--fg-2, #64748b);
  &--opt { font-weight: 400; color: var(--fg-3); }
}

.df-input, .df-textarea {
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: 8px;
  padding: 10px 13px;
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  color: var(--fg-1, #0f172a);
  background: var(--surface-2, #f8fafc);
  outline: none;
  box-sizing: border-box;
  width: 100%;
  &:focus { border-color: var(--brand-primary); background: var(--surface-1); }
  &::placeholder { color: var(--fg-3); }
}

.df-textarea { resize: none; line-height: 1.5; }

.df-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}
</style>
