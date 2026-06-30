/* ─── Onboarding · Flujo DESKTOP (tarjeta centrada · ciclo completo) ─────
 * Ordena el ciclo: landing → register/login → intro → wizard → recommend →
 * summary → done → app (handoff). Una pregunta por pantalla, centrada y amplia.
 * Reutiliza flow-data + onb-atoms + gamification + profile-panel + onbRecommendTemplate.
 * Presentación propia (no usa los componentes mobile de phone-frame).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, OnbChoice, OnbInput, onbRecommendTemplate, OnbVoiceButton, OnbRing,
   OnbLevelBadge, onbCompleteness, AIAvatar, MJarMiniBar */
const { useState: useDkState, useEffect: useDkEffect, useRef: useDkRef } = React;

const DK_MAXW = 940;

/* Estilos inyectados */
if (typeof document !== 'undefined' && !document.getElementById('dk-style')) {
  const s = document.createElement('style');
  s.id = 'dk-style';
  s.textContent =
    /* Entradas SOLO transform: el estado base es visible (opacity:1) pase lo que pase. */
    '@keyframes dkIn{from{transform:translateY(16px)}to{transform:translateY(0)}}' +
    '@keyframes dkFade{from{transform:translateY(6px)}to{transform:translateY(0)}}' +
    '@keyframes dkPop{0%{transform:scale(.96)}60%{transform:scale(1.02)}100%{transform:scale(1)}}' +
    '@keyframes dkFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}' +
    '.dk-stagger>*{animation:dkIn .5s var(--ease-out) both}' +
    '.dk-stagger>*:nth-child(1){animation-delay:.04s}.dk-stagger>*:nth-child(2){animation-delay:.12s}' +
    '.dk-stagger>*:nth-child(3){animation-delay:.20s}.dk-stagger>*:nth-child(4){animation-delay:.28s}';
  document.head.appendChild(s);
}

/* Botón pill desktop */
function DkBtn({ children, icon, iconRight, variant = 'primary', onClick, size = 'md', fullWidth }) {
  const [h, setH] = useDkState(false);
  const pad = size === 'lg' ? '15px 30px' : size === 'sm' ? '9px 16px' : '13px 24px';
  const fs = size === 'lg' ? 16 : size === 'sm' ? 13.5 : 15;
  const map = {
    primary: { bg: h ? 'var(--brand-primary-hover)' : 'var(--brand-primary)', color: '#fff', sh: 'none', bd: 0 },
    ghost: { bg: h ? 'var(--surface-2)' : 'transparent', color: 'var(--fg-1)', sh: 'none', bd: '1.5px solid var(--border-hairline)' },
    soft: { bg: h ? 'var(--surface-2)' : 'var(--surface-1)', color: 'var(--fg-1)', sh: 'var(--shadow-card)', bd: 0 },
  }[variant] || {};
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: fs, border: map.bd, borderRadius: 'var(--radius-pill)', cursor: 'pointer', padding: pad, background: map.bg, color: map.color, boxShadow: map.sh, width: fullWidth ? '100%' : 'auto', transition: 'background 160ms' }}>
      {icon && <span className="material-icons" style={{ fontSize: fs + 3 }}>{icon}</span>}{children}{iconRight && <span className="material-icons" style={{ fontSize: fs + 3 }}>{iconRight}</span>}
    </button>
  );
}

/* Logo */
function DkLogo({ size = 40 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: size, height: size, borderRadius: size * 0.3, background: 'linear-gradient(150deg, var(--brand-primary), var(--brand-primary-press))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-icons" style={{ fontSize: size * 0.54, color: '#fff' }}>savings</span>
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.42, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>OW Finance</span>
    </span>
  );
}

