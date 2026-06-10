/* ─── OW Finance Mobile — Transaction Components ─────────────────────────
 * RN: TransactionRow → custom ListItem inside <FlatList>
 *     DayHeader → FlatList's renderSectionHeader (use SectionList)
 *     Use react-native-swipeable for swipe actions on rows.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* ── TransactionRow ─────────────────────────────────────────────────────
 * Single transaction list item.
 * Props: tx(object) hidden(bool) dense(bool) */
function TransactionRow({ tx, hidden = false, dense = false }) {
  const isIncome = tx.amount > 0;
  const amt = Math.abs(tx.amount);
  const fmt = amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const open = () => { if (window.__owOpenTxDetail) window.__owOpenTxDetail(tx); };

  return (
    <div
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      style={{
      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
      background: 'transparent', transition: 'background 140ms',
      padding: dense ? '10px 20px' : '13px 20px',
    }}>
      {/* Icon circle */}
      <div style={{
        width: dense ? 34 : 40, height: dense ? 34 : 40, borderRadius: dense ? 17 : 20, flexShrink: 0,
        background: isIncome ? 'var(--income-soft)' : 'var(--expense-soft)',
        color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-icons" style={{ fontSize: dense ? 16 : 18 }}>
          {isIncome ? 'arrow_downward' : 'arrow_outward'}
        </span>
      </div>

      {/* Label + meta */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: dense ? 13 : 14,
          color: 'var(--fg-1)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{tx.label}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>
          {tx.time ? `${tx.day} · ${tx.time}` : tx.day}
        </span>
      </div>

      {/* Category chip (dense mode) */}
      {dense && (
        <MobileChip variant={isIncome ? 'income' : 'default'} size="sm">{tx.category}</MobileChip>
      )}

      {/* Amount */}
      <span style={{
        fontFamily: 'var(--font-money)', fontWeight: 600, fontSize: 14,
        fontVariantNumeric: 'tabular-nums',
        color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)',
        flexShrink: 0,
      }}>
        {hidden ? '••••' : `${isIncome ? '+' : '−'} $ ${fmt}`}
      </span>
    </div>
  );
}

/* ── DayHeader ──────────────────────────────────────────────────────────
 * Section header for a grouped transactions list.
 * RN: renderSectionHeader in SectionList */
function DayHeader({ label }) {
  return (
    <div style={{
      padding: '10px 20px 6px',
      fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      color: 'var(--fg-2)',
      background: 'var(--bg-canvas)',
    }}>{label}</div>
  );
}

/* ── TransactionList ────────────────────────────────────────────────────
 * Grouped list by day. Renders DayHeader + TransactionRows.
 * Props: transactions(array) hidden(bool) dense(bool) limit(number|null) */
function TransactionList({ transactions, hidden = false, dense = false, limit }) {
  const items = limit ? transactions.slice(0, limit) : transactions;
  // Group by day
  const groups = items.reduce((acc, tx) => {
    if (!acc[tx.day]) acc[tx.day] = [];
    acc[tx.day].push(tx);
    return acc;
  }, {});

  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', margin: '0 16px' }}>
      {Object.entries(groups).map(([day, txs], gi) => (
        <div key={day}>
          {gi > 0 && <div style={{ height: 1, background: 'var(--border-hairline)', margin: '0 20px' }} />}
          <DayHeader label={day} />
          {txs.map((tx, i) => (
            <div key={tx.id}>
              {i > 0 && <div style={{ height: 1, background: 'var(--border-hairline)', margin: '0 20px' }} />}
              <TransactionRow tx={tx} hidden={hidden} dense={dense} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── SectionTitle ───────────────────────────────────────────────────────
 * Section header with optional CTA link. */
function SectionTitle({ title, action, onAction, style = {} }) {
  return (
    <div style={{
      padding: '0 20px', marginBottom: 10,
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      ...style,
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--fg-1)' }}>{title}</span>
      {action && (
        <button onClick={onAction} style={{
          border: 0, background: 'transparent', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
          color: 'var(--brand-primary)',
        }}>{action}</button>
      )}
    </div>
  );
}

Object.assign(window, { TransactionRow, DayHeader, TransactionList, SectionTitle });
