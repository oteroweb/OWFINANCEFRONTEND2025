/* ─── Onboarding · Modal de bienvenida (primer acceso · usuario nuevo) ───
 * Aparece SÓLO la primera vez sobre el panel real. El asesor IA se presenta
 * y ofrece ayudar a llenar el perfil. El formulario va integrado dentro del
 * modal como wizard por pasos (intro → formulario → recomendación → listo),
 * con el plan formándose en vivo y la barra de completitud.
 * Reutiliza: AIAvatar, MJarMiniBar, OnbChoice, OnbRing, OnbLevelBadge,
 *            onbCompleteness, onbRecommendTemplate, PROFILE_FIELDS,
 *            ONB_FLAT, ONB_PHASES, ONB_BLANK, JAR_TEMPLATES.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, AIAvatar, Avatar, MJarMiniBar, OnbChoice, OnbRing, OnbLevelBadge,
   onbCompleteness, onbRecommendTemplate */
const { useState: useWmState, useEffect: useWmEffect, useRef: useWmRef } = React;

/* Estilos propios (entradas sólo transform/opacity del overlay) */
if (typeof document !== 'undefined' && !document.getElementById('wm-style')) {
  const s = document.createElement('style');
  s.id = 'wm-style';
  s.textContent =
    '@keyframes wmFadeIn{from{opacity:.001}to{opacity:1}}' +
    '@keyframes wmPopIn{0%{transform:translateY(16px) scale(.97)}100%{transform:translateY(0) scale(1)}}' +
    '@keyframes wmStepIn{from{transform:translateY(10px)}to{transform:translateY(0)}}' +
    '@keyframes wmFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}' +
    '@keyframes wmDot{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}' +
    '@keyframes wmRipple{0%{box-shadow:0 0 0 0 rgba(124,58,237,.35)}100%{box-shadow:0 0 0 14px rgba(124,58,237,0)}}' +
    '.wm-stagger>*{animation:wmStepIn .42s var(--ease-out) both}' +
    '.wm-stagger>*:nth-child(1){animation-delay:.04s}.wm-stagger>*:nth-child(2){animation-delay:.10s}' +
    '.wm-stagger>*:nth-child(3){animation-delay:.16s}.wm-stagger>*:nth-child(4){animation-delay:.22s}' +
    '.wm-scroll::-webkit-scrollbar{width:0}';
  document.head.appendChild(s);
}

/* Botón pill local (mismas reglas de marca) */
function WmBtn({ children, icon, iconRight, variant = 'primary', onClick, size = 'md', fullWidth, disabled }) {
  const [h, setH] = useWmState(false);
  const pad = size === 'lg' ? '15px 28px' : size === 'sm' ? '9px 16px' : '13px 22px';
  const fs = size === 'lg' ? 16 : size === 'sm' ? 13.5 : 15;
  const map = {
    primary: { bg: disabled ? 'var(--surface-3)' : h ? 'var(--brand-primary-hover)' : 'var(--brand-primary)', color: disabled ? 'var(--fg-3)' : '#fff', bd: 0, sh: 'none' },
    ghost: { bg: h ? 'var(--surface-2)' : 'transparent', color: 'var(--fg-1)', bd: '1.5px solid var(--border-hairline)', sh: 'none' },
    soft: { bg: h ? 'var(--surface-2)' : 'var(--surface-1)', color: 'var(--fg-1)', bd: 0, sh: 'var(--shadow-card)' },
  }[variant] || {};
  return (
    <button type="button" onClick={disabled ? undefined : onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: fs, border: map.bd, borderRadius: 'var(--radius-pill)', cursor: disabled ? 'default' : 'pointer', padding: pad, background: map.bg, color: map.color, boxShadow: map.sh, width: fullWidth ? '100%' : 'auto', transition: 'background 160ms' }}>
      {icon && <span className="material-icons" style={{ fontSize: fs + 3 }}>{icon}</span>}{children}{iconRight && <span className="material-icons" style={{ fontSize: fs + 3 }}>{iconRight}</span>}
    </button>
  );
}

