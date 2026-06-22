/* ─── Onboarding · Panel de fondo + raíz del demo (modal de bienvenida) ──
 * Panel Lite Desktop en estado de usuario NUEVO (saldo en cero, sin
 * movimientos, plan por configurar). El modal de bienvenida aparece encima
 * en el primer acceso. Al terminar, el panel refleja el plan y la
 * completitud del perfil. Barra de demo para re-abrir / alternar estado.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, ReactDOM, AIAvatar, Avatar, MJarMiniBar, OnbRing, OnbLevelBadge,
   onbCompleteness, onbRecommendTemplate, WelcomeModal, WmBtn */
const { useState: useDashState, useEffect: useDashEffect } = React;

/* Logo */
function DashLogo({ size = 32 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <span style={{ width: size, height: size, borderRadius: size * 0.3, background: 'linear-gradient(150deg, var(--brand-primary), var(--brand-primary-press))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-icons" style={{ fontSize: size * 0.54, color: '#fff' }}>savings</span>
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.5, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>OW Finance</span>
    </span>
  );
}

/* Tarjeta de saldo (estado cero del usuario nuevo) */
function DashHero({ userName }) {
  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-2xl, 28px)', boxShadow: 'var(--shadow-float)', padding: 30 }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 10 }}>Saldo disponible</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 46, color: 'var(--fg-1)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>$ 0.00</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--fg-3)', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 7, marginBottom: 6 }}>USD</span>
      </div>
      <div style={{ display: 'flex', gap: 28, marginTop: 22 }}>
        {[{ l: 'Ingresos del mes', v: '$ 0.00' }, { l: 'Gastos del mes', v: '$ 0.00' }].map((k, i) => (
          <div key={i}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 5 }}>{k.l}</div>
            <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 17, color: 'var(--fg-2)', fontVariantNumeric: 'tabular-nums' }}>{k.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Tarjeta de cántaros: vacía (sin plan) o con el esquema elegido */
function DashJars({ tpl }) {
  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>
          <span className="material-icons" style={{ fontSize: 20, color: 'var(--brand-primary)' }}>savings</span>Tus cántaros
        </span>
        {tpl && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{tpl.name}</span>}
      </div>
      {tpl ? (
        <div>
          <MJarMiniBar segments={tpl.segments} height={16} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            {tpl.segments.slice(0, 6).map((s, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color }} />{s.name}
              </span>
            ))}
            {tpl.segments.length > 6 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-3)' }}>+{tpl.segments.length - 6} más</span>}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 10px 14px' }}>
          <span style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--surface-2)', color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><span className="material-icons" style={{ fontSize: 24 }}>add</span></span>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5, maxWidth: 220 }}>Aún no tienes un plan de cántaros. Completa tu perfil para configurarlo.</div>
        </div>
      )}
    </div>
  );
}

/* Movimientos recientes — estado vacío del usuario nuevo */
function DashRecent() {
  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>Movimientos recientes</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 10px 14px' }}>
        <span style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--surface-2)', color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><span className="material-icons" style={{ fontSize: 24 }}>receipt_long</span></span>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5, maxWidth: 220 }}>Aún no hay movimientos. Registra el primero con el botón añadir.</div>
      </div>
    </div>
  );
}

/* Nudge de perfil: visible mientras el perfil no está completo */
function DashProfileNudge({ comp, completed, onContinue }) {
  if (completed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--income-soft)', border: '1px solid var(--income)', borderRadius: 'var(--radius-lg)', padding: '14px 18px' }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: 'var(--income-fg)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 20 }}>check</span></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>Perfil completo · nivel {comp.level.label}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>Tu asesor ya trabaja con tu información.</div>
        </div>
        <OnbLevelBadge level={comp.level} size="sm" />
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '16px 20px' }}>
      <OnbRing pct={comp.pct} size={52} stroke={6} color={comp.level.color}>
        <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>{comp.pct}%</span>
      </OnbRing>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, color: 'var(--fg-1)', marginBottom: 2 }}>Completa tu perfil</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>Tu asesor personaliza tus consejos y arma tu plan a tu medida.</div>
      </div>
      <WmBtn variant="primary" size="sm" iconRight="arrow_forward" onClick={onContinue}>Continuar</WmBtn>
    </div>
  );
}

