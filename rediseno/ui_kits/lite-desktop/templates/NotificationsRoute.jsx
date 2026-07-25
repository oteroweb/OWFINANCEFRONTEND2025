/* global React */
/* NotificationsRoute — página completa `/user/notifications` (§3.1 del
 * prompt), independiente del panel dropdown (`NotificationsPanel.jsx`,
 * campana del header). Antes de este archivo solo existía el panel — no
 * había ninguna página dedicada, aunque el botón "Ver todas las
 * notificaciones" del panel ya la mencionaba (sin destino real).
 *
 * Estado deliberadamente INDEPENDIENTE del panel (mismo hallazgo del
 * prompt §3.3): cada uno hace su propio "leer" local, no comparten store —
 * así es como funciona hoy en el Vue real, no es un bug de este mock.
 * Tampoco tiene "marcar todas" (a diferencia del panel) — mismo comportamiento
 * documentado. */
const { useState: useNotifRState } = React;

function NotificationsRoute() {
  const [items, setItems] = useNotifRState(() => (window.NOTIF_SEED || []).map(n => ({ ...n })));
  const readOne = (id) => setItems(its => its.map(n => n.id === id ? { ...n, unread: false } : n));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 640, margin: '0 auto', width: '100%' }}>
      <div>
        <Eyebrow>{t('Centro de mensajes')}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Notificaciones')}</h1>
      </div>

      {items.length === 0 ? (
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 40, textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: 32, color: 'var(--fg-3)' }}>notifications_off</span>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)' }}>{t('Sin notificaciones recientes')}</div>
        </Card>
      ) : (
        <Card padding={0}>
          {items.map((n, i) => {
            const tone = { expense: { fg: 'var(--expense-fg)', bg: 'var(--expense-soft)' }, income: { fg: 'var(--income-fg)', bg: 'var(--income-soft)' }, warning: { fg: 'var(--warning-fg)', bg: 'var(--warning-soft)' }, info: { fg: 'var(--info)', bg: 'var(--surface-2)' } }[n.tone] || { fg: 'var(--info)', bg: 'var(--surface-2)' };
            return (
              <button key={n.id} type="button" onClick={() => readOne(n.id)} style={{
                width: '100%', textAlign: 'left', border: 0, cursor: 'pointer',
                display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 18px',
                background: n.unread ? 'rgba(37,99,235,0.045)' : 'transparent',
                borderTop: i ? '1px solid var(--border-hairline)' : 'none',
              }}>
                <span style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 'var(--radius-md)', background: tone.bg, color: tone.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-icons" style={{ fontSize: 20 }}>{n.icon}</span>
                </span>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: n.unread ? 700 : 600, color: 'var(--fg-1)' }}>{n.title}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.4 }}>{n.body}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{n.time}</span>
                </div>
                {n.unread && <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 4, background: 'var(--info)', marginTop: 6 }} />}
              </button>
            );
          })}
        </Card>
      )}
    </div>
  );
}

Object.assign(window, { NotificationsRoute });