/* Top bar del flujo */
function DkTopBar({ right, progress }) {
  return (
    <div style={{ flexShrink: 0, borderBottom: '1px solid var(--border-hairline)', background: 'var(--surface-1)' }}>
      <div style={{ maxWidth: DK_MAXW, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 32px' }}>
        <DkLogo size={34} />
        {progress && <div style={{ flex: 1, maxWidth: 360, margin: '0 auto' }}>{progress}</div>}
        <div style={{ flex: progress ? 0 : 1 }} />
        {right}
      </div>
    </div>
  );
}

/* Progreso por fases (horizontal, con labels) */
function DkProgress({ phases, phaseIndex, withinPhase }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {phases.map((ph, i) => {
        const done = i < phaseIndex, active = i === phaseIndex;
        const fill = done ? 1 : active ? withinPhase : 0;
        return (
          <div key={ph.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: (fill * 100) + '%', borderRadius: 3, background: 'var(--brand-primary)', transition: 'width 400ms var(--ease-out)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: active ? 700 : 600, color: active || done ? 'var(--brand-primary)' : 'var(--fg-3)', textAlign: 'center' }}>{ph.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── LANDING (entrada del ciclo · resuelve "dashboard en vez de landing") ── */
function DkLanding({ onRegister, onLogin }) {
  const feats = [
    { icon: 'savings', t: 'Cántaros con propósito', d: 'Reparte tu ingreso en frascos que reflejan tu vida, no una hoja de cálculo.' },
    { icon: 'auto_awesome', t: 'Asesor con IA', d: 'Aprende de tu perfil y te aconseja en tu idioma, sin juicios.' },
    { icon: 'insights', t: 'Claridad mes a mes', d: 'Ves a dónde va tu dinero y cuánto te queda disponible, siempre.' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DkTopBar right={<div style={{ display: 'flex', gap: 10 }}><DkBtn variant="ghost" size="sm" onClick={onLogin}>Iniciar sesión</DkBtn><DkBtn variant="primary" size="sm" onClick={onRegister}>Crear cuenta</DkBtn></div>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: DK_MAXW, margin: '0 auto', padding: '48px 32px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'center', width: '100%' }}>
          {/* Hero copy */}
          <div className="dk-stagger">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--brand-primary)', background: 'var(--brand-primary-soft)', padding: '6px 13px', borderRadius: 999, marginBottom: 20 }}>
              <span className="material-icons" style={{ fontSize: 15 }}>auto_awesome</span>Finanzas personales con IA
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 50, lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--fg-1)', margin: '0 0 18px' }}>
              Tu dinero,<br />con un plan claro.
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--fg-2)', lineHeight: 1.5, margin: '0 0 30px', maxWidth: 440 }}>
              OW organiza tu ingreso en cántaros y te acompaña con un asesor que aprende de ti. Empieza en dos minutos.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <DkBtn variant="primary" size="lg" iconRight="arrow_forward" onClick={onRegister}>Crear mi cuenta gratis</DkBtn>
              <DkBtn variant="ghost" size="lg" onClick={onLogin}>Ya tengo cuenta</DkBtn>
            </div>
          </div>
          {/* Feature cards */}
          <div className="dk-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {feats.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 15, alignItems: 'flex-start', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 18 }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)' }}>
                  <span className="material-icons" style={{ fontSize: 24 }}>{f.icon}</span>
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--fg-1)', marginBottom: 3 }}>{f.t}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AUTH (centrada) ── */
function DkAuthCard({ mode, data, setData, onSubmit, onSwap, onBack }) {
  const [show, setShow] = useDkState(false);
  const isReg = mode === 'register';
  const valid = isReg
    ? data.name.trim() && /\S+@\S+\.\S+/.test(data.email) && data.password.length >= 6
    : /\S+@\S+\.\S+/.test(data.email) && data.password.length >= 1;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DkTopBar right={<DkBtn variant="ghost" size="sm" icon="arrow_back" onClick={onBack}>Inicio</DkBtn>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'dkIn .5s var(--ease-out)' }}>
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><DkLogo size={46} /></div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 27, color: 'var(--fg-1)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{isReg ? 'Crea tu cuenta' : 'Hola de nuevo'}</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--fg-2)', margin: 0 }}>{isReg ? 'Menos de un minuto. Luego personalizamos todo.' : 'Entra para seguir con tu plan.'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isReg && <OnbInput value={data.name} onChange={v => setData({ ...data, name: v })} placeholder="Tu nombre" icon="person" />}
            <OnbInput value={data.email} onChange={v => setData({ ...data, email: v })} placeholder="tu@correo.com" type="email" icon="mail" />
            <div style={{ position: 'relative' }}>
              <OnbInput value={data.password} onChange={v => setData({ ...data, password: v })} placeholder={isReg ? 'Contraseña (mín. 6)' : 'Contraseña'} type={show ? 'text' : 'password'} icon="lock" onEnter={() => valid && onSubmit()} />
              <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}>
                <span className="material-icons" style={{ fontSize: 20 }}>{show ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            <div style={{ marginTop: 6 }}><DkBtn variant="primary" fullWidth icon={isReg ? 'arrow_forward' : 'login'} onClick={() => valid && onSubmit()}>{isReg ? 'Continuar' : 'Iniciar sesión'}</DkBtn></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>o</span><div style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['Google', 'Apple'].map(p => <DkBtn key={p} variant="ghost" fullWidth size="sm">{p}</DkBtn>)}
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

/* ── INTRO ── */
function DkIntro({ userName, onChoose }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DkTopBar right={<span />} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 560, textAlign: 'center', animation: 'dkIn .5s var(--ease-out)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', animation: 'dkPop .6s var(--ease-out)' }}><AIAvatar size={64} /></div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color: 'var(--fg-1)', margin: '22px 0 10px', letterSpacing: '-0.02em' }}>{userName ? `${userName}, construyamos tu plan.` : 'Construyamos tu plan.'}</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--fg-2)', lineHeight: 1.55, margin: '0 auto 30px', maxWidth: 460 }}>
            Te hago unas preguntas y, con cada respuesta, tus cántaros se van formando. Solo lo que mejora tu resultado.
          </p>
          <div className="dk-stagger" style={{ display: 'flex', gap: 14, maxWidth: 520, margin: '0 auto' }}>
            <button type="button" onClick={() => onChoose('express')} style={{ flex: 1, cursor: 'pointer', textAlign: 'left', padding: 20, borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-hairline)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)' }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--fg-2)', marginBottom: 12 }}><span className="material-icons">bolt</span></span>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)' }}>Empezar rápido</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', marginTop: 3 }}>Solo lo esencial · ~40 s</div>
            </button>
            <button type="button" onClick={() => onChoose('full')} style={{ flex: 1, cursor: 'pointer', textAlign: 'left', padding: 20, borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--brand-primary)', background: 'var(--brand-primary-soft)' }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-primary)', color: '#fff', marginBottom: 12 }}><span className="material-icons">tune</span></span>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--brand-primary-fg-soft)' }}>Hacerlo bien</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--brand-primary-fg-soft)', opacity: 0.85, marginTop: 3 }}>8 preguntas · a tu medida · ~2 min</div>
            </button>
          </div>
          <button type="button" onClick={() => onChoose('skip')} style={{ marginTop: 22, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-3)' }}>Explorar primero · completar después</button>
        </div>
      </div>
    </div>
  );
}