/* Nav pill flotante (Lite Desktop) */
function DashNavPill() {
  const items = [{ icon: 'home', label: 'Inicio', on: true }, { icon: 'receipt_long', label: 'Movimientos' }, { icon: 'savings', label: 'Cántaros' }, { icon: 'settings', label: 'Ajustes' }];
  return (
    <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, padding: 7, borderRadius: 999, background: 'var(--surface-1)', boxShadow: 'var(--shadow-float)', zIndex: 5 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 999, background: it.on ? 'var(--brand-primary)' : 'transparent', color: it.on ? '#fff' : 'var(--fg-2)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600 }}>
          <span className="material-icons" style={{ fontSize: 19 }}>{it.icon}</span>{it.on && it.label}
        </div>
      ))}
      <div style={{ width: 1, height: 24, background: 'var(--border-hairline)', margin: '0 2px' }} />
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 999, background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 700 }}>
        <span className="material-icons" style={{ fontSize: 19 }}>add</span>Añadir
      </div>
    </div>
  );
}

/* Panel completo */
function DashPanel({ userName, profile, chosenSlug, completed, onOpenModal, blurred }) {
  const comp = onbCompleteness({ ...profile, template_slug: chosenSlug || profile.template_slug }, { pro: false });
  const tpl = completed ? (window.JAR_TEMPLATES || []).find(t => t.slug === (chosenSlug || profile.template_slug)) : null;
  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--bg-canvas)', filter: blurred ? 'blur(3px)' : 'none', transform: blurred ? 'scale(1.01)' : 'none', transition: 'filter 280ms, transform 280ms' }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '26px 32px 6px' }}>
        <DashLogo size={30} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', color: 'var(--fg-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><span className="material-icons" style={{ fontSize: 21 }}>notifications</span></span>
          <Avatar initial={(userName || 'J')[0]} size={40} />
        </div>
      </div>
      {/* Greeting */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 32px 0' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)' }}>Hola{userName ? ',' : ''}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--fg-1)', letterSpacing: '-0.01em', marginBottom: 18 }}>{userName || 'tu panel'}</div>
        <DashProfileNudge comp={comp} completed={completed} onContinue={onOpenModal} />
      </div>
      {/* Content grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 32px 120px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <DashHero userName={userName} />
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18 }}>
          <DashJars tpl={tpl} />
          <DashRecent />
        </div>
      </div>
      <DashNavPill />
    </div>
  );
}

/* Toast de confirmación */
function DashToast({ show, text }) {
  return (
    <div style={{ position: 'absolute', bottom: 90, left: '50%', transform: `translateX(-50%) translateY(${show ? 0 : 16}px)`, opacity: show ? 1 : 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--fg-1)', color: 'var(--bg-canvas)', padding: '12px 18px', borderRadius: 999, boxShadow: 'var(--shadow-float)', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, zIndex: 6, transition: 'opacity 240ms, transform 240ms', maxWidth: '90%' }}>
      <span className="material-icons" style={{ fontSize: 18, color: 'var(--income)' }}>check_circle</span>{text}
    </div>
  );
}

/* ═══ Landing (entrada del ciclo) ═══ */
function WmLanding({ onRegister, onLogin }) {
  const feats = [
    { icon: 'savings', t: 'Cántaros con propósito', d: 'Reparte tu ingreso en frascos que reflejan tu vida, no una hoja de cálculo.' },
    { icon: 'auto_awesome', t: 'Asesor con IA', d: 'Aprende de tu perfil y te aconseja en tu idioma, sin juicios.' },
    { icon: 'insights', t: 'Claridad mes a mes', d: 'Ves a dónde va tu dinero y cuánto te queda disponible, siempre.' },
  ];
  return (
    <div className="wm-scroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--bg-canvas)' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 36px' }}>
        <DashLogo size={30} />
        <div style={{ display: 'flex', gap: 10 }}>
          <WmBtn variant="ghost" size="sm" onClick={onLogin}>Iniciar sesión</WmBtn>
          <WmBtn variant="primary" size="sm" onClick={onRegister}>Crear cuenta</WmBtn>
        </div>
      </div>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '20px 36px 48px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center' }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--brand-primary)', background: 'var(--brand-primary-soft)', padding: '6px 13px', borderRadius: 999, marginBottom: 18 }}><span className="material-icons" style={{ fontSize: 15 }}>auto_awesome</span>Finanzas personales con IA</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 44, lineHeight: 1.06, letterSpacing: '-0.025em', color: 'var(--fg-1)', margin: '0 0 16px' }}>Tu dinero,<br />con un plan claro.</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--fg-2)', lineHeight: 1.5, margin: '0 0 28px', maxWidth: 420 }}>OW organiza tu ingreso en cántaros y te acompaña con un asesor que aprende de ti. Empieza en dos minutos.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <WmBtn variant="primary" size="lg" iconRight="arrow_forward" onClick={onRegister}>Crear mi cuenta gratis</WmBtn>
            <WmBtn variant="ghost" size="lg" onClick={onLogin}>Ya tengo cuenta</WmBtn>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {feats.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 15, alignItems: 'flex-start', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 18 }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)' }}><span className="material-icons" style={{ fontSize: 24 }}>{f.icon}</span></span>
              <div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--fg-1)', marginBottom: 3 }}>{f.t}</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>{f.d}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ Auth (registro / login) ═══ */
