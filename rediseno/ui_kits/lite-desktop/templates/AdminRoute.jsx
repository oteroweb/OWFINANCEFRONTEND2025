/* global React */
/* AdminRoute — panel /admin/* completo (PROMPT_REDISENO_ADMIN.md). Antes no
 * existía ningún diseño interactivo para Admin en este kit — solo un HTML
 * genérico de referencia (`OW Finance - Admin.html`). Sidebar propia (no
 * comparte nav con AppShell — en el Vue real Admin usa `AdminLayout.vue`,
 * layout completamente separado) con: Dashboard, Usuarios (index + detalle
 * 6 tabs, con impersonar), 2 CRUDs genéricos de muestra (Monedas,
 * Proveedores — representan las 15 pantallas CRUD reales, todas sobre el
 * mismo motor `AdminCrudTable`), Monitor de IA, Sistema. */
const { useState: useAdRState } = React;

const ADMIN_NAV = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { id: 'users', icon: 'group', label: 'Usuarios' },
  { id: 'currencies', icon: 'attach_money', label: 'Monedas' },
  { id: 'providers', icon: 'storefront', label: 'Proveedores' },
  { id: 'ai', icon: 'smart_toy', label: 'Monitor de IA' },
  { id: 'system', icon: 'dns', label: 'Sistema' },
];

function AdminRoute({ onExit }) {
  const [screen, setScreen] = useAdRState('dashboard');
  const [detailUserId, setDetailUserId] = useAdRState(null);
  const [impersonating, setImpersonating] = useAdRState(null);

  const openUser = (id) => { setDetailUserId(id); setScreen('user-detail'); };
  const backToUsers = () => { setDetailUserId(null); setScreen('users'); };
  const impersonate = () => setImpersonating(detailUserId);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-canvas)', overflow: 'hidden' }}>
      {impersonating && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20000, background: 'var(--expense)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '8px 16px', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>
          <span className="material-icons" style={{ fontSize: 17 }}>visibility</span>
          {t('Estás impersonando a un usuario')}
          <button type="button" onClick={() => setImpersonating(null)} style={{ border: '1px solid rgba(255,255,255,.5)', background: 'transparent', color: '#fff', cursor: 'pointer', borderRadius: 999, padding: '3px 12px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12 }}>{t('Volver al Admin')}</button>
        </div>
      )}

      <aside style={{ width: 220, flexShrink: 0, background: 'var(--surface-1)', borderRight: '1px solid var(--border-hairline)', display: 'flex', flexDirection: 'column', padding: '24px 14px', boxSizing: 'border-box', marginTop: impersonating ? 38 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 24px' }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 17, color: '#fff' }}>shield</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>{t('Admin')}</span>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ADMIN_NAV.map(item => {
            const active = screen === item.id || (item.id === 'users' && screen === 'user-detail');
            return (
              <button key={item.id} type="button" onClick={() => setScreen(item.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-sm)', background: active ? 'var(--brand-primary-soft)' : 'transparent', color: active ? 'var(--brand-primary)' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: active ? 600 : 500, textAlign: 'left', width: '100%' }}>
                <span className="material-icons" style={{ fontSize: 19 }}>{item.icon}</span>{t(item.label)}
              </button>
            );
          })}
        </nav>
        <div style={{ paddingTop: 14, borderTop: '1px solid var(--border-hairline)' }}>
          <button type="button" onClick={onExit} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '9px 12px' }}>
            <span className="material-icons" style={{ fontSize: 18 }}>logout</span>{t('Salir del panel admin')}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 60px', boxSizing: 'border-box', marginTop: impersonating ? 38 : 0 }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          {screen === 'dashboard' && <AdminDashboard />}
          {screen === 'users' && <UsersIndex onOpen={openUser} />}
          {screen === 'user-detail' && <UserDetail userId={detailUserId} onBack={backToUsers} onImpersonate={impersonate} />}
          {screen === 'currencies' && <AdminCrudTable entityKey="currencies" />}
          {screen === 'providers' && <AdminCrudTable entityKey="providers" />}
          {screen === 'ai' && <AiMonitorScreen />}
          {screen === 'system' && <SystemScreen />}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { AdminRoute });