/* ── WIZARD (tarjeta centrada, una pregunta) ── */
function DkWizardStep({ step, value, onSelect, onChange, planStrip, advMode }) {
  const F = window.PROFILE_FIELDS || {};
  const phs = window.DREAM_PLACEHOLDERS || ['Tu sueño aquí…'];
  const [ph, setPh] = useDkState(0);
  useDkEffect(() => { if (step.kind !== 'dream') return; const t = setInterval(() => setPh(p => (p + 1) % phs.length), 2800); return () => clearInterval(t); }, [step.kind]);
  const options = step.options || (F[step.field] ? F[step.field].options : []);
  const icon = step.icon || (window.ONB_STEP_ICONS || {})[step.field];
  const isDream = step.kind === 'dream';

  return (
    <div key={step.field} style={{ width: '100%', maxWidth: 620, margin: '0 auto', animation: 'dkIn .45s var(--ease-out)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, lineHeight: 1.15, color: 'var(--fg-1)', margin: '0 0 8px', letterSpacing: '-0.02em', textAlign: 'center' }}>{step.q}</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15.5, color: 'var(--fg-2)', lineHeight: 1.5, margin: '0 auto 28px', textAlign: 'center', maxWidth: 480 }}>{step.sub}</p>

      {isDream ? (
        <div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <textarea value={value} maxLength={240} onChange={e => onChange(e.target.value)} placeholder={phs[ph]} rows={4}
              style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: '16px', fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.5, color: 'var(--fg-1)', background: 'var(--surface-1)', outline: 'none', resize: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-hairline)'} />
            <span style={{ position: 'absolute', bottom: 12, right: 14, fontFamily: 'var(--font-money)', fontSize: 11, color: 'var(--fg-3)' }}>{(value || '').length}/240</span>
          </div>
          <OnbVoiceButton onResult={(t) => onChange(t)} samples={phs} />
        </div>
      ) : (
        <div className="dk-stagger" style={{ display: 'grid', gridTemplateColumns: options.length > 4 ? '1fr 1fr' : '1fr', gap: 11 }}>
          {options.map(opt => (
            <OnbChoice key={opt.value} label={opt.label} desc={opt.desc} icon={icon} selected={value === opt.value} onClick={() => onSelect(opt.value)} />
          ))}
        </div>
      )}

      {!advMode && planStrip}
    </div>
  );
}

/* Strip "plan se va formando" (desktop) */
function DkPlanStrip({ profile }) {
  const essentials = ['occupation', 'income_range', 'main_goal'];
  const filled = essentials.filter(f => profile[f]).length;
  const rec = onbRecommendTemplate(profile);
  const forming = filled < essentials.length;
  return (
    <div style={{ marginTop: 28, padding: '14px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: forming ? 'var(--surface-2)' : 'var(--brand-primary-soft)', color: forming ? 'var(--fg-3)' : 'var(--brand-primary)', transition: 'all 300ms' }}>
        <span className="material-icons" style={{ fontSize: 20 }}>savings</span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>{forming ? 'Tu plan se va formando…' : `Plan en formación · ${rec.tpl.name}`}</div>
        <div style={{ opacity: 0.4 + (filled / essentials.length) * 0.6, transition: 'opacity 400ms' }}><MJarMiniBar segments={rec.tpl.segments} height={10} /></div>
      </div>
    </div>
  );
}

/* ── RECOMMEND ── */
function DkRecommend({ profile, chosenSlug, setChosenSlug, onConfirm, onBack }) {
  const rec = useDkRef(onbRecommendTemplate(profile)).current;
  const [thinking, setThinking] = useDkState(true);
  useDkEffect(() => { const t = setTimeout(() => setThinking(false), 1500); return () => clearTimeout(t); }, []);
  useDkEffect(() => { if (!chosenSlug) setChosenSlug(rec.slug); }, []);
  const templates = window.JAR_TEMPLATES || [];
  const active = templates.find(t => t.slug === (chosenSlug || rec.slug)) || rec.tpl;

  if (thinking) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 30 }}>
        <div style={{ animation: 'dkFloat 2.4s ease-in-out infinite' }}><AIAvatar size={72} /></div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--fg-1)', margin: '24px 0 8px' }}>Armando tu plan…</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)' }}>Leo tu perfil para darte un punto de partida sólido.</p>
      </div>
    );
  }
  return (
    <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', animation: 'dkIn .45s var(--ease-out)' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: 'var(--fg-1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Tu plan recomendado</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15.5, color: 'var(--fg-2)', maxWidth: 460, margin: '0 auto' }}>Un punto de partida que puedes ajustar cuando quieras.</p>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 22, maxWidth: 560, margin: '0 auto 22px' }}>
        <AIAvatar size={40} />
        <div style={{ flex: 1, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: '4px 16px 16px 16px', padding: '13px 16px', boxShadow: 'var(--shadow-card)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.5, margin: 0 }}>{rec.why}</p>
        </div>
      </div>
      <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--brand-primary)', boxShadow: 'var(--shadow-float)', padding: 24, maxWidth: 560, margin: '0 auto', animation: 'dkPop .5s var(--ease-out)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)' }}>{active.name}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{active.count} cántaros · {active.forWho}</div>
          </div>
          {active.slug === rec.slug && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 700, color: 'var(--brand-primary)', background: 'var(--brand-primary-soft)', padding: '5px 10px', borderRadius: 999 }}><span className="material-icons" style={{ fontSize: 13 }}>auto_awesome</span>IA</span>}
        </div>
        <MJarMiniBar segments={active.segments} height={18} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 16 }}>
          {active.segments.map((s, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-1)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />{s.name}<span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, color: 'var(--fg-2)' }}>{s.percent}%</span>
            </span>
          ))}
        </div>
      </div>
      {/* selector de esquemas */}
      <div style={{ maxWidth: 560, margin: '20px auto 0' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700, color: 'var(--fg-2)', marginBottom: 10, textAlign: 'center' }}>¿Prefieres otro esquema?</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {templates.map(t => {
            const on = (chosenSlug || rec.slug) === t.slug;
            return <button key={t.slug} type="button" onClick={() => setChosenSlug(t.slug)} style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: 999, border: on ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)', background: on ? 'var(--brand-primary-soft)' : 'var(--surface-1)', color: on ? 'var(--brand-primary-fg-soft)' : 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t.name}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ── SUMMARY ── */
function DkSummary({ profile, chosenSlug, onEdit }) {
  const F = window.PROFILE_FIELDS || {};
  const tpl = (window.JAR_TEMPLATES || []).find(t => t.slug === chosenSlug);
  const comp = onbCompleteness({ ...profile, template_slug: chosenSlug }, { pro: false });
  const labelFor = (field, val) => { const g = F[field]; const o = g && g.options.find(x => x.value === val); return o ? o.label : null; };
  const rows = [
    { field: 'occupation', icon: 'work' }, { field: 'income_range', icon: 'payments' },
    { field: 'debt_situation', icon: 'credit_card' }, { field: 'main_goal', icon: 'flag' },
    { field: 'money_relationship', icon: 'favorite' }, { field: 'emotional_keyword', icon: 'spa' },
  ].map(r => ({ ...r, label: F[r.field] && F[r.field].label, value: labelFor(r.field, profile[r.field]) })).filter(r => r.value);
  return (
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto', animation: 'dkIn .45s var(--ease-out)' }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: 'var(--fg-1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Revisa tu perfil</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15.5, color: 'var(--fg-2)' }}>Ajusta cualquier cosa ahora o más tarde.</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--brand-primary-soft)', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 16 }}>
        <OnbRing pct={comp.pct} size={64} stroke={7} color={comp.level.color}><span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)' }}>{comp.pct}%</span></OnbRing>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 5 }}><OnbLevelBadge level={comp.level} /></div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--brand-primary-fg-soft)', margin: 0, lineHeight: 1.45 }}>{comp.nextLevel ? `Listo para empezar. Sube a ${comp.nextLevel.label} cuando quieras desde tu perfil.` : 'Perfil completo.'}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {tpl && (
          <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}><span className="material-icons" style={{ fontSize: 19, color: 'var(--brand-primary)' }}>savings</span>Plan {tpl.name}</span>
              <button type="button" onClick={() => onEdit('recommend')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>Cambiar</button>
            </div>
            <MJarMiniBar segments={tpl.segments} height={14} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {tpl.segments.slice(0, 6).map((s, i) => <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.name}</span>)}
            </div>
          </div>
        )}
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '6px 18px' }}>
          {rows.map((r, i) => (
            <div key={r.field} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: i ? '1px solid var(--border-hairline)' : 'none' }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--fg-2)' }}><span className="material-icons" style={{ fontSize: 16 }}>{r.icon}</span></span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{r.label}</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>{r.value}</div></div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border-hairline)', padding: '10px 0' }}>
            <button type="button" onClick={() => onEdit('wizard')} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}><span className="material-icons" style={{ fontSize: 16 }}>edit</span>Editar respuestas</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DONE ── */
