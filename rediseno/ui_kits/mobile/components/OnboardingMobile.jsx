/* ─── Mobile · Onboarding wizard (post-login) ───────────────────────────
 * Fuente: DESIGN_PROMPT_ONBOARDING.md (Parte 1). Overlay full-screen dentro
 * del teléfono. Pasos: bienvenida → quién eres → situación → metas → cántaros → listo.
 * Props: open · onClose · onFinish(payload)
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useObmState, useEffect: useObmEffect } = React;

const OBM_STEPS = [
  { id: 'welcome',   skippable: false },
  { id: 'about',     skippable: true,  title: 'Cuéntanos sobre ti',          sub: 'El asesor IA usará esto para consejos personalizados.' },
  { id: 'situation', skippable: true,  title: 'Tu situación actual',          sub: 'Honestidad = mejores consejos.' },
  { id: 'goals',     skippable: true,  title: 'Tus metas y sueños',           sub: 'Lo que quieres lograr guía todo el plan.' },
  { id: 'jars',      skippable: true,  title: 'Propósito de tus cántaros',    sub: 'El asesor sabrá para qué es cada uno.' },
  { id: 'done',      skippable: false },
];

function OnboardingMobile({ open, onClose, onFinish }) {
  const F = window.PROFILE_FIELDS || {};
  const [i, setI] = useObmState(0);
  const [p, setP] = useObmState({
    mode: 'lite',
    occupation: null, income_range: null, living_situation: null,
    debt_situation: null, emergency_fund: null, money_relationship: null,
    main_goal: null, long_term_dream: '', emotional_keyword: null,
    template_slug: 'moderado', jars: (window.USER_JARS || []).map(j => ({ ...j })),
  });
  const set = (k, v) => setP(s => ({ ...s, [k]: v }));
  if (!open) return null;

  const step = OBM_STEPS[i];
  const last = i === OBM_STEPS.length - 1;
  const finish = () => { try { localStorage.setItem('ow-onboarded', '1'); } catch (e) {} onFinish && onFinish({ ...p, onboarding_profile_completed: true }); };
  const next = () => { if (last) finish(); else setI(n => Math.min(n + 1, OBM_STEPS.length - 1)); };
  const back = () => setI(n => Math.max(n - 1, 0));
  const applyTemplate = (slug) => {
    const tpl = (window.JAR_TEMPLATES || []).find(t0 => t0.slug === slug);
    setP(s => ({ ...s, template_slug: slug, jars: tpl ? tpl.segments.map((sg, idx) => ({ id: 'tpl-' + idx, name: sg.name, percent: sg.percent, color: sg.color, description: '' })) : s.jars }));
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', animation: 'obmFade 220ms var(--ease-out)' }}>
      <style>{`@keyframes obmFade{from{opacity:0}to{opacity:1}}@keyframes obmSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* top: marca + cerrar + dots */}
      <div style={{ flexShrink: 0, padding: '16px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--brand-primary)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--fg-1)' }}>OW Finance</span>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'inline-flex' }}><span className="material-icons" style={{ fontSize: 22 }}>close</span></button>
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 13 }}>
          {OBM_STEPS.map((s, idx) => <div key={s.id} style={{ flex: 1, height: 5, borderRadius: 999, background: idx <= i ? 'var(--brand-primary)' : 'var(--surface-3)', transition: 'background 200ms' }} />)}
        </div>
      </div>

      {/* contenido */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '18px' }}>
        <div key={step.id} style={{ animation: 'obmSlide 240ms var(--ease-out)' }}>
          {step.title && (
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)', margin: 0 }}>{step.title}</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', margin: '6px 0 0', lineHeight: 1.5 }}>{step.sub}</p>
            </div>
          )}
          <ObmStep step={step.id} p={p} set={set} F={F} applyTemplate={applyTemplate} />
        </div>
      </div>

      {/* nav inferior */}
      <div style={{ flexShrink: 0, borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-1)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        {i > 0 ? <PillButtonMobile variant="ghost" size="sm" onPress={back}>Atrás</PillButtonMobile> : <span />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step.skippable && <button type="button" onClick={next} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>Saltar</button>}
          <PillButtonMobile variant="primary" icon={last ? 'check' : 'arrow_forward'} onPress={next}>{last ? 'Ir al inicio' : (i === 0 ? 'Empezar' : 'Continuar')}</PillButtonMobile>
        </div>
      </div>
    </div>
  );
}

