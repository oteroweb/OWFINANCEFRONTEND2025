/* ─── Home Screen — Lite ─────────────────────────────────────────────────
 * Calm, money-first layout. Balance + jars + 5 recent transactions.
 * No charts, no KPI grid, generous whitespace.
 *
 * RN: This entire screen is a <ScrollView> with a <View> for the sticky header.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function HomeScreenLite({ hidden, onToggleVisible, onGoTo, onOpenAI }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', scrollbarWidth: 'none' }}>
      {/* Greeting header */}
      <div style={{ padding: '16px 0 0' }}>
        <HomeHeader
          balanceVisible={!hidden}
          onToggle={onToggleVisible}
          onNotifications={() => {}}
          mode="lite"
        />
      </div>

      {/* Hero balance */}
      <BalanceCard
        amount={12480.50}
        currency="USD"
        hidden={hidden}
        mode="lite"
        delta={{ value: 4.2, label: 'MoM' }}
      />

      {/* Spacer */}
      <div style={{ height: 24 }} />

      {/* Jars row */}
      <JarsRow
        jars={MOBILE_JARS.slice(0, 4)}
        hidden={hidden}
        onViewAll={() => onGoTo('jars')}
      />

      <div style={{ height: 24 }} />

      {/* Recent transactions */}
      <SectionTitle
        title="Recientes"
        action="Ver todo"
        onAction={() => onGoTo('transactions')}
      />
      <TransactionList transactions={MOBILE_TX} hidden={hidden} limit={4} />

      {/* Bottom padding so last item isn't behind nav */}
      <div style={{ height: 32 }} />
    </div>
  );
}

Object.assign(window, { HomeScreenLite });