function DkDone({ userName, comp, onApp }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 30 }}>
      <div style={{ animation: 'dkPop .6s var(--ease-out)' }}>
        {comp ? <OnbRing pct={comp.pct} size={120} stroke={11} color={comp.level.color}><span className="material-icons" style={{ fontSize: 44, color: comp.level.color }}>{comp.level.icon}</span></OnbRing> : <span className="material-icons" style={{ fontSize: 56, color: 'var(--income-fg)' }}>check_circle</span>}
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color: 'var(--fg-1)', margin: '22px 0 8px', letterSpacing: '-0.02em' }}>¡Tu plan está listo{userName ? `, ${userName}` : ''}!</h1>
      {comp && <div style={{ marginBottom: 10 }}><OnbLevelBadge level={comp.level} /></div>}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--fg-2)', lineHeight: 1.5, maxWidth: 420 }}>Tus cántaros están configurados y conozco tu perfil. {comp && comp.nextLevel ? `Completa más para subir a ${comp.nextLevel.label}.` : 'Estoy listo para acompañarte.'}</p>
      <div style={{ marginTop: 30 }}><DkBtn variant="primary" size="lg" iconRight="arrow_forward" onClick={onApp}>Entrar a la app</DkBtn></div>
    </div>
  );
}

/* ── APP handoff (destino del ciclo) ── */
function DkAppHandoff({ userName, comp, onRestart }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <DkTopBar right={<DkBtn variant="ghost" size="sm" icon="refresh" onClick={onRestart}>Reiniciar demo</DkBtn>} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <span style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><span className="material-icons" style={{ fontSize: 30 }}>dashboard</span></span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--fg-1)', margin: '0 0 10px' }}>Aquí entra la app (dashboard)</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15.5, color: 'var(--fg-2)', lineHeight: 1.55, marginBottom: 24 }}>
            Fin del ciclo de entrada. Desde aquí el usuario llega al panel real de OW (Lite o Pro). El onboarding solo aparece la primera vez; en visitas siguientes, login lleva directo al dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="../ui_kits/lite-desktop/index.html" style={{ textDecoration: 'none' }}><DkBtn variant="primary" icon="open_in_new">Abrir app Lite/Pro (desktop)</DkBtn></a>
            <a href="Onboarding Mobile.html" style={{ textDecoration: 'none' }}><DkBtn variant="ghost" icon="smartphone">Ver variante mobile</DkBtn></a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════ Controlador DESKTOP ════════════════════ */