function WmAuth({ mode, data, setData, onSubmit, onSwap, onBack }) {
  const [show, setShow] = useDashState(false);
  const isReg = mode === 'register';
  const valid = isReg
    ? data.name.trim() && /\S+@\S+\.\S+/.test(data.email) && data.password.length >= 6
    : /\S+@\S+\.\S+/.test(data.email) && data.password.length >= 1;
  return (
    <div className="wm-scroll" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--bg-canvas)' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '22px 36px' }}>
        <WmBtn variant="ghost" size="sm" icon="arrow_back" onClick={onBack}>Inicio</WmBtn>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '14px 24px 48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><DashLogo size={36} /></div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--fg-1)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{isReg ? 'Crea tu cuenta' : 'Hola de nuevo'}</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--fg-2)', margin: 0 }}>{isReg ? 'Menos de un minuto. Luego tu asesor personaliza todo.' : 'Entra para seguir con tu plan.'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isReg && <OnbInput value={data.name} onChange={v => setData({ ...data, name: v })} placeholder="Tu nombre" icon="person" />}
            <OnbInput value={data.email} onChange={v => setData({ ...data, email: v })} placeholder="tu@correo.com" type="email" icon="mail" />
            <div style={{ position: 'relative' }}>
              <OnbInput value={data.password} onChange={v => setData({ ...data, password: v })} placeholder={isReg ? 'Contraseña (mín. 6)' : 'Contraseña'} type={show ? 'text' : 'password'} icon="lock" onEnter={() => valid && onSubmit()} />
              <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 20 }}>{show ? 'visibility_off' : 'visibility'}</span></button>
            </div>
            <div style={{ marginTop: 6, opacity: valid ? 1 : 0.55, pointerEvents: valid ? 'auto' : 'none' }}><WmBtn variant="primary" fullWidth icon={isReg ? 'arrow_forward' : 'login'} onClick={() => valid && onSubmit()}>{isReg ? 'Continuar' : 'Iniciar sesión'}</WmBtn></div>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', textAlign: 'center', marginTop: 22 }}>
            {isReg ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}
            <button type="button" onClick={onSwap} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-body)' }}>{isReg ? 'Inicia sesión' : 'Crear cuenta'}</button>
          </p>
          {isReg && <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>Al continuar, tu asesor abrirá el onboarding para llenar tu perfil.</p>}
        </div>
      </div>
    </div>
  );
}

/* ═══ Raíz del demo ═══ */
const WM_BLANK = window.ONB_BLANK;

