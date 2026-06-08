/* global React */

function TxRow({ tx, hidden, dense = false }) {
  const isIncome = tx.amount > 0;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: dense ? 'auto 1fr auto auto' : 'auto 1fr auto',
      gap: 14, alignItems: 'center',
      padding: dense ? '10px 20px' : '14px 20px',
      borderTop: '1px solid var(--border-hairline)',
    }}>
      <div style={{
        width: dense ? 32 : 38, height: dense ? 32 : 38,
        borderRadius: 'var(--radius-pill)',
        background: isIncome ? 'var(--income-soft)' : 'var(--expense-soft)',
        color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-icons" style={{ fontSize: dense ? 18 : 20 }}>
          {isIncome ? 'arrow_downward' : 'arrow_outward'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(tx.label)}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t(tx.meta)}</span>
      </div>
      {dense && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {tx.jar ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
              padding: '4px 10px 4px 8px', borderRadius: 'var(--radius-pill)',
              background: 'color-mix(in srgb, ' + tx.jarColor + ' 12%, var(--surface-1))',
              color: 'color-mix(in srgb, ' + tx.jarColor + ' 72%, var(--fg-1))',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: tx.jarColor, flexShrink: 0 }}></span>
              {t(tx.jar)}
            </span>
          ) : (
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
              padding: '4px 10px', borderRadius: 'var(--radius-pill)',
              background: 'var(--income-soft)', color: 'var(--income-fg)',
            }}>{t('Sin cántaro')}</span>
          )}
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
            padding: '4px 10px', borderRadius: 'var(--radius-pill)',
            background: 'var(--surface-2)', color: 'var(--fg-2)',
          }}>{t(tx.category)}</span>
        </div>
      )}
      <Money
        value={tx.amount}
        className="t-amount-sm"
        sign
        hidden={hidden}
        color={isIncome ? 'var(--income-fg)' : 'var(--expense-fg)'}
      />
    </div>
  );
}

function RecentTransactions({ transactions, hidden, onViewAll, title = 'Recent transactions' }) {
  return (
    <div>
      <SectionHeader
        title={title}
        action={onViewAll && <PillButton variant="ghost" size="sm" onClick={onViewAll}>{t('Ver todas')}</PillButton>}
      />
      <Card padding={0}>
        <div style={{ padding: '6px 0' }}>
          {transactions.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <div className="t-body" style={{ color: 'var(--fg-2)' }}>{t('Sin transacciones todavía.')}</div>
            </div>
          ) : (
            transactions.map((tx, i) => (
              <div key={i} style={{ borderTop: i === 0 ? 'none' : undefined }}>
                <TxRow tx={tx} hidden={hidden} />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function TransactionsLedger({ transactions, hidden }) {
  // dense variant with category column, grouped by day header
  const grouped = transactions.reduce((acc, tx) => {
    (acc[tx.day] = acc[tx.day] || []).push(tx);
    return acc;
  }, {});
  const days = Object.keys(grouped);
  return (
    <Card padding={0}>
      {days.map((d, i) => (
        <div key={d}>
          <div style={{
            padding: '14px 20px 8px',
            borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
          }}>
            <Eyebrow>{t(d)}</Eyebrow>
          </div>
          {grouped[d].map((tx, j) => <TxRow key={j} tx={tx} hidden={hidden} dense />)}
        </div>
      ))}
    </Card>
  );
}

Object.assign(window, { RecentTransactions, TransactionsLedger, TxRow });