function OnboardingDesktop({ startRoute }) {
  const ONB_BLANK = window.ONB_BLANK, ONB_FLAT = window.ONB_FLAT, ONB_PHASES = window.ONB_PHASES, ONB_ADV_STEPS = window.ONB_ADV_STEPS;
  const seed = window.AI_PROFILE || {};
  const [route, setRoute] = useDkState(startRoute || 'landing');
  const [auth, setAuth] = useDkState({ name: '', email: '', password: '' });
  const [profile, setProfile] = useDkState({ ...ONB_BLANK });
  const [stepIdx, setStepIdx] = useDkState(0);
  const [chosenSlug, setChosenSlug] = useDkState(null);
  const [mode, setMode] = useDkState('full');
  const advanceTimer = useDkRef(null);
  const userName = (auth.name || '').trim().split(' ')[0] || '';
  const setField = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const steps = mode === 'express' ? ONB_FLAT.filter(s => !s.optional) : ONB_FLAT;
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const essentialsReady = profile.occupation && profile.income_range && profile.main_goal;

  const goNext = () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); if (stepIdx >= steps.length - 1) setRoute('recommend'); else setStepIdx(i => i + 1); };
  const goBack = () => { if (stepIdx <= 0) setRoute('intro'); else setStepIdx(i => i - 1); };
  const selectChip = (field, val) => { setField(field, val); if (advanceTimer.current) clearTimeout(advanceTimer.current); advanceTimer.current = setTimeout(goNext, 280); };
  const reset = () => { setProfile({ ...ONB_BLANK }); setChosenSlug(null); setStepIdx(0); setAuth({ name: '', email: '', password: '' }); setRoute('landing'); };

  let screen;
  if (route === 'landing') {
    screen = <DkLanding onRegister={() => setRoute('register')} onLogin={() => setRoute('login')} />;
  } else if (route === 'register') {
    screen = <DkAuthCard mode="register" data={auth} setData={setAuth} onSubmit={() => setRoute('intro')} onSwap={() => setRoute('login')} onBack={() => setRoute('landing')} />;
  } else if (route === 'login') {
    screen = <DkAuthCard mode="login" data={auth} setData={setAuth} onSwap={() => setRoute('register')} onBack={() => setRoute('landing')}
      onSubmit={() => { setAuth(a => ({ ...a, name: a.name || 'José Pérez' })); setProfile(p => ({ ...p, ...seed })); setChosenSlug(seed.template_slug || 'moderado'); setRoute('app'); }} />;
  } else if (route === 'intro') {
    screen = <DkIntro userName={userName} onChoose={(m) => { if (m === 'skip') { setRoute('app'); return; } setMode(m === 'express' ? 'express' : 'full'); setStepIdx(0); setRoute('wizard'); }} />;
  } else if (route === 'wizard') {
    screen = (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <DkTopBar progress={<DkProgress phases={ONB_PHASES} phaseIndex={step.phaseIndex} withinPhase={step.stepInPhase / step.phaseSteps} />}
          right={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <DkBtn variant="ghost" size="sm" icon="arrow_back" onClick={goBack}>Atrás</DkBtn>
            {step.optional && <button type="button" onClick={goNext} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>Saltar</button>}
          </div>} />
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <DkWizardStep step={step} value={profile[step.field]} onSelect={(v) => selectChip(step.field, v)} onChange={(v) => setField(step.field, v)} planStrip={<DkPlanStrip profile={profile} />} />
        </div>
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-1)', padding: '14px 24px' }}>
          <div style={{ maxWidth: 620, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            {essentialsReady && stepIdx < steps.length - 1
              ? <button type="button" onClick={() => setRoute('recommend')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600 }}>Ya tengo lo esencial · ir a mi plan →</button>
              : <span />}
            <DkBtn variant="primary" iconRight="arrow_forward" onClick={goNext}>{stepIdx >= steps.length - 1 ? 'Ver mi plan' : 'Continuar'}</DkBtn>
          </div>
        </div>
      </div>
    );
  } else if (route === 'recommend') {
    screen = (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <DkTopBar right={<DkBtn variant="ghost" size="sm" icon="arrow_back" onClick={() => { setStepIdx(steps.length - 1); setRoute('wizard'); }}>Atrás</DkBtn>} />
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <DkRecommend profile={profile} chosenSlug={chosenSlug} setChosenSlug={setChosenSlug} onConfirm={() => {}} onBack={() => {}} />
        </div>
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-1)', padding: '14px 24px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}><DkBtn variant="primary" fullWidth icon="check" onClick={() => { setProfile(p => ({ ...p, template_slug: chosenSlug || onbRecommendTemplate(profile).slug })); setRoute('summary'); }}>Usar este plan</DkBtn></div>
        </div>
      </div>
    );
  } else if (route === 'summary') {
    screen = (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <DkTopBar right={<DkBtn variant="ghost" size="sm" icon="arrow_back" onClick={() => setRoute('recommend')}>Atrás</DkBtn>} />
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <DkSummary profile={profile} chosenSlug={chosenSlug || onbRecommendTemplate(profile).slug} onEdit={(target) => { if (target === 'wizard') { setStepIdx(0); setRoute('wizard'); } else setRoute('recommend'); }} />
        </div>
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-1)', padding: '14px 24px' }}>
          <div style={{ maxWidth: 420, margin: '0 auto' }}><DkBtn variant="primary" fullWidth icon="rocket_launch" onClick={() => setRoute('done')}>Empezar a usar OW</DkBtn></div>
        </div>
      </div>
    );
  } else if (route === 'done') {
    const comp = onbCompleteness({ ...profile, template_slug: chosenSlug || profile.template_slug }, { pro: false });
    screen = <DkDone userName={userName} comp={comp} onApp={() => setRoute('app')} />;
  } else {
    const comp = onbCompleteness({ ...profile, template_slug: chosenSlug || profile.template_slug }, { pro: false });
    screen = <DkAppHandoff userName={userName} comp={comp} onRestart={reset} />;
  }

  return <div key={route} style={{ height: '100%', animation: 'dkFade .3s var(--ease-out) both' }}>{screen}</div>;
}

Object.assign(window, { OnboardingDesktop });
