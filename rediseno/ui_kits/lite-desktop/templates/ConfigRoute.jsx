/* global React */
const { useState: useCfgState } = React;

const CONFIG_GROUPS = [
  {
    label: 'Cuenta',
    items: [
      { icon: 'person',       label: 'Perfil',              hint: 'José Otero · jose@owfinance.com', nav: 'profile' },
      { icon: 'insights',     label: 'Mi perfil financiero', hint: 'Ingresos, cántaros, metas y avisos', nav: 'finprofile' },
      { icon: 'savings',      label: 'Cuentas vinculadas',  hint: '3 tarjetas · 2 bancos', chevron: true },
      { icon: 'route',        label: 'Repetir configuración inicial', hint: 'Volver a ver el onboarding', act: 'onboarding' },
      { icon: 'receipt_long', label: 'Exportar datos',      hint: 'CSV, PDF', chevron: true },
    ],
  },
  {
    label: 'Visualización',
    items: [
      { icon: 'visibility',   label: 'Ocultar saldos por defecto', toggle: 'hideBal', value: false },
      { icon: 'settings',     label: 'Divisa predeterminada',      hint: 'USD', chevron: true },
      { icon: 'home',         label: 'Pantalla de inicio',         hint: 'Inicio', chevron: true },
    ],
  },
  {
    label: 'Notificaciones',
    items: [
      { icon: 'notifications', label: 'Resumen semanal',           toggle: 'weekDigest',  value: true },
      { icon: 'notifications', label: 'Alertas de dinero ocioso',  toggle: 'idleAlerts',  value: true },
      { icon: 'notifications', label: 'Alerta de sobrepresupuesto',toggle: 'overBudget',  value: false },
    ],
  },
  {
    label: '',
    items: [
      { icon: 'close', label: 'Cerrar sesión', destructive: true, act: 'logout' },
    ],
  },
];

