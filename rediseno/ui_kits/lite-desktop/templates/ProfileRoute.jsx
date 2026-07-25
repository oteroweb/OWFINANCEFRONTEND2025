/* ─── ProfileRoute — "Perfil" · datos personales que el usuario rellena ──
 * Identidad + contacto + ubicación. Medidor de completitud arriba.
 * Reutiliza Field / TextInput / Picker de FormControls.
 * Props: onGo(route) para volver a Configuración.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: usePrState } = React;

/* ── Seguridad: cambio de contraseña + indicador de fortaleza (§5 del prompt) ── */
function ChangePasswordCard() {
  const [pwd, setPwd] = usePrState('');
  const [confirm, setConfirm] = usePrState('');
  const [show, setShow] = usePrState(false);
  const [msg, setMsg] = usePrState('');

  const score = (() => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  })();
  const LABELS = [t('Muy débil'), t('Débil'), t('Aceptable'), t('Aceptable'), t('Fuerte')];
  const COLORS = ['var(--expense)', 'var(--expense)', 'var(--warning)', 'var(--warning)', 'var(--income)'];

  const submit = () => {
    if (!pwd && !confirm) return;
    if (pwd.length < 8) { setMsg(t('Mínimo 8 caracteres')); return; }
    if (pwd !== confirm) { setMsg(t('Las contraseñas no coinciden')); return; }
    setMsg(t('Contraseña actualizada')); setPwd(''); setConfirm('');
  };

  return (
    <ProfileSection title={t('Seguridad')}>
      <Field label={t('Nueva contraseña')}>
        <div style={{ position: 'relative' }}>
          <TextInput value={pwd} onChange={v => { setPwd(v); setMsg(''); }} type={show ? 'text' : 'password'} placeholder={t('Mínimo 8 caracteres')} icon="lock" />
          <button type="button" onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}>
            <span className="material-icons" style={{ fontSize: 18 }}>{show ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>
      </Field>
      <Field label={t('Confirmar contraseña')}>
        <TextInput value={confirm} onChange={v => { setConfirm(v); setMsg(''); }} type={show ? 'text' : 'password'} placeholder={t('Repite la contraseña')} icon="lock" />
      </Field>
      {pwd && (
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < score ? COLORS[score] : 'var(--surface-3)' }} />
            ))}
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: COLORS[score] }}>{LABELS[score]}</span>
        </div>
      )}
      {msg && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: msg.includes('actualizada') ? 'var(--income-fg)' : 'var(--expense-fg)' }}>{msg}</div>}
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>{t('Deja estos campos vacíos si no deseas cambiar tu contraseña')}</div>
      <div>
        <button type="button" onClick={submit} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-2)', color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}>
          <span className="material-icons" style={{ fontSize: 16 }}>key</span>{t('Actualizar contraseña')}
        </button>
      </div>
    </ProfileSection>
  );
}

