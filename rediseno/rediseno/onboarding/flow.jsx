/* ─── Onboarding · Flujo v2 (mentor · narrativa · gamificación · voz IA) ──
 * welcome → register/login → intro → wizard (plan en formación + voz) →
 * recommend → summary → done → panel (gamificado) ⇄ profile (Mi perfil) →
 * advanced (Pro). Reutiliza datos del kit + onb-atoms + gamification + panel.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, OnbStatusBar, OnbProgress, OnbChoice, OnbInput, PillButtonMobile,
   WelcomeScreen, RegisterScreen, LoginScreen, MJarMiniBar, AIAvatar, onbRecommendTemplate,
   OnbVoiceButton, onbCompleteness, PanelScreen, ProfileScreen */
const { useState: useFlowState, useEffect: useFlowEffect, useRef: useFlowRef } = React;

/* Constantes del flujo — fuente única en flow-data.jsx (cargado antes). */
const ONB_PHASES = window.ONB_PHASES;
const ONB_ADV_STEPS = window.ONB_ADV_STEPS;
const ONB_FLAT = window.ONB_FLAT;

/* ── Intro: express vs personalizado ── */
function IntroScreen({ onChoose, userName }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <OnbStatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 26px', overflow: 'hidden' }}>
        <div style={{ animation: 'onbPop .5s var(--ease-out)' }}><AIAvatar size={58} /></div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, lineHeight: 1.15, color: 'var(--fg-1)', margin: '20px 0 8px', letterSpacing: '-0.01em' }}>
          {userName ? `${userName}, construyamos tu plan.` : 'Construyamos tu plan.'}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.5, margin: '0 0 26px' }}>
          Te hago unas preguntas y, con cada respuesta, tus cántaros se van formando. Sin relleno: solo lo que mejora tu resultado. Puedes saltar o seguir cuando quieras.
        </p>
        <div className="onb-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <OnbChoice icon="bolt" label="Empezar rápido" desc="Solo lo esencial → tu plan en ~40 segundos" onClick={() => onChoose('express')} />
          <OnbChoice icon="tune" label="Hacerlo bien" desc="8 preguntas → afino todo a tu medida · ~2 min" selected onClick={() => onChoose('full')} />
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: '14px 26px calc(20px + env(safe-area-inset-bottom))' }}>
        <button type="button" onClick={() => onChoose('skip')} style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-3)', padding: 6 }}>
          Explorar primero · completar después
        </button>
      </div>
    </div>
  );
}

/* ── Header del wizard ── */
function WizardHeader({ phases, step, onBack, onSkip, canSkip }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <OnbStatusBar />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 8px' }}>
        <button type="button" onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 34, height: 34, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-1)', flexShrink: 0 }}>
          <span className="material-icons" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <OnbProgress phases={phases} phaseIndex={step.phaseIndex} withinPhase={(step.stepInPhase) / step.phaseSteps} />
        </div>
        <button type="button" onClick={onSkip} disabled={!canSkip} style={{ border: 0, background: 'transparent', cursor: canSkip ? 'pointer' : 'default', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: canSkip ? 'var(--fg-2)' : 'transparent', padding: '0 6px', flexShrink: 0, width: 52, textAlign: 'right' }}>Saltar</button>
      </div>
    </div>
  );
}

const ONB_STEP_ICONS = window.ONB_STEP_ICONS;

/* ── Paso de chips ── */
function WizardChipStep({ step, value, onSelect }) {
  const F = window.PROFILE_FIELDS || {};
  const options = step.options || (F[step.field] ? F[step.field].options : []);
  const icon = step.icon || ONB_STEP_ICONS[step.field];
  return (
    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '8px 22px 14px' }} key={step.field}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 23, lineHeight: 1.18, color: 'var(--fg-1)', margin: '6px 0 5px', letterSpacing: '-0.01em', animation: 'onbIn .4s var(--ease-out)' }}>{step.q}</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 18px', lineHeight: 1.45, animation: 'onbIn .4s var(--ease-out) .05s both' }}>{step.sub}</p>
      <div className="onb-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(opt => (
          <OnbChoice key={opt.value} label={opt.label} desc={opt.desc} icon={icon} selected={value === opt.value} onClick={() => onSelect(opt.value)} />
        ))}
      </div>
    </div>
  );
}

