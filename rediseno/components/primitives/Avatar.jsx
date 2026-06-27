/* Avatar — circular brand-colored initial badge. */
/* global React */

export function Avatar({ initial, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 'var(--radius-pill)',
      background: 'var(--brand-primary)', color: 'var(--fg-on-brand)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size * 0.42,
    }}>{initial}</div>
  );
}
