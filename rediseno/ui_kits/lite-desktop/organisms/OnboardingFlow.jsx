/* ─── OnboardingFlow — wizard de perfilado IA (post-login, 1ª vez) ───────
 * Fuente: docs/00-sistema/DESIGN_PROMPT_ONBOARDING.md (Parte 1).
 * Pasos: bienvenida(Lite/Pro) → quién eres → situación → metas → cántaros → listo.
 * Pasos 1–4 con "Saltar". Al terminar/saltar → onboarding_profile_completed=true.
 * Props: open · onClose · onFinish(payload)
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useObState, useEffect: useObEffect } = React;

const OB_STEPS = [
  { id: 'welcome',   label: 'Bienvenida', skippable: false },
  { id: 'about',     label: 'Sobre ti',   skippable: true,  title: 'Cuéntanos sobre ti',        sub: 'El asesor IA usará esto para consejos personalizados.' },
  { id: 'situation', label: 'Situación',  skippable: true,  title: 'Tu situación actual',        sub: 'Honestidad = mejores consejos.' },
  { id: 'goals',     label: 'Metas',      skippable: true,  title: 'Tus metas y sueños',         sub: 'Lo que quieres lograr guía todo el plan.' },
  { id: 'jars',      label: 'Cántaros',   skippable: true,  title: 'Dale propósito a tus cántaros', sub: 'El asesor sabrá para qué es cada uno.' },
  { id: 'done',      label: 'Listo',      skippable: false },
];

function OnboardingFlow({ open, onClose, onFinish }) {
  const [i, setI] = useObState(0);
  const F = window.PROFILE_FIELDS || {};
  const [p, setP] = useObState({
    mode: 'lite',
    occupation: null, income_range: null, living_situation: null,
    debt_situation: null, emergency_fund: null, money_relationship: null,
    main_goal: null, long_term_dream: '', emotional_keyword: null,
    template_slug: 'moderado',
    jars: (window.USER_JARS || []).map(j => ({ ...j })),
  });
  const set = (k, v) => setP(s => ({ ...s, [k]: v }));

  if (!open) return null;
  const step = OB_STEPS[i];
  const last = i === OB_STEPS.length - 1;
  const finish = () => { try { localStorage.setItem('ow-onboarded', '1'); } catch (e) {} onFinish && onFinish({ ...p, onboarding_profile_completed: true }); };
  const next = () => { if (last) finish(); else setI(n => Math.min(n + 1, OB_STEPS.length - 1)); };
  const back = () => setI(n => Math.max(n - 1, 0));
  const applyTemplate = (slug) => {
    const tpl = (window.JAR_TEMPLATES || []).find(t0 => t0.slug === slug);
    setP(s => ({ ...s, template_slug: slug, jars: tpl ? tpl.segments.map((sg, idx) => ({ id: 'tpl-' + idx, name: sg.name, percent: sg.percent, color: sg.color, description: '' })) : s.jars }));
  };

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 12000, background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', animation: 'obFade 220ms var(--ease-out)' }}>
      <style>{`@keyframes obFade{from{opacity:0}to{opacity:1}}@keyframes obSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* barra superior: marca · pasos (dots) · salir */}
      <div style={{ flexShrink: 0, padding: '18px 24px 0' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--brand-primary)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)' }}>OW Finance</span>
          </div>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onClose} title={t('Salir')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'inline-flex' }}><span className="material-icons" style={{ fontSize: 22 }}>close</span></button>
        </div>
        {/* dots de progreso */}
        <div style={{ maxWidth: 720, margin: '16px auto 0', display: 'flex', gap: 6 }}>
          {OB_STEPS.map((s, idx) => (
            <div key={s.id} style={{ flex: 1, height: 5, borderRadius: 999, background: idx <= i ? 'var(--brand-primary)' : 'var(--surface-3)', transition: 'background var(--dur-base) var(--ease-out)' }} />
          ))}
        </div>
      </div>

      {/* contenido del paso */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div key={step.id} style={{ maxWidth: 720, margin: '0 auto', animation: 'obSlide 240ms var(--ease-out)' }}>
          {step.title && (
            <div style={{ marginBottom: 22 }}>
              <h2 className="t-h2" style={{ margin: 0 }}>{t(step.title)}</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', margin: '6px 0 0', textWrap: 'pretty' }}>{t(step.sub)}</p>
            </div>
          )}
          <ObStep step={step.id} p={p} set={set} F={F} applyTemplate={applyTemplate} />
        </div>
      </div>

      {/* navegación inferior */}
      <div style={{ flexShrink: 0, borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-1)', padding: '14px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {i > 0 ? <PillButton variant="ghost" onClick={back}>{t('Atrás')}</PillButton> : <span />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {step.skippable && <button type="button" onClick={next} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Saltar')}</button>}
            <button type="button" onClick={next}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', padding: '13px 28px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15 }}>
              {last ? t('Ir al inicio') : (i === 0 ? t('Empezar') : t('Continuar'))}
              <span className="material-icons" style={{ fontSize: 19 }}>{last ? 'check' : 'arrow_forward'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- contenido de cada paso ---------- */
function ObStep({ step, p, set, F, applyTemplate }) {
  if (step === 'welcome') {
    const points = [
      { icon: 'savings', text: t('Reparte tu dinero en cántaros con un propósito') },
      { icon: 'psychology', text: t('Un asesor IA que te conoce y te aconseja') },
      { icon: 'flag', text: t('Metas y sueños claros, mes a mes') },
    ];
    return (
      <div style={{ textAlign: 'center', paddingTop: 4 }}>
        <span style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <span className="material-icons" style={{ fontSize: 38, color: '#fff' }}>account_balance_wallet</span>
        </span>
        <h1 className="t-h1" style={{ margin: 0 }}>{t('Tu dinero, con calma.')}</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', margin: '10px auto 22px', maxWidth: 440, textWrap: 'pretty' }}>{t('Vamos a conocerte en un minuto para que el asesor IA te dé consejos a tu medida. Puedes saltar lo que quieras.')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, maxWidth: 400, margin: '0 auto 24px', textAlign: 'left' }}>
          {points.map((pt, k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px', borderRadius: 'var(--radius-md)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 19 }}>{pt.icon}</span></span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)' }}>{pt.text}</span>
            </div>
          ))}
        </div>
        {/* La elección Lite/Pro ya no vive acá — pasó a OnboardingModal (pantalla
         * completa, previa a este wizard), matching la arquitectura real de 2
         * flujos independientes (OnboardingModal vs OnboardingFlow). `p.mode`
         * llega precargado desde ahí. */}
      </div>
    );
  }

  if (step === 'about') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <ChipGroup group={F.occupation}       value={p.occupation}       onChange={v => set('occupation', v)} />
        <ChipGroup group={F.income_range}     value={p.income_range}     onChange={v => set('income_range', v)} />
        <ChipGroup group={F.living_situation} value={p.living_situation} onChange={v => set('living_situation', v)} />
      </div>
    );
  }
  if (step === 'situation') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <ChipGroup group={F.debt_situation}     value={p.debt_situation}     onChange={v => set('debt_situation', v)} />
        <ChipGroup group={F.emergency_fund}     value={p.emergency_fund}     onChange={v => set('emergency_fund', v)} />
        <ChipGroup group={F.money_relationship} value={p.money_relationship} onChange={v => set('money_relationship', v)} />
      </div>
    );
  }
  if (step === 'goals') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <ChipGroup group={F.main_goal} value={p.main_goal} onChange={v => set('main_goal', v)} />
        <ObDreamInput value={p.long_term_dream} onChange={v => set('long_term_dream', v)} />
        <ChipGroup group={F.emotional_keyword} value={p.emotional_keyword} onChange={v => set('emotional_keyword', v)} />
      </div>
    );
  }
  if (step === 'jars') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 9 }}>{t('Elige un esquema (puedes cambiarlo luego)')}</div>
          <JarTemplateSelector value={p.template_slug} onChange={applyTemplate} />
        </div>
        <div style={{ height: 1, background: 'var(--border-hairline)' }} />
        <JarsTable jars={p.jars} setJars={v => set('jars', v)} />
      </div>
    );
  }

  // done
  const tpl = (window.JAR_TEMPLATES || []).find(t0 => t0.slug === p.template_slug);
  const lbl = (field, val) => { const g = F[field]; const o = g && g.options.find(x => x.value === val); return o ? o.label : '—'; };

  /* Gamificación (§4.2 paso 7 del prompt): 🌱 Semilla <40% · 🌿 Brote 40-74% ·
   * 🌳 Árbol ≥75%, sobre los 8 campos de perfil (mismo criterio que la barra
   * de completitud de Perfil, ver PROMPT_REDISENO_DEUDAS_SUENOS_PERFIL.md §4.1). */
  const PROFILE_FIELD_KEYS = ['occupation', 'income_range', 'living_situation', 'debt_situation', 'emergency_fund', 'money_relationship', 'main_goal', 'emotional_keyword'];
  const filledCount = PROFILE_FIELD_KEYS.filter(k => p[k]).length + (p.long_term_dream ? 1 : 0);
  const completionPct = Math.round((filledCount / (PROFILE_FIELD_KEYS.length + 1)) * 100);
  const badge = completionPct >= 75
    ? { emoji: '🌳', label: t('Árbol') }
    : completionPct >= 40
      ? { emoji: '🌿', label: t('Brote') }
      : { emoji: '🌱', label: t('Semilla') };

  return (
    <div style={{ textAlign: 'center', paddingTop: 8 }}>
      <span style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--income-soft)', color: 'var(--income-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <span className="material-icons" style={{ fontSize: 40 }}>check_circle</span>
      </span>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', marginBottom: 14 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{badge.emoji}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700, color: 'var(--fg-1)' }}>{badge.label}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>· {completionPct}% {t('del perfil')}</span>
      </div>
      <h1 className="t-h1" style={{ margin: 0 }}>{t('¡Todo listo!')}</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', margin: '10px auto 22px', maxWidth: 440, textWrap: 'pretty' }}>{t('Guardamos tu perfil. El asesor IA ya puede darte consejos personalizados. Puedes editarlo cuando quieras en Ajustes.')}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, textAlign: 'left', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-md)', padding: 18, maxWidth: 420, margin: '0 auto' }}>
        <ObSummaryRow icon="badge" label={t('Ocupación')} value={t(lbl('occupation', p.occupation))} />
        <ObSummaryRow icon="trending_up" label={t('Meta principal')} value={t(lbl('main_goal', p.main_goal))} />
        <ObSummaryRow icon="favorite" label={t('Quiero sentirme')} value={t(lbl('emotional_keyword', p.emotional_keyword))} />
        <ObSummaryRow icon="savings" label={t('Esquema de cántaros')} value={tpl ? tpl.name : '—'} />
      </div>
    </div>
  );
}

function ObSummaryRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-2)' }}>{icon}</span>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{label}</span>
      <strong style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)' }}>{value}</strong>
    </div>
  );
}

/* Input del sueño con placeholder rotativo */
function ObDreamInput({ value, onChange }) {
  const examples = window.DREAM_PLACEHOLDERS || ['Tu sueño a largo plazo…'];
  const [idx, setIdx] = useObState(0);
  useObEffect(() => { const id = setInterval(() => setIdx(n => (n + 1) % examples.length), 3200); return () => clearInterval(id); }, [examples.length]);
  const max = 500;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)' }}>{t('Tu sueño a largo plazo')}</span>
        <span style={{ fontFamily: 'var(--font-money)', fontSize: 11, color: value.length > max ? 'var(--expense-fg)' : 'var(--fg-3)' }}>{value.length}/{max}</span>
      </div>
      <textarea value={value} maxLength={max} onChange={e => onChange(e.target.value)} placeholder={examples[idx]} rows={3}
        style={{ ...window.FC_INPUT_STYLE, resize: 'vertical', minHeight: 78, padding: '12px 13px', fontFamily: 'var(--font-body)', lineHeight: 1.5 }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
    </div>
  );
}

/* ─── OnboardingModal — elegir Lite/Pro (PROMPT_REDISENO_ASESOR_CONFIG_NOTIFICACIONES_ONBOARDING.md §4.1) ─
 * Independiente de OnboardingFlow (el wizard de perfil de arriba) — en el
 * Vue real son 2 flujos separados: este va PRIMERO (obligatorio, sin botón
 * de cerrar, solo se dispara la 1ª vez), OnboardingFlow es opcional/después.
 * Antes de este componente, la elección de modo vivía fusionada dentro del
 * paso "welcome" de OnboardingFlow — se sacó de ahí para que ambos flujos
 * queden realmente independientes, como en producción.
 * Props: onChoose(mode) */
