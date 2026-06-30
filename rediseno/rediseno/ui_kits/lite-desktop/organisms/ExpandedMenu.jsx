/* global React */
const { useEffect: useMenuEffect, useRef: useMenuRef } = React;

const MENU_GROUPS = [
  {
    label: 'Account',
    items: [
      { icon: 'person',          label: 'Profile',         hint: 'José Otero' },
      { icon: 'savings',         label: 'Payment methods', hint: '3 cards · 1 bank' },
      { icon: 'notifications',   label: 'Notifications',   hint: 'On · weekly digest' },
    ],
  },
  {
    label: 'Preferences',
    items: [
      { icon: 'settings',        label: 'App settings' },
      { icon: 'visibility',      label: 'Privacy & visibility' },
      { icon: 'receipt_long',    label: 'Export data' },
    ],
  },
  {
    label: '',
    items: [
      { icon: 'close',           label: 'Sign out', destructive: true },
    ],
  },
];

function ExpandedMenu({ open, onClose, anchorRight = 32 }) {
  const ref = useMenuRef(null);

  useMenuEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('keydown', onKey);
    // small delay so the click that opened it doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); clearTimeout(t); };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Account menu"
      style={{
        position: 'absolute', top: 76, right: anchorRight,
        width: 320,
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-popover)',
        zIndex: 'var(--z-popover)',
        overflow: 'hidden',
        animation: 'fadeIn var(--dur-base) var(--ease-out)',
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ padding: '18px 18px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius-pill)',
          background: 'var(--brand-primary)', color: 'var(--fg-on-brand)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
        }}>J</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)' }}>José Otero</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>jose@owfinance.com</span>
        </div>
      </div>

      {MENU_GROUPS.map((group, gi) => (
        <div key={gi} style={{ padding: '6px 8px' }}>
          {group.label && (
            <div style={{
              padding: '8px 12px 4px',
              fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-2)',
            }}>{group.label}</div>
          )}
          {group.items.map((item, ii) => <MenuRow key={ii} item={item} />)}
        </div>
      ))}
    </div>
  );
}

function MenuRow({ item }) {
  const [h, setH] = React.useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: '100%', border: 0, cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 'var(--radius-sm)',
        background: h ? 'var(--surface-2)' : 'transparent',
        color: item.destructive ? 'var(--expense-fg)' : 'var(--fg-1)',
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
        transition: 'background var(--dur-base) var(--ease-out)',
      }}
    >
      <span className="material-icons" style={{ fontSize: 18, color: item.destructive ? 'var(--expense)' : 'var(--fg-2)' }}>{item.icon}</span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span>{item.label}</span>
        {item.hint && <span style={{ fontSize: 11, color: 'var(--fg-2)', fontWeight: 400 }}>{item.hint}</span>}
      </div>
      {!item.destructive && <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>chevron_right</span>}
    </button>
  );
}

Object.assign(window, { ExpandedMenu });
