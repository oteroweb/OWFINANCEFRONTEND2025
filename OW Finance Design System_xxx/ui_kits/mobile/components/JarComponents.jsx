/* ─── OW Finance Mobile — Jar Components ────────────────────────────────
 * RN: JarCard → <View> card. JarsRow → <ScrollView horizontal>
 *     Progress bar → <View> with width animated via Animated.Value
 *     or react-native-reanimated withTiming.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const JAR_TONES = {
  brand:  { bg: 'var(--brand-primary-soft)',  icon: 'var(--brand-primary-fg-soft)', bar: 'var(--brand-primary)' },
  income: { bg: 'var(--income-soft)',          icon: 'var(--income-fg)',              bar: 'var(--income)' },
  warn:   { bg: 'var(--warning-soft)',         icon: 'var(--warning-fg)',             bar: 'var(--warning)' },
};

/* ── JarCard ────────────────────────────────────────────────────────────
 * Single jar tile — used in horizontal scroll on Home,
 * and in a 2-col grid on the Jars screen.
 * Props: jar(object) hidden(bool) compact(bool) */
function JarCard({ jar, hidden = false, compact = false }) {
  const tone = JAR_TONES[jar.tone] || JAR_TONES.brand;
  const w = compact ? 140 : 160;

  return (
    <div style={{
      width: w, flexShrink: 0,
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      padding: compact ? '14px 14px' : '16px 16px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Icon + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: tone.bg, color: tone.icon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-icons" style={{ fontSize: 16 }}>savings</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{jar.name}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-2)' }}>{jar.sub}</span>
        </div>
      </div>

      {/* Amount */}
      <span style={{
        fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 18,
        color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums',
      }}>
        {hidden ? '$ ••••' : `$ ${jar.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
      </span>

      {/* Progress bar */}
      <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${jar.progress}%`, background: tone.bar, borderRadius: 2 }} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-2)' }}>
        <span>{jar.progress}%</span>
        <span>{jar.progress >= 100 ? 'Completo' : `de $${(jar.goal / 1000).toFixed(1)}k`}</span>
      </div>
    </div>
  );
}

/* ── JarsRow ────────────────────────────────────────────────────────────
 * Horizontal scroll row of JarCards.
 * RN: <ScrollView horizontal showsHorizontalScrollIndicator={false}> */
function JarsRow({ jars, hidden = false, onViewAll }) {
  return (
    <div>
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--fg-1)' }}>Jars</span>
        <button onClick={onViewAll} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--brand-primary)', fontWeight: 500 }}>
          Ver todos
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 4px', scrollbarWidth: 'none' }}>
        {jars.map(jar => <JarCard key={jar.id} jar={jar} hidden={hidden} />)}
      </div>
    </div>
  );
}

/* ── JarGrid ────────────────────────────────────────────────────────────
 * 2-column grid for the full Jars screen.
 * RN: <FlatList numColumns={2}> */
function JarGrid({ jars, hidden = false }) {
  return (
    <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {jars.map(jar => (
        <div key={jar.id} style={{
          background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)',
          padding: '16px', boxShadow: 'var(--shadow-card)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 15,
              background: JAR_TONES[jar.tone]?.bg || 'var(--surface-2)',
              color: JAR_TONES[jar.tone]?.icon || 'var(--fg-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-icons" style={{ fontSize: 15 }}>savings</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--fg-1)' }}>{jar.name}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>
            {hidden ? '$ ••••' : `$ ${jar.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </span>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${jar.progress}%`, background: JAR_TONES[jar.tone]?.bar || 'var(--brand-primary)', borderRadius: 2 }} />
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-2)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{jar.progress}% completado</span>
            {jar.tone === 'warn' && <MobileChip variant="warning" size="sm">Mover</MobileChip>}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { JarCard, JarsRow, JarGrid });
