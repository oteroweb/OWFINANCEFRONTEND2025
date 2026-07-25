/* ─── EntryGate — landing + auth previo al dashboard ────────────────────
 * Ordena el ciclo: al abrir el index sin sesión → Landing → Login/Registro.
 * login → dashboard. registro → dashboard + abre onboarding (1ª vez).
 * Sesión persistida en localStorage('ow-session'); logout: window.__owLogout().
 * Reusa PillButton + tokens del kit. Inline styles (paint inmediato).
 * Props: onAuthed({ onboard })
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, PillButton */
const { useState: useGateState } = React;

function EntryGate({ onAuthed }) {
  const [route, setRoute] = useGateState('landing'); // landing | login | register | forgot | reset
  const [data, setData] = useGateState({ name: '', email: '', password: '' });
  const tt = (window.t || ((s) => s));

  if (route === 'landing') return <GateLanding onRegister={() => setRoute('register')} onLogin={() => setRoute('login')} />;
  if (route === 'forgot') return <GateForgotPassword email={data.email} setEmail={v => setData({ ...data, email: v })} onBack={() => setRoute('login')} onSent={() => setRoute('reset')} />;
  if (route === 'reset') return <GateResetPassword onBack={() => setRoute('login')} onDone={() => setRoute('login')} />;
  return <GateAuth mode={route} data={data} setData={setData}
    onBack={() => setRoute('landing')}
    onSwap={() => setRoute(route === 'login' ? 'register' : 'login')}
    onForgot={() => setRoute('forgot')}
    onSubmit={() => onAuthed({ onboard: route === 'register' })} />;
}

/* Medidor de fuerza (§ ChangePasswordCard, reusado acá — mismo criterio:
 * longitud≥8, mayúscula, número, carácter especial). */
function useStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
const STRENGTH_LABELS = ['Muy débil', 'Débil', 'Aceptable', 'Aceptable', 'Fuerte'];
const STRENGTH_COLORS = ['var(--expense)', 'var(--expense)', 'var(--warning)', 'var(--warning)', 'var(--income)'];
function StrengthMeter({ pwd }) {
  if (!pwd) return null;
  const score = useStrength(pwd);
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < score ? STRENGTH_COLORS[score] : 'var(--surface-3)' }} />)}
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: STRENGTH_COLORS[score] }}>{(window.t || (s => s))(STRENGTH_LABELS[score])}</span>
    </div>
  );
}

/* Botones sociales decorativos — sin función real, igual que en LoginPage.vue (§9 del prompt). */
function GateSocialButtons() {
  const tf = (window.t || (s => s));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>{tf('o continúa con')}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {[['G', 'Google'], ['', 'Apple']].map(([label, name]) => (
          <button key={name} type="button" title={tf(`${name} (decorativo, sin función real)`)}
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1.5px solid var(--border-hairline)', background: 'var(--surface-1)', cursor: 'not-allowed', padding: '11px 0', borderRadius: 'var(--radius-lg)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'var(--fg-2)' }}>
            <span className="material-icons" style={{ fontSize: 18 }}>{name === 'Apple' ? 'apple' : 'g_translate'}</span>{name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Recuperar contraseña — ForgotPasswordPage.vue: email → banner de éxito. */
function GateForgotPassword({ email, setEmail, onBack, onSent }) {
  const [sent, setSent] = useGateState(false);
  const tf = (window.t || (s => s));
  const valid = /\S+@\S+\.\S+/.test(email);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column' }}>
      <GateTopBar right={<PillButton variant="ghost" size="sm" icon="arrow_back" onClick={onBack}>{tf('Inicio de sesión')}</PillButton>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <span style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--brand-primary-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 26, color: 'var(--brand-primary)' }}>lock_reset</span></span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--fg-1)', margin: '0 0 6px' }}>{tf('¿Olvidaste tu contraseña?')}</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', margin: 0 }}>{tf('Te enviamos un enlace para restablecerla.')}</p>
          </div>
          {sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center' }}>
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--income-soft)', color: 'var(--income-fg)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>
                ✅ {tf('Revisa tu correo')} ({email}) {tf('para restablecer tu contraseña.')}
              </div>
              <button type="button" onClick={onSent} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{tf('Ya tengo el enlace →')}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <GateInput value={email} onChange={setEmail} placeholder="tu@correo.com" type="email" icon="mail" onEnter={() => valid && setSent(true)} />
              <div style={{ opacity: valid ? 1 : 0.55, pointerEvents: valid ? 'auto' : 'none' }}>
                <PillButton variant="primary" icon="send" onClick={() => valid && setSent(true)}>{tf('Enviar enlace')}</PillButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Restablecer contraseña — ResetPasswordPage.vue: nueva contraseña + confirmar → banner de éxito. */
