/* ─── Settings Screen ────────────────────────────────────────────────────
 * RN: Use SectionList for grouped settings.
 *     Toggle → RN Switch component.
 *     Row → TouchableOpacity with chevron.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useCfgMobileState } = React;

const SETTINGS_GROUPS = [
  {
    label: 'Cuenta',
    items: [
      { icon: 'person',        label: 'Perfil',             hint: 'José Otero', chevron: true },
      { icon: 'savings',       label: 'Cuentas vinculadas', hint: '3 tarjetas · 1 banco', chevron: true },
      { icon: 'receipt_long',  label: 'Exportar datos',     hint: 'CSV, PDF', chevron: true },
    ],
  },
  {
    label: 'Visualización',
    items: [
      { icon: 'visibility',    label: 'Ocultar saldos por defecto', toggle: 'hideBal', value: false },
      { icon: 'settings',      label: 'Divisa predeterminada',      hint: 'USD', chevron: true },
    ],
  },
  {
    label: 'Notificaciones',
    items: [
      { icon: 'notifications', label: 'Resumen semanal',     toggle: 'weekDigest', value: true },
      { icon: 'notifications', label: 'Alertas de dinero ocioso', toggle: 'idleAlerts', value: true },
      { icon: 'notifications', label: 'Alerta de sobrepresupuesto', toggle: 'overBudget', value: false },
    ],
  },
  {
    label: '',
    items: [
      { icon: 'close',         label: 'Cerrar sesión', destructive: true },
    ],
  },
];

function SettingsScreen({ onBack }) {
  const initToggles = {};
  SETTINGS_GROUPS.forEach(g => g.items.forEach(it => { if (it.toggle) initToggles[it.toggle] = it.value; }));
  const [toggles, setToggles] = useCfgMobileState(initToggles);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MobileHeader title="Configuración" onBack={onBack} />

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '8px 0' }}>
        {SETTINGS_GROUPS.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 20 }}>
            {group.label && (
              <div style={{ padding: '0 20px 8px', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-2)' }}>
                {group.label}
              </div>
            )}
            <div style={{ background: 'var(--surface-1)', margin: '0 16px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
              {group.items.map((item, ii) => (
                <div key={ii}>
                  {ii > 0 && <Divider />}
                  <button
                    onClick={item.toggle ? () => setToggles(s => ({ ...s, [item.toggle]: !s[item.toggle] })) : undefined}
                    style={{
                      width: '100%', border: 0, background: 'transparent', cursor: item.toggle || item.chevron ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', textAlign: 'left',
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: 20, color: item.destructive ? 'var(--expense)' : 'var(--fg-2)', flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: item.destructive ? 'var(--expense-fg)' : 'var(--fg-1)' }}>{item.label}</span>
                      {item.hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{item.hint}</span>}
                    </div>
                    {item.toggle && <MobileToggle on={toggles[item.toggle]} />}
                    {item.chevron && <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>chevron_right</span>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

Object.assign(window, { SettingsScreen });
