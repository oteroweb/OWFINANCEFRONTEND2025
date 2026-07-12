<template>
  <!-- OWF-184: preview + validación. OWF-296: look del rediseño (TfReview en TransactionForm.jsx):
       ícono de ojo + eyebrow "VAS A REGISTRAR" + resumen en lenguaje natural (tx-summary.js),
       tokens dark-safe en lugar de rgba negros. -->
  <div
    class="tf-review-card"
    :class="{
      'tf-review-card--draft': state === 'draft',
      'tf-review-card--valid': state === 'valid',
      'tf-review-card--error': state === 'error',
    }"
    :style="{ '--tf-accent': accent || 'var(--brand-primary)' }"
  >
    <q-icon
      class="tf-review-card__eye"
      :name="state === 'error' ? 'error_outline' : 'visibility'"
      size="20px"
    />
    <div class="tf-review-card__main">
      <div class="tf-review-card__eyebrow">Vas a registrar</div>
      <div class="tf-review-card__summary">{{ summaryText }}</div>
      <ul v-if="validationErrors.length" class="tf-review-card__errors">
        <li v-for="(err, i) in validationErrors" :key="i" class="tf-review-card__error">
          <q-icon name="error_outline" size="15px" class="tf-review-card__error-icon" />
          {{ err }}
        </li>
      </ul>
      <div v-if="debugPayload != null" class="tf-review-card__debug">
        <button class="tf-review-card__debug-btn" @click="showPayload = !showPayload">
          <q-icon :name="showPayload ? 'expand_less' : 'expand_more'" size="14px" />
          Ver payload
        </button>
        <pre v-if="showPayload" class="tf-review-card__debug-pre">{{ JSON.stringify(debugPayload, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  typeLabel: string;
  isAdjuste: boolean;
  isTransfer: boolean;
  amount: number | null;
  name: string;
  categoryName?: string | null;
  accountName?: string | null;
  fromAccountName?: string | null;
  toAccountName?: string | null;
  datetime: string;
  adjusteAccountName?: string | null;
  adjusteTargetBalance?: number | null;
  adjusteMotivo?: string;
  validationErrors: string[];
  debugPayload?: unknown;
  // OWF-296: fraseo/estilo del rediseño
  accent?: string;
  currencySymbol?: string;
  jarName?: string | null;
  crossArrivesAmount?: number | null;
  toCurrencySymbol?: string | null;
}

defineOptions({ name: 'TfReviewCard' });

const props = defineProps<Props>();

const showPayload = ref(false);

type ReviewState = 'draft' | 'valid' | 'error';

// tfMoney/owfMoney del rediseño: símbolo + NBSP + cifra en-US con 2 decimales
function money(n: number | null | undefined, sym?: string): string {
  const s = sym || props.currencySymbol || '$';
  const v = Math.abs(Number(n) || 0);
  return `${s} ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// "Borrador/incompleto": aún no hay suficientes datos para intentar validar en serio.
const isDraft = computed(() => {
  if (props.isAdjuste) {
    return !props.adjusteAccountName && props.adjusteTargetBalance == null && !props.adjusteMotivo;
  }
  const noAmount = props.amount == null || Number(props.amount) === 0;
  const noName = !props.name || !props.name.trim();
  const noAccount = props.isTransfer
    ? !props.fromAccountName && !props.toAccountName
    : !props.accountName;
  return noAmount && noName && noAccount;
});

const state = computed<ReviewState>(() => {
  if (isDraft.value) return 'draft';
  if (props.validationErrors.length) return 'error';
  return 'valid';
});

// Fraseo portado de rediseno/tx-summary.js (owfTxSummary)
const summaryText = computed(() => {
  if (props.isAdjuste) {
    const dir = (Number(props.amount) || 0) >= 0 ? 'sube' : 'baja';
    const acc = props.adjusteAccountName || 'la cuenta';
    return `Ajustas ${acc} a ${money(props.adjusteTargetBalance)} — el saldo ${dir} ${money(props.amount)}.`;
  }
  if (props.isTransfer) {
    let s = `Transfieres ${money(props.amount)}`;
    if (props.fromAccountName) s += ` desde ${props.fromAccountName}`;
    if (props.toAccountName) s += ` a ${props.toAccountName}`;
    if (props.crossArrivesAmount != null) {
      s += `, llegan ${money(props.crossArrivesAmount, props.toCurrencySymbol || undefined)}`;
    }
    return s + '.';
  }
  const verb = (props.typeLabel || '').toLowerCase().startsWith('ingreso')
    ? 'Registras un ingreso de'
    : 'Registras un gasto de';
  let s = `${verb} ${money(props.amount)}`;
  if (props.categoryName) s += ` en ${props.categoryName}`;
  if (props.accountName) s += ` desde ${props.accountName}`;
  if (props.jarName) s += `. Aporta al cántaro ${props.jarName}`;
  else s += '.';
  return s;
});
</script>

<style scoped lang="scss">
.tf-review-card {
  display: flex;
  gap: 11px;
  padding: 13px 15px;
  border-radius: var(--radius-md, 12px);
  border: 1px solid var(--border-hairline, #e2e8f0);
  background: var(--surface-2, #f8fafc);
}
.tf-review-card--valid {
  border-color: color-mix(in srgb, var(--tf-accent, var(--brand-primary)) 26%, transparent);
  background: color-mix(in srgb, var(--tf-accent, var(--brand-primary)) 8%, var(--surface-1, #fff));
}
.tf-review-card--error {
  border-color: color-mix(in srgb, var(--expense, #ef4444) 30%, transparent);
  background: color-mix(in srgb, var(--expense, #ef4444) 6%, var(--surface-1, #fff));
}
.tf-review-card__eye {
  color: var(--tf-accent, var(--brand-primary));
  margin-top: 1px;
  flex-shrink: 0;
}
.tf-review-card--error .tf-review-card__eye {
  color: var(--expense, #ef4444);
}
.tf-review-card__main {
  flex: 1;
  min-width: 0;
}
.tf-review-card__eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg-3, #94a3b8);
  margin-bottom: 3px;
}
.tf-review-card__summary {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--fg-1, #0f172a);
  text-wrap: pretty;
}
.tf-review-card__errors {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.tf-review-card__error {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--fg-2, #64748b);
}
.tf-review-card__error-icon {
  color: var(--warning, #f59e0b);
  flex-shrink: 0;
}
.tf-review-card__debug {
  margin-top: 10px;
  border-top: 1px dashed var(--border-hairline, #e2e8f0);
  padding-top: 6px;
}
.tf-review-card__debug-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--fg-3, #94a3b8);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  &:hover { color: var(--fg-2, #64748b); }
}
.tf-review-card__debug-pre {
  margin: 6px 0 0;
  font-size: 10.5px;
  background: var(--surface-2, #f1f5f9);
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: 6px;
  padding: 8px;
  overflow-x: auto;
  white-space: pre;
  max-height: 200px;
  overflow-y: auto;
}
</style>