function GateResetPassword({ onBack, onDone }) {
  const [pwd, setPwd] = useGateState('');
  const [confirm, setConfirm] = useGateState('');
  const [show, setShow] = useGateState(false);
  const [done, setDone] = useGateState(false);
  const [err, setErr] = useGateState('');
  const tf = (window.t || (s => s));

  const submit = () => {
    if (pwd.length < 8) { setErr(tf('Mínimo 8 caracteres')); return; }
    if (pwd !== confirm) { setErr(tf('Las contraseñas no coinciden')); return; }
    setErr(''); setDone(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column' }}>
      <GateTopBar right={<PillButton variant="ghost" size="sm" icon="arrow_back" onClick={onBack}>{tf('Inicio de sesión')}</PillButton>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--fg-1)', margin: '0 0 6px' }}>{tf('Elige una nueva contraseña')}</h1>
          </div>
          {done ? (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--income-soft)', color: 'var(--income-fg)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
              ✅ {tf('Contraseña actualizada — ya puedes iniciar sesión.')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <GateInput value={pwd} onChange={v => { setPwd(v); setErr(''); }} placeholder={tf('Nueva contraseña')} type={show ? 'text' : 'password'} icon="lock" />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 20 }}>{show ? 'visibility_off' : 'visibility'}</span></button>
              </div>
              <StrengthMeter pwd={pwd} />
              <GateInput value={confirm} onChange={v => { setConfirm(v); setErr(''); }} placeholder={tf('Confirmar contraseña')} type={show ? 'text' : 'password'} icon="lock" onEnter={submit} />
              {err && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--expense-fg)' }}>{err}</div>}
              <div><PillButton variant="primary" icon="check" onClick={submit}>{tf('Guardar contraseña')}</PillButton></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GateBrand({ size = 34 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: size, height: size, borderRadius: size * 0.3, background: 'linear-gradient(150deg, var(--brand-primary), var(--brand-primary-press))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-icons" style={{ fontSize: size * 0.54, color: '#fff' }}>savings</span>
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.44, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>OW Finance</span>
    </span>
  );
}

function GateTopBar({ right }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-hairline)', background: 'var(--surface-1)' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px' }}>
        <GateBrand /><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{right}</div>
      </div>
    </div>
  );
}