/* ── Paso del sueño (texto + voz IA) ── */
function WizardDreamStep({ value, onChange }) {
  const phs = window.DREAM_PLACEHOLDERS || ['Tu sueño aquí…'];
  const [ph, setPh] = useFlowState(0);
  useFlowEffect(() => { const t = setInterval(() => setPh(p => (p + 1) % phs.length), 2800); return () => clearInterval(t); }, []);
  const max = 240;
  return (
    <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '8px 22px 14px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 23, lineHeight: 1.18, color: 'var(--fg-1)', margin: '6px 0 5px', letterSpacing: '-0.01em' }}>¿Cuál es tu sueño grande?</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 16px', lineHeight: 1.45 }}>Lo uso para recordarte tu norte cuando dudes. Escríbelo o díctalo con voz.</p>
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <textarea value={value} maxLength={max} onChange={e => onChange(e.target.value)} placeholder={phs[ph]} rows={4}
          style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: '15px', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.5, color: 'var(--fg-1)', background: 'var(--surface-1)', outline: 'none', resize: 'none', transition: 'border-color 150ms' }}
          onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-hairline)'} />
        <span style={{ position: 'absolute', bottom: 12, right: 14, fontFamily: 'var(--font-money)', fontSize: 11, color: 'var(--fg-3)' }}>{value.length}/{max}</span>
      </div>
      <OnbVoiceButton onResult={(t) => onChange(t)} samples={phs} />
    </div>
  );
}

/* ── Strip persistente: "tu plan se va formando" ── */
function WizardPlanStrip({ profile }) {
  const essentials = ['occupation', 'income_range', 'main_goal'];
  const filled = essentials.filter(f => profile[f]).length;
  const rec = onbRecommendTemplate(profile);
  const definition = filled / essentials.length; // 0..1
  const forming = filled < essentials.length;
  return (
    <div style={{ margin: '0 16px 8px', padding: '10px 13px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: forming ? 'var(--surface-3)' : 'var(--brand-primary-soft)', color: forming ? 'var(--fg-3)' : 'var(--brand-primary)', transition: 'all 300ms' }}>
        <span className="material-icons" style={{ fontSize: 18 }}>savings</span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 5 }}>
          {forming ? 'Tu plan se va formando…' : `Plan en formación · ${rec.tpl.name}`}
        </div>
        <div style={{ opacity: 0.35 + definition * 0.65, filter: forming ? 'saturate(0.6)' : 'none', transition: 'opacity 400ms, filter 400ms' }}>
          <MJarMiniBar segments={rec.tpl.segments} height={9} />
        </div>
      </div>
    </div>
  );
}

