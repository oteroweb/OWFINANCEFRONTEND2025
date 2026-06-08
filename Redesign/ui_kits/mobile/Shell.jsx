/* ─── Mobile Shell ───────────────────────────────────────────────────────
 * Root component: owns routing, balance-visible state, action sheet state.
 * Props: mode('lite'|'pro') — passed from external Lite/Pro toggle.
 *
 * RN MAPPING:
 *   Replace with a NavigationContainer + Stack.Navigator (for AI chat push)
 *   + bottom-tabs navigator (for the 4 main routes).
 *   QuickActionSheet → render inside the tab navigator's tabBar prop,
 *   or use a global modal via RN's Modal component.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useShellMobileState } = React;

function MobileShell({ mode = 'lite' }) {
  const [route,       setRoute]       = useShellMobileState('home');
  const [sheetOpen,   setSheetOpen]   = useShellMobileState(false);
  const [smartOpen,   setSmartOpen]   = useShellMobileState(false);
  const [smartType,   setSmartType]   = useShellMobileState('expense');
  const [smartTab,    setSmartTab]    = useShellMobileState('text');
  const [balVisible,  setBal]         = useShellMobileState(true);
  const hidden = !balVisible;

  const isNavRoute = route !== 'aichat';

  const goTo = (r) => { setSheetOpen(false); setSmartOpen(false); setRoute(r); };
  const openSmart = (type = 'expense', tab = 'text') => { setSmartType(type); setSmartTab(tab); setSmartOpen(true); };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: 'var(--bg-canvas)' }}>

      {/* Status bar — always visible */}
      <MobileStatusBar />

      {/* Screen content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {route === 'home'         && mode === 'lite' && <HomeScreenLite  hidden={hidden} onToggleVisible={() => setBal(v => !v)} onGoTo={goTo} />}
        {route === 'home'         && mode === 'pro'  && <HomeScreenPro   hidden={hidden} onToggleVisible={() => setBal(v => !v)} onGoTo={goTo} />}
        {route === 'transactions' && <TransactionsScreen hidden={hidden} onBack={() => goTo('home')} />}
        {route === 'jars'         && <JarsScreen         hidden={hidden} onBack={() => goTo('home')} />}
        {route === 'config'       && <SettingsScreen                     onBack={() => goTo('home')} />}
        {route === 'aichat'       && <AIAdvisorScreen                    onBack={() => goTo('home')} />}

        {/* Quick action sheet overlays content (but stays above BottomNav) */}
        {isNavRoute && (
          <QuickActionSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onOpenAI={() => goTo('aichat')}
            onSelectAction={(id) => { const cfg = STS_ACTION_MAP[id]; if (cfg) openSmart(cfg.type, cfg.tab); }}
            mode={mode}
          />
        )}

        {/* Smart transaction sheet */}
        {isNavRoute && (
          <SmartTransactionSheet
            open={smartOpen}
            onClose={() => setSmartOpen(false)}
            initialType={smartType}
            initialTab={smartTab}
          />
        )}
      </div>

      {/* Bottom nav — hidden on AI chat (full-screen chat pattern) */}
      {isNavRoute && (
        <BottomNav
          active={route}
          onChange={goTo}
          onAction={() => setSheetOpen(o => !o)}
          actionOpen={sheetOpen}
          mode={mode}
        />
      )}
    </div>
  );
}

Object.assign(window, { MobileShell });
