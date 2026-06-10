/* ─── Pro Desktop Shell — 3-column layout ───────────────────────────────
 * [Sidebar 240px] [Main content flex] [Accounts+Debts panel 280px]
 * Pro primary: cyan (#0EA5E9). Sidebar + AccountsPanel always visible.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useProState } = React;

const PRO_NAV = [
  { id: 'home',         icon: 'home',            label: 'Inicio' },
  { id: 'transactions', icon: 'receipt_long',     label: 'Transacciones' },
  { id: 'analisis',     icon: 'donut_small',      label: 'Análisis' },
  { id: 'jars',         icon: 'savings',          label: 'Cántaros' },
  { id: 'dreams',       icon: 'auto_awesome',     label: 'Sueños' },
  { id: 'debts',        icon: 'credit_card',      label: 'Deudas' },
  { id: 'config',       icon: 'settings',         label: 'Configuración' },
];

function ProShell() {
  const [route,          setRouteRaw]      = useProState(window.__appRoute || 'home');
  const setRoute = (r) => { window.__appRoute = r; setRouteRaw(r); };
  const [balanceVisible, setBalanceVisible] = useProState(true);
  const [aiOpen,         setAIOpen]         = useProState(false);
  const [quickOpen,      setQuickOpen]      = useProState(false);
  const [smartOpen,      setSmartOpen]      = useProState(false);
  const [smartType,      setSmartType]      = useProState('expense');
  const [smartTab,       setSmartTab]       = useProState('text');
  const [rates,          setRates]          = useProState({ ...DEFAULT_RATES });
  const [notifOpen,      setNotifOpen]      = useProState(false);
  const [detailTx,       setDetailTx]       = useProState(null);
  const [, setDataVer]                      = useProState(0);

  React.useEffect(() => {
    window.__owOpenTxDetailDesktop = (tx) => setDetailTx(tx);
    return () => { if (window.__owOpenTxDetailDesktop) delete window.__owOpenTxDetailDesktop; };
  }, []);

  const hidden = !balanceVisible;
  const isMobile = useViewportMobile();
  const appTheme = useAppTheme();
  const openAI    = () => { setQuickOpen(false); setSmartOpen(false); setAIOpen(true); };
  const openQuick = () => { setAIOpen(false);    setSmartOpen(false); setQuickOpen(true); };
  const openSmart = (type = 'expense', tab = 'text') => { setSmartType(type); setSmartTab(tab); setQuickOpen(false); setSmartOpen(true); };

  return (
    <div data-screen-label="Pro Desktop" style={{ display: 'flex', height: '100vh', background: 'var(--bg-canvas)', overflow: 'hidden', position: 'relative' }}>

      {/* ── Left sidebar ─────────────────────────────────────────── */}
      {!isMobile && (
      <aside style={{ width: 240, flexShrink: 0, background: 'var(--surface-1)', borderRight: '1px solid var(--border-hairline)', display: 'flex', flexDirection: 'column', padding: '24px 16px', boxSizing: 'border-box' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 28px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: '#fff', letterSpacing: '-0.04em' }}>OW</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>Finance</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--info)', padding: '1px 6px', background: 'var(--info-soft)', borderRadius: 4, alignSelf: 'flex-start' }}>PRO</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', padding: '0 8px', marginBottom: 6 }}>{t('Menú')}</div>
          {PRO_NAV.map(item => {
            const active = route === item.id;
            return (
              <button key={item.id} onClick={() => setRoute(item.id)}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--fg-1)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-2)'; } }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-sm)', background: active ? 'var(--info-soft)' : 'transparent', color: active ? 'var(--info)' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active ? 600 : 500, textAlign: 'left', width: '100%', transition: 'background 150ms, color 150ms' }}>
                <span className="material-icons" style={{ fontSize: 20 }}>{item.icon}</span>
                {t(item.label)}
              </button>
            );
          })}

          <div style={{ height: 1, background: 'var(--border-hairline)', margin: '12px 0' }} />
          <button onClick={openAI}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(90deg, rgba(124,58,237,.10) 0%, rgba(14,165,233,.10) 100%)', color: '#8B5CF6', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, textAlign: 'left', width: '100%' }}>
            <span className="material-icons" style={{ fontSize: 20 }}>auto_awesome</span>
            {t('Asesor IA')}
          </button>
        </nav>

        {/* User */}
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--info)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>J</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>José Otero</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>jose@owfinance.com</div>
            </div>
            <span className="material-icons" style={{ fontSize: 16, color: 'var(--fg-3)', flexShrink: 0 }}>more_vert</span>
          </div>
        </div>
      </aside>
      )}

      {/* ── Main content ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ height: 60, flexShrink: 0, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-1)', borderBottom: '1px solid var(--border-hairline)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>
            {t(PRO_NAV.find(n => n.id === route)?.label) || t('Inicio')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={openQuick} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-pill)', background: 'var(--info)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, boxShadow: '0 4px 14px rgba(14,165,233,.30)' }}>
              <span className="material-icons" style={{ fontSize: 18 }}>add</span>{t('Agregar')}
            </button>
            <span style={{ width: 1, height: 22, background: 'var(--border-hairline)', margin: '0 2px', flexShrink: 0 }} />
            <IconButton icon={balanceVisible ? 'visibility' : 'visibility_off'} ariaLabel="Ocultar saldos" onClick={() => setBalanceVisible(v => !v)} />
            <IconButton icon={appTheme === 'dark' ? 'light_mode' : 'dark_mode'} ariaLabel={appTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'} onClick={() => window.toggleAppTheme && window.toggleAppTheme()} />
            <div style={{ position: 'relative' }}>
              <IconButton icon="notifications" ariaLabel="Notificaciones" onClick={() => setNotifOpen(o => !o)} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, background: 'var(--expense)', boxShadow: '0 0 0 2px var(--surface-1)' }} />
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 80px', boxSizing: 'border-box' }}>
          {isMobile && route === 'home' && (
            <Card style={{ marginBottom: 16, padding: 18 }}>
              <AccountsPanel hidden={hidden} rates={rates} mobile={true} />
            </Card>
          )}
          {/* App-wide month navigator — present on every route */}
          <MonthNavigator accent="var(--info)" />
          {route === 'home'         && <ProHomeRoute hidden={hidden} onQuickAdd={openQuick} onGo={setRoute} onOpenAI={openAI} />}
          {route === 'transactions' && <TransactionsRoute hidden={hidden} />}
          {route === 'analisis'     && <ProAnalisisRoute hidden={hidden} />}
          {route === 'jars'         && <JarsRoute hidden={hidden} />}
          {route === 'dreams'       && <DreamsRoute hidden={hidden} />}
          {route === 'debts'        && <DebtsRoute hidden={hidden} />}
          {route === 'config'       && <ConfigRoute rates={rates} onRatesChange={setRates} />}
        </main>
      </div>

      {/* ── Right panel: Accounts + Debts (desktop only) ─────── */}
      {!isMobile && <AccountsPanel hidden={hidden} rates={rates} />}

      {/* ── Mobile bottom tab bar ─────────────────────────────── */}
      {isMobile && (
        <MobileTabBar
          items={[
            { id: 'home',         icon: 'home',         label: 'Inicio' },
            { id: 'transactions', icon: 'receipt_long', label: 'Movs' },
            { id: 'analisis',     icon: 'donut_small',  label: 'Análisis' },
            { id: 'jars',         icon: 'savings',      label: 'Cántaros' },
            { id: 'dreams',       icon: 'auto_awesome', label: 'Sueños' },
            { id: 'debts',        icon: 'credit_card',  label: 'Deudas' },
            { id: 'config',       icon: 'settings',     label: 'Ajustes' },
          ]}
          active={route}
          onChange={setRoute}
          onQuickAdd={openQuick}
          accent="var(--info)"
        />
      )}

      {/* ── Overlays ─────────────────────────────────────────────── */}
      <DesktopQuickModal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        onOpenAI={openAI}
        onSelectAction={(id) => {
          if (id.includes(':')) { const [t, tab] = id.split(':'); openSmart(t, tab); return; }
          const cfg = STM_ACTION_MAP[id]; if (cfg) openSmart(cfg.type, cfg.tab);
        }}
        mode="pro"
      />
      <SmartTransactionModal open={smartOpen} onClose={() => setSmartOpen(false)} initialType={smartType} initialTab={smartTab} mode="pro" rates={rates} />
      <TransactionDetailModal open={!!detailTx} tx={detailTx} mode="pro" hidden={hidden} onClose={() => setDetailTx(null)} onChanged={() => setDataVer(v => v + 1)} />
      <AIAdvisorPanel open={aiOpen} onClose={() => setAIOpen(false)} />
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} accent="var(--info)" anchorRight={24} anchorTop={60} />
    </div>
  );
}

Object.assign(window, { ProShell });
