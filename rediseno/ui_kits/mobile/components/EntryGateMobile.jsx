/* ─── EntryGateMobile — landing + auth previo al dashboard (mobile) ──────
 * Ordena el ciclo en el folder mobile: index sin sesión → Landing → Login/Registro.
 * login → dashboard. registro → dashboard + onboarding (1ª vez).
 * Sesión en localStorage('ow-session'); logout: window.__owLogout().
 * Reusa PillButtonMobile + AIAvatar + tokens. Inline styles.
 * Props: onAuthed({ onboard })
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, PillButtonMobile */
const { useState: useGateMState } = React;

function EgmStatusBar() {
  return (
    <div style={{ height: 50, flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 26px 5px' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-1)' }}>
        <span className="material-icons" style={{ fontSize: 15 }}>signal_cellular_alt</span>
        <span className="material-icons" style={{ fontSize: 15 }}>wifi</span>
        <span className="material-icons" style={{ fontSize: 17 }}>battery_full</span>
      </div>
    </div>
  );
}

function EgmLogo({ size = 56 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.32, background: 'linear-gradient(150deg, var(--brand-primary), var(--brand-primary-press))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-float)' }}>
      <span className="material-icons" style={{ fontSize: size * 0.52, color: '#fff' }}>savings</span>
    </div>
  );
}

function EgmInput({ value, onChange, placeholder, type = 'text', icon, onEnter }) {
  const [f, setF] = useGateMState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 15px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-1)', border: f ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)', transition: 'border-color 150ms' }}>
      {icon && <span className="material-icons" style={{ fontSize: 20, color: f ? 'var(--brand-primary)' : 'var(--fg-3)' }}>{icon}</span>}
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)} onKeyDown={e => { if (e.key === 'Enter' && onEnter) onEnter(); }}
        style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-1)' }} />
    </div>
  );
}

function EntryGateMobile({ onAuthed }) {
  const [route, setRoute] = useGateMState('landing');
  const [data, setData] = useGateMState({ name: '', email: '', password: '' });
  const [show, setShow] = useGateMState(false);

  if (route === 'landing') {
    const bullets = [
      { icon: 'savings', text: 'Reparte tu ingreso en cántaros con propósito' },
      { icon: 'auto_awesome', text: 'Un asesor con IA que aprende de ti' },
      { icon: 'insights', text: 'Mira a dónde va tu dinero, sin hojas de cálculo' },
    ];
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
        <EgmStatusBar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px', overflow: 'hidden' }}>
          <div style={{ marginBottom: 26 }}><EgmLogo size={64} /></div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, lineHeight: 1.12, color: 'var(--fg-1)', margin: 0, letterSpacing: '-0.02em' }}>Tu dinero,<br />con un plan claro.</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.5, margin: '14px 0 28px' }}>OW Finance organiza tu ingreso en cántaros y te acompaña para que cada decisión sea fácil.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)' }}><span className="material-icons" style={{ fontSize: 20 }}>{b.icon}</span></span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.35 }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '14px 26px calc(20px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <PillButtonMobile variant="primary" fullWidth icon="arrow_forward" onPress={() => setRoute('register')}>Crear mi cuenta</PillButtonMobile>
          <button type="button" onClick={() => setRoute('login')} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', padding: 6 }}>
            Ya tengo cuenta · <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Iniciar sesión</span>
          </button>
        </div>
      </div>
    );
  }

  const isReg = route === 'register';
  const valid = isReg
    ? data.name.trim() && /\S+@\S+\.\S+/.test(data.email) && data.password.length >= 6
    : /\S+@\S+\.\S+/.test(data.email) && data.password.length >= 1;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
      <EgmStatusBar />
      <div style={{ flexShrink: 0, padding: '2px 18px 4px' }}>
        <button type="button" onClick={() => setRoute('landing')} style={{ border: 0, background: 'var(--surface-1)', cursor: 'pointer', width: 38, height: 38, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-1)', boxShadow: 'var(--shadow-card)' }}>
          <span className="material-icons" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '14px 26px 24px', display: 'flex', flexDirection: 'column' }}>
        {!isReg && <div style={{ marginBottom: 22 }}><EgmLogo size={52} /></div>}
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 25, color: 'var(--fg-1)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{isReg ? 'Crea tu cuenta' : 'Hola de nuevo'}</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', margin: '0 0 22px' }}>{isReg ? 'Menos de un minuto. Luego personalizamos todo a tu medida.' : 'Entra para seguir con tu plan.'}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 18 }}>
          {isReg && <EgmInput value={data.name} onChange={v => setData({ ...data, name: v })} placeholder="Tu nombre" icon="person" />}
          <EgmInput value={data.email} onChange={v => setData({ ...data, email: v })} placeholder="tu@correo.com" type="email" icon="mail" />
          <div style={{ position: 'relative' }}>
            <EgmInput value={data.password} onChange={v => setData({ ...data, password: v })} placeholder={isReg ? 'Contraseña (mín. 6)' : 'Contraseña'} type={show ? 'text' : 'password'} icon="lock" onEnter={() => valid && onAuthed({ onboard: isReg })} />
            <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 20 }}>{show ? 'visibility_off' : 'visibility'}</span></button>
          </div>
        </div>
        <div style={{ opacity: valid ? 1 : 0.5, pointerEvents: valid ? 'auto' : 'none' }}>
          <PillButtonMobile variant="primary" fullWidth icon={isReg ? 'arrow_forward' : 'login'} onPress={() => valid && onAuthed({ onboard: isReg })}>{isReg ? 'Continuar' : 'Iniciar sesión'}</PillButtonMobile>
        </div>
        <div style={{ flex: 1 }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', textAlign: 'center', marginTop: 22 }}>
          {isReg ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}
          <button type="button" onClick={() => setRoute(isReg ? 'login' : 'register')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-body)' }}>{isReg ? 'Inicia sesión' : 'Crear cuenta'}</button>
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { EntryGateMobile });
