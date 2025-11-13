import { computed } from 'vue';
import { useAuthStore } from 'stores/auth';

export type RateChip = {
  code: string;
  rate: number;
  is_official: boolean;
  updated_at?: string;
  rateLabel: string;
};

// Helper: numeric label with precision depending on magnitude
function toRateLabel(n: number): string {
  if (n >= 1) return Number(n.toFixed(2)).toString();
  return Number(n.toFixed(6)).toString();
}

export function useUserRates() {
  const auth = useAuthStore();

  const defaultCurrencyCode = computed(() => auth.defaultCurrencyCode);

  // Deduplicate by currency code and prioritize current rates
  const currentRates = computed<RateChip[]>(() => {
    const u = (auth.user || null) as unknown as Record<string, unknown> | null;
    const fromKey = (key: string): Array<Record<string, unknown>> =>
      Array.isArray((u || ({} as Record<string, unknown>))[key])
        ? ((u as Record<string, unknown>)[key] as unknown[] as Array<Record<string, unknown>>)
        : [];

    // Prefer 'rates' (normalized), then 'current_currency_rates', then 'currency_rates'
    const sources: Array<Array<Record<string, unknown>>> = [
      fromKey('rates'),
      fromKey('current_currency_rates'),
      fromKey('currency_rates'),
    ];

  const byCode: Record<string, { code: string; rate: number; is_official: boolean; updated_at?: string }> = {};
    for (const src of sources) {
      for (const r of src) {
        const cur = (r['currency'] as Record<string, unknown>) || {};
        const code = typeof cur['code'] === 'string' ? cur['code'] : '';
        if (!code) continue;
        const isCurrent = Boolean(r['is_current']);
        const valRaw = r['current_rate'];
        const val = typeof valRaw === 'number' ? valRaw : Number(valRaw ?? 0);
        if (!(val > 0)) continue;
        const official = Boolean(r['is_official']);
        const updRaw = r['updated_at'];
        const updated = typeof updRaw === 'string' ? updRaw : undefined;
        const existing = byCode[code];
        if (!existing || isCurrent) {
          const base = { code, rate: val, is_official: official } as {
            code: string;
            rate: number;
            is_official: boolean;
            updated_at?: string;
          };
          if (updated) base.updated_at = updated;
          byCode[code] = base;
        }
      }
      // Stop at first non-empty source (highest priority)
      if (Object.keys(byCode).length) break;
    }

    return Object.values(byCode).map((it) => {
      const base: RateChip = {
        code: it.code,
        rate: it.rate,
        is_official: it.is_official,
        rateLabel: toRateLabel(it.rate),
      };
      if (it.updated_at) base.updated_at = it.updated_at;
      return base;
    });
  });

  return { defaultCurrencyCode, currentRates, toRateLabel };
}
