/* global React */

function HomeRoute({ hidden, onQuickAdd, onGo }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <HeroBalance
        amount={12480.50}
        currency="USD"
        hidden={hidden}
        onQuickAdd={onQuickAdd}
        asOf="hoy, 2:42 PM"
        delta={{ value: 4.2, label: 'vs. mes ant.' }}
      />
      <JarsPreview jars={SAMPLE_JARS} hidden={hidden} onViewAll={() => onGo('jars')} />
      <DreamsPreview dreams={SAMPLE_DREAMS} hidden={hidden} onViewAll={() => onGo('dreams')} />
      <DebtsPreview debts={SAMPLE_DEBTS} hidden={hidden} onViewAll={() => onGo('debts')} />
      <RecentTransactions
        transactions={SAMPLE_TX.slice(0, 5)}
        hidden={hidden}
        onViewAll={() => onGo('transactions')}
      />
    </div>
  );
}

Object.assign(window, { HomeRoute });