/* ── Recomendación IA + preview en vivo ── */
function RecommendScreen({ profile, chosenSlug, setChosenSlug, onConfirm, onBack }) {
  const rec = useFlowRef(onbRecommendTemplate(profile)).current;
  const [thinking, setThinking] = useFlowState(true);
  const [pickerOpen, setPickerOpen] = useFlowState(false);
  useFlowEffect(() => { const t = setTimeout(() => setThinking(false), 1500); return () => clearTimeout(t); }, []);
  useFlowEffect(() => { if (!chosenSlug) setChosenSlug(rec.slug); }, []);
  const templates = window.JAR_TEMPLATES || [];
  const active = templates.find(t => t.slug === (chosenSlug || rec.slug)) || rec.tpl;

  if (thinking) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
        <div style={{ animation: 'onbFloat 2.4s ease-in-out infinite' }}><AIAvatar size={66} /></div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, color: 'var(--fg-1)', margin: '22px 0 8px' }}>Armando tu plan…</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.5 }}>Estoy leyendo tu perfil para darte un punto de partida sólido.</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 22 }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--brand-primary)', animation: `onbFloat 1s ease-in-out ${i * 0.15}s infinite` }} />)}</div>
      </div>
    );
  }
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <WizardHeaderSimple onBack={onBack} title="Tu plan recomendado" />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '4px 22px 20px' }}>
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 20, animation: 'onbIn .4s var(--ease-out)' }}>
          <AIAvatar size={38} />
          <div style={{ flex: 1, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: '4px 16px 16px 16px', padding: '12px 14px', boxShadow: 'var(--shadow-card)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)', lineHeight: 1.5, margin: 0 }}>{rec.why}</p>
          </div>
        </div>
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--brand-primary)', boxShadow: 'var(--shadow-float)', padding: 18, animation: 'onbPop .5s var(--ease-out)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--fg-1)' }}>{active.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{active.count} cántaros · {active.forWho}</div>
            </div>
            {active.slug === rec.slug && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, color: 'var(--brand-primary)', background: 'var(--brand-primary-soft)', padding: '4px 8px', borderRadius: 999, flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 12 }}>auto_awesome</span>IA</span>}
          </div>
          <div key={active.slug} style={{ animation: 'onbIn .4s var(--ease-out)' }}>
            <MJarMiniBar segments={active.segments} height={16} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
              {active.segments.map((s, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-1)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />{s.name}
                  <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, color: 'var(--fg-2)' }}>{s.percent}%</span>
                </span>
              ))}
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setPickerOpen(true)} style={{ width: '100%', marginTop: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1.5px solid var(--border-hairline)', background: 'transparent', cursor: 'pointer', color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, padding: '13px', borderRadius: 'var(--radius-lg)' }}>
          <span className="material-icons" style={{ fontSize: 19 }}>tune</span>Probar otro esquema
        </button>
      </div>
      <div style={{ flexShrink: 0, padding: '12px 22px calc(18px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--border-hairline)' }}>
        <PillButtonMobile variant="primary" fullWidth icon="check" onPress={onConfirm}>Usar este plan</PillButtonMobile>
      </div>
      {pickerOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 90 }}>
          <div onClick={() => setPickerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,18,0.6)', animation: 'onbIn .2s' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '80%', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)', borderRadius: '24px 24px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.4)', animation: 'onbInRight .3s var(--ease-out)' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)', margin: '10px auto 6px' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)', padding: '4px 20px 12px' }}>Elige un esquema</div>
            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {templates.map(t => {
                const on = (chosenSlug || rec.slug) === t.slug;
                return (
                  <button key={t.slug} type="button" onClick={() => { setChosenSlug(t.slug); setPickerOpen(false); }} style={{ textAlign: 'left', cursor: 'pointer', padding: 14, borderRadius: 'var(--radius-lg)', border: on ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)', background: on ? 'var(--brand-primary-soft)' : 'var(--surface-1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{t.name}</span>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        {t.slug === rec.slug && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'var(--brand-primary)' }}>Sugerido</span>}
                        {on && <span className="material-icons" style={{ fontSize: 18, color: 'var(--brand-primary)' }}>check_circle</span>}
                      </div>
                    </div>
                    <MJarMiniBar segments={t.segments} height={11} />
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)', marginTop: 9 }}>{t.count} cántaros · {t.forWho}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WizardHeaderSimple({ onBack, title }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <OnbStatusBar />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 8px' }}>
        <button type="button" onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 34, height: 34, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-1)' }}>
          <span className="material-icons" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{title}</span>
      </div>
    </div>
  );
}

