/* Card — elevated surface container (standard or hero elevation). */
/* global React */

export function Card({ children, hero = false, padding = 24, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface-1)',
      borderRadius: hero ? 'var(--radius-xl)' : 'var(--radius-lg)',
      padding: hero ? 32 : padding,
      boxShadow: hero ? 'var(--shadow-float)' : 'var(--shadow-card)',
      ...style,
    }}>{children}</div>
  );
}