function WmRoot() {
  const [theme, setTheme] = useDashState('light');
  const [phase, setPhase] = useDashState('landing'); // landing | register | login | app
  const [auth, setAuth] = useDashState({ name: '', email: '', password: '' });
  const [profile, setProfile] = useDashState({ ...WM_BLANK });
  const [chosenSlug, setChosenSlug] = useDashState(null);
  const [modalOpen, setModalOpen] = useDashState(false);
  const [completed, setCompleted] = useDashState(false);
  const [toast, setToast] = useDashState(false);

  useDashEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const setField = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const userName = (auth.name || '').trim().split(' ')[0] || '';

  /* Registro (usuario nuevo) → dashboard + modal de bienvenida (1ª vez) */
  const doRegister = () => {
    setAuth(a => ({ ...a, name: a.name.trim() || 'José' }));
    setProfile({ ...WM_BLANK }); setChosenSlug(null); setCompleted(false); setToast(false);
    setPhase('app'); setTimeout(() => setModalOpen(true), 420);
  };
  /* Login (usuario recurrente) → dashboard directo, perfil ya completo */
  const doLogin = () => {
    const seed = window.AI_PROFILE || {};
    setAuth(a => ({ ...a, name: a.name.trim() || 'José Pérez' }));
    setProfile({ ...WM_BLANK, ...seed }); setChosenSlug(seed.template_slug || 'moderado'); setCompleted(true); setModalOpen(false); setToast(false);
    setPhase('app');
  };
  const restart = () => { setAuth({ name: '', email: '', password: '' }); setProfile({ ...WM_BLANK }); setChosenSlug(null); setCompleted(false); setModalOpen(false); setToast(false); setPhase('landing'); };

  const onComplete = (slug) => {
    setChosenSlug(slug || onbRecommendTemplate(profile).slug);
    setProfile(p => ({ ...p, template_slug: slug || onbRecommendTemplate(p).slug }));
    setCompleted(true);
    setToast(true);
    setTimeout(() => setToast(false), 3400);
  };

  const stages = [
    { id: 'landing', icon: 'waving_hand', label: 'Landing' },
    { id: 'auth', icon: 'person_add', label: 'Registro / Login' },
    { id: 'app', icon: 'dashboard', label: 'Dashboard' },
  ];
  const stageIdx = phase === 'landing' ? 0 : phase === 'app' ? 2 : 1;

  const ctl = (icon, label, onClick) => (
    <button type="button" onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 0, cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#C3CAD6', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '8px 13px', borderRadius: 999, transition: 'background 140ms, color 140ms' }}>
      <span className="material-icons" style={{ fontSize: 15 }}>{icon}</span>{label}
    </button>
  );

  let view;
  if (phase === 'landing') {
    view = <WmLanding onRegister={() => setPhase('register')} onLogin={() => setPhase('login')} />;
  } else if (phase === 'register' || phase === 'login') {
    view = <WmAuth mode={phase} data={auth} setData={setAuth} onBack={() => setPhase('landing')} onSwap={() => setPhase(phase === 'register' ? 'login' : 'register')} onSubmit={() => (phase === 'register' ? doRegister() : doLogin())} />;
  } else {
    view = (
      <React.Fragment>
        <DashPanel userName={userName} profile={profile} chosenSlug={chosenSlug} completed={completed} onOpenModal={() => setModalOpen(true)} blurred={modalOpen} />
        <DashToast show={toast} text="Perfil guardado · plan configurado" />
        {modalOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
            <div onClick={() => setModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,11,18,0.55)' }} />
            <div style={{ position: 'relative', width: '100%', maxWidth: 540, maxHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)', borderRadius: 'var(--radius-2xl, 28px)', boxShadow: '0 30px 80px rgba(0,0,0,0.45)', overflow: 'hidden', animation: 'wmPopIn .42s var(--ease-out)' }}>
              <WelcomeModal userName={userName} profile={profile} setField={setField} chosenSlug={chosenSlug} setChosenSlug={setChosenSlug} onClose={() => setModalOpen(false)} onComplete={onComplete} />
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 22px 40px' }}>
      {/* Barra de demo: ciclo de entrada + controles */}
      <div style={{ width: '100%', maxWidth: 1180, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A6478' }}>Ciclo</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {stages.map((s, i) => (
            <React.Fragment key={s.id}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 999, background: i === stageIdx ? 'var(--brand-primary)' : 'rgba(255,255,255,0.06)', color: i === stageIdx ? '#fff' : i < stageIdx ? '#9FE3C2' : '#7A8395', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>
                <span className="material-icons" style={{ fontSize: 14 }}>{i < stageIdx ? 'check' : s.icon}</span>{s.label}
              </span>
              {i < stages.length - 1 && <span className="material-icons" style={{ fontSize: 15, color: '#3A4456' }}>chevron_right</span>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        {phase === 'app' && !completed && ctl('auto_awesome', 'Re-abrir bienvenida', () => setModalOpen(true))}
        {ctl('refresh', 'Reiniciar ciclo', restart)}
        {ctl(theme === 'light' ? 'dark_mode' : 'light_mode', theme === 'light' ? 'Oscuro' : 'Claro', () => setTheme(t => t === 'light' ? 'dark' : 'light'))}
      </div>

      {/* Marco navegador */}
      <div style={{ width: '100%', maxWidth: 1180, borderRadius: 14, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)', background: 'var(--surface-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', background: theme === 'light' ? '#E4E7EE' : '#1d2230' }}>
          <div style={{ display: 'flex', gap: 8 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} /><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} /><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} /></div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 12.5, color: theme === 'light' ? '#5A6478' : '#9AA3B2' }}>
            <span className="material-icons" style={{ fontSize: 14 }}>lock</span>app.owfinance.com
          </div>
          <div style={{ width: 54 }} />
        </div>
        {/* Viewport */}
        <div style={{ position: 'relative', height: 768, overflow: 'hidden', background: 'var(--bg-canvas)' }}>
          {view}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<WmRoot />);