function GateLanding({ onRegister, onLogin }) {
  const feats = [
    { icon: 'savings', t: 'Cántaros con propósito', d: 'Reparte tu ingreso en frascos que reflejan tu vida, no una hoja de cálculo.' },
    { icon: 'auto_awesome', t: 'Asesor con IA', d: 'Aprende de tu perfil y te aconseja en tu idioma, sin juicios.' },
    { icon: 'insights', t: 'Claridad mes a mes', d: 'Ves a dónde va tu dinero y cuánto te queda disponible, siempre.' },
  ];
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column' }}>
      <GateTopBar right={<>
        <PillButton variant="ghost" size="sm" onClick={onLogin}>Iniciar sesión</PillButton>
        <PillButton variant="primary" size="sm" onClick={onRegister}>Crear cuenta</PillButton>
      </>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '56px 32px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'center', width: '100%' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--brand-primary)', background: 'var(--brand-primary-soft)', padding: '6px 13px', borderRadius: 999, marginBottom: 20 }}>
              <span className="material-icons" style={{ fontSize: 15 }}>auto_awesome</span>Finanzas personales con IA
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--fg-1)', margin: '0 0 18px' }}>Tu dinero,<br />con un plan claro.</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--fg-2)', lineHeight: 1.5, margin: '0 0 30px', maxWidth: 450 }}>OW organiza tu ingreso en cántaros y te acompaña con un asesor que aprende de ti. Empieza en dos minutos.</p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <PillButton variant="primary" icon="arrow_forward" onClick={onRegister}>Crear mi cuenta gratis</PillButton>
              <PillButton variant="ghost" onClick={onLogin}>Ya tengo cuenta</PillButton>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {feats.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 15, alignItems: 'flex-start', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 18 }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)' }}><span className="material-icons" style={{ fontSize: 24 }}>{f.icon}</span></span>
                <div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--fg-1)', marginBottom: 3 }}>{f.t}</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>{f.d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GateInput({ value, onChange, placeholder, type = 'text', icon, onEnter }) {
  const [f, setF] = useGateState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-1)', border: f ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)', transition: 'border-color 150ms' }}>
      {icon && <span className="material-icons" style={{ fontSize: 20, color: f ? 'var(--brand-primary)' : 'var(--fg-3)' }}>{icon}</span>}
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)} onKeyDown={e => { if (e.key === 'Enter' && onEnter) onEnter(); }}
        style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-1)' }} />
    </div>
  );
}

function GateAuth({ mode, data, setData, onSubmit, onSwap, onBack, onForgot }) {
  const [show, setShow] = useGateState(false);
  const isReg = mode === 'register';
  const valid = isReg
    ? data.name.trim() && /\S+@\S+\.\S+/.test(data.email) && data.password.length >= 6
    : /\S+@\S+\.\S+/.test(data.email) && data.password.length >= 1;
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column' }}>
      <GateTopBar right={<PillButton variant="ghost" size="sm" icon="arrow_back" onClick={onBack}>Inicio</PillButton>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><GateBrand size={46} /></div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 27, color: 'var(--fg-1)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{isReg ? 'Crea tu cuenta' : 'Hola de nuevo'}</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--fg-2)', margin: 0 }}>{isReg ? 'Menos de un minuto. Luego personalizamos todo.' : 'Entra para seguir con tu plan.'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isReg && <GateInput value={data.name} onChange={v => setData({ ...data, name: v })} placeholder="Tu nombre" icon="person" />}
            <GateInput value={data.email} onChange={v => setData({ ...data, email: v })} placeholder="tu@correo.com" type="email" icon="mail" />
            <div style={{ position: 'relative' }}>
              <GateInput value={data.password} onChange={v => setData({ ...data, password: v })} placeholder={isReg ? 'Contraseña (mín. 6)' : 'Contraseña'} type={show ? 'text' : 'password'} icon="lock" onEnter={() => valid && onSubmit()} />
              <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 20 }}>{show ? 'visibility_off' : 'visibility'}</span></button>
            </div>
            {isReg && <StrengthMeter pwd={data.password} />}
            {!isReg && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <button type="button" onClick={onForgot} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>¿Olvidaste tu contraseña?</button>
              </div>
            )}
            <div style={{ marginTop: 6, opacity: valid ? 1 : 0.55, pointerEvents: valid ? 'auto' : 'none' }}><PillButton variant="primary" icon={isReg ? 'arrow_forward' : 'login'} onClick={() => valid && onSubmit()}>{isReg ? 'Continuar' : 'Iniciar sesión'}</PillButton></div>
            <GateSocialButtons />
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', textAlign: 'center', marginTop: 24 }}>
            {isReg ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}
            <button type="button" onClick={onSwap} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-body)' }}>{isReg ? 'Inicia sesión' : 'Crear cuenta'}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EntryGate });
