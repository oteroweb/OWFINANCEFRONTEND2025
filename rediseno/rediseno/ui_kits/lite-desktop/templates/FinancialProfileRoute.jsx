/* ─── FinancialProfileRoute — "Mi perfil financiero" (Settings) ─────────
 * Fuente: docs/00-sistema/DESIGN_PROMPT_ONBOARDING.md (Parte 2).
 * 4 cards: Quién soy · Situación financiera · Metas y sueños · Mis cántaros.
 * El asesor IA usa estos datos. Editable siempre. Props: onGo(route).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useFpState } = React;

function FinancialProfileRoute({ onGo }) {
  const F = window.PROFILE_FIELDS || {};
  const seed = window.AI_PROFILE || {};
  const [p, setP] = useFpState({
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 760, margin: '0 auto', width: '100%' }}>
      <div>
        <button type="button" onClick={() => onGo && onGo('config')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '2px 0', marginBottom: 8 }}>
          <span className="material-icons" style={{ fontSize: 17 }}>chevron_left</span>{t('Configuración')}
        </button>
        <Eyebrow>{t('Cuenta')}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Mi perfil financiero')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', margin: 0, maxWidth: 520, textWrap: 'pretty' }}>{t('El asesor IA usa esta información para personalizar sus consejos.')}</p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}><span className="material-icons" style={{ fontSize: 14 }}>history</span>{t('Actualizado hace')} {seed.updated_days_ago || 3} {t('días')}</span>
        </div>
      </div>

      {/* Card 1 — Quién soy */}
      <FpCard icon="badge" title={t('Quién soy')}>
        <ChipGroup group={F.occupation}       value={p.occupation}       onChange={v => set('occupation', v)} />
        <ChipGroup group={F.income_range}     value={p.income_range}     onChange={v => set('income_range', v)} />
        <ChipGroup group={F.living_situation} value={p.living_situation} onChange={v => set('living_situation', v)} />
      </FpCard>

      {/* Card 2 — Situación financiera */}
      <FpCard icon="account_balance" title={t('Situación financiera')}>
        <ChipGroup group={F.debt_situation}     value={p.debt_situation}     onChange={v => set('debt_situation', v)} />
        <ChipGroup group={F.emergency_fund}     value={p.emergency_fund}     onChange={v => set('emergency_fund', v)} />
        <ChipGroup group={F.money_relationship} value={p.money_relationship} onChange={v => set('money_relationship', v)} />
      </FpCard>

      {/* Card 3 — Metas y sueños */}
      <FpCard icon="flag" title={t('Metas y sueños')}>
        <ChipGroup group={F.main_goal} value={p.main_goal} onChange={v => set('main_goal', v)} />
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)' }}>{t('Sueño a largo plazo')}</span>
            <span style={{ fontFamily: 'var(--font-money)', fontSize: 11, color: p.long_term_dream.length > max ? 'var(--expense-fg)' : 'var(--fg-3)' }}>{p.long_term_dream.length}/{max}</span>
          </div>
          <textarea value={p.long_term_dream} maxLength={max} onChange={e => set('long_term_dream', e.target.value)} placeholder={t('Ej: Tener un negocio que funcione solo y comprar casa propia…')} rows={3}
            style={{ ...window.FC_INPUT_STYLE, resize: 'vertical', minHeight: 78, padding: '12px 13px', fontFamily: 'var(--font-body)', lineHeight: 1.5 }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
        </div>
        <ChipGroup group={F.emotional_keyword} value={p.emotional_keyword} onChange={v => set('emotional_keyword', v)} />
      </FpCard>

      {/* Card 4 — Mis cántaros */}
      <FpCard icon="savings" title={t('Mis cántaros')}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 9 }}>{t('Esquema')}</div>
          <JarTemplateSelector value={p.template_slug} onChange={applyTemplate} />
        </div>
        <div style={{ height: 1, background: 'var(--border-hairline)' }} />
        <JarsTable jars={p.jars} setJars={v => set('jars', v)} />
      </FpCard>

      {/* acciones */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, position: 'sticky', bottom: 16 }}>
        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', padding: '13px 26px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5, boxShadow: 'var(--shadow-float)' }}>
          <span className="material-icons" style={{ fontSize: 19 }}>check</span>{t('Guardar perfil')}
        </button>
      </div>
    </div>
  );
}

function FpCard({ icon, title, children }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 18 }}>{icon}</span></span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--fg-1)', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </Card>
  );
}

Object.assign(window, { FinancialProfileRoute });
