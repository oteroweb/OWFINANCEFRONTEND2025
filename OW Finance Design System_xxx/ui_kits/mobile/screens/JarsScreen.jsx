/* ─── Jars Screen ────────────────────────────────────────────────────────
 * RN: Header → Stack header. Summary → custom View card.
 *     Grid → FlatList numColumns={2}.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function JarsScreen({ hidden, onBack }) {
  const total = MOBILE_JARS.reduce((s, j) => s + j.amount, 0);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MobileHeader
        title="Jars"
        subtitle="Dinero apartado"
        onBack={onBack}
        rightActions={[{ icon: 'add', onPress: () => {} }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
        {/* Summary card */}
        <div style={{
          margin: '8px 16px 16px',
          background: 'var(--brand-primary)',
          borderRadius: 'var(--radius-xl)', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>Total en jars · USD</span>
          <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 38, color: '#fff', lineHeight: 1, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums' }}>
            {hidden ? '$ ••••••' : `$ ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </span>
          <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jars activos</span>
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 18, fontWeight: 700, color: '#fff' }}>{MOBILE_JARS.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Necesita atención</span>
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 18, fontWeight: 700, color: '#FCD34D' }}>1</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <JarGrid jars={MOBILE_JARS} hidden={hidden} />
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

Object.assign(window, { JarsScreen });
