/* ─── Exchange Rates Widget ──────────────────────────────────────────────
 * Manual rate setter for multi-currency Pro accounts.
 * Rates are stored in parent state and passed to AccountsPanel for conversion.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useERState } = React;

const RATE_DEFS = [
  { code: 'EUR', name: 'Euro',              flag: 'EU', base: 'USD → EUR', hint: '1 USD =' },
  { code: 'VES', name: 'Bolívar venezolano',flag: 'VE', base: 'USD → VES', hint: '1 USD =' },
  { code: 'COP', name: 'Peso colombiano',   flag: 'CO', base: 'USD → COP', hint: '1 USD =' },
  { code: 'CLP', name: 'Peso chileno',      flag: 'CL', base: 'USD → CLP', hint: '1 USD =' },
  { code: 'PEN', name: 'Sol peruano',       flag: 'PE', base: 'USD → PEN', hint: '1 USD =' },
];

function ExchangeRatesWidget({ rates, onChange }) {
  // Tolerant to flat ({VES: 40.5}) or nested ({VES: {current, official}}) shapes.
  const readRate = (code) => {
    const r = rates[code];
    return (r && typeof r === 'object') ? (r.current ?? '') : (r ?? '');
  };
  const writeRate = (code, v) => {
    const r = rates[code];
    if (r && typeof r === 'object') return onChange({ ...rates, [code]: { ...r, current: v } });
    return onChange({ ...rates, [code]: v });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {RATE_DEFS.map((def, i) => (
        <RateRow key={def.code} def={def} value={readRate(def.code)} onChange={v => writeRate(def.code, v)} first={i === 0} />
      ))}
    </div>
  );
}

function RateRow({ def, value, onChange, first }) {
  const [focused, setFocused] = useERState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '13px 18px',
      borderTop: first ? 'none' : '1px solid var(--border-hairline)',
    }}>
      {/* Flag initials */}
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--fg-2)', letterSpacing: '0.04em', flexShrink: 0 }}>
        {def.flag}
      </div>

      {/* Name */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--fg-1)' }}>{def.code}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{def.name}</span>
      </div>

      {/* Hint */}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', flexShrink: 0 }}>1 USD =</span>

      {/* Rate input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: focused ? 'var(--surface-1)' : 'var(--surface-2)', border: `1px solid ${focused ? 'var(--brand-primary)' : 'var(--border-hairline)'}`, borderRadius: 'var(--radius-sm)', padding: '7px 12px', transition: 'all 160ms', minWidth: 120 }}>
        <input
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || '')}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ border: 0, background: 'transparent', fontFamily: 'var(--font-money)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', outline: 'none', width: 80, fontVariantNumeric: 'tabular-nums' }}
        />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>{def.code}</span>
      </div>
    </div>
  );
}

Object.assign(window, { ExchangeRatesWidget, RATE_DEFS });
