<template>
  <div class="ert">
    <div
      v-for="(def, i) in RATE_DEFS"
      :key="def.code"
      class="ert__row"
      :class="{ 'ert__row--first': i === 0 }"
    >
      <div class="ert__flag">{{ def.flag }}</div>
      <div class="ert__name">
        <span class="ert__code">{{ def.code }}</span>
        <span class="ert__full-name">{{ def.name }}</span>
      </div>

      <div class="ert__col">
        <span class="ert__col-label">Oficial (BCV)</span>
        <div class="ert__input-wrap">
          <span class="ert__unit">1 $ =</span>
          <input
            type="number" min="0" step="any" class="ert__input"
            placeholder="—"
            :value="rowsByCode[def.code]?.official.value ?? ''"
            @change="onEdit(def.code, 'official', ($event.target as HTMLInputElement).value)"
          />
          <span class="ert__unit">{{ def.code }}</span>
        </div>
      </div>

      <div class="ert__col">
        <span class="ert__col-label">Tasa actual</span>
        <div class="ert__input-wrap">
          <span class="ert__unit">1 $ =</span>
          <input
            type="number" min="0" step="any" class="ert__input"
            placeholder="—"
            :value="rowsByCode[def.code]?.current.value ?? ''"
            @change="onEdit(def.code, 'current', ($event.target as HTMLInputElement).value)"
          />
          <span class="ert__unit">{{ def.code }}</span>
        </div>
      </div>

      <div v-if="rowsByCode[def.code]?.deltaPct != null" class="ert__delta" :class="deltaClass(rowsByCode[def.code]!.deltaPct!)">
        <q-icon :name="rowsByCode[def.code]!.deltaPct! >= 0 ? 'trending_up' : 'trending_down'" size="14px" />
        {{ rowsByCode[def.code]!.deltaPct! >= 0 ? '+' : '' }}{{ rowsByCode[def.code]!.deltaPct!.toFixed(1) }}%
      </div>
      <div v-else class="ert__delta ert__delta--empty" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useUserCurrenciesStore } from 'stores/useUserCurrencies';

interface RateDef { code: string; name: string; flag: string }

const RATE_DEFS: RateDef[] = [
  { code: 'EUR', name: 'Euro', flag: 'EU' },
  { code: 'VES', name: 'Bolívar venezolano', flag: 'VE' },
  { code: 'COP', name: 'Peso colombiano', flag: 'CO' },
  { code: 'CLP', name: 'Peso chileno', flag: 'CL' },
  { code: 'PEN', name: 'Sol peruano', flag: 'PE' },
];

interface RateCell { value: number | null; id: number | null }
interface RateRowState { official: RateCell; current: RateCell; deltaPct: number | null }

const store = useUserCurrenciesStore();

// Maps store.rates (UserCurrency shape) to the RateRowState shape the template expects.
const rowsByCode = computed<Record<string, RateRowState>>(() => {
  const result: Record<string, RateRowState> = {};
  for (const def of RATE_DEFS) {
    const r = store.rates[def.code];
    const off = r?.official_rate ?? null;
    const cur = r?.current_rate ?? null;
    result[def.code] = {
      official: { value: off, id: r?.id ?? null },
      current: { value: cur, id: r?.id ?? null },
      deltaPct: off && cur && off > 0 ? ((cur - off) / off) * 100 : null,
    };
  }
  return result;
});

function deltaClass(pct: number) {
  return pct >= 0 ? 'ert__delta--up' : 'ert__delta--down';
}

async function onEdit(code: string, column: 'official' | 'current', raw: string) {
  const val = parseFloat(raw);
  if (isNaN(val) || val <= 0) return;
  await store.onEdit(code, column, val);
}

onMounted(() => {
  void store.fetchAll();
});
</script>

<style scoped>
.ert { display: flex; flex-direction: column; gap: 0; }
.ert__row {
  display: flex; align-items: center; gap: 14px;
  padding: 13px 18px; border-top: 1px solid var(--border-hairline);
  flex-wrap: wrap;
}
.ert__row--first { border-top: none; }
.ert__flag {
  width: 36px; height: 36px; border-radius: 10px; background: var(--surface-2);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 10px; font-weight: 700; color: var(--fg-2);
  letter-spacing: 0.04em; flex-shrink: 0;
}
.ert__name { display: flex; flex-direction: column; min-width: 120px; }
.ert__code { font-family: var(--font-body); font-size: 14px; font-weight: 600; color: var(--fg-1); }
.ert__full-name { font-family: var(--font-body); font-size: 11px; color: var(--fg-2); }
.ert__col { display: flex; flex-direction: column; gap: 3px; min-width: 150px; }
.ert__col-label {
  font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--fg-3);
}
.ert__input-wrap {
  display: flex; align-items: center; gap: 6px; background: var(--surface-2);
  border: 1px solid var(--border-hairline); border-radius: var(--radius-sm); padding: 6px 10px;
}
.ert__input {
  border: 0; background: transparent; font-family: var(--font-money); font-size: 13px; font-weight: 600;
  color: var(--fg-1); outline: none; width: 70px; font-variant-numeric: tabular-nums;
}
.ert__unit { font-family: var(--font-body); font-size: 11px; font-weight: 600; color: var(--fg-2); white-space: nowrap; }
.ert__delta {
  display: inline-flex; align-items: center; gap: 3px; padding: 4px 8px; border-radius: var(--radius-pill);
  font-family: var(--font-body); font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.ert__delta--empty { visibility: hidden; }
.ert__delta--up { background: var(--income-soft, rgba(34,197,94,.12)); color: var(--income-fg, #16a34a); }
.ert__delta--down { background: var(--warning-soft, rgba(234,179,8,.14)); color: var(--warning-fg, #a16207); }
</style>
