/* global React */
/* ─── Dreams (Sueños) ─────────────────────────────────────────────────
 * Long-term aspirational goals: house, masters, sabbatical.
 * More emotional + visual than jars. Violet/purple palette.
 * ──────────────────────────────────────────────────────────────────── */

const DREAM_TONES = {
  'dream-primary':   { accent: '#8B5CF6', tint: 'rgba(139,92,246,0.10)', soft: 'rgba(139,92,246,0.18)' },
  'dream-secondary': { accent: '#EC4899', tint: 'rgba(236,72,153,0.10)', soft: 'rgba(236,72,153,0.18)' },
};

function DreamTile({ dream, hidden, compact = false }) {
  const t = DREAM_TONES[dream.tone] || DREAM_TONES['dream-primary'];
  const remaining = dream.goal - dream.amount;

  return (
    <Card padding={compact ? 18 : 22} style={{ display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      {/* Background flourish */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 160, height: 160,
        borderRadius: '50%', background: t.tint, pointerEvents: 'none', filter: 'blur(2px)',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          background: `linear-gradient(135deg, ${t.accent}, ${t.accent}cc)`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', flexShrink: 0,
          boxShadow: `0 4px 16px ${t.tint}`,
        }}>
          <span className="material-icons" style={{ fontSize: 22 }}>{dream.icon}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{window.t(dream.name)}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{window.t(dream.subtitle)}</span>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <Money value={dream.amount} className="t-amount-lg" hidden={hidden} />
          <span className="t-body-sm" style={{ color: 'var(--fg-2)' }}>
            {window.t('de')} <span className="tabular" style={{ fontWeight: 600 }}>${dream.goal.toLocaleString('en-US')}</span>
          </span>
        </div>

        {/* Progress bar with marker */}
        <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            height: '100%', width: `${dream.progress}%`,
            background: `linear-gradient(90deg, ${t.accent} 0%, ${DREAM_TONES['dream-secondary'].accent} 100%)`,
            borderRadius: 999,
            transition: 'width var(--dur-slow) var(--ease-out)',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>
          <span><strong style={{ color: t.accent }}>{dream.progress}%</strong> · ETA {dream.eta}</span>
          <span>{window.t('Faltan')} <span className="tabular" style={{ color: 'var(--fg-1)', fontWeight: 600 }}>${remaining.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span></span>
        </div>
      </div>

      {/* Footer chips */}
      <div style={{ display: 'flex', gap: 6, position: 'relative', flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
          padding: '4px 9px', borderRadius: 'var(--radius-pill)',
          background: t.tint, color: t.accent,
        }}>
          <span className="material-icons" style={{ fontSize: 12 }}>autorenew</span>
          ${dream.monthly}{window.t('/mes')}
        </span>
        {dream.contributors > 1 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
            padding: '4px 9px', borderRadius: 'var(--radius-pill)',
            background: 'var(--surface-2)', color: 'var(--fg-2)',
            border: '1px solid var(--border-hairline)',
          }}>
            <span className="material-icons" style={{ fontSize: 12 }}>group</span>
            {dream.contributors}
          </span>
        )}
      </div>
    </Card>
  );
}

function DreamsPreview({ dreams, hidden, onViewAll }) {
  const isMobile = useViewportMobile();
  const totalSaved = dreams.reduce((s, d) => s + d.amount, 0);
  const totalGoal  = dreams.reduce((s, d) => s + d.goal,   0);
  const overallProgress = Math.round((totalSaved / totalGoal) * 100);

  return (
    <div>
      <SectionHeader
        title={t('Sueños')}
        action={<PillButton variant="ghost" size="sm" onClick={onViewAll}>{t('Ver todos')}</PillButton>}
      />

      <Card padding={20} style={{ marginBottom: 14, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(236,72,153,0.05) 100%)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="t-eyebrow">{t('Total ahorrado en sueños')}</span>
          <Money value={totalSaved} className="t-amount-xl" hidden={hidden} color="#8B5CF6" />
        </div>
        <div style={{ width: 1, height: 36, background: 'var(--border-hairline)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="t-eyebrow">{t('Meta combinada')}</span>
          <span className="t-amount-lg tabular" style={{ color: 'var(--fg-1)' }}>
            {hidden ? '••••••' : `$ ${totalGoal.toLocaleString('en-US')}`}
          </span>
        </div>
        <div style={{ width: 1, height: 36, background: 'var(--border-hairline)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
          <span className="t-eyebrow">{t('Progreso global')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="t-amount-lg" style={{ color: '#8B5CF6' }}>{overallProgress}%</span>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${overallProgress}%`, background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)', borderRadius: 999 }} />
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <PillButton variant="secondary" size="sm" icon="favorite">{t('Aportar')}</PillButton>
          <PillButton variant="primary" size="sm" icon="add">{t('Nuevo sueño')}</PillButton>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 14 }}>
        {dreams.slice(0, 2).map(d => <DreamTile key={d.id} dream={d} hidden={hidden} />)}
      </div>
    </div>
  );
}

function DreamsFullGrid({ dreams, hidden }) {
  const isMobile = useViewportMobile();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
      {dreams.map(d => <DreamTile key={d.id} dream={d} hidden={hidden} />)}
    </div>
  );
}

Object.assign(window, { DreamTile, DreamsPreview, DreamsFullGrid, DREAM_TONES });
