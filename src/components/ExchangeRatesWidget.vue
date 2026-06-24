<template>
  <div class="exchange-rates-widget">
    <div
      v-for="(def, i) in RATE_DEFS"
      :key="def.code"
      class="exchange-rates-widget__row"
      :class="{ 'exchange-rates-widget__row--first': i === 0 }"
    >
      <!-- Flag initials -->
      <div class="exchange-rates-widget__flag">
        {{ def.flag }}
      </div>

      <!-- Name -->
      <div class="exchange-rates-widget__name">
        <span class="exchange-rates-widget__code">{{ def.code }}</span>
        <span class="exchange-rates-widget__full-name">{{ def.name }}</span>
      </div>

      <!-- Hint -->
      <span class="exchange-rates-widget__hint">1 USD =</span>

      <!-- Rate input -->
      <div
        class="exchange-rates-widget__input-wrap"
        :class="{ 'exchange-rates-widget__input-wrap--focused': focusedCode === def.code }"
      >
        <input
          type="number"
          min="0"
          step="any"
          class="exchange-rates-widget__input"
          :value="readRate(def.code)"
          @input="onInput(def.code, ($event.target as HTMLInputElement).value)"
          @focus="focusedCode = def.code"
          @blur="focusedCode = null; onBlur(def.code)"
        />
        <span class="exchange-rates-widget__unit">{{ def.code }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth';

interface RateDef {
  code: string;
  name: string;
  flag: string;
}

const RATE_DEFS: RateDef[] = [
  { code: 'EUR', name: 'Euro', flag: 'EU' },
  { code: 'VES', name: 'Bolívar venezolano', flag: 'VE' },
  { code: 'COP', name: 'Peso colombiano', flag: 'CO' },
  { code: 'CLP', name: 'Peso chileno', flag: 'CL' },
  { code: 'PEN', name: 'Sol peruano', flag: 'PE' },
];

interface RateShape {
  current?: number | string;
  [key: string]: unknown;
}

type RatesMap = Record<string, number | string | RateShape>;

const props = defineProps<{
  rates: RatesMap;
}>();

const emit = defineEmits<{
  change: [rates: RatesMap];
}>();

const authStore = useAuthStore();
const focusedCode = ref<string | null>(null);

function readRate(code: string): number | string {
  const r = props.rates[code];
  if (r && typeof r === 'object') {
    return (r as RateShape).current ?? '';
  }
  return r ?? '';
}

function writeRate(code: string, v: number | string): void {
  const r = props.rates[code];
  let next: RatesMap;
  if (r && typeof r === 'object') {
    next = { ...props.rates, [code]: { ...(r as RateShape), current: v } };
  } else {
    next = { ...props.rates, [code]: v };
  }
  emit('change', next);
}

function onInput(code: string, raw: string): void {
  const parsed = parseFloat(raw);
  writeRate(code, isNaN(parsed) ? '' : parsed);
}

async function onBlur(code: string): Promise<void> {
  // Persist via PUT /user_currencies when rate changes
  const v = readRate(code);
  if (!v || typeof v !== 'number' || v <= 0) return;
  const userId = authStore.user?.id;
  if (!userId) return;
  try {
    // Find the user_currency id for this code
    const allRates = [
      ...((authStore.user as Record<string, unknown>)?.['rates'] as Array<Record<string, unknown>> ?? []),
      ...((authStore.user as Record<string, unknown>)?.['currency_rates'] as Array<Record<string, unknown>> ?? []),
      ...((authStore.user as Record<string, unknown>)?.['current_currency_rates'] as Array<Record<string, unknown>> ?? []),
    ];
    const match = allRates.find((r) => {
      const cur = r['currency'] as Record<string, unknown> | undefined;
      const c = (cur?.['code'] as string | undefined)?.toUpperCase();
      return c === code.toUpperCase();
    });
    if (match && match['id']) {
      await api.put(`/user_currencies/${match['id'] as string}`, {
        current_rate: v,
        is_current: 1,
      });
      // Refresh rates in auth store
      void authStore.refreshUserCurrencies();
    }
  } catch {
    // Silent — widget is best-effort
  }
}
</script>

<style scoped>
.exchange-rates-widget {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.exchange-rates-widget__row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 18px;
  border-top: 1px solid var(--border-hairline);
}

.exchange-rates-widget__row--first {
  border-top: none;
}

.exchange-rates-widget__flag {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  color: var(--fg-2);
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.exchange-rates-widget__name {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.exchange-rates-widget__code {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--fg-1);
}

.exchange-rates-widget__full-name {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--fg-2);
}

.exchange-rates-widget__hint {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--fg-2);
  flex-shrink: 0;
}

.exchange-rates-widget__input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface-2);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-sm);
  padding: 7px 12px;
  transition: all 160ms;
  min-width: 120px;
}

.exchange-rates-widget__input-wrap--focused {
  background: var(--surface-1);
  border-color: var(--brand-primary);
}

.exchange-rates-widget__input {
  border: 0;
  background: transparent;
  font-family: var(--font-money);
  font-size: 14px;
  font-weight: 600;
  color: var(--fg-1);
  outline: none;
  width: 80px;
  font-variant-numeric: tabular-nums;
}

.exchange-rates-widget__unit {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--fg-2);
}
</style>
