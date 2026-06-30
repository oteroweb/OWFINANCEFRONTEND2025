/* ─── OW Finance Mobile — Balance Card & KPI Strip ──────────────────────
 * RN: Use <View> + <Text>. Animate amount changes with LayoutAnimation
 *     or react-native-reanimated FadeInDown for the masked state.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* ── BalanceCard ────────────────────────────────────────────────────────
 * The hero card shown at the top of the Home screen.
 * Lite: shows only the total balance + currency chip.
 * Pro: shows total + income/expense/net row below. */
function BalanceCard({ amount = 12480.50, currency = 'USD', hidden = false, mode = 'lite', delta }) {
  return (
    <div style={{
      margin: '0 16px',
      background: 'var(--brand-primary)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px 22px 20px',
      boxShadow: '0 8px 28px rgba(30,58,138,0.35)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.65)',
        }}>Disponible · {currency}</span>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
          padding: '4px 10px', borderRadius: 'var(--radius-pill)',
          background: 'rgba(255,255,255,0.15)', color: '#fff',
        }}>{currency}</span>
      </div>

      {/* Big amount */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{
          fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 44, lineHeight: 1,
          letterSpacing: -1, color: '#fff', fontVariantNumeric: 'tabular-nums',
        }}>
          {hidden ? '$ ••••••' : `$ ${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        </span>
      </div>

      {/* Delta badge */}
      {delta && !hidden && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
          background: delta.value >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
          color: delta.value >= 0 ? '#6EE7B7' : '#FCA5A5',
          padding: '4px 10px', borderRadius: 'var(--radius-pill)',
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
        }}>
          <span className="material-icons" style={{ fontSize: 14 }}>
            {delta.value >= 0 ? 'arrow_upward' : 'arrow_downward'}
          </span>
          {delta.value >= 0 ? '+' : ''}{delta.value.toFixed(1)}% {delta.label}
        </div>
      )}

      {/* Pro only: KPI strip */}
      {mode === 'pro' && (
        <div style={{
          marginTop: 4,
          paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.12)',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0,
        }}>
          <CardKPI label="Ingresos" value={4820} color="#6EE7B7" hidden={hidden} />
          <CardKPI label="Gastos"   value={-2360.50} color="#FCA5A5" hidden={hidden} />
          <CardKPI label="Neto"     value={2459.50}  color="#fff"   hidden={hidden} />
        </div>
      )}
    </div>
  );
}

function CardKPI({ label, value, color, hidden }) {
  const isNeg = value < 0;
  const fmt = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-money)', fontSize: 15, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
        {hidden ? '••••' : `${isNeg ? '−' : '+'}$${fmt}`}
      </span>
    </div>
  );
}

/* ── QuickStatRow ───────────────────────────────────────────────────────
 * Horizontal row of 3 stats. Used in Pro home below the balance card. */
function QuickStatRow({ hidden }) {
  const stats = [
    { label: 'Tasa ahorro', value: '42%',   icon: 'trending_up',  color: 'var(--income-fg)' },
    { label: 'Jars activos', value: '6',     icon: 'savings',       color: 'var(--brand-primary-fg-soft)' },
    { label: 'Próx. pago',   value: '10 jun',icon: 'event',         color: 'var(--warning-fg)' },
  ];
  return (
    <div style={{
      margin: '12px 16px 0',
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: 'var(--surface-1)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <span className="material-icons" style={{ fontSize: 18, color: s.color }}>{s.icon}</span>
          <span style={{ fontFamily: 'var(--font-money)', fontSize: 16, fontWeight: 700, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>
            {hidden && s.label === 'Tasa ahorro' ? '••%' : s.value}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { BalanceCard, QuickStatRow });
