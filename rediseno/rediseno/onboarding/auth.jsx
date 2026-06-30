/* ─── Onboarding · Auth (bienvenida · registro · login) ─────────────────
 * Pantallas mobile de entrada. Conectan con el flujo vía onNext/onRoute.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, OnbStatusBar, OnbInput, PillButtonMobile */
const { useState: useAuthState } = React;

/* Logo OW (marca simple por tokens) */
function OnbLogo({ size = 56 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.32, background: 'linear-gradient(150deg, var(--brand-primary) 0%, var(--brand-primary-press) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-float)' }}>
      <span className="material-icons" style={{ fontSize: size * 0.52, color: '#fff' }}>savings</span>
    </div>
  );
}

function OnbSocialRow() {
  const item = (icon, label) => (
    <button type="button" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', border: '1.5px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-1)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>
      <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-2)' }}>{icon}</span>{label}
    </button>
  );
  return (
    <div style={{ display: 'flex', gap: 10 }}>{item('g_translate', 'Google')}{item('apple', 'Apple')}</div>
  );
}

function OnbDivider({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }} />
    </div>
  );
}

/* ── Bienvenida / value prop ── */
function WelcomeScreen({ onStart, onLogin }) {
  const bullets = [
    { icon: 'savings', text: 'Reparte tu ingreso en cántaros con propósito' },
    { icon: 'auto_awesome', text: 'Un asesor con IA que aprende de ti' },
    { icon: 'trending_up', text: 'Mira a dónde va tu dinero, sin hojas de cálculo' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <OnbStatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px', overflow: 'hidden' }}>
        <div style={{ animation: 'onbFloat 5s ease-in-out infinite', marginBottom: 26 }}><OnbLogo size={64} /></div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, lineHeight: 1.12, color: 'var(--fg-1)', margin: 0, letterSpacing: '-0.02em' }}>
          Tu dinero,<br />con un plan claro.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.5, margin: '14px 0 28px' }}>
          OW Finance organiza tu ingreso en cántaros y te acompaña para que cada decisión sea fácil.
        </p>
        <div className="onb-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)' }}>
                <span className="material-icons" style={{ fontSize: 20 }}>{b.icon}</span>
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.35 }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: '14px 26px calc(20px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 11 }}>
        <PillButtonMobile variant="primary" fullWidth icon="arrow_forward" onPress={onStart}>Crear mi cuenta</PillButtonMobile>
        <button type="button" onClick={onLogin} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', padding: 6 }}>
          Ya tengo cuenta · <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Iniciar sesión</span>
        </button>
      </div>
    </div>
  );
}

/* ── Registro ── */
function RegisterScreen({ data, setData, onNext, onLogin, onBack }) {
  const [show, setShow] = useAuthState(false);
  const valid = data.name.trim() && /\S+@\S+\.\S+/.test(data.email) && data.password.length >= 6;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <OnbStatusBar />
      <div style={{ flexShrink: 0, padding: '2px 18px 4px' }}>
        <button type="button" onClick={onBack} style={{ border: 0, background: 'var(--surface-1)', cursor: 'pointer', width: 38, height: 38, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-1)', boxShadow: 'var(--shadow-card)' }}>
          <span className="material-icons" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '10px 26px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 25, color: 'var(--fg-1)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>Crea tu cuenta</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', margin: '0 0 22px' }}>Menos de un minuto. Luego personalizamos todo a tu medida.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 16 }}>
          <OnbInput value={data.name} onChange={v => setData({ ...data, name: v })} placeholder="Tu nombre" icon="person" />
          <OnbInput value={data.email} onChange={v => setData({ ...data, email: v })} placeholder="tu@correo.com" type="email" icon="mail" />
          <div style={{ position: 'relative' }}>
            <OnbInput value={data.password} onChange={v => setData({ ...data, password: v })} placeholder="Contraseña (mín. 6)" type={show ? 'text' : 'password'} icon="lock" onEnter={() => valid && onNext()} />
            <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}>
              <span className="material-icons" style={{ fontSize: 20 }}>{show ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        <PillButtonMobile variant="primary" fullWidth icon="arrow_forward" onPress={() => valid && onNext()}>Continuar</PillButtonMobile>
        <div style={{ opacity: valid ? 0 : 1, height: valid ? 0 : 'auto', transition: 'opacity 200ms', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)', textAlign: 'center', marginTop: 8 }}>
          Completa nombre, correo válido y contraseña de 6+ caracteres.
        </div>

        <div style={{ margin: '18px 0' }}><OnbDivider>o regístrate con</OnbDivider></div>
        <OnbSocialRow />

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', textAlign: 'center', marginTop: 22 }}>
          ¿Ya tienes cuenta? <button type="button" onClick={onLogin} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 600, fontSize: 12.5, fontFamily: 'var(--font-body)' }}>Inicia sesión</button>
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
          Al continuar aceptas los <span style={{ color: 'var(--fg-2)', textDecoration: 'underline' }}>Términos</span> y la <span style={{ color: 'var(--fg-2)', textDecoration: 'underline' }}>Política de privacidad</span>.
        </p>
      </div>
    </div>
  );
}

/* ── Login ── */
function LoginScreen({ data, setData, onNext, onRegister, onBack }) {
  const [show, setShow] = useAuthState(false);
  const valid = /\S+@\S+\.\S+/.test(data.email) && data.password.length >= 1;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <OnbStatusBar />
      <div style={{ flexShrink: 0, padding: '2px 18px 4px' }}>
        <button type="button" onClick={onBack} style={{ border: 0, background: 'var(--surface-1)', cursor: 'pointer', width: 38, height: 38, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-1)', boxShadow: 'var(--shadow-card)' }}>
          <span className="material-icons" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px 26px 24px' }}>
        <div style={{ marginBottom: 22 }}><OnbLogo size={52} /></div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 25, color: 'var(--fg-1)', margin: '0 0 6px' }}>Hola de nuevo</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', margin: '0 0 22px' }}>Entra para seguir con tu plan.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 10 }}>
          <OnbInput value={data.email} onChange={v => setData({ ...data, email: v })} placeholder="tu@correo.com" type="email" icon="mail" />
          <div style={{ position: 'relative' }}>
            <OnbInput value={data.password} onChange={v => setData({ ...data, password: v })} placeholder="Contraseña" type={show ? 'text' : 'password'} icon="lock" onEnter={() => valid && onNext()} />
            <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}>
              <span className="material-icons" style={{ fontSize: 20 }}>{show ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>
        <button type="button" style={{ alignSelf: 'flex-end', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, marginBottom: 20 }}>¿Olvidaste tu contraseña?</button>

        <PillButtonMobile variant="primary" fullWidth icon="login" onPress={() => valid && onNext()}>Iniciar sesión</PillButtonMobile>

        <div style={{ margin: '20px 0' }}><OnbDivider>o continúa con</OnbDivider></div>
        <OnbSocialRow />

        <div style={{ flex: 1 }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', textAlign: 'center', marginTop: 18 }}>
          ¿Aún no tienes cuenta? <button type="button" onClick={onRegister} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-body)' }}>Crear cuenta</button>
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { OnbLogo, WelcomeScreen, RegisterScreen, LoginScreen });
