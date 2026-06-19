/* global React */
const { useState, useEffect, useRef } = React;

/* ---------- PillButton ---------- */
function PillButton({ children, icon, variant = 'primary', size = 'md', onClick, ariaLabel, type = 'button' }) {
  const pad = size === 'sm' ? '8px 14px' : '12px 22px';
  const fontSize = size === 'sm' ? 13 : 14;
  const palette = {
    primary: { bg: 'var(--brand-primary)', color: 'var(--fg-on-brand)', hover: 'var(--brand-primary-hover)', shadow: 'none' },
    secondary: { bg: 'var(--surface-1)', color: 'var(--fg-1)', hover: 'var(--surface-2)', shadow: 'var(--shadow-card)' },
    ghost: { bg: 'transparent', color: 'var(--fg-1)', hover: 'var(--surface-2)', shadow: 'none' },
    danger: { bg: 'var(--expense-soft)', color: 'var(--expense-fg)', hover: 'var(--expense-soft)', shadow: 'none' },
  }[variant];

  const [h, setH] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize,
        border: 0, borderRadius: 'var(--radius-pill)', cursor: 'pointer',
        padding: pad,
        background: h ? palette.hover : palette.bg,
        color: palette.color,
        boxShadow: palette.shadow,
        transition: 'background var(--dur-base) var(--ease-out)',
      }}
    >
      {icon && <span className="material-icons" style={{ fontSize: 18 }}>{icon}</span>}
      {children}
    </button>
  );
}

/* ---------- IconButton ---------- */
function IconButton({ icon, onClick, ariaLabel, active = false, size = 40 }) {
  const [h, setH] = useState(false);
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

Object.assign(window, { PillButton, IconButton });
