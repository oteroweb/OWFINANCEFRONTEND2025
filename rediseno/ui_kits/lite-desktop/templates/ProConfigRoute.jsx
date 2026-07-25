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

      {tab === 'Categorías' && <CategoriesTreeView />}

      {tab === 'Cuentas' && <AccountsTreeView />}

      {tab === 'Impuestos' && <TaxesCrud />}
    </div>
  );
}


Object.assign(window, { ProConfigRoute });
