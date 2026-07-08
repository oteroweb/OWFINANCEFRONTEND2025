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
              {{ mode === 'edit' ? 'Editar movimiento' : 'Detalle del movimiento' }}
              {{ layoutMode === 'pro' ? ' · Pro' : ' · Lite' }}
            </div>
            <div class="t-h2" style="margin-top: 4px;">
              {{ mode === 'edit' ? 'Editar' : tx.name }}
            </div>
          </div>
          <button class="txdm__close-btn" @click="isOpen = false" aria-label="Cerrar">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Hero amount -->
        <div
          class="txdm__hero"
          :style="{ background: isIncome ? 'var(--income-soft)' : 'var(--expense-soft)' }"
        >
          <div
            class="txdm__hero-icon"
            :style="{ color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)' }"
          >
            <span class="material-icons">{{ isIncome ? 'arrow_downward' : 'arrow_outward' }}</span>
          </div>
          <div class="txdm__hero-info">
            <div
              class="txdm__hero-amount"
              :style="{ color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)' }"
            >
              {{ isHidden ? '$ ••••••' : `${isIncome ? '+' : '−'} $ ${fmtAmt(Math.abs(form.amount))}` }}
            </div>
            <div class="txdm__hero-date">{{ fmtDate(tx.date) }}</div>
          </div>
        </div>

        <!-- ── VIEW MODE ── -->
        <template v-if="mode === 'view'">
          <div class="txdm__fields">
            <div class="txdm__field">
              <span class="material-icons txdm__field-icon">swap_vert</span>
              <span class="txdm__field-label">Tipo</span>
              <span class="txdm__field-value" :style="{ color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)' }">
                <span class="txdm__dot" :style="{ background: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)' }" />
                {{ isIncome ? 'Ingreso' : 'Gasto' }}
              </span>
            </div>
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
            <div class="txdm__field">
              <span class="material-icons txdm__field-icon">event</span>
              <span class="txdm__field-label">Fecha</span>
              <span class="txdm__field-value">{{ fmtDateLong(tx.date) }}</span>
            </div>
          </div>

          <!-- Delete confirm inline -->
          <div v-if="mode === 'view' && confirmDelete" class="txdm__confirm-delete">
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
            <button class="txdm__btn txdm__btn--primary" @click="mode = 'edit'">
              <span class="material-icons">edit</span> Editar
            </button>
          </div>
        </template>

        <!-- ── EDIT MODE ── -->
        <template v-if="mode === 'edit'">
          <div class="txdm__edit-body">

            <!-- Type toggle -->
            <div class="txdm__type-seg">
              <button
                class="txdm__type-btn"
                :class="{ 'txdm__type-btn--active-expense': form.txType === 'expense' }"
                @click="form.txType = 'expense'"
              >
                <span class="material-icons">arrow_outward</span> Gasto
              </button>
              <button
                class="txdm__type-btn"
                :class="{ 'txdm__type-btn--active-income': form.txType === 'income' }"
                @click="form.txType = 'income'"
              >
                <span class="material-icons">arrow_downward</span> Ingreso
              </button>
            </div>

            <!-- Amount -->
            <div class="txdm__amount-field">
              <span class="txdm__amount-prefix">$</span>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                min="0"
                class="txdm__amount-input"
                placeholder="0.00"
              />
            </div>

            <!-- Concept -->
            <div class="txdm__field-group">
              <label class="txdm__field-label-edit">Concepto</label>
              <div class="txdm__text-input-wrap">
                <span class="material-icons txdm__input-icon">notes</span>
                <input v-model="form.name" type="text" class="txdm__text-input" placeholder="Ej: Mercado del super" />
              </div>
            </div>

            <!-- Category + Jar row -->
            <div class="txdm__row-2col">
              <div class="txdm__field-group" style="flex: 1;">
                <label class="txdm__field-label-edit">Categoría</label>
                <CategorySelector v-model="form.category_id" allow-null placeholder="Sin categoría" />
              </div>
              <div class="txdm__field-group" style="flex: 1;">
                <label class="txdm__field-label-edit">Cántaro <span class="txdm__hint">· anclado a la categoría</span></label>
                <AnchoredJarChip :category-id="form.category_id" />
              </div>
            </div>

            <!-- Account (Pro only) -->
            <div v-if="layoutMode === 'pro'" class="txdm__field-group">
              <label class="txdm__field-label-edit">Cuenta</label>
              <q-select
                v-model="form.account_id"
                :options="accountOptions"
                option-value="id"
                option-label="label"
                emit-value
                map-options
                outlined
                dense
                placeholder="Seleccionar cuenta"
              />
            </div>

          </div>

          <!-- Edit footer -->
          <div class="txdm__footer">
            <button class="txdm__btn txdm__btn--ghost" @click="mode = 'view'">Cancelar</button>
            <button class="txdm__btn txdm__btn--primary" :disabled="saving" @click="doSave">
              <span class="material-icons">check</span>
              {{ saving ? 'Guardando…' : 'Guardar cambios' }}
            </button>
          </div>
        </template>

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
import CategorySelector from 'components/CategorySelector.vue';
import { jarForCategory, getCachedJars, loadCategoriesWithJars, loadUserJars } from 'src/utils/txCatalog';

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
  transaction_type_id: number | null;
}

