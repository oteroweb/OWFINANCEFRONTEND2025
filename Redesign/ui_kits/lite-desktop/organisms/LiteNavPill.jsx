/* global React */

const NAV_ITEMS = [
  { id: 'home',         label: 'Home',     icon: 'home',          route: '/user/home' },
  { id: 'transactions', label: 'Movs',     icon: 'receipt_long',  route: '/user/transactions' },
  { id: 'analisis',     label: 'Análisis', icon: 'donut_small',   route: '/user/expense-analysis' },
  { id: 'jars',         label: 'Cántaros', icon: 'savings',       route: '/user/jars' },
  { id: 'dreams',       label: 'Sueños',   icon: 'auto_awesome',  route: '/user/dreams' },
  { id: 'debts',        label: 'Deudas',   icon: 'credit_card',   route: '/user/debts' },
  { id: 'config',       label: 'Ajustes',  icon: 'settings',      route: '/user/config' },
];

function LiteNavPill({ active, onChange, onQuickAdd }) {
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
      {NAV_ITEMS.map(item => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 14px',
              border: 0, cursor: 'pointer',
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-body)', fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--fg-on-brand)' : 'var(--fg-2)',
              background: isActive ? 'var(--brand-primary)' : 'transparent',
              transition: 'background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--fg-1)'; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-2)'; } }}
          >
            <span className="material-icons" style={{ fontSize: 20 }}>{item.icon}</span>
            {t(item.label)}
          </button>
        );
      })}
      <button
        onClick={onQuickAdd}
        aria-label="Quick add"
        style={{
          marginLeft: 4, width: 48, height: 48, border: 0, cursor: 'pointer',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--brand-primary)', color: 'var(--fg-on-brand)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(30, 58, 138, 0.30)',
        }}
      >
        <span className="material-icons" style={{ fontSize: 26 }}>add</span>
      </button>
    </nav>
  );
}

Object.assign(window, { LiteNavPill, NAV_ITEMS });
