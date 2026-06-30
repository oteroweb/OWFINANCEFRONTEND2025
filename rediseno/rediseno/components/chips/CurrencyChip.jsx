/* CurrencyChip — selectable currency token with live/inactive dot. */
/* global React */

export function CurrencyChip({ code = 'USD', active = true }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--font-body)',
      fontWeight: 600, fontSize: 12, letterSpacing: '0.06em',
      padding: '8px 14px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-1)',
      color: 'var(--fg-1)',
      boxShadow: 'var(--shadow-card)',
      cursor: 'pointer',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: active ? 'var(--income)' : 'var(--fg-3)' }} />
      {code}
    </span>
  );
}