interface AccountOption {
  id: number;
  label: string;
  color?: string;
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
const mode = ref<'view' | 'edit'>('view');
const tx = ref<TxDetail | null>(null);
const accountOptions = ref<AccountOption[]>([]);

const form = ref({
  txType: 'expense' as 'income' | 'expense',
  amount: 0,
  name: '',
  category_id: null as number | null,
  account_id: null as number | null,
});

const isIncome = computed(() =>
  mode.value === 'edit' ? form.value.txType === 'income' : (tx.value?.amount ?? 0) > 0
);

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
  mode.value = 'view';
  confirmDelete.value = false;
  tx.value = null;
  try {
    await Promise.all([loadCategoriesWithJars(), loadUserJars()]);
    const [txRes, acctRes] = await Promise.all([
      api.get(`/transactions/${id}`),
      api.get('/accounts'),
    ]);
    const raw = txRes.data?.data ?? txRes.data;
    const paymentLegs: { account?: { name?: string; color?: string; id?: number } }[] =
      raw.payment_transactions ?? raw.paymentTransactions ?? [];
    const firstLeg = paymentLegs[0];
    tx.value = {
      id: raw.id,
      name: raw.name,
      amount: raw.amount,
      date: raw.date ?? raw.created_at,
      category_id: raw.category_id ?? null,
      category_name: raw.category?.name ?? raw.category_name ?? null,
      account_id: firstLeg?.account?.id ?? raw.account_id ?? null,
      account_name: firstLeg?.account?.name ?? raw.account_name ?? null,
      account_color: firstLeg?.account?.color ?? null,
      transaction_type_id: raw.transaction_type_id ?? null,
    };
    form.value = {
      txType: (raw.amount ?? 0) > 0 ? 'income' : 'expense',
      amount: Math.abs(raw.amount ?? 0),
      name: raw.name ?? '',
      category_id: raw.category_id ?? null,
      account_id: tx.value.account_id,
    };
    const accounts: { id: number; name: string; color?: string }[] =
      acctRes.data?.data ?? acctRes.data ?? [];
    accountOptions.value = accounts.map((a): AccountOption => {
      const opt: AccountOption = { id: a.id, label: a.name };
      if (a.color !== undefined) opt.color = a.color;
      return opt;
    });
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo cargar la transacción' });
    isOpen.value = false;
  } finally {
    loading.value = false;
  }
}

async function doSave() {
  if (!tx.value) return;
  saving.value = true;
  try {
    const derivedJarId = jarForCategory(form.value.category_id, getCachedJars())?.id ?? null;
    const sign = form.value.txType === 'income' ? 1 : -1;
    await api.patch(`/transactions/${tx.value.id}`, {
      name: form.value.name,
      amount: sign * Math.abs(form.value.amount),
      category_id: form.value.category_id,
      jar_id: derivedJarId,
      account_id: form.value.account_id,
    });
    $q.notify({ type: 'positive', message: 'Transacción actualizada' });
    emit('saved');
    isOpen.value = false;
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar' });
  } finally {
    saving.value = false;
  }
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
  mode.value = 'view';
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
