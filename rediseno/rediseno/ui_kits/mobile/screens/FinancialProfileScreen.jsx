/* ─── Mobile · Mi perfil financiero ─────────────────────────────────────
 * Fuente: DESIGN_PROMPT_ONBOARDING.md (Parte 2). 4 cards de chips + cántaros.
 * El asesor IA usa estos datos. Props: onBack.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useMfpState } = React;

function FinancialProfileScreen({ onBack }) {
  const F = window.PROFILE_FIELDS || {};
  const seed = window.AI_PROFILE || {};
  const [p, setP] = useMfpState({
    occupation: seed.occupation || null, income_range: seed.income_range || null, living_situation: seed.living_situation || null,
    debt_situation: seed.debt_situation || null, emergency_fund: seed.emergency_fund || null, money_relationship: seed.money_relationship || null,
    main_goal: seed.main_goal || null, long_term_dream: seed.long_term_dream || '', emotional_keyword: seed.emotional_keyword || null,
    template_slug: seed.template_slug || 'moderado',
    jars: (window.USER_JARS || []).map(j => ({ ...j })),
  });
  const set = (k, v) => setP(s => ({ ...s, [k]: v }));
  const applyTemplate = (slug) => {
    const tpl = (window.JAR_TEMPLATES || []).find(t0 => t0.slug === slug);
    setP(s => ({ ...s, template_slug: slug, jars: tpl ? tpl.segments.map((sg, idx) => ({ id: 'tpl-' + idx, name: sg.name, percent: sg.percent, color: sg.color, description: '' })) : s.jars }));
  };
  const max = 500;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <MobileHeader title="Mi perfil financiero" onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '6px 16px 24px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', margin: '4px 4px 14px', lineHeight: 1.5 }}>
          El asesor IA usa esta información para personalizar sus consejos.
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--fg-3)', fontSize: 11.5, marginLeft: 6 }}><span className="material-icons" style={{ fontSize: 13 }}>history</span>Actualizado hace {seed.updated_days_ago || 3} días</span>
        </p>

        <MfpCard icon="badge" title="Quién soy">
          <MChipGroup group={F.occupation}       value={p.occupation}       onChange={v => set('occupation', v)} />
          <MChipGroup group={F.income_range}     value={p.income_range}     onChange={v => set('income_range', v)} />
          <MChipGroup group={F.living_situation} value={p.living_situation} onChange={v => set('living_situation', v)} />
        </MfpCard>

        <MfpCard icon="account_balance" title="Situación financiera">
          <MChipGroup group={F.debt_situation}     value={p.debt_situation}     onChange={v => set('debt_situation', v)} />
          <MChipGroup group={F.emergency_fund}     value={p.emergency_fund}     onChange={v => set('emergency_fund', v)} />
          <MChipGroup group={F.money_relationship} value={p.money_relationship} onChange={v => set('money_relationship', v)} />
        </MfpCard>

        <MfpCard icon="flag" title="Metas y sueños">
          <MChipGroup group={F.main_goal} value={p.main_goal} onChange={v => set('main_goal', v)} />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)' }}>Sueño a largo plazo</span>
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 11, color: p.long_term_dream.length > max ? 'var(--expense-fg)' : 'var(--fg-3)' }}>{p.long_term_dream.length}/{max}</span>
            </div>
            <textarea value={p.long_term_dream} maxLength={max} onChange={e => set('long_term_dream', e.target.value)} placeholder="Ej: Tener un negocio que funcione solo…" rows={3} style={{ ...window.MPC_INPUT, resize: 'vertical', minHeight: 76, lineHeight: 1.5 }} onFocus={window.mpcFocus} onBlur={window.mpcBlur} />
          </div>
          <MChipGroup group={F.emotional_keyword} value={p.emotional_keyword} onChange={v => set('emotional_keyword', v)} />
        </MfpCard>

        <MfpCard icon="savings" title="Mis cántaros">
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 9 }}>Esquema</div>
            <MJarTemplateSelector value={p.template_slug} onChange={applyTemplate} />
          </div>
          <div style={{ height: 1, background: 'var(--border-hairline)' }} />
          <MJarsTable jars={p.jars} setJars={v => set('jars', v)} />
        </MfpCard>

        <div style={{ marginTop: 18 }}>
          <PillButtonMobile variant="primary" icon="check" fullWidth onPress={onBack}>Guardar perfil</PillButtonMobile>
        </div>
      </div>
    </div>
  );
}

function MfpCard({ icon, title, children }) {
  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 16, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 17 }}>{icon}</span></span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--fg-1)', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

Object.assign(window, { FinancialProfileScreen });
