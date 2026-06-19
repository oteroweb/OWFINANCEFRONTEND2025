/* global React */
/* ─── MobileTabBar ────────────────────────────────────────────────────────
 * Bottom navigation used on phones by BOTH Lite and Pro shells.
 * Renders <nav aria-label="Primary"> so the mobile CSS in index.html
 * (body.viewport-mobile nav[aria-label="Primary"]) reshapes it into a docked
 * full-width tab bar. `accent` sets the active pill color (navy for Lite,
 * cyan for Pro).
 * ──────────────────────────────────────────────────────────────────────── */

function MobileTabBar({ items, active, onChange, onQuickAdd, accent = 'var(--brand-primary)', addColor }) {
  const fab = addColor || accent;
  return (
    <nav
      role="navigation"
      aria-label="Primary"
      style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 'var(--z-nav)',
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: 'var(--surface-1)',
        borderRadius: 'var(--radius-pill)',
        padding: 6,
        boxShadow: 'var(--shadow-float)',
      }}
    >
      {items.map(item => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 14px', border: 0, cursor: 'pointer',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-body)', fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#fff' : 'var(--fg-2)',
              background: isActive ? accent : 'transparent',
              transition: 'background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)',
            }}
          >
            <span className="material-icons" style={{ fontSize: 20 }}>{item.icon}</span>
            {window.t(item.label)}
          </button>
        );
      })}
      <button
        onClick={onQuickAdd}
        aria-label="Quick add"
        style={{
          marginLeft: 4, width: 48, height: 48, border: 0, cursor: 'pointer',
          borderRadius: 'var(--radius-pill)',
          background: fab, color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.20)',
        }}
      >
        <span className="material-icons" style={{ fontSize: 26 }}>add</span>
      </button>
    </nav>
  );
}

Object.assign(window, { MobileTabBar });
