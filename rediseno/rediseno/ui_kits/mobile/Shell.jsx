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
const { useState: useShellMobileState, useEffect: useShellMobileEffect } = React;

function MobileShell({ mode: initialMode = 'lite' }) {
  const [route,       setRoute]       = useShellMobileState('home');
  const [mode,        setMode]        = useShellMobileState(initialMode);
  const [theme,       setTheme]       = useShellMobileState(() => (typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'dark') : 'dark'));
  const [sheetOpen,   setSheetOpen]   = useShellMobileState(false);
  const [smartOpen,   setSmartOpen]   = useShellMobileState(false);
  const [smartType,   setSmartType]   = useShellMobileState('expense');
  const [smartTab,    setSmartTab]    = useShellMobileState('text');
  const [formOpen,    setFormOpen]    = useShellMobileState(false);
  const [formType,    setFormType]    = useShellMobileState('expense');
  const [balVisible,  setBal]         = useShellMobileState(true);
  const [detailTx,    setDetailTx]    = useShellMobileState(null);
  const [onbOpen,     setOnbOpen]     = useShellMobileState(false);
  const [, setDataVersion]            = useShellMobileState(0);
  const hidden = !balVisible;

  const isNavRoute = route !== 'aichat';

  // Apply theme to the document so the design-system tokens switch.
  useShellMobileEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  // Register the global opener so any TransactionRow (home or ledger) can
  // surface the detail/edit sheet without prop-threading through every screen.
  useShellMobileEffect(() => {
    window.__owOpenTxDetail = (tx) => setDetailTx(tx);
    window.__owStartOnboardingMobile = () => setOnbOpen(true);
    window.__owGoToMobile = (r) => setRoute(r);
    return () => { if (window.__owOpenTxDetail) delete window.__owOpenTxDetail; if (window.__owStartOnboardingMobile) delete window.__owStartOnboardingMobile; if (window.__owGoToMobile) delete window.__owGoToMobile; };
  }, []);

  const goTo = (r) => { setSheetOpen(false); setSmartOpen(false); setFormOpen(false); setRoute(r); };
  const openSmart = (type = 'expense', tab = 'text') => { setSmartType(type); setSmartTab(tab); setSmartOpen(true); };
  const openForm = (type = 'expense') => { setSheetOpen(false); setSmartOpen(false); setFormType(type); setFormOpen(true); };

  const onTxSaved = () => { setDataVersion(v => v + 1); setDetailTx(null); };
  const onTxDeleted = (tx) => { const i = window.MOBILE_TX.indexOf(tx); if (i > -1) window.MOBILE_TX.splice(i, 1); setDataVersion(v => v + 1); setDetailTx(null); };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: 'var(--bg-canvas)' }}>

      {/* Status bar — always visible */}
      <MobileStatusBar theme={theme} />

      {/* Screen content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {route === 'home'         && mode === 'lite' && <HomeScreenLite  hidden={hidden} onToggleVisible={() => setBal(v => !v)} onGoTo={goTo} />}
        {route === 'home'         && mode === 'pro'  && <HomeScreenPro   hidden={hidden} onToggleVisible={() => setBal(v => !v)} onGoTo={goTo} />}
        {route === 'transactions' && <TransactionsScreen hidden={hidden} mode={mode} onBack={() => goTo('home')} />}
        {route === 'jars'         && <JarsScreen         hidden={hidden} onBack={() => goTo('home')} />}
        {route === 'debts'        && <DebtsScreen        hidden={hidden} onBack={() => goTo('home')} />}
        {route === 'dreams'       && <DreamsScreen       hidden={hidden} onBack={() => goTo('home')} />}
        {route === 'config'       && <SettingsScreen mode={mode} onModeChange={setMode} theme={theme} onThemeChange={setTheme} onBack={() => goTo('home')} onGoTo={goTo} onStartOnboarding={() => setOnbOpen(true)} />}
        {route === 'profile'      && <ProfileScreen onBack={() => goTo('config')} onGoFinancial={() => goTo('finprofile')} />}
        {route === 'finprofile'   && <FinancialProfileScreen onBack={() => goTo('config')} />}
        {route === 'aichat'       && <AIAdvisorScreen                    onBack={() => goTo('home')} />}

        {/* Quick action sheet overlays content (but stays above BottomNav) */}
        {isNavRoute && (
          <QuickActionSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onOpenAI={() => goTo('aichat')}
            onSelectAction={(id) => {
              // Pro: el alta de gasto/ingreso/transferencia usa el formulario
              // tabular (pago compuesto · monto compuesto · comisión).
              if (mode === 'pro' && (id === 'expense' || id === 'income' || id === 'transfer')) { openForm(id); return; }
              const cfg = STS_ACTION_MAP[id]; if (cfg) openSmart(cfg.type, cfg.tab);
            }}
            onNavigate={(r) => goTo(r)}
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

        {/* Structured tabular form (Pro): pago compuesto + monto compuesto + comisión */}
        {isNavRoute && (
          <TransactionFormSheet
            open={formOpen}
            mode={mode}
            initialType={formType}
            onClose={() => setFormOpen(false)}
            onSubmit={() => setDataVersion(v => v + 1)}
          />
        )}

        {/* Transaction detail / edit sheet — opened by tapping any row */}
        <TransactionDetailSheet
          open={!!detailTx}
          tx={detailTx}
          mode={mode}
          hidden={hidden}
          onClose={() => setDetailTx(null)}
          onSave={onTxSaved}
          onDelete={onTxDeleted}
        />
        {/* Onboarding post-creación de cuenta — overlay full-screen del teléfono */}
        <OnboardingMobile open={onbOpen} onClose={() => setOnbOpen(false)} onFinish={() => { setOnbOpen(false); goTo('home'); }} />
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
