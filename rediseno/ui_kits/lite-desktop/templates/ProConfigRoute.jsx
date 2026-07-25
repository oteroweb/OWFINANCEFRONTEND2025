/* global React */
/* ProConfigRoute — Config Pro (PROMPT_REDISENO_ASESOR_CONFIG_NOTIFICACIONES_ONBOARDING.md
 * §2.1): cards arriba + tabs debajo (Perfil/Finanzas/Categorías/Cuentas/
 * Impuestos). Antes de este archivo, Pro y Lite compartían el mismo
 * `ConfigRoute.jsx` (lista simple) con solo un card extra de Tasas de
 * Cambio — violación de DESIGN_CONTRACT.md §5. `AppPrefsSection` y
 * `ChangePasswordCard` se reutilizan de `ConfigRoute.jsx`/`ProfileRoute.jsx`
 * (cargan antes en index.html, mismo scope global no-module).
 *
 * Categorías/Cuentas/Impuestos acá son listas funcionales simples, NO el
 * árbol completo con drag&drop — ese es el alcance del módulo separado
 * "Cuentas/Categorías/Impuestos" (`PROMPT_REDISENO_CUENTAS_CATEGORIAS_IMPUESTOS.md`),
 * que todavía no tiene su propio ciclo de diseño real. No duplicar ese
 * trabajo acá — esto es un placeholder funcional, no la versión final. */
const { useState: usePCState } = React;

const PC_TABS = ['Perfil', 'Finanzas', 'Categorías', 'Cuentas', 'Impuestos'];

function ProConfigRoute({ rates = {}, onRatesChange, onGo, onStartOnboarding }) {
  const [tab, setTab] = usePCState('Perfil');
  const [monthlyIncome, setMonthlyIncome] = usePCState(1200);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860, margin: '0 auto', width: '100%' }}>
      <div>
        <Eyebrow>{t('Configuración')}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Preferencias')}</h1>
      </div>

      <AppPrefsSection />

      <Card padding={0}>
        <ConfigRow item={{ icon: 'lock', label: t('Seguridad'), hint: t('PIN de acceso, privacidad de saldos') }} first onActivate={() => {}} />
        <ConfigRow item={{ icon: 'notifications', label: t('Notificaciones'), hint: t('Resumen semanal, alertas de dinero ocioso') }} onActivate={() => {}} />
        <ConfigRow item={{ icon: 'insights', label: t('Perfil financiero'), hint: t('Ingresos, cántaros, metas y avisos'), chevron: true, nav: 'finprofile' }} onActivate={() => onGo && onGo('finprofile')} />
      </Card>

      {onRatesChange && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Eyebrow>{t('Tasas de cambio')}</Eyebrow>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)', fontStyle: 'italic' }}>{t('· BCV oficial + tasa del momento · se aplican en todo Pro')}</span>
          </div>
          <Card padding={0}>
            <ExchangeRatesWidget rates={rates} onChange={onRatesChange} />
          </Card>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-hairline)', flexWrap: 'wrap' }}>
        {PC_TABS.map(tb => (
          <button key={tb} type="button" onClick={() => setTab(tb)} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '9px 16px', fontFamily: 'var(--font-body)', fontWeight: tab === tb ? 700 : 500, fontSize: 13.5, color: tab === tb ? 'var(--info)' : 'var(--fg-2)', borderBottom: tab === tb ? '2px solid var(--info)' : '2px solid transparent', marginBottom: -1 }}>{t(tb)}</button>
        ))}
      </div>

      {tab === 'Perfil' && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar initial="J" size={56} />
            <PillButton variant="ghost" icon="photo_camera">{t('Cambiar foto')}</PillButton>
          </div>
          <Field label={t('Nombre')}><TextInput value="José Otero" onChange={() => {}} /></Field>
          <Field label={t('Correo')}><TextInput value="otero@demo.com" onChange={() => {}} type="email" /></Field>
          <div style={{ height: 1, background: 'var(--border-hairline)' }} />
          <ChangePasswordCard />
        </Card>
      )}

      {tab === 'Finanzas' && (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label={t('Moneda por defecto')}><Picker value="USD" onChange={() => {}} options={[{ value: 'USD', label: 'USD — Dólar' }, { value: 'VES', label: 'VES — Bolívar' }, { value: 'EUR', label: 'EUR — Euro' }]} searchable /></Field>
          <Field label={t('Ingreso Mensual Esperado')}><MoneyInput value={monthlyIncome} onChange={setMonthlyIncome} /></Field>
          {monthlyIncome > 0 ? (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--income-soft)', color: 'var(--income-fg)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>✅ {t('Sistema Híbrido Activado')}</div>
          ) : (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-soft)', color: 'var(--warning-fg)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>⚠️ {t('Configura tu ingreso mensual')}</div>
          )}
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 8 }}>{t('¿Cómo Funciona?')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[t('1. Defines tu ingreso mensual esperado'), t('2. Se reparte automáticamente entre tus cántaros'), t('3. Cada gasto se descuenta del cántaro correspondiente'), t('4. Ajustas sobre la marcha si el ingreso real varía')].map((s, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>{s}</div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {tab === 'Categorías' && (
        <Card padding={0}>
          <div style={{ padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)', borderBottom: '1px solid var(--border-hairline)' }}>
            {t('Vista simplificada — el árbol completo con drag&drop es el alcance del módulo Cuentas/Categorías/Impuestos.')}
          </div>
          {(window.SAMPLE_CATEGORIES || []).slice(0, 8).map((c, i) => {
            const jar = (window.SAMPLE_JARS || []).find(j => j.id === c.assigned_jar_id);
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: i ? '1px solid var(--border-hairline)' : 'none' }}>
                <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-2)' }}>{c.icon || 'label'}</span>
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)' }}>{c.name}</span>
                {jar ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: jar.color + '22', color: jar.color }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: jar.color }} />{jar.name}
                  </span>
                ) : <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)', fontStyle: 'italic' }}>{t('Sin cántaro')}</span>}
              </div>
            );
          })}
        </Card>
      )}

      {tab === 'Cuentas' && (
        <Card padding={0}>
          <div style={{ padding: '10px 16px', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)', borderBottom: '1px solid var(--border-hairline)' }}>
            {t('Vista simplificada — carpetas, drag&drop y toggle "incluir en balance" son el alcance del módulo Cuentas/Categorías/Impuestos.')}
          </div>
          {(window.SAMPLE_ACCOUNTS || []).map((a, i) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: i ? '1px solid var(--border-hairline)' : 'none' }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--fg-2)' }}>{a.currencyCode?.slice(0, 2)}</span>
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)' }}>{a.name}{a.isDefault ? ` · ${t('predeterminada')}` : ''}</span>
              <Money value={a.balance} currency={a.currencySymbol} />
            </div>
          ))}
          <div style={{ padding: '11px 16px', borderTop: '1px solid var(--border-hairline)' }}>
            <PillButton variant="ghost" icon="add">{t('Agregar cuenta')}</PillButton>
          </div>
        </Card>
      )}

      {tab === 'Impuestos' && <ConfigTaxesTab />}
    </div>
  );
}