/* Encabezado del wizard dentro del modal: back + progreso por fases + cerrar */
function WmWizardHeader({ phases, step, onBack, onClose, count }) {
  return (
    <div style={{ flexShrink: 0, padding: '18px 22px 12px', borderBottom: '1px solid var(--border-hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <button type="button" onClick={onBack} style={{ border: 0, background: 'var(--surface-2)', cursor: 'pointer', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-1)', flexShrink: 0 }}>
          <span className="material-icons" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AIAvatar size={26} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)' }}>{count}</span>
        </div>
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', flexShrink: 0 }}>
          <span className="material-icons" style={{ fontSize: 20 }}>close</span>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {phases.map((ph, i) => {
          const done = i < step.phaseIndex, active = i === step.phaseIndex;
          const fill = done ? 1 : active ? (step.stepInPhase + 1) / step.phaseSteps : 0;
          return (
            <div key={ph.id} style={{ flex: 1 }}>
              <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: (fill * 100) + '%', borderRadius: 3, background: 'var(--brand-primary)', transition: 'width 380ms var(--ease-out)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 9.5, fontWeight: active ? 700 : 600, letterSpacing: '0.02em', color: active || done ? 'var(--brand-primary)' : 'var(--fg-3)', textAlign: 'center', marginTop: 6 }}>{ph.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Strip "tu plan se va formando" dentro del modal */
function WmPlanStrip({ profile }) {
  const essentials = ['occupation', 'income_range', 'main_goal'];
  const filled = essentials.filter(f => profile[f]).length;
  const rec = onbRecommendTemplate(profile);
  const forming = filled < essentials.length;
  return (
    <div style={{ margin: '18px 0 4px', padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 13 }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: forming ? 'var(--surface-3)' : 'var(--brand-primary-soft)', color: forming ? 'var(--fg-3)' : 'var(--brand-primary)', transition: 'all 300ms' }}>
        <span className="material-icons" style={{ fontSize: 18 }}>savings</span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>
          {forming ? 'Tu plan se va formando…' : `Plan en formación · ${rec.tpl.name}`}
        </div>
        <div style={{ opacity: 0.35 + (filled / essentials.length) * 0.65, filter: forming ? 'saturate(0.6)' : 'none', transition: 'opacity 400ms, filter 400ms' }}>
          <MJarMiniBar segments={rec.tpl.segments} height={9} />
        </div>
      </div>
    </div>
  );
}

/* ═══ El modal (controlado por WmRoot) ═══ */
function WelcomeModal({ userName, profile, setField, chosenSlug, setChosenSlug, onClose, onComplete }) {
  const ONB_FLAT = window.ONB_FLAT, ONB_PHASES = window.ONB_PHASES, PROFILE_FIELDS = window.PROFILE_FIELDS || {};
  const ONB_STEP_ICONS = window.ONB_STEP_ICONS || {};
  const phs = window.DREAM_PLACEHOLDERS || ['Tu sueño aquí…'];

  const [stage, setStage] = useWmState('intro'); // intro | form | recommend | done
  const [stepIdx, setStepIdx] = useWmState(0);
  const [thinking, setThinking] = useWmState(false);
  const [dreamPh, setDreamPh] = useWmState(0);
  const advanceTimer = useWmRef(null);

  const steps = ONB_FLAT;
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const essentialsReady = profile.occupation && profile.income_range && profile.main_goal;

  useWmEffect(() => () => advanceTimer.current && clearTimeout(advanceTimer.current), []);
  useWmEffect(() => { if (step && step.kind === 'dream') { const t = setInterval(() => setDreamPh(p => (p + 1) % phs.length), 2800); return () => clearInterval(t); } }, [step && step.field]);

  const goNext = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (stepIdx >= steps.length - 1) gotoRecommend();
    else setStepIdx(i => i + 1);
  };
  const goBack = () => {
    if (stepIdx <= 0) setStage('intro');
    else setStepIdx(i => i - 1);
  };
  const selectChip = (field, val) => { setField(field, val); if (advanceTimer.current) clearTimeout(advanceTimer.current); advanceTimer.current = setTimeout(goNext, 280); };
  const gotoRecommend = () => { setStage('recommend'); setThinking(true); setTimeout(() => setThinking(false), 1500); };

  /* ── Stage: INTRO (presentación del asesor) ── */
  const comp0 = onbCompleteness({ ...profile, template_slug: chosenSlug || profile.template_slug }, { pro: false });
  if (stage === 'intro') {
    const previewPhases = window.ONB_PHASES || [];
    const totalQ = (window.ONB_FLAT || []).length;
    return (
      <div className="wm-scroll" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: '100%' }}>
        <div style={{ position: 'relative', padding: '30px 30px 8px', textAlign: 'center' }}>
          <button type="button" onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, border: 0, background: 'var(--surface-2)', cursor: 'pointer', width: 34, height: 34, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-2)' }}>
            <span className="material-icons" style={{ fontSize: 20 }}>close</span>
          </button>
          <div style={{ display: 'inline-flex', position: 'relative', animation: 'wmFloat 5s ease-in-out infinite', marginBottom: 4 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', animation: 'wmRipple 2.4s ease-out infinite' }} />
            <AIAvatar size={62} />
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B5CF6', margin: '18px 0 6px' }}>Tu asesor de OW</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, lineHeight: 1.18, color: 'var(--fg-1)', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
            {userName ? `Hola, ${userName}.` : 'Hola.'}<br />Aquí te ayudo a llenar tu perfil.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.55, margin: '0 auto', maxWidth: 400 }}>
            Con unas pocas preguntas personalizo tus consejos y armo tu plan de cántaros a tu medida.
          </p>
        </div>
        <div style={{ padding: '20px 30px 6px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 11 }}>El proceso · {previewPhases.length} fases · {totalQ} preguntas</div>
          <div className="wm-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {previewPhases.map((ph, i) => (
              <div key={ph.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)' }}>
                <span style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 12 }}>{i + 1}</span>
                <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)' }}><span className="material-icons" style={{ fontSize: 19 }}>{ph.icon}</span></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5, color: 'var(--fg-1)' }}>{ph.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ph.steps.length} preguntas · “{ph.steps[0].q}”</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            {[['schedule', '~2 minutos'], ['lock', 'Privado'], ['redo', 'Puedes saltar']].map(([ic, tx]) => (
              <span key={tx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-3)' }}><span className="material-icons" style={{ fontSize: 15 }}>{ic}</span>{tx}</span>
            ))}
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '16px 30px 26px', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <WmBtn variant="primary" size="lg" fullWidth iconRight="arrow_forward" onClick={() => { setStage('form'); setStepIdx(0); }}>Empezar mi perfil</WmBtn>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-3)', padding: 6 }}>
            Ahora no · explorar primero
          </button>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
            Puedes completarlo cuando quieras desde <span style={{ color: 'var(--fg-2)', fontWeight: 600 }}>Mi perfil</span>.
          </p>
        </div>
      </div>
    );
  }

  /* ── Stage: FORM (wizard integrado) ── */
  if (stage === 'form') {
    const isDream = step.kind === 'dream';
    const options = step.options || (PROFILE_FIELDS[step.field] ? PROFILE_FIELDS[step.field].options : []);
    const icon = step.icon || ONB_STEP_ICONS[step.field];
    const hasValue = isDream ? !!profile.long_term_dream : !!profile[step.field];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <WmWizardHeader phases={ONB_PHASES} step={step} onBack={goBack} onClose={onClose} count={`Paso ${stepIdx + 1} de ${steps.length}`} />
        <div className="wm-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 26px 8px' }} key={step.field}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 23, lineHeight: 1.2, color: 'var(--fg-1)', margin: '0 0 6px', letterSpacing: '-0.01em', animation: 'wmStepIn .4s var(--ease-out)' }}>{step.q}</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 18px', lineHeight: 1.45, animation: 'wmStepIn .4s var(--ease-out) .05s both' }}>{step.sub}</p>
          {isDream ? (
            <div style={{ position: 'relative' }}>
              <textarea value={profile.long_term_dream} maxLength={240} onChange={e => setField('long_term_dream', e.target.value)} placeholder={phs[dreamPh]} rows={4}
                style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: '15px', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.5, color: 'var(--fg-1)', background: 'var(--surface-1)', outline: 'none', resize: 'none', transition: 'border-color 150ms' }}
                onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-hairline)'} />
              <span style={{ position: 'absolute', bottom: 12, right: 14, fontFamily: 'var(--font-money)', fontSize: 11, color: 'var(--fg-3)' }}>{(profile.long_term_dream || '').length}/240</span>
            </div>
          ) : (
            <div className="wm-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {options.map(opt => (
                <OnbChoice key={opt.value} label={opt.label} desc={opt.desc} icon={icon} selected={profile[step.field] === opt.value} onClick={() => selectChip(step.field, opt.value)} />
              ))}
            </div>
          )}
          <WmPlanStrip profile={profile} />
        </div>
        <div style={{ flexShrink: 0, padding: '12px 26px 18px', borderTop: '1px solid var(--border-hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step.optional && !hasValue && (
              <button type="button" onClick={goNext} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-2)', padding: '6px 4px', flexShrink: 0 }}>Saltar</button>
            )}
            <div style={{ flex: 1 }}>
              <WmBtn variant={hasValue ? 'primary' : 'soft'} fullWidth iconRight="arrow_forward" onClick={goNext}>
                {stepIdx >= steps.length - 1 ? 'Ver mi plan' : 'Continuar'}
              </WmBtn>
            </div>
          </div>
          {essentialsReady && stepIdx < steps.length - 1 && (
            <button type="button" onClick={gotoRecommend} style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-3)', padding: '9px 0 0' }}>
              Ya tengo lo esencial · ir a mi plan →
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Stage: RECOMMEND ── */
  if (stage === 'recommend') {
    const rec = onbRecommendTemplate(profile);
    const templates = window.JAR_TEMPLATES || [];
    const active = templates.find(t => t.slug === (chosenSlug || rec.slug)) || rec.tpl;
    if (thinking) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 30px' }}>
          <div style={{ animation: 'wmFloat 2.4s ease-in-out infinite' }}><AIAvatar size={64} /></div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)', margin: '22px 0 8px' }}>Armando tu plan…</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.5, maxWidth: 300 }}>Leo tu perfil para darte un punto de partida sólido.</p>
          <div style={{ display: 'flex', gap: 7, marginTop: 22 }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--brand-primary)', animation: `wmDot 1s ease-in-out ${i * 0.16}s infinite` }} />)}</div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flexShrink: 0, padding: '18px 22px 10px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-hairline)' }}>
          <button type="button" onClick={() => { setStepIdx(steps.length - 1); setStage('form'); }} style={{ border: 0, background: 'var(--surface-2)', cursor: 'pointer', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-1)' }}>
            <span className="material-icons" style={{ fontSize: 20 }}>arrow_back</span>
          </button>
          <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>Tu plan recomendado</span>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>
            <span className="material-icons" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        <div className="wm-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 26px 8px' }}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 18, animation: 'wmStepIn .4s var(--ease-out)' }}>
            <AIAvatar size={38} />
            <div style={{ flex: 1, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: '4px 16px 16px 16px', padding: '12px 14px', boxShadow: 'var(--shadow-card)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)', lineHeight: 1.5, margin: 0 }}>{rec.why}</p>
            </div>
          </div>
          <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--brand-primary)', boxShadow: 'var(--shadow-float)', padding: 18, animation: 'wmPopIn .5s var(--ease-out)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--fg-1)' }}>{active.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{active.count} cántaros · {active.forWho}</div>
              </div>
              {active.slug === rec.slug && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, color: 'var(--brand-primary)', background: 'var(--brand-primary-soft)', padding: '4px 8px', borderRadius: 999, flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 12 }}>auto_awesome</span>IA</span>}
            </div>
            <div key={active.slug} style={{ animation: 'wmStepIn .4s var(--ease-out)' }}>
              <MJarMiniBar segments={active.segments} height={15} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 13 }}>
                {active.segments.map((sg, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-1)' }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: sg.color }} />{sg.name}
                    <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, color: 'var(--fg-2)' }}>{sg.percent}%</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'var(--fg-2)', marginBottom: 9 }}>¿Prefieres otro esquema?</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {templates.map(t => {
                const on = (chosenSlug || rec.slug) === t.slug;
                return <button key={t.slug} type="button" onClick={() => setChosenSlug(t.slug)} style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: 999, border: on ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)', background: on ? 'var(--brand-primary-soft)' : 'var(--surface-1)', color: on ? 'var(--brand-primary-fg-soft)' : 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t.name}</button>;
              })}
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '12px 26px 18px', borderTop: '1px solid var(--border-hairline)' }}>
          <WmBtn variant="primary" fullWidth icon="check" onClick={() => { setChosenSlug(chosenSlug || rec.slug); setStage('done'); }}>Usar este plan</WmBtn>
        </div>
      </div>
    );
  }

  /* ── Stage: DONE ── */
  const comp = onbCompleteness({ ...profile, template_slug: chosenSlug || profile.template_slug }, { pro: false });
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 30px', position: 'relative', overflow: 'hidden' }}>
      {['#10B981', '#F59E0B', '#8B5CF6', '#0EA5E9', '#EC4899', '#F97316'].map((c, i) => (
        <span key={i} style={{ position: 'absolute', top: '24%', left: `${14 + i * 13}%`, width: 9, height: 9, borderRadius: 2, background: c, animation: `wmFloat ${1.2 + i * 0.12}s ease-in-out infinite`, opacity: 0.85 }} />
      ))}
      <div style={{ animation: 'wmPopIn .6s var(--ease-out)' }}>
        <OnbRing pct={comp.pct} size={112} stroke={10} color={comp.level.color}>
          <span className="material-icons" style={{ fontSize: 42, color: comp.level.color }}>{comp.level.icon}</span>
        </OnbRing>
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--fg-1)', margin: '20px 0 8px', letterSpacing: '-0.01em' }}>¡Tu perfil está listo{userName ? `, ${userName}` : ''}!</h1>
      <div style={{ marginBottom: 12 }}><OnbLevelBadge level={comp.level} /></div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.5, maxWidth: 320 }}>
        Tus cántaros están configurados y conozco tu perfil. {comp.nextLevel ? `Completa más para subir a ${comp.nextLevel.label} y afinar mis consejos.` : 'Estoy listo para acompañarte.'}
      </p>
      <div style={{ width: '100%', maxWidth: 320, marginTop: 26 }}>
        <WmBtn variant="primary" size="lg" fullWidth iconRight="arrow_forward" onClick={() => { onComplete(chosenSlug || onbRecommendTemplate(profile).slug); onClose(); }}>Ir a mi panel</WmBtn>
      </div>
    </div>
  );
}

window.WelcomeModal = WelcomeModal;
window.WmBtn = WmBtn;