/* ── Resumen editable + nivel alcanzado ── */
function SummaryScreen({ profile, chosenSlug, userName, onEdit, onFinish, onBack }) {
  const F = window.PROFILE_FIELDS || {};
  const tpl = (window.JAR_TEMPLATES || []).find(t => t.slug === chosenSlug);
  const merged = { ...profile, template_slug: chosenSlug };
  const comp = onbCompleteness(merged, { pro: false });
  const labelFor = (field, val) => { const g = F[field]; const o = g && g.options.find(x => x.value === val); return o ? o.label : null; };
  const rows = [
    { field: 'occupation', icon: 'work' }, { field: 'income_range', icon: 'payments' },
    { field: 'debt_situation', icon: 'credit_card' }, { field: 'main_goal', icon: 'flag' },
    { field: 'money_relationship', icon: 'favorite' }, { field: 'emotional_keyword', icon: 'spa' },
  ].map(r => ({ ...r, label: F[r.field] && F[r.field].label, value: labelFor(r.field, profile[r.field]) })).filter(r => r.value);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <WizardHeaderSimple onBack={onBack} title="Revisa tu perfil" />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '4px 20px 20px' }}>
        {/* Nivel alcanzado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--brand-primary-soft)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 14 }}>
          <OnbRing pct={comp.pct} size={56} stroke={6} color={comp.level.color}>
            <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{comp.pct}%</span>
          </OnbRing>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 4 }}><OnbLevelBadge level={comp.level} size="sm" /></div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--brand-primary-fg-soft)', lineHeight: 1.4, margin: 0 }}>{comp.nextLevel ? `Listo para empezar. Sube a ${comp.nextLevel.label} cuando quieras desde tu perfil.` : 'Perfil completo. ¡Máximo provecho del asesor!'}</p>
          </div>
        </div>

        {tpl && (
          <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}><span className="material-icons" style={{ fontSize: 19, color: 'var(--brand-primary)' }}>savings</span>Plan {tpl.name}</span>
              <button type="button" onClick={() => onEdit('recommend')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>Cambiar</button>
            </div>
            <MJarMiniBar segments={tpl.segments} height={13} />
          </div>
        )}

        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '6px 16px' }}>
          {rows.map((r, i) => (
            <div key={r.field} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: i ? '1px solid var(--border-hairline)' : 'none' }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: 'var(--fg-2)' }}><span className="material-icons" style={{ fontSize: 17 }}>{r.icon}</span></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>{r.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{r.value}</div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border-hairline)', padding: '11px 0' }}>
            <button type="button" onClick={() => onEdit('wizard')} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, padding: 4 }}><span className="material-icons" style={{ fontSize: 17 }}>edit</span>Editar respuestas</button>
          </div>
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: '12px 22px calc(18px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--border-hairline)' }}>
        <PillButtonMobile variant="primary" fullWidth icon="rocket_launch" onPress={onFinish}>Empezar a usar OW</PillButtonMobile>
      </div>
    </div>
  );
}

/* ── Done ── */
function DoneScreen({ userName, comp, onHome }) {
  const [show, setShow] = useFlowState(false);
  useFlowEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t); }, []);
  const dots = ['#10B981', '#F59E0B', '#8B5CF6', '#0EA5E9', '#EC4899', '#F97316'];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {show && dots.map((c, i) => (<span key={i} style={{ position: 'absolute', top: '30%', left: `${15 + i * 13}%`, width: 9, height: 9, borderRadius: 2, background: c, animation: `onbFloat ${1.2 + i * 0.1}s ease-in-out infinite`, opacity: 0.85 }} />))}
      <div style={{ animation: 'onbPop .6s var(--ease-out)' }}>
        {comp ? <OnbRing pct={comp.pct} size={108} stroke={10} color={comp.level.color}><span className="material-icons" style={{ fontSize: 40, color: comp.level.color }}>{comp.level.icon}</span></OnbRing>
              : <span className="material-icons" style={{ fontSize: 52, color: 'var(--income-fg)' }}>check_circle</span>}
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--fg-1)', margin: '20px 0 6px', letterSpacing: '-0.01em' }}>¡Tu plan está listo{userName ? `, ${userName}` : ''}!</h1>
      {comp && <div style={{ marginBottom: 10 }}><OnbLevelBadge level={comp.level} /></div>}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.5, maxWidth: 290 }}>
        Tus cántaros están configurados y conozco tu perfil. {comp && comp.nextLevel ? `Completa más para subir a ${comp.nextLevel.label} y afinar mis consejos.` : 'Estoy listo para acompañarte.'}
      </p>
      <div style={{ width: '100%', marginTop: 28 }}>
        <PillButtonMobile variant="primary" fullWidth icon="arrow_forward" onPress={onHome}>Ir a mi panel</PillButtonMobile>
      </div>
    </div>
  );
}

