<template>
  <q-dialog
    v-model="isOpen"
    :maximized="$q.screen.lt.sm"
    transition-show="jump-up"
    transition-hide="jump-down"
    @before-hide="onClose"
  >
    <q-card class="txdm" style="width: 100%; max-width: 520px; border-radius: var(--radius-xl); overflow: hidden;">

      <!-- Loading -->
      <div v-if="loading" class="txdm__loading">
        <q-spinner color="primary" size="32px" />
      </div>

      <template v-else-if="tx">
        <!-- Header -->
        <div class="txdm__header">
          <div>
            <div class="t-eyebrow">
              Detalle del movimiento
              {{ layoutMode === 'pro' ? ' · Pro' : ' · Lite' }}
            </div>
            <div class="t-h2" style="margin-top: 4px;">
              {{ tx.name }}
            </div>
          </div>
          <button class="txdm__close-btn" @click="isOpen = false" aria-label="Cerrar">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Hero amount -->
        <div
          class="txdm__hero"
          :style="{ background: heroSoftBg }"
        >
          <div
            class="txdm__hero-icon"
            :style="{ color: heroFg }"
          >
            <span class="material-icons">{{ heroIcon }}</span>
          </div>
          <div class="txdm__hero-info">
            <div
              class="txdm__hero-amount"
              :style="{ color: heroFg }"
            >
              {{ isHidden ? '$ ••••••' : `${txType === 'transfer' ? '' : (isIncome ? '+ ' : '− ')}$ ${fmtAmt(Math.abs(tx.amount))}` }}
            </div>
            <div class="txdm__hero-date">{{ fmtDate(tx.date) }}</div>
          </div>
        </div>

        <!-- ── VIEW MODE (solo lectura; edición delega a SmartTransactionModal) ── -->
        <div class="txdm__fields">
            <div class="txdm__field">
              <span class="material-icons txdm__field-icon">swap_vert</span>
              <span class="txdm__field-label">Tipo</span>
              <span class="txdm__field-value" :style="{ color: heroFg }">
                <span class="txdm__dot" :style="{ background: heroFg }" />
                {{ txType === 'transfer' ? 'Transferencia' : (isIncome ? 'Ingreso' : 'Gasto') }}
              </span>
            </div>
            <template v-if="txType !== 'transfer'">
              <div class="txdm__field">
                <span class="material-icons txdm__field-icon">label</span>
                <span class="txdm__field-label">Categoría</span>
                <span class="txdm__field-value">{{ tx.category_name || 'Sin categoría' }}</span>
              </div>
              <div class="txdm__field">
                <span class="material-icons txdm__field-icon">savings</span>
                <span class="txdm__field-label">Cántaro</span>
                <span class="txdm__field-value">
                  <AnchoredJarChip :category-id="tx.category_id ?? null" compact />
                </span>
              </div>
              <div v-if="tx.account_name" class="txdm__field">
                <span class="material-icons txdm__field-icon">account_balance_wallet</span>
                <span class="txdm__field-label">Cuenta</span>
                <span class="txdm__field-value">
                  <span v-if="tx.account_color" class="txdm__dot" :style="{ background: tx.account_color }" />
                  {{ tx.account_name }}
                </span>
              </div>
            </template>
            <template v-else>
              <div class="txdm__field">
                <span class="material-icons txdm__field-icon">account_balance_wallet</span>
                <span class="txdm__field-label">Origen</span>
                <span class="txdm__field-value">
                  <span v-if="tx.account_color" class="txdm__dot" :style="{ background: tx.account_color }" />
                  {{ tx.account_name || '—' }}
                </span>
              </div>
              <div class="txdm__field">
                <span class="material-icons txdm__field-icon">arrow_forward</span>
                <span class="txdm__field-label">Destino</span>
                <span class="txdm__field-value">
                  <span v-if="tx.account_to_color" class="txdm__dot" :style="{ background: tx.account_to_color }" />
                  {{ tx.account_to_name || '—' }}
                </span>
              </div>
            </template>
            <div class="txdm__field">
              <span class="material-icons txdm__field-icon">event</span>
              <span class="txdm__field-label">Fecha</span>
              <span class="txdm__field-value">{{ fmtDateLong(tx.date) }}</span>
            </div>
          </div>

        <!-- Delete confirm inline -->
        <div v-if="confirmDelete" class="txdm__confirm-delete">
          <div class="txdm__confirm-delete__text">¿Eliminar este movimiento? No se puede deshacer.</div>
          <div class="txdm__confirm-delete__actions">
            <button class="txdm__btn txdm__btn--ghost" @click="confirmDelete = false">Cancelar</button>
            <button class="txdm__btn txdm__btn--danger" :disabled="saving" @click="doDelete">
              <span class="material-icons">delete</span>
              {{ saving ? 'Eliminando…' : 'Eliminar' }}
            </button>
          </div>
        </div>

        <!-- View footer -->
        <div v-if="!confirmDelete" class="txdm__footer">
          <button class="txdm__btn txdm__btn--danger-ghost" @click="confirmDelete = true">
            <span class="material-icons">delete_outline</span> Eliminar
          </button>
          <button class="txdm__btn txdm__btn--ghost" @click="doDuplicate">
            <span class="material-icons">content_copy</span> Duplicar
          </button>
          <div style="flex: 1;" />
          <button class="txdm__btn txdm__btn--ghost" @click="isOpen = false">Cerrar</button>
          <button class="txdm__btn txdm__btn--primary" @click="editTx">
            <span class="material-icons">edit</span> Editar
          </button>
        </div>
      </template>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useUiStore } from 'stores/ui';
