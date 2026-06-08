/* ─── Transactions Screen ────────────────────────────────────────────────
 * RN: Header → Stack.Screen header. Filters → <ScrollView horizontal>.
 *     List → <SectionList> with filter state.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useTxFilterState } = React;

const TX_FILTERS = [
  { id: 'all',     label: 'Todos' },
  { id: 'income',  label: 'Ingresos' },
  { id: 'expense', label: 'Gastos' },
  { id: 'jars',    label: 'Jars' },
];

function TransactionsScreen({ hidden, onBack }) {
  const [filter, setFilter] = useTxFilterState('all');

  const filtered = MOBILE_TX.filter(t => {
    if (filter === 'all')     return true;
    if (filter === 'income')  return t.amount > 0;
    if (filter === 'expense') return t.amount < 0 && t.category !== 'Jar';
    if (filter === 'jars')    return t.category === 'Jar';
    return true;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MobileHeader
        title="Transacciones"
        subtitle="Marzo 2026"
        onBack={onBack}
        rightActions={[{ icon: 'search', onPress: () => {} }]}
      />

      {/* Filter chips horizontal scroll */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 20px 12px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
        {TX_FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            flexShrink: 0, border: 0, cursor: 'pointer',
            padding: '8px 16px', borderRadius: 'var(--radius-pill)',
            background: filter === f.id ? 'var(--brand-primary)' : 'var(--surface-1)',
            color: filter === f.id ? '#fff' : 'var(--fg-1)',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: filter === f.id ? 600 : 500,
            boxShadow: filter === f.id ? 'none' : 'var(--shadow-card)',
          }}>{f.label}</button>
        ))}
      </div>
      <Divider />

      {/* Transaction list */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingTop: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: 40, color: 'var(--fg-3)' }}>receipt_long</span>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', marginTop: 12 }}>Sin movimientos en esta categoría.</div>
          </div>
        ) : (
          <TransactionList transactions={filtered} hidden={hidden} dense />
        )}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

Object.assign(window, { TransactionsScreen });