/* Impuestos: CRUD genérico simple (Nombre/Porcentaje/Activo), mismo motor
 * conceptual que las 15 vistas CRUD de Admin — acá solo local, sin
 * confirmación previa de borrado (mismo patrón documentado). */
function ConfigTaxesTab() {
  const [rows, setRows] = usePCState([
    { id: 1, name: 'IGTF', percent: 3, active: true },
    { id: 2, name: 'IVA', percent: 16, active: true },
  ]);
  return (
    <Card padding={0} style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 12.5 }}>
        <thead><tr>
          {['Nombre', 'Porcentaje', 'Activo', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 16px', borderBottom: '1px solid var(--border-hairline)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-3)' }}>{t(h)}</th>)}
        </tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
              <td style={{ padding: '11px 16px', color: 'var(--fg-1)' }}>{r.name}</td>
              <td style={{ padding: '11px 16px', color: 'var(--fg-1)' }}>{r.percent}%</td>
              <td style={{ padding: '11px 16px' }}>
                <span style={{ width: 30, height: 18, borderRadius: 999, background: r.active ? 'var(--income-fg)' : 'var(--surface-3)', position: 'relative', display: 'inline-block' }}>
                  <span style={{ position: 'absolute', top: 2, left: r.active ? 14 : 2, width: 14, height: 14, borderRadius: 999, background: '#fff' }} />
                </span>
              </td>
              <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                <button type="button" onClick={() => setRows(rs => rs.filter(x => x.id !== r.id))} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12 }}>{t('Eliminar')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

Object.assign(window, { ProConfigRoute });