function ProfileRoute({ onGo }) {
  const seed = (window.SAMPLE_USER && window.SAMPLE_USER.profile) || {};
  const [form, setForm] = usePrState({
    firstName: seed.firstName || '', lastName: seed.lastName || '',
    email: seed.email || '', phone: seed.phone || '',
    country: seed.country || 'VE', city: seed.city || '',
    birthdate: seed.birthdate || '', occupation: seed.occupation || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const countryOpts = (window.COUNTRY_OPTS || []).map(c => ({ value: c.value, label: `${c.flag}  ${c.label}` }));

  // completitud: cuántos de los campos clave están rellenos
  const fields = ['firstName', 'lastName', 'email', 'phone', 'country', 'city', 'birthdate', 'occupation'];
  const filled = fields.filter(k => String(form[k] || '').trim() !== '').length;
  const pct = Math.round((filled / fields.length) * 100);
  const initial = (form.firstName || 'J').trim().charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 720, margin: '0 auto', width: '100%' }}>
      {/* encabezado con volver */}
      <div>
        <button type="button" onClick={() => onGo && onGo('config')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '2px 0', marginBottom: 8 }}>
          <span className="material-icons" style={{ fontSize: 17 }}>chevron_left</span>{t('Configuración')}
        </button>
        <Eyebrow>{t('Cuenta')}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Perfil')}</h1>
      </div>

      {/* tarjeta de identidad + completitud */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--brand-primary)', color: 'var(--fg-on-brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 32 }}>{initial}</div>
            <button type="button" title={t('Cambiar foto')} style={{ position: 'absolute', right: -2, bottom: -2, width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--surface-1)', background: 'var(--surface-3)', color: 'var(--fg-1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ fontSize: 15 }}>photo_camera</span>
            </button>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, color: 'var(--fg-1)' }}>{(form.firstName || '—') + ' ' + (form.lastName || '')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{form.email || t('Sin correo')}</span>
              {seed.emailVerified && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--income-fg)', background: 'var(--income-soft)', padding: '2px 8px', borderRadius: 999 }}><span className="material-icons" style={{ fontSize: 13 }}>verified</span>{t('Verificado')}</span>}
            </div>
          </div>
          <div style={{ width: 130 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t('Completado')}</span>
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, fontWeight: 700, color: pct === 100 ? 'var(--income-fg)' : 'var(--brand-primary)' }}>{pct}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: 'var(--surface-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: pct + '%', borderRadius: 999, background: pct === 100 ? 'var(--income)' : 'var(--brand-primary)', transition: 'width var(--dur-base) var(--ease-out)' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* datos personales */}
      <ProfileSection title={t('Datos personales')}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Field label={t('Nombre')} required style={{ flex: '1 1 200px' }}>
            <TextInput value={form.firstName} onChange={v => set('firstName', v)} placeholder={t('Tu nombre')} icon="person" />
          </Field>
          <Field label={t('Apellido')} required style={{ flex: '1 1 200px' }}>
            <TextInput value={form.lastName} onChange={v => set('lastName', v)} placeholder={t('Tu apellido')} icon="person" />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Field label={t('Fecha de nacimiento')} style={{ flex: '1 1 200px' }}>
            <TextInput value={form.birthdate} onChange={v => set('birthdate', v)} type="date" />
          </Field>
          <Field label={t('Ocupación')} style={{ flex: '1 1 200px' }}>
            <TextInput value={form.occupation} onChange={v => set('occupation', v)} placeholder={t('Ej: Diseñador')} icon="work" />
          </Field>
        </div>
      </ProfileSection>

      {/* contacto */}
      <ProfileSection title={t('Contacto')}>
        <Field label={t('Correo electrónico')} required hint={t('Lo usamos para iniciar sesión y avisos')}>
          <TextInput value={form.email} onChange={v => set('email', v)} type="email" placeholder="tucorreo@dominio.com" icon="mail" />
        </Field>
        <Field label={t('Teléfono')} hint={t('Para recordatorios y verificación')}>
          <TextInput value={form.phone} onChange={v => set('phone', v)} placeholder="+58 412 000 0000" icon="call" />
        </Field>
      </ProfileSection>

      {/* ubicación */}
      <ProfileSection title={t('Ubicación')}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Field label={t('País')} style={{ flex: '1 1 200px' }}>
            <Picker value={form.country} onChange={v => set('country', v)} options={countryOpts} placeholder={t('Elige tu país')} />
          </Field>
          <Field label={t('Ciudad')} style={{ flex: '1 1 200px' }}>
            <TextInput value={form.city} onChange={v => set('city', v)} placeholder={t('Tu ciudad')} icon="place" />
          </Field>
        </div>
      </ProfileSection>

      <ChangePasswordCard />

      {/* acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => onGo && onGo('finprofile')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>
          <span className="material-icons" style={{ fontSize: 18 }}>insights</span>{t('Ir a mi perfil financiero')}
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <PillButton variant="ghost" onClick={() => onGo && onGo('config')}>{t('Cancelar')}</PillButton>
          <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', padding: '12px 24px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5 }}>
            <span className="material-icons" style={{ fontSize: 19 }}>check</span>{t('Guardar cambios')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ title, children }) {
  return (
    <div>
      <Eyebrow style={{ marginBottom: 10 }}>{title}</Eyebrow>
      <Card style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</Card>
    </div>
  );
}

Object.assign(window, { ProfileRoute });