import AnchoredJarChip from 'components/AnchoredJarChip.vue';
import { loadCategoriesWithJars, loadUserJars } from 'src/utils/txCatalog';

interface TxDetail {
  id: number;
  name: string;
  amount: number;
  date: string;
  category_id: number | null;
  category_name: string | null;
  account_id: number | null;
  account_name: string | null;
  account_color: string | null;
  account_to_name: string | null;
  account_to_color: string | null;
  transaction_type_id: number | null;
  transaction_type_name: string | null;
  transaction_type_slug: string | null;
}

const props = defineProps<{
  txId: number | null;
  layoutMode?: 'lite' | 'pro';
}>();

const emit = defineEmits<{
  'saved': [];
  'deleted': [];
}>();

const $q = useQuasar();
const ui = useUiStore();

const isOpen = defineModel<boolean>({ required: true });

const isHidden = computed(() => ui.hideValues);

const loading = ref(false);
const saving = ref(false);
const confirmDelete = ref(false);
const tx = ref<TxDetail | null>(null);

// OWF-325: transactions.amount se guarda siempre en positivo (el signo real vive
// en payment_transactions[].amount) — inferir el tipo por el signo de amount falla
// siempre para gastos. Mismo patrón que deriveTypeFromTx()/classifyTx() ya usan
// SmartTransactionModal.vue / LiteHomeView.vue: transaction_type primero, signo de
// amount solo como último fallback (transacciones legacy sin type asignado).
function deriveType(t: TxDetail | null): 'income' | 'expense' | 'transfer' {
  if (!t) return 'expense';
  const text = `${t.transaction_type_name ?? ''} ${t.transaction_type_slug ?? ''}`.toLowerCase();
  if (t.transaction_type_id === 4 || text.includes('transfer') || text.includes('traspaso')) return 'transfer';
  if (text.includes('income') || text.includes('ingreso')) return 'income';
  if (text.includes('expense') || text.includes('gasto')) return 'expense';
  return t.amount >= 0 ? 'income' : 'expense';
}

const txType = computed(() => deriveType(tx.value));
const isIncome = computed(() => txType.value === 'income');

// OWF-335: la transferencia usaba los mismos colores/ícono de "Gasto" (isIncome=false
// para transfer) porque el hero/campo Tipo solo distinguían income/expense — se veía
// como un gasto normal en vez de un movimiento propio entre cuentas.
const heroFg = computed(() => {
  if (txType.value === 'transfer') return 'var(--brand-primary, #8b5cf6)';
  return isIncome.value ? 'var(--income-fg)' : 'var(--expense-fg)';
});
const heroSoftBg = computed(() => {
  if (txType.value === 'transfer') return 'rgba(139, 92, 246, 0.12)';
  return isIncome.value ? 'var(--income-soft)' : 'var(--expense-soft)';
});
const heroIcon = computed(() => {
  if (txType.value === 'transfer') return 'swap_horiz';
  return isIncome.value ? 'arrow_downward' : 'arrow_outward';
});

