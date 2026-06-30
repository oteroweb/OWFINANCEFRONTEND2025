/* Chip — compact status / category pill with semantic variants. */
/* global React */

export function Chip({ children, variant = 'default', icon }) {
  const palette = {
    default:  { bg: 'var(--surface-2)', color: 'var(--fg-1)' },
    currency: { bg: 'var(--surface-1)', color: 'var(--fg-1)', shadow: 'var(--shadow-card)', weight: 600, letter: '0.06em' },
    brand:    { bg: 'var(--brand-primary-soft)', color: 'var(--brand-primary-fg-soft)', weight: 600 },
    income:   { bg: 'var(--income-soft)', color: 'var(--income-fg)' },
    expense:  { bg: 'var(--expense-soft)', color: 'var(--expense-fg)' },
    warning:  { bg: 'var(--warning-soft)', color: 'var(--warning-fg)' },
    info:     { bg: 'var(--info-soft)', color: 'var(--info-fg)' },
  }[variant] || {};
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-body)',
      fontWeight: palette.weight || 500,
      fontSize: 12,
      letterSpacing: palette.letter || 'normal',
      padding: '6px 12px',
      borderRadius: 'var(--radius-pill)',
      background: palette.bg,
      color: palette.color,
      boxShadow: palette.shadow || 'none',
    }}>
      {icon && <span className="material-icons" style={{ fontSize: 14 }}>{icon}</span>}
      {children}
    </span>
  );
}
