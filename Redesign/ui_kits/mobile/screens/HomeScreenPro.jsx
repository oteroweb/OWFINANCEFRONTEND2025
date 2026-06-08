/* ─── Home Screen — Pro ──────────────────────────────────────────────────
 * Denser layout: balance with KPI strip + quick stats + more transactions.
 * Pro uses cyan as the primary accent on the balance card.
 *
 * RN: Same ScrollView structure, but use a SectionList to support
 *     sticky "quick stats" subheader.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function HomeScreenPro({ hidden, onToggleVisible, onGoTo }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', scrollbarWidth: 'none' }}>
      {/* Header */}
      <div style={{ padding: '16px 0 0' }}>
        <HomeHeader
          balanceVisible={!hidden}
          onToggle={onToggleVisible}
          onNotifications={() => {}}
          mode="pro"
        />
      </div>

      {/* Balance card — Pro variant (cyan background) */}
      <div style={{
        margin: '0 16px',
        background: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)',
        borderRadius: 'var(--radius-xl)', padding: '24px 22px 20px',
        boxShadow: '0 8px 28px rgba(14,165,233,0.35)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>Disponible · USD</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>PRO</span>
        </div>
        <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 44, lineHeight: 1, letterSpacing: -1, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
          {hidden ? '$ ••••••' : '$ 12,480.50'}
        </span>
        <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
          {[['Ingresos', '+$4,820', '#6EE7B7'], ['Gastos', '−$2,361', '#FCA5A5'], ['Neto', '+$2,459', '#fff']].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</span>
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 15, fontWeight: 600, color: c, fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats strip */}
      <QuickStatRow hidden={hidden} />

      <div style={{ height: 22 }} />

      {/* Spending by category — Pro-only mini chart (placeholder) */}
      <SectionTitle title="Gastos por categoría" action="Ver análisis" onAction={() => {}} />
      <div style={{
        margin: '0 16px 22px',
        background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)',
        padding: '18px', boxShadow: 'var(--shadow-card)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {[['Vivienda', 61, '#0EA5E9'], ['Supermercado', 23, '#10B981'], ['Transporte', 9, '#F59E0B'], ['Suscripciones', 7, '#8B5CF6']].map(([cat, pct, color]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-1)', width: 100, flexShrink: 0 }}>{cat}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', width: 28, textAlign: 'right' }}>{pct}%</span>
          </div>
        ))}
      </div>

      {/* Jars */}
      <JarsRow jars={MOBILE_JARS.slice(0, 4)} hidden={hidden} onViewAll={() => onGoTo('jars')} />
      <div style={{ height: 22 }} />

      {/* Transactions — denser in Pro */}
      <SectionTitle title="Movimientos" action="Ver todo" onAction={() => onGoTo('transactions')} />
      <TransactionList transactions={MOBILE_TX} hidden={hidden} dense limit={5} />
      <div style={{ height: 32 }} />
    </div>
  );
}

Object.assign(window, { HomeScreenPro });
