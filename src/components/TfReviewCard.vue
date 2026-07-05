<template>
  <div
    class="tf-review-card"
    :class="{
      'tf-review-card--draft': state === 'draft',
      'tf-review-card--valid': state === 'valid',
      'tf-review-card--error': state === 'error',
    }"
  >
    <div class="row items-center q-gutter-sm">
      <q-icon :name="stateIcon" :color="stateColor" size="20px" />
      <div class="text-caption text-weight-medium" :class="`text-${stateColor}`">
        {{ stateLabel }}
      </div>
    </div>
    <div class="text-body2 q-mt-xs">{{ summaryText }}</div>
    <ul v-if="validationErrors.length" class="tf-review-card__errors q-mt-sm">
      <li v-for="(err, i) in validationErrors" :key="i" class="text-caption text-negative">
        {{ err }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
}

defineOptions({ name: 'TfReviewCard' });

const props = defineProps<Props>();

type ReviewState = 'draft' | 'valid' | 'error';

function formatDate(dt: string): string {
  if (!dt) return '';
  try {
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return dt;
    return new Intl.DateTimeFormat('es-VE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dt;
  }
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

const stateIcon = computed(() => {
  if (state.value === 'draft') return 'edit_note';
  if (state.value === 'error') return 'error_outline';
  return 'check_circle';
});
const stateColor = computed(() => {
  if (state.value === 'draft') return 'grey-7';
  if (state.value === 'error') return 'negative';
  return 'positive';
});
const stateLabel = computed(() => {
  if (state.value === 'draft') return 'Borrador / incompleto';
  if (state.value === 'error') return 'Revisa los datos antes de enviar';
  return 'Listo para enviar';
});

const summaryText = computed(() => {
  const amt = Math.abs(Number(props.amount || 0)).toFixed(2);
  const dateStr = formatDate(props.datetime);
  if (props.isAdjuste) {
    const acc = props.adjusteAccountName || 'una cuenta';
    const target =
      props.adjusteTargetBalance != null ? Number(props.adjusteTargetBalance).toFixed(2) : '—';
    return `Vas a AJUSTAR el saldo de ${acc} a ${target}${dateStr ? `, el ${dateStr}` : ''}.`;
  }
  if (props.isTransfer) {
    const from = props.fromAccountName || 'una cuenta';
    const to = props.toAccountName || 'otra cuenta';
    return `Vas a TRANSFERIR ${amt} desde ${from} hacia ${to}${dateStr ? `, el ${dateStr}` : ''}.`;
  }
  const typeWord = (props.typeLabel || 'movimiento').toUpperCase();
  const cat = props.categoryName ? ` en ${props.categoryName}` : '';
  const acc = props.accountName ? `, pagado desde ${props.accountName}` : '';
  const concept = props.name ? ` (${props.name})` : '';
  return `Vas a registrar un ${typeWord} de ${amt}${cat}${concept}${acc}${
    dateStr ? `, el ${dateStr}` : ''
  }.`;
});
</script>

<style scoped>
.tf-review-card {
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.02);
}
.tf-review-card--draft {
  border-color: rgba(0, 0, 0, 0.12);
}
.tf-review-card--valid {
  border-color: rgba(76, 175, 80, 0.4);
  background: rgba(76, 175, 80, 0.06);
}
.tf-review-card--error {
  border-color: rgba(244, 67, 54, 0.4);
  background: rgba(244, 67, 54, 0.06);
}
.tf-review-card__errors {
  margin: 0;
  padding-left: 18px;
}
</style>