function ConfigRoute({ rates = {}, onRatesChange, onGo, onStartOnboarding }) {
  const initToggles = {};
  CONFIG_GROUPS.forEach(g => g.items.forEach(it => { if (it.toggle) initToggles[it.toggle] = it.value; }));
  const [toggles, setToggles] = useCfgState(initToggles);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720, margin: '0 auto', width: '100%' }}>
      <div>
        <Eyebrow>{t("Configuración")}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Preferencias')}</h1>
      </div>

      {/* ── Aplicación: modo · idioma · dispositivo ──────────────── */}
      <AppPrefsSection />

      {/* ── Exchange rates (Pro only — rates prop provided) ──────── */}
      {onRatesChange && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Eyebrow>{t("Tasas de cambio")}</Eyebrow>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)', fontStyle: 'italic' }}>{t("· Ingresa manualmente · se aplican en todo Pro")}</span>
          </div>
          <Card padding={0}>
            <ExchangeRatesWidget rates={rates} onChange={onRatesChange} />
          </Card>
        </div>
      )}

      {/* ── General settings groups ──────────────────────────────── */}
      {CONFIG_GROUPS.map((group, gi) => (
        <div key={gi}>
          {group.label && <Eyebrow style={{ marginBottom: 10 }}>{t(group.label)}</Eyebrow>}
          <Card padding={0} style={{ marginTop: group.label ? 10 : 0 }}>
            {group.items.map((item, ii) => (
              <ConfigRow
                key={ii}
                item={item}
                first={ii === 0}
                value={item.toggle ? toggles[item.toggle] : undefined}
                onToggle={item.toggle ? () => setToggles(s => ({ ...s, [item.toggle]: !s[item.toggle] })) : undefined}
                onActivate={item.nav ? () => onGo && onGo(item.nav) : item.act === 'onboarding' ? () => onStartOnboarding && onStartOnboarding() : item.act === 'logout' ? () => window.__owLogout && window.__owLogout() : undefined}
              />
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

function ConfigRow({ item, first, value, onToggle, onActivate }) {
  const clickable = item.toggle || item.chevron || item.nav || item.act;
  const showChevron = (item.chevron || item.nav || item.act) && !item.toggle;
  return (
    <div
      onClick={onToggle || onActivate}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px',
        borderTop: first ? 'none' : '1px solid var(--border-hairline)',
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      <span className="material-icons" style={{ fontSize: 20, color: item.destructive ? 'var(--expense)' : 'var(--fg-2)', flexShrink: 0 }}>{item.icon}</span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: item.destructive ? 'var(--expense-fg)' : 'var(--fg-1)' }}>{t(item.label)}</span>
        {item.hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t(item.hint)}</span>}
      </div>
      {item.toggle && <Toggle on={value} />}
      {showChevron && <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>chevron_right</span>}
    </div>
  );
}

function Toggle({ on }) {
  return (
    <span style={{ width: 36, height: 22, borderRadius: 999, background: on ? 'var(--brand-primary)' : 'var(--surface-3)', position: 'relative', transition: 'background 180ms', flexShrink: 0, display: 'inline-block' }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.20)', transition: 'left var(--dur-base) var(--ease-out)' }} />
    </span>
  );
}

/* ─── App preferences: mode · language · device ─────────────────────────── */
function AppPrefsSection() {
  const isMobile = useViewportMobile();
  // local mirrors of global state — bump to force re-read after global setters
  const [, force] = useCfgState(0);
  const mode   = (window.getMode   && window.getMode())   || 'lite';
  const lang   = (window.I18N && window.I18N.lang) || 'es';
  const device = (window.getDevice && window.getDevice()) || 'desktop';
  const accent = mode === 'pro' ? 'var(--info)' : 'var(--brand-primary)';

  return (
    <div>
      <Eyebrow style={{ marginBottom: 10 }}>{t('Aplicación')}</Eyebrow>
      <Card padding={0} style={{ marginTop: 10 }}>
        {/* Modo de la app */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', flexWrap: 'wrap' }}>
          <span className="material-icons" style={{ fontSize: 20, color: 'var(--fg-2)', flexShrink: 0 }}>tune</span>
          <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--fg-1)' }}>{t('Modo de la app')}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{mode === 'pro' ? t('Pro · panel completo multi-cuenta') : t('Lite · simple y enfocado')}</span>
          </div>
          <div style={{ display: 'inline-flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 3, gap: 2, flexShrink: 0 }}>
            {[['lite', 'Lite'], ['pro', 'Pro']].map(([id, label]) => {
              const on = mode === id;
              return (
                <button key={id} onClick={() => { window.setMode && window.setMode(id); force(n => n + 1); }}
                  style={{ border: 0, cursor: 'pointer', padding: '7px 18px', borderRadius: 'var(--radius-pill)',
                    background: on ? (id === 'pro' ? 'var(--info)' : 'var(--brand-primary)') : 'transparent',
                    color: on ? '#fff' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: on ? 600 : 500,
                    transition: 'background 150ms, color 150ms' }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-hairline)' }} />

        {/* Idioma — dropdown */}
        <PrefDropdown
          icon="language" label={t('Idioma')} hint={t('Interfaz y formatos')}
          value={lang} accent={accent}
          options={[['es', 'Español'], ['en', 'English']]}
          onChange={(v) => { window.setLang && window.setLang(v); force(n => n + 1); }}
        />

        <div style={{ height: 1, background: 'var(--border-hairline)' }} />

        {/* Dispositivo — dropdown (vista previa) */}
        <PrefDropdown
          icon="devices" label={t('Vista previa')} hint={t('Tamaño de pantalla')}
          value={device} accent={accent}
          options={[['desktop', t('PC')], ['tablet', t('Tablet')], ['mobile', t('Celular')]]}
          onChange={(v) => { window.setDevice && window.setDevice(v); force(n => n + 1); }}
        />
      </Card>
    </div>
  );
}

function PrefDropdown({ icon, label, hint, value, options, onChange, accent }) {
  const [open, setOpen] = useCfgState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const tmo = setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); clearTimeout(tmo); };
  }, [open]);

  const current = options.find(([id]) => id === value);
  const currentLabel = current ? current[1] : value;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
      <span className="material-icons" style={{ fontSize: 20, color: 'var(--fg-2)', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--fg-1)' }}>{label}</span>
        {hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{hint}</span>}
      </div>
      <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
        <button onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--border-hairline)', cursor: 'pointer',
            padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', minWidth: 120, justifyContent: 'space-between' }}>
          {currentLabel}
          <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>expand_more</span>
        </button>
        {open && (
          <div role="listbox" style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 160, zIndex: 'var(--z-popover)',
            background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-popover)', overflow: 'hidden', padding: 4 }}>
            {options.map(([id, lbl]) => {
              const on = id === value;
              return (
                <button key={id} role="option" aria-selected={on} onClick={() => { onChange(id); setOpen(false); }}
                  style={{ width: '100%', textAlign: 'left', border: 0, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                    background: on ? 'var(--surface-2)' : 'transparent',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: on ? 600 : 500, color: 'var(--fg-1)' }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                  {lbl}
                  {on && <span className="material-icons" style={{ fontSize: 18, color: accent }}>check</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ConfigRoute });
