/* IconButton — square icon-only button with optional active state. */
/* global React */

export function IconButton({ icon, onClick, ariaLabel, active = false, size = 40 }) {
  const [h, setH] = React.useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: size, height: size,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: 0, cursor: 'pointer',
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--brand-primary-soft)' : (h ? 'var(--surface-2)' : 'var(--surface-1)'),
        color: active ? 'var(--brand-primary-fg-soft)' : 'var(--fg-1)',
        boxShadow: active ? 'none' : 'var(--shadow-card)',
        transition: 'background var(--dur-base) var(--ease-out)',
      }}
    >
      <span className="material-icons" style={{ fontSize: 20 }}>{icon}</span>
    </button>
  );
}
