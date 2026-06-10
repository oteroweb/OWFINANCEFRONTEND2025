/* global React */
const { useState: useShellState } = React;

const USER = { initial: 'J', name: 'José', greeting: 'Buenas tardes,' };

function LiteShell() {
  const [route,         setRouteRaw]      = useShellState(window.__appRoute || 'home');
  const setRoute = (r) => { window.__appRoute = r; setRouteRaw(r); };
  const [menuOpen,      setMenuOpen]      = useShellState(false);
  const [notifOpen,     setNotifOpen]     = useShellState(false);
  const [quickOpen,     setQuickOpen]     = useShellState(false);
  const [aiOpen,        setAIOpen]        = useShellState(false);
  const [balanceVisible,setBalanceVisible] = useShellState(true);
  const [currency]                        = useShellState('USD');
  const hidden = !balanceVisible;

  const [smartOpen, setSmartOpen] = useShellState(false);
  const [smartType, setSmartType] = useShellState('expense');
  const [smartTab,  setSmartTab]  = useShellState('text');
  const [detailTx,  setDetailTx]  = useShellState(null);
  const [, setDataVer]            = useShellState(0);

  // Register the global opener used by every transaction row.
  React.useEffect(() => {
    window.__owOpenTxDetailDesktop = (tx) => setDetailTx(tx);
    return () => { if (window.__owOpenTxDetailDesktop) delete window.__owOpenTxDetailDesktop; };
  }, []);

  const openAI    = () => { setQuickOpen(false); setSmartOpen(false); setAIOpen(true); };
  const openQuick = () => { setAIOpen(false);    setSmartOpen(false); setQuickOpen(true); };
  const openSmart = (type = 'expense', tab = 'text') => { setSmartType(type); setSmartTab(tab); setQuickOpen(false); setSmartOpen(true); };

  return (
    <div data-screen-label={`Lite Desktop · ${route}`} style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--fg-1)', position: 'relative', paddingBottom: 140 }}>

      {/* Header + expanded menu */}
      <div style={{ position: 'relative' }}>
        <LiteHeader
          user={USER} currency={currency}
          balanceVisible={balanceVisible}
          onToggleVisibility={() => setBalanceVisible(v => !v)}
          onOpenMenu={() => { setNotifOpen(false); setMenuOpen(o => !o); }}
          onAvatarClick={() => { setNotifOpen(false); setMenuOpen(o => !o); }}
          onOpenNotifications={() => { setMenuOpen(false); setNotifOpen(o => !o); }}
        />
        <ExpandedMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>

      {/* Page content */}
      <main style={{ maxWidth: 'var(--container-max)', margin: '0 auto', width: '100%', padding: '12px 32px 32px', boxSizing: 'border-box' }}>
        {/* App-wide month navigator — present on every route */}
        <MonthNavigator accent="var(--brand-primary)" />
        {route === 'home'         && <HomeRoute hidden={hidden} onQuickAdd={openQuick} onGo={setRoute} />}
        {route === 'transactions' && <TransactionsRoute hidden={hidden} />}
        {route === 'analisis'     && <AnalisisRoute hidden={hidden} />}
        {route === 'jars'         && <JarsRoute hidden={hidden} />}
        {route === 'dreams'       && <DreamsRoute hidden={hidden} />}
        {route === 'debts'        && <DebtsRoute hidden={hidden} />}
        {route === 'config'       && <ConfigRoute />}
      </main>

      {/* Floating nav pill — Lite signature */}
      <LiteNavPill active={route} onChange={setRoute} onQuickAdd={openQuick} />

      {/* Desktop Quick Action Modal */}
      <DesktopQuickModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        onOpenAI={openAI}
        onSelectAction={(id) => {
          if (id.includes(':')) { const [t, tab] = id.split(':'); openSmart(t, tab); return; }
          const cfg = STM_ACTION_MAP[id]; if (cfg) openSmart(cfg.type, cfg.tab);
        }}
        mode="lite"
      />
      {/* Smart Transaction Modal */}
      <SmartTransactionModal open={smartOpen} onClose={() => setSmartOpen(false)} initialType={smartType} initialTab={smartTab} mode="lite" />
      {/* Transaction detail / edit modal — opened by clicking any row */}
      <TransactionDetailModal open={!!detailTx} tx={detailTx} mode="lite" hidden={hidden} onClose={() => setDetailTx(null)} onChanged={() => setDataVer(v => v + 1)} />
      {/* AI Advisor slide-in panel */}
      <AIAdvisorPanel open={aiOpen} onClose={() => setAIOpen(false)} />
      {/* Notifications (popover desktop · sheet mobile) */}
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} accent="var(--brand-primary)" anchorRight={32} />
    </div>
  );
}

Object.assign(window, { LiteShell });
