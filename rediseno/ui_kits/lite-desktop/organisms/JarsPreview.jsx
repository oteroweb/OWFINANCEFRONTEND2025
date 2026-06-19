/* global React */

function JarTile({ jar, hidden, compact = false }) {
  const toneVar = jar.tone === 'warn' ? 'var(--warning)' : jar.tone === 'income' ? 'var(--income)' : 'var(--brand-primary)';
  const softVar = jar.tone === 'warn' ? 'var(--warning-soft)' : jar.tone === 'income' ? 'var(--income-soft)' : 'var(--brand-primary-soft)';
  const fgVar   = jar.tone === 'warn' ? 'var(--warning-fg)' : jar.tone === 'income' ? 'var(--income-fg)' : 'var(--brand-primary-fg-soft)';

  return (
    <Card padding={compact ? 18 : 22} style={{ display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 'var(--radius-pill)',
          background: softVar, color: fgVar,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-icons" style={{ fontSize: 18 }}>savings</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)' }}>{t(jar.name)}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t(jar.subtitle)}</span>
        </div>
      </div>

      <Money value={jar.amount} className="t-amount-lg" hidden={hidden} />

      <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${jar.progress}%`, background: toneVar, borderRadius: 999, transition: 'width var(--dur-slow) var(--ease-out)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>
        <span>{jar.progress}% {t('de')} <span className="tabular">{jar.goalText}</span></span>
        <span>{t(jar.statusText)}</span>
      </div>
    </Card>
  );
}

function JarsPreview({ jars, hidden, onViewAll }) {
  const isMobile = useViewportMobile();
  return (
    <div>
      <SectionHeader
        title={t('Cántaros')}
        action={<PillButton variant="ghost" size="sm" onClick={onViewAll}>{t('Ver todos')}</PillButton>}
      />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
        {jars.slice(0, 3).map((j, i) => <JarTile key={i} jar={j} hidden={hidden} />)}
      </div>
    </div>
  );
}

function JarsFullGrid({ jars, hidden }) {
  const isMobile = useViewportMobile();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
      {jars.map((j, i) => <JarTile key={i} jar={j} hidden={hidden} />)}
    </div>
  );
}

Object.assign(window, { JarsPreview, JarsFullGrid, JarTile });
