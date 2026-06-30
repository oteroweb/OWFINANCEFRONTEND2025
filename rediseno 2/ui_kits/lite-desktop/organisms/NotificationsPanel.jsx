/* global React */
/* ─── NotificationsPanel ──────────────────────────────────────────────────
 * Bell dropdown shared by Lite + Pro shells.
 *  · Desktop  → popover anchored under the header bell
 *  · Mobile   → bottom-sheet docked to the frame (matches modals)
 * Notifications are realistic OW Finance events (Cashea cuotas, idle money,
 * weekly digest, dream goals, over-budget, incoming payment).
 * `accent` tints the unread dot + "mark all read" link (navy Lite / cyan Pro).
 * ──────────────────────────────────────────────────────────────────────── */
const { useEffect: useNotifEffect, useRef: useNotifRef, useState: useNotifState } = React;

const NOTIF_SEED = [
  { id: 1, icon: 'credit_card',   tone: 'expense', title: 'Cuota Cashea por vencer',      body: 'iPhone 15 · $148.50 vence en 2 días (28 mar).',           time: 'Hace 2 h',  unread: true },
  { id: 2, icon: 'savings',       tone: 'info',    title: 'Dinero ocioso detectado',      body: 'Tienes $1,240 sin asignar a ningún cántaro hace 9 días.', time: 'Hace 5 h',  unread: true },
  { id: 3, icon: 'auto_awesome',  tone: 'income',  title: '¡Meta de sueño más cerca!',     body: 'Vacaciones Margarita llegó al 72% de tu objetivo.',       time: 'Ayer',      unread: false },
  { id: 4, icon: 'trending_up',   tone: 'warning', title: 'Cántaro Diversión al 90%',     body: 'Has usado $270 de $300 este mes. Cuida el límite.',       time: 'Hace 2 d',  unread: false },
  { id: 5, icon: 'arrow_downward',tone: 'income',  title: 'Pago recibido',                body: 'Banesco · +$820.00 acreditado a Cuenta principal.',       time: 'Hace 3 d',  unread: false },
  { id: 6, icon: 'receipt_long',  tone: 'info',    title: 'Tu resumen semanal está listo',body: 'Gastaste 8% menos que la semana pasada. Buen ritmo.',     time: 'Hace 4 d',  unread: false },
];

const NOTIF_TONE = {
  expense: { fg: 'var(--expense-fg)', bg: 'var(--expense-soft)' },
  income:  { fg: 'var(--income-fg)',  bg: 'var(--income-soft)'  },
  warning: { fg: 'var(--warning-fg)', bg: 'var(--warning-soft)' },
  info:    { fg: 'var(--info)',       bg: 'var(--surface-2)'    },
};

function NotificationsPanel({ open, onClose, accent = 'var(--brand-primary)', anchorRight = 32, anchorTop = 76 }) {
  const ref = useNotifRef(null);
  const isMobile = useViewportMobile();
  const [items, setItems] = useNotifState(NOTIF_SEED);

  useNotifEffect(() => {
    if (!open) return;
    setItems(NOTIF_SEED.map(n => ({ ...n }))); // reset each open
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); clearTimeout(t); };
  }, [open, onClose]);

  if (!open) return null;

  const T = (window.t || (s => s));
  const unreadCount = items.filter(n => n.unread).length;
  const markAllRead = () => setItems(items.map(n => ({ ...n, unread: false })));
  const readOne = (id) => setItems(items.map(n => n.id === id ? { ...n, unread: false } : n));

  /* ── Mobile: bottom-sheet ─────────────────────────────────────── */
  if (isMobile) {
    return (
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 'var(--z-modal)',
        background: 'rgba(10,14,28,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'npFade 200ms',
      }}>
        <style>{`@keyframes npFade { from{opacity:0} to{opacity:1} }`}</style>
        <div ref={ref} role="dialog" aria-label="Notificaciones" onClick={e => e.stopPropagation()} style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, boxSizing: 'border-box',
          background: 'var(--surface-1)', borderRadius: '22px 22px 0 0',
          maxHeight: '88%', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.28)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          <div style={{ width: 38, height: 4, borderRadius: 999, background: 'var(--border-hairline)', margin: '10px auto 6px', flexShrink: 0 }} />
          <NotifHeader T={T} accent={accent} unreadCount={unreadCount} onMarkAll={markAllRead} pad="6px 18px 12px" />
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {items.map(n => <NotifRow key={n.id} n={n} T={T} onClick={() => readOne(n.id)} />)}
            <NotifFooter T={T} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Desktop: popover ─────────────────────────────────────────── */
  return (
    <div ref={ref} role="dialog" aria-label="Notificaciones" style={{
      position: 'absolute', top: anchorTop, right: anchorRight, width: 380,
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-popover)',
      border: '1px solid var(--border-hairline)',
      zIndex: 'var(--z-popover)', overflow: 'hidden',
      animation: 'npRise var(--dur-base) var(--ease-out)',
      display: 'flex', flexDirection: 'column', maxHeight: 540,
    }}>
      <style>{`@keyframes npRise { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <NotifHeader T={T} accent={accent} unreadCount={unreadCount} onMarkAll={markAllRead} pad="16px 18px 12px" />
      <div style={{ overflowY: 'auto' }}>
        {items.map(n => <NotifRow key={n.id} n={n} T={T} onClick={() => readOne(n.id)} />)}
        <NotifFooter T={T} />
      </div>
    </div>
  );
}

function NotifHeader({ T, accent, unreadCount, onMarkAll, pad }) {
  return (
    <div style={{ padding: pad, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0, borderBottom: '1px solid var(--border-hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)' }}>{T('Notificaciones')}</span>
        {unreadCount > 0 && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: accent }}>
            {unreadCount} {T('sin leer')}
          </span>
        )}
      </div>
      {unreadCount > 0 && (
        <button onClick={onMarkAll} style={{
          border: 0, background: 'transparent', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: accent, padding: 0,
        }}>{T('Marcar todas')}</button>
      )}
    </div>
  );
}

function NotifRow({ n, T, onClick }) {
  const [h, setH] = useNotifState(false);
  const tone = NOTIF_TONE[n.tone] || NOTIF_TONE.info;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: '100%', border: 0, cursor: 'pointer', textAlign: 'left',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '13px 18px',
        background: h ? 'var(--surface-2)' : (n.unread ? 'var(--unread-bg, rgba(37,99,235,0.045))' : 'transparent'),
        borderBottom: '1px solid var(--border-hairline)',
        transition: 'background var(--dur-base) var(--ease-out)',
        position: 'relative',
      }}
    >
      <span style={{
        flexShrink: 0, width: 38, height: 38, borderRadius: 'var(--radius-md)',
        background: tone.bg, color: tone.fg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-icons" style={{ fontSize: 20 }}>{n.icon}</span>
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: n.unread ? 700 : 600, color: 'var(--fg-1)' }}>{T(n.title)}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.4 }}>{T(n.body)}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{T(n.time)}</span>
      </div>
      {n.unread && (
        <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 4, background: 'var(--info)', marginTop: 6 }} />
      )}
    </button>
  );
}

function NotifFooter({ T }) {
  const [h, setH] = useNotifState(false);
  return (
    <button
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: '100%', border: 0, cursor: 'pointer',
        padding: '14px 18px', background: h ? 'var(--surface-2)' : 'transparent',
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'background var(--dur-base) var(--ease-out)',
      }}
    >
      {T('Ver todas las notificaciones')}
      <span className="material-icons" style={{ fontSize: 18 }}>chevron_right</span>
    </button>
  );
}

Object.assign(window, { NotificationsPanel, NOTIF_SEED });