function ObmStep({ step, p, set, F, applyTemplate }) {
  if (step === 'welcome') {
    const points = [
      { icon: 'savings', text: 'Reparte tu dinero en cántaros con propósito' },
      { icon: 'psychology', text: 'Un asesor IA que te conoce y aconseja' },
      { icon: 'flag', text: 'Metas y sueños claros, mes a mes' },
    ];
    return (
      <div style={{ textAlign: 'center', paddingTop: 6 }}>
        <span style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><span className="material-icons" style={{ fontSize: 34, color: '#fff' }}>account_balance_wallet</span></span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--fg-1)', margin: 0 }}>Tu dinero, con calma.</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', margin: '8px auto 20px', lineHeight: 1.5 }}>Te conocemos en un minuto para darte consejos a tu medida. Puedes saltar lo que quieras.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 20 }}>
          {points.map((pt, k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)' }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 18 }}>{pt.icon}</span></span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)' }}>{pt.text}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 9 }}>¿Cómo prefieres empezar?</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[['lite', 'Lite', 'Simple y enfocado', 'spa'], ['pro', 'Pro', 'Panel completo', 'dashboard']].map(([id, lbl, d, ic]) => {
              const on = p.mode === id;
              return (
                <button key={id} type="button" onClick={() => set('mode', id)} style={{ flex: 1, textAlign: 'left', cursor: 'pointer', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: on ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)', background: on ? 'var(--brand-primary-soft)' : 'var(--surface-1)' }}>
                  <span className="material-icons" style={{ fontSize: 21, color: on ? 'var(--brand-primary)' : 'var(--fg-2)' }}>{ic}</span>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--fg-1)', marginTop: 4 }}>{lbl}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{d}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  if (step === 'about') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <MChipGroup group={F.occupation}       value={p.occupation}       onChange={v => set('occupation', v)} />
      <MChipGroup group={F.income_range}     value={p.income_range}     onChange={v => set('income_range', v)} />
      <MChipGroup group={F.living_situation} value={p.living_situation} onChange={v => set('living_situation', v)} />
    </div>
  );
  if (step === 'situation') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <MChipGroup group={F.debt_situation}     value={p.debt_situation}     onChange={v => set('debt_situation', v)} />
      <MChipGroup group={F.emergency_fund}     value={p.emergency_fund}     onChange={v => set('emergency_fund', v)} />
      <MChipGroup group={F.money_relationship} value={p.money_relationship} onChange={v => set('money_relationship', v)} />
    </div>
  );
  if (step === 'goals') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <MChipGroup group={F.main_goal} value={p.main_goal} onChange={v => set('main_goal', v)} />
      <ObmDream value={p.long_term_dream} onChange={v => set('long_term_dream', v)} />
      <MChipGroup group={F.emotional_keyword} value={p.emotional_keyword} onChange={v => set('emotional_keyword', v)} />
    </div>
  );
  if (step === 'jars') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 9 }}>Elige un esquema (puedes cambiarlo luego)</div>
        <MJarTemplateSelector value={p.template_slug} onChange={applyTemplate} />
      </div>
      <div style={{ height: 1, background: 'var(--border-hairline)' }} />
      <MJarsTable jars={p.jars} setJars={v => set('jars', v)} />
    </div>
  );

  // done
  const tpl = (window.JAR_TEMPLATES || []).find(t0 => t0.slug === p.template_slug);
  const lbl = (field, val) => { const g = F[field]; const o = g && g.options.find(x => x.value === val); return o ? o.label : '—'; };
  return (
    <div style={{ textAlign: 'center', paddingTop: 8 }}>
      <span style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--income-soft)', color: 'var(--income-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><span className="material-icons" style={{ fontSize: 36 }}>check_circle</span></span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--fg-1)', margin: 0 }}>¡Todo listo!</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', margin: '8px auto 18px', lineHeight: 1.5 }}>Guardamos tu perfil. El asesor IA ya puede aconsejarte. Edítalo cuando quieras en Ajustes.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, textAlign: 'left', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-md)', padding: 16 }}>
        <ObmRow icon="badge" label="Ocupación" value={lbl('occupation', p.occupation)} />
        <ObmRow icon="trending_up" label="Meta principal" value={lbl('main_goal', p.main_goal)} />
        <ObmRow icon="favorite" label="Quiero sentirme" value={lbl('emotional_keyword', p.emotional_keyword)} />
        <ObmRow icon="savings" label="Esquema" value={tpl ? tpl.name : '—'} />
      </div>
    </div>
  );
}

function ObmRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-2)' }}>{icon}</span>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{label}</span>
      <strong style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)' }}>{value}</strong>
    </div>
  );
}

function ObmDream({ value, onChange }) {
  const examples = window.DREAM_PLACEHOLDERS || ['Tu sueño a largo plazo…'];
  const [idx, setIdx] = useObmState(0);
  useObmEffect(() => { const id = setInterval(() => setIdx(n => (n + 1) % examples.length), 3200); return () => clearInterval(id); }, [examples.length]);
  const max = 500;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)' }}>Tu sueño a largo plazo</span>
        <span style={{ fontFamily: 'var(--font-money)', fontSize: 11, color: value.length > max ? 'var(--expense-fg)' : 'var(--fg-3)' }}>{value.length}/{max}</span>
      </div>
      <textarea value={value} maxLength={max} onChange={e => onChange(e.target.value)} placeholder={examples[idx]} rows={3} style={{ ...window.MPC_INPUT, resize: 'vertical', minHeight: 76, lineHeight: 1.5 }} onFocus={window.mpcFocus} onBlur={window.mpcBlur} />
    </div>
  );
}

Object.assign(window, { OnboardingMobile });
