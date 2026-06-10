/* ─── OW Finance Mobile — Dream Components (Sueños) ──────────────────────
 * Espejo móvil de lite-desktop/organisms/DreamsPreview.jsx.
 * Metas aspiracionales: violeta/rosa, más emocionales que los jars.
 *
 * Componentes:
 *   DreamCard         — tarjeta individual de un sueño (full-width)
 *   DreamSummaryCard  — resumen (total acumulado, meta combinada, progreso)
 *   DreamsList        — lista vertical para la pantalla completa
 *
 * RN MAPPING:
 *   DreamCard → <View> con gradiente (expo-linear-gradient).
 *   DreamsList → FlatList. Progress → Animated width.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const DREAM_TONES = {
  'dream-primary':   { accent: '#8B5CF6', tint: 'rgba(139,92,246,0.12)' },
  'dream-secondary': { accent: '#EC4899', tint: 'rgba(236,72,153,0.12)' },
};

/* ── DreamCard ──────────────────────────────────────────────────────────
 * Tarjeta full-width de un sueño. Props: dream(object) hidden(bool) */
function DreamCard({ dream, hidden = false }) {
  const tone = DREAM_TONES[dream.tone] || DREAM_TONES['dream-primary'];
  const remaining = dream.goal - dream.amount;

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)',
      padding: '16px', boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Flourish */}
      <div style={{
        position: 'absolute', top: -48, right: -48, width: 150, height: 150,
        borderRadius: '50%', background: tone.tint, pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          background: `linear-gradient(135deg, ${tone.accent}, ${tone.accent}cc)`,
          color: '#fff', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${tone.tint}`,
        }}>
          <span className="material-icons" style={{ fontSize: 22 }}>{dream.icon}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{dream.name}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{dream.subtitle}</span>
        </div>
      </div>

      {/* Amount + goal */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>
            {hidden ? '$ ••••' : `$ ${dream.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>
            de <span className="tabular" style={{ fontWeight: 600 }}>${dream.goal.toLocaleString('en-US')}</span>
          </span>
        </div>

        {/* Progress */}
        <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${dream.progress}%`,
            background: `linear-gradient(90deg, ${tone.accent} 0%, ${DREAM_TONES['dream-secondary'].accent} 100%)`,
            borderRadius: 999, transition: 'width var(--dur-slow) var(--ease-out)',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>
          <span><strong style={{ color: tone.accent }}>{dream.progress}%</strong> · ETA {dream.eta}</span>
          <span>Faltan <span className="tabular" style={{ color: 'var(--fg-1)', fontWeight: 600 }}>${remaining.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span></span>
        </div>
      </div>

      {/* Footer chips */}
      <div style={{ display: 'flex', gap: 6, position: 'relative', flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
          padding: '4px 9px', borderRadius: 'var(--radius-pill)',
          background: tone.tint, color: tone.accent,
        }}>
          <span className="material-icons" style={{ fontSize: 12 }}>autorenew</span>
          ${dream.monthly}/mes
        </span>
        {dream.contributors > 1 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
            padding: '4px 9px', borderRadius: 'var(--radius-pill)',
            background: 'var(--surface-2)', color: 'var(--fg-2)',
          }}>
            <span className="material-icons" style={{ fontSize: 12 }}>group</span>
            {dream.contributors}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── DreamSummaryCard ───────────────────────────────────────────────────
 * Resumen violeta de sueños. Tappable → navega a la pantalla Sueños.
 * Props: dreams(array) hidden(bool) onPress(fn?) compact(bool) */
function DreamSummaryCard({ dreams, hidden = false, onPress, compact = false }) {
  const totalSaved = dreams.reduce((s, d) => s + d.amount, 0);
  const totalGoal  = dreams.reduce((s, d) => s + d.goal, 0);
  const overall    = Math.round((totalSaved / totalGoal) * 100);

  return (
    <div onClick={onPress} style={{
      margin: '0 16px', cursor: onPress ? 'pointer' : 'default',
      background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
      borderRadius: 'var(--radius-xl)', padding: '18px 20px',
      boxShadow: '0 8px 24px rgba(124,58,237,0.30)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>Total acumulado · USD</span>
        {onPress && <span className="material-icons" style={{ fontSize: 20, color: 'rgba(255,255,255,0.85)' }}>chevron_right</span>}
      </div>
      <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: compact ? 32 : 38, color: '#fff', lineHeight: 1, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums' }}>
        {hidden ? '$ ••••••' : `$ ${totalSaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
          <span>{dreams.length} sueños · meta {hidden ? '••••' : `$${totalGoal.toLocaleString('en-US')}`}</span>
          <span style={{ fontWeight: 700, color: '#fff' }}>{overall}% del camino</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.22)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${overall}%`, background: '#fff', borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}

/* ── DreamsList ─────────────────────────────────────────────────────────
 * Lista vertical de sueños para la pantalla completa.
 * RN: FlatList. */
function DreamsList({ dreams, hidden = false }) {
  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {dreams.map(d => <DreamCard key={d.id} dream={d} hidden={hidden} />)}
    </div>
  );
}

Object.assign(window, { DreamCard, DreamSummaryCard, DreamsList, DREAM_TONES });