/* ════════════════════ Controlador ════════════════════ */
const ONB_BLANK = window.ONB_BLANK;

function OnboardingFlow({ startRoute }) {
  const seedDemo = startRoute === 'panel' || startRoute === 'profile';
  const seed = window.AI_PROFILE || {};
  const [route, setRoute] = useFlowState(startRoute || 'welcome');
  const [auth, setAuth] = useFlowState({ name: seedDemo ? 'José Pérez' : '', email: '', password: '' });
  const [profile, setProfile] = useFlowState(seedDemo ? { ...ONB_BLANK, ...seed, long_term_dream: seed.long_term_dream || '', plan: 'lite' } : { ...ONB_BLANK });
  const [stepIdx, setStepIdx] = useFlowState(0);
  const [chosenSlug, setChosenSlug] = useFlowState(seedDemo ? (seed.template_slug || 'moderado') : null);
  const [mode, setMode] = useFlowState('full');
  const [advMode, setAdvMode] = useFlowState(false); // wizard avanzado (Pro)
  const advanceTimer = useFlowRef(null);

  const userName = (auth.name || '').trim().split(' ')[0] || '';
  const setField = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const baseSteps = mode === 'express' ? ONB_FLAT.filter(s => !s.optional) : ONB_FLAT;
  const advSteps = ONB_ADV_STEPS.map((s, i) => ({ ...s, phaseIndex: 0, stepInPhase: i, phaseSteps: ONB_ADV_STEPS.length }));
  const steps = advMode ? advSteps : baseSteps;
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const advPhases = [{ id: 'adv', label: 'Detalle avanzado' }];

  const goNext = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (stepIdx >= steps.length - 1) { setRoute(advMode ? 'profile' : 'recommend'); }
    else setStepIdx(i => i + 1);
  };
  const goBack = () => {
    if (stepIdx <= 0) { setRoute(advMode ? 'profile' : 'intro'); }
    else setStepIdx(i => i - 1);
  };
  const selectChip = (field, val) => { setField(field, val); if (advanceTimer.current) clearTimeout(advanceTimer.current); advanceTimer.current = setTimeout(goNext, 260); };
  const reset = () => { setProfile({ ...ONB_BLANK }); setChosenSlug(null); setStepIdx(0); setAuth({ name: '', email: '', password: '' }); setAdvMode(false); setRoute('welcome'); };

  let screen;
  if (route === 'welcome') {
    screen = <WelcomeScreen onStart={() => setRoute('register')} onLogin={() => setRoute('login')} />;
  } else if (route === 'register') {
    screen = <RegisterScreen data={auth} setData={setAuth} onNext={() => setRoute('intro')} onLogin={() => setRoute('login')} onBack={() => setRoute('welcome')} />;
  } else if (route === 'login') {
    // Reusar el plan de login: entra directo al panel con un perfil ya armado (José)
    screen = <LoginScreen data={auth} setData={setAuth} onRegister={() => setRoute('register')} onBack={() => setRoute('welcome')}
      onNext={() => { const seed = window.AI_PROFILE || {}; setAuth(a => ({ ...a, name: a.name || 'José Pérez' })); setProfile(p => ({ ...p, ...seed, plan: 'lite' })); setChosenSlug(seed.template_slug || 'moderado'); setRoute('panel'); }} />;
  } else if (route === 'intro') {
    screen = <IntroScreen userName={userName} onChoose={(m) => { if (m === 'skip') { setRoute('panel'); return; } setMode(m === 'express' ? 'express' : 'full'); setStepIdx(0); setAdvMode(false); setRoute('wizard'); }} />;
  } else if (route === 'wizard') {
    const essentialsReady = profile.occupation && profile.income_range && profile.main_goal;
    screen = (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <WizardHeader phases={advMode ? advPhases : ONB_PHASES} step={step} onBack={goBack} onSkip={goNext} canSkip={!!step.optional} />
        {step.kind === 'dream'
          ? <WizardDreamStep value={profile.long_term_dream} onChange={v => setField('long_term_dream', v)} />
          : <WizardChipStep step={step} value={profile[step.field]} onSelect={(v) => selectChip(step.field, v)} />}
        {!advMode && <WizardPlanStrip profile={profile} />}
        <div style={{ flexShrink: 0, padding: '4px 22px calc(14px + env(safe-area-inset-bottom))' }}>
          <PillButtonMobile variant={step.kind === 'dream' || profile[step.field] ? 'primary' : 'secondary'} fullWidth icon="arrow_forward" onPress={goNext}>
            {stepIdx >= steps.length - 1 ? (advMode ? 'Guardar detalle' : 'Ver mi plan') : 'Continuar'}
          </PillButtonMobile>
          {!advMode && essentialsReady && stepIdx < steps.length - 1 && (
            <button type="button" onClick={() => setRoute('recommend')} style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-3)', padding: '9px 0 2px' }}>
              Ya tengo lo esencial · ir a mi plan →
            </button>
          )}
        </div>
      </div>
    );
  } else if (route === 'recommend') {
    screen = <RecommendScreen profile={profile} chosenSlug={chosenSlug} setChosenSlug={setChosenSlug}
      onConfirm={() => { setProfile(p => ({ ...p, template_slug: chosenSlug || onbRecommendTemplate(profile).slug })); setRoute('summary'); }}
      onBack={() => { setStepIdx(steps.length - 1); setRoute('wizard'); }} />;
  } else if (route === 'summary') {
    screen = <SummaryScreen profile={profile} chosenSlug={chosenSlug || onbRecommendTemplate(profile).slug} userName={userName}
      onEdit={(target) => { if (target === 'wizard') { setStepIdx(0); setRoute('wizard'); } else setRoute('recommend'); }}
      onFinish={() => setRoute('done')} onBack={() => setRoute('recommend')} />;
  } else if (route === 'done') {
    const comp = onbCompleteness({ ...profile, template_slug: chosenSlug || profile.template_slug }, { pro: profile.plan === 'pro' });
    screen = <DoneScreen userName={userName} comp={comp} onHome={() => setRoute('panel')} />;
  } else if (route === 'profile') {
    screen = <ProfileScreen profile={{ ...profile, template_slug: chosenSlug || profile.template_slug }} userName={userName}
      onBack={() => setRoute('panel')}
      onUpgrade={() => { setProfile(p => ({ ...p, plan: 'pro' })); }}
      onEditSection={(sec) => {
        if (sec.id === 'advanced') { setAdvMode(true); setStepIdx(0); setRoute('wizard'); return; }
        if (sec.id === 'jars') { setRoute('recommend'); return; }
        const phaseIdx = ONB_PHASES.findIndex(p => p.id === sec.id);
        const flatIdx = ONB_FLAT.findIndex(s => s.phaseIndex === (phaseIdx < 0 ? 0 : phaseIdx));
        setMode('full'); setAdvMode(false); setStepIdx(flatIdx < 0 ? 0 : flatIdx); setRoute('wizard');
      }} />;
  } else { // panel
    screen = <PanelScreen profile={{ ...profile, template_slug: chosenSlug || profile.template_slug }} userName={userName}
      onContinue={() => { const c = onbCompleteness({ ...profile, template_slug: chosenSlug || profile.template_slug }, { pro: profile.plan === 'pro' }); if (!c.standardDone) { setMode('full'); setAdvMode(false); const flatIdx = ONB_FLAT.findIndex(s => !profile[s.field] && s.kind !== 'dream'); setStepIdx(flatIdx < 0 ? 0 : flatIdx); setRoute('wizard'); } else { setRoute('profile'); } }}
      onViewProfile={() => setRoute('profile')} onRestart={reset} />;
  }

  return <div key={route + (advMode ? '-adv' : '')} style={{ height: '100%', animation: 'onbIn .32s var(--ease-out)' }}>{screen}</div>;
}

Object.assign(window, { OnboardingFlow, ONB_PHASES, ONB_ADV_STEPS });