function fmtAmt(n: number): string {
  return Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string | null): string {
  if (!d) return '';
  const dt = new Date(d.replace(' ', 'T'));
  return dt.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

function fmtDateLong(d: string | null): string {
  if (!d) return '';
  const dt = new Date(d.replace(' ', 'T'));
  return dt.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

async function loadTx(id: number) {
  loading.value = true;
  confirmDelete.value = false;
  tx.value = null;
  try {
    await Promise.all([loadCategoriesWithJars(), loadUserJars()]);
    const txRes = await api.get(`/transactions/${id}`);
    const raw = txRes.data?.data ?? txRes.data;
    const paymentLegs: { amount?: number | string; account?: { name?: string; color?: string; id?: number } }[] =
      raw.payment_transactions ?? raw.paymentTransactions ?? [];
    // OWF-335: en una transferencia los legs no vienen ordenados por dirección — hay que
    // identificar origen/destino por el signo del monto (negativo=origen, positivo=destino),
    // no asumir que payment_transactions[0] es siempre el origen.
    const fromLeg = paymentLegs.find(p => Number(p.amount) < 0) ?? paymentLegs[0];
    const toLeg = paymentLegs.find(p => Number(p.amount) > 0);
    tx.value = {
      id: raw.id,
      name: raw.name,
      amount: raw.amount,
      date: raw.date ?? raw.created_at,
      category_id: raw.category_id ?? null,
      category_name: raw.category?.name ?? raw.category_name ?? null,
      account_id: fromLeg?.account?.id ?? raw.account_id ?? null,
      account_name: fromLeg?.account?.name ?? raw.account_name ?? null,
      account_color: fromLeg?.account?.color ?? null,
      account_to_name: toLeg?.account?.name ?? null,
      account_to_color: toLeg?.account?.color ?? null,
      transaction_type_id: raw.transaction_type_id ?? null,
      transaction_type_name: raw.transaction_type?.name ?? null,
      transaction_type_slug: raw.transaction_type?.slug ?? null,
    };
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo cargar la transacción' });
    isOpen.value = false;
  } finally {
    loading.value = false;
  }
}

// OWF-adhoc: "Editar" ya no usa un mini-form propio (sin soporte de transferencia/
// comisión) — abre SmartTransactionModal.vue prellenado (ui.openSmartModalForEdit),
// el mismo formulario real de "crear". Este sheet queda como vista de SOLO LECTURA.
function editTx() {
  if (!tx.value) return;
  isOpen.value = false;
  ui.openSmartModalForEdit(tx.value.id);
}

async function doDelete() {
  if (!tx.value) return;
  saving.value = true;
  try {
    await api.delete(`/transactions/${tx.value.id}`);
    $q.notify({ type: 'positive', message: 'Transacción eliminada' });
    emit('deleted');
    isOpen.value = false;
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar' });
  } finally {
    saving.value = false;
  }
}

async function doDuplicate() {
  if (!tx.value) return;
  try {
    const sign = (tx.value.amount ?? 0) > 0 ? 1 : -1;
    await api.post('/transactions', {
      name: `${tx.value.name} (copia)`,
      amount: sign * Math.abs(tx.value.amount),
      category_id: tx.value.category_id,
      account_id: tx.value.account_id,
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
    $q.notify({ type: 'positive', message: 'Transacción duplicada' });
    emit('saved');
    isOpen.value = false;
  } catch {
    $q.notify({ type: 'negative', message: 'Error al duplicar' });
  }
}

function onClose() {
  confirmDelete.value = false;
  tx.value = null;
}

watch(
  () => props.txId,
  (id) => { if (id != null && isOpen.value) void loadTx(id); }
);

watch(isOpen, (v) => {
  if (v && props.txId != null) void loadTx(props.txId);
  if (!v) onClose();
});
</script>

<style scoped lang="scss">
.txdm {
  background: var(--surface-1);

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 22px 22px 16px;
  }

  &__close-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--border-hairline);
    background: var(--surface-2);
    color: var(--fg-2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    &:hover { background: var(--surface-3); }
    .material-icons { font-size: 18px; }
  }

  &__hero {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    margin: 0 18px 18px;
    border-radius: var(--radius-md);
  }

  &__hero-icon {
    width: 46px;
    height: 46px;
    border-radius: 23px;
    background: var(--surface-1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    .material-icons { font-size: 22px; }
  }

  &__hero-amount {
    font-family: var(--font-money, 'Roboto Mono', monospace);
    font-weight: 700;
    font-size: 26px;
    font-variant-numeric: tabular-nums;
  }

  &__hero-date {
    font-size: 12.5px;
    color: var(--fg-2);
    margin-top: 2px;
  }

  &__fields {
    padding: 0 18px;
  }

  &__field {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 0;
    border-top: 1px solid var(--border-hairline);
  }

  &__field-icon {
    font-size: 18px !important;
    color: var(--fg-3);
    flex-shrink: 0;
  }

  &__field-label {
    flex: 1;
    font-size: 13.5px;
    color: var(--fg-2);
  }

  &__field-value {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--fg-1);
    text-align: right;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__confirm-delete {
    margin: 12px 18px;
    padding: 14px 16px;
    border-radius: var(--radius-md);
    background: var(--expense-soft);

    &__text {
      font-size: 13.5px;
      color: var(--expense-fg);
      font-weight: 600;
      margin-bottom: 12px;
    }

    &__actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
  }

  &__footer {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 16px 18px;
    border-top: 1px solid var(--border-hairline);
    margin-top: 12px;
  }

  &__edit-body {
    padding: 0 18px 4px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 60vh;
    overflow-y: auto;
  }

  &__type-seg {
    display: flex;
    gap: 8px;
    background: var(--surface-2);
    border-radius: var(--radius-md);
    padding: 4px;
  }

  &__type-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 14px;
    border: none;
    border-radius: calc(var(--radius-md) - 2px);
    background: transparent;
    color: var(--fg-2);
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    .material-icons { font-size: 16px; }

    &--active-expense {
      background: var(--surface-1);
      color: var(--expense-fg);
      box-shadow: 0 1px 4px rgba(0,0,0,0.10);
    }
    &--active-income {
      background: var(--surface-1);
      color: var(--income-fg);
      box-shadow: 0 1px 4px rgba(0,0,0,0.10);
    }
  }

  &__amount-field {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--surface-2);
    border-radius: var(--radius-md);
    padding: 14px 18px;
  }

  &__amount-prefix {
    font-size: 22px;
    color: var(--fg-3);
    font-weight: 600;
  }

  &__amount-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 28px;
    font-weight: 700;
    color: var(--fg-1);
    font-family: var(--font-money, 'Roboto Mono', monospace);
    font-variant-numeric: tabular-nums;
    outline: none;
    width: 100%;
    &::placeholder { color: var(--fg-4); }
  }

  &__field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__field-label-edit {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--fg-2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__hint {
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
  }

  &__row-2col {
    display: flex;
    gap: 14px;
    @media (max-width: 480px) { flex-direction: column; }
  }

  &__text-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--surface-2);
    border: 1px solid var(--border-hairline);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    &:focus-within { border-color: var(--brand-primary); }
  }

  &__input-icon {
    font-size: 18px !important;
    color: var(--fg-3);
    flex-shrink: 0;
  }

  &__text-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 14px;
    color: var(--fg-1);
    outline: none;
    &::placeholder { color: var(--fg-3); }
  }

  // Buttons
  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    cursor: pointer;
    padding: 11px 18px;
    border-radius: var(--radius-pill, 999px);
    font-size: 13.5px;
    font-weight: 700;
    transition: all 0.15s;
    .material-icons { font-size: 17px; }

    &--primary {
      background: var(--brand-primary, var(--info));
      color: #fff;
      &:hover { opacity: 0.88; }
      &:disabled { opacity: 0.5; cursor: default; }
    }
    &--ghost {
      background: var(--surface-2);
      color: var(--fg-2);
      &:hover { background: var(--surface-3); }
    }
    &--danger-ghost {
      background: transparent;
      color: var(--expense-fg);
      &:hover { background: var(--expense-soft); }
    }
    &--danger {
      background: var(--expense, #e53935);
      color: #fff;
      &:hover { opacity: 0.88; }
      &:disabled { opacity: 0.5; cursor: default; }
    }
  }
}
</style>
