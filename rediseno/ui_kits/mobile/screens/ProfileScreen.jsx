/* ─── Mobile · Perfil (datos personales) ────────────────────────────────
 * Identidad + contacto + ubicación con medidor de completitud. Props: onBack,
 * onGoFinancial (ir a Mi perfil financiero).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useMprState } = React;

const MPR_COUNTRIES = [
  { value: 'VE', label: '🇻🇪  Venezuela' }, { value: 'CO', label: '🇨🇴  Colombia' },
  { value: 'MX', label: '🇲🇽  México' }, { value: 'AR', label: '🇦🇷  Argentina' },
  { value: 'US', label: '🇺🇸  Estados Unidos' }, { value: 'ES', label: '🇪🇸  España' },
];

function ProfileScreen({ onBack, onGoFinancial }) {
  const [f, setF] = useMprState({
    firstName: 'José', lastName: 'Otero', email: 'jose@owfinance.com', phone: '+58 412 555 0142',
    country: 'VE', city: 'Caracas', birthdate: '1994-03-12', occupation: 'Diseñador de producto',
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const keys = ['firstName', 'lastName', 'email', 'phone', 'country', 'city', 'birthdate', 'occupation'];
  const pct = Math.round((keys.filter(k => String(f[k] || '').trim() !== '').length / keys.length) * 100);
  const initial = (f.firstName || 'J').trim().charAt(0).toUpperCase();

  const Field = ({ label, hint, children }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>{label}</span>
      {children}
      {hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{hint}</span>}
    </label>
  );
  const Txt = ({ k, ph, type = 'text' }) => (
    <input value={f[k]} type={type} placeholder={ph} onChange={e => set(k, e.target.value)} style={{ ...window.MPC_INPUT }} onFocus={window.mpcFocus} onBlur={window.mpcBlur} />
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <MobileHeader title="Perfil" onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '8px 16px 24px' }}>

        {/* identidad + completitud */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar initial={initial} size={62} />
              <span style={{ position: 'absolute', right: -2, bottom: -2, width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--surface-1)', background: 'var(--surface-3)', color: 'var(--fg-1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 13 }}>photo_camera</span></span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--fg-1)' }}>{f.firstName} {f.lastName}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 5px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>Perfil completado</span>
            <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, fontWeight: 700, color: pct === 100 ? 'var(--income-fg)' : 'var(--brand-primary)' }}>{pct}%</span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: 'var(--surface-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', borderRadius: 999, background: pct === 100 ? 'var(--income)' : 'var(--brand-primary)', transition: 'width 200ms' }} />
          </div>
        </div>

        <MprSection title="Datos personales">
          <Field label="Nombre"><Txt k="firstName" ph="Tu nombre" /></Field>
          <Field label="Apellido"><Txt k="lastName" ph="Tu apellido" /></Field>
          <Field label="Fecha de nacimiento"><Txt k="birthdate" type="date" /></Field>
          <Field label="Ocupación"><Txt k="occupation" ph="Ej: Diseñador" /></Field>
        </MprSection>

        <MprSection title="Contacto">
          <Field label="Correo electrónico" hint="Para iniciar sesión y avisos"><Txt k="email" type="email" ph="tucorreo@dominio.com" /></Field>
          <Field label="Teléfono" hint="Recordatorios y verificación"><Txt k="phone" ph="+58 412 000 0000" /></Field>
        </MprSection>

        <MprSection title="Ubicación">
          <Field label="País">
            <select value={f.country} onChange={e => set('country', e.target.value)} style={{ ...window.MPC_INPUT, appearance: 'none', WebkitAppearance: 'none' }}>
              {MPR_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Ciudad"><Txt k="city" ph="Tu ciudad" /></Field>
        </MprSection>

        <button type="button" onClick={onGoFinancial} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '4px 4px 16px' }}>
          <span className="material-icons" style={{ fontSize: 18 }}>insights</span>Ir a mi perfil financiero
        </button>
        <PillButtonMobile variant="primary" icon="check" fullWidth onPress={onBack}>Guardar cambios</PillButtonMobile>
      </div>
    </div>
  );
}

function MprSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ padding: '0 4px 8px', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--fg-2)' }}>{title}</div>
      <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

Object.assign(window, { ProfileScreen });
