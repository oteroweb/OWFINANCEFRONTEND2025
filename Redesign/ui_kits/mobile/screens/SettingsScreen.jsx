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

function SettingsScreen({ onBack, mode = 'lite', onModeChange, theme = 'dark', onThemeChange }) {
  const initToggles = {};
  SETTINGS_GROUPS.forEach(g => g.items.forEach(it => { if (it.toggle) initToggles[it.toggle] = it.value; }));
  const [toggles, setToggles] = useCfgMobileState(initToggles);

  /* Segmented control reused for Modo + Tema */
  const Seg = ({ value, onChange, options, accent }) => (
    <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
      {options.map(o => {
        const on = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange && onChange(o.value)} style={{
            flex: 1, border: 0, cursor: 'pointer', padding: '9px 6px', borderRadius: 'var(--radius-pill)',
            background: on ? (accent || 'var(--brand-primary)') : 'transparent', color: on ? '#fff' : 'var(--fg-2)',
            fontFamily: 'var(--font-body)', fontWeight: on ? 700 : 500, fontSize: 13,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 160ms, color 160ms',
          }}>
            {o.icon && <span className="material-icons" style={{ fontSize: 16 }}>{o.icon}</span>}{o.label}
          </button>
        );
      })}
    </div>
  );

  const appearanceRow = (label, hint, control) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--fg-1)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{hint}</span>
      </div>
      <div style={{ width: 168, flexShrink: 0 }}>{control}</div>
    </div>
  );

  const proAccent = mode === 'pro' ? 'var(--info)' : 'var(--brand-primary)';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MobileHeader title="Configuración" onBack={onBack} />

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '8px 0' }}>
        {/* ── Apariencia — Mode + Theme live inside the app now ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ padding: '0 20px 8px', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-2)' }}>Apariencia</div>
          <div style={{ background: 'var(--surface-1)', margin: '0 16px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            {appearanceRow('Plan', mode === 'pro' ? 'Multimoneda · multicuenta' : 'Billetera única, calmada', (
              <Seg value={mode} onChange={onModeChange} accent={proAccent} options={[{ value: 'lite', label: 'Lite' }, { value: 'pro', label: 'Pro' }]} />
            ))}
            <Divider />
            {appearanceRow('Tema', theme === 'dark' ? 'Oscuro' : 'Claro', (
              <Seg value={theme} onChange={onThemeChange} accent={proAccent} options={[{ value: 'light', label: 'Claro', icon: 'light_mode' }, { value: 'dark', label: 'Oscuro', icon: 'dark_mode' }]} />
            ))}
          </div>
        </div>

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
