/* global React */

function HeroBalance({ amount, currency, hidden, onQuickAdd, asOf, delta }) {
  return (
    <Card hero>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Eyebrow>{t('Disponible')} · {currency}</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <Money value={amount} className="t-hero-amount" hidden={hidden} />
            {delta && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                color: delta.value >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)',
                background: delta.value >= 0 ? 'var(--income-soft)' : 'var(--expense-soft)',
                padding: '4px 10px', borderRadius: 'var(--radius-pill)',
              }}>
                <span className="material-icons" style={{ fontSize: 14 }}>{delta.value >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                {delta.value >= 0 ? '+' : ''}{delta.value.toFixed(1)}% {t(delta.label)}
              </span>
            )}
          </div>
          <div className="t-body-sm">{t('Al')} {t(asOf)}</div>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <PillButton variant="primary" icon="add" onClick={onQuickAdd}>{t('Agregar')}</PillButton>
        </div>
      </div>

      <div style={{
        marginTop: 28, paddingTop: 20,
        borderTop: '1px solid var(--border-hairline)',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
      }}>
        <KPI label={t('Ingresos · este mes')} value={4820.00} tone="income" hidden={hidden} />
        <KPI label={t('Gastos · este mes')}  value={-2360.50} tone="expense" hidden={hidden} />
        <KPI label={t('Neto · este mes')}    value={2459.50} tone="default" hidden={hidden} />
      </div>
    </Card>
  );
}

function KPI({ label, value, tone, hidden }) {
  const color = tone === 'income' ? 'var(--income-fg)' : tone === 'expense' ? 'var(--expense-fg)' : 'var(--fg-1)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Eyebrow>{label}</Eyebrow>
      <Money value={value} className="t-amount-lg" hidden={hidden} sign={tone !== 'default'} color={color} />
    </div>
  );
}

Object.assign(window, { HeroBalance });