function OnboardingModal({ onChoose }) {
  const tf = (window.t || (s => s));
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 30000, background: 'var(--brand-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <span style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span className="material-icons" style={{ fontSize: 30, color: '#fff' }}>savings</span>
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: '#fff', margin: '0 0 8px' }}>{tf('Bienvenido a OW Finance')}</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,.85)', margin: 0 }}>{tf('¿Cómo prefieres empezar? Puedes cambiar de modo cuando quieras.')}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, width: '100%', maxWidth: 720 }}>
        <button type="button" onClick={() => onChoose('lite')} style={{ textAlign: 'left', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-lg)', background: '#fff', padding: 28, boxShadow: '0 20px 50px rgba(0,0,0,.25)' }}>
          <span className="material-icons" style={{ fontSize: 32, color: 'var(--brand-primary)' }}>speed</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--fg-1)', margin: '14px 0 6px' }}>Lite</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.5, margin: '0 0 18px' }}>{tf('Rápida, ágil y directa al grano. Una sola billetera, sin cuentas que pensar.')}</p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}>{tf('Elegir Lite')} <span className="material-icons" style={{ fontSize: 17 }}>arrow_forward</span></span>
        </button>
        <button type="button" onClick={() => onChoose('pro')} style={{ textAlign: 'left', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-lg)', background: '#0B1220', padding: 28, boxShadow: '0 20px 50px rgba(0,0,0,.35)' }}>
          <span className="material-icons" style={{ fontSize: 32, color: '#fff' }}>dashboard_customize</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff', margin: '14px 0 6px' }}>Pro</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'rgba(255,255,255,.7)', lineHeight: 1.5, margin: '0 0 18px' }}>{tf('Potencia máxima. Vista de escritorio, multi-cuenta y análisis detallados.')}</p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5 }}>{tf('Elegir Pro')} <span className="material-icons" style={{ fontSize: 17 }}>arrow_forward</span></span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingFlow, OnboardingModal });
