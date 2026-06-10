/* ─── Transactions Screen (mode-aware) ───────────────────────────────────
 * Brings the desktop transaction experience to mobile:
 *   • MonthBar          — date-interval navigation (both modes)
 *   • Quick type chips  — Todos / Ingresos / Gastos / Jars (fast filter)
 *   • SmartFilter sheet — category · day · amount (both modes)
 *   • AccountFilter     — smart grouped multi-select        [PRO only]
 *   • ExchangeRates     — editable USD-base rates           [PRO only]
 *   • Active-filter chips + results/net context line
 *
 * LITE = calm, single implicit wallet (no account/rate widgets).
 * PRO  = multi-account, multi-currency, exchange-aware.
 *
 * RN: Stack.Screen · SectionList · sheets via @gorhom/bottom-sheet.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useTxScreenState } = React;

function TransactionsScreen({ hidden, onBack, mode = 'lite' }) {
  const isPro  = mode === 'pro';
  const accent = isPro ? 'var(--info)' : 'var(--brand-primary)';

  const [month,  setMonth]  = useTxScreenState({ ...MNM_TODAY });
  const [accts,  setAccts]  = useTxScreenState([]);                  // Pro
  const [rates,  setRates]  = useTxScreenState({ ...MOBILE_RATES }); // Pro
  const [filter, setFilter] = useTxScreenState({ type: 'all', cat: 'all', day: 'all', min: '', max: '' });
  const [query,  setQuery]  = useTxScreenState('');
  const [search, setSearch] = useTxScreenState(false);

  /* tx in the selected month (Pro also respects the account selection scope) */
  const monthTx = MOBILE_TX.filter(t => t.m === month.m && t.y === month.y);
  const categories = [...new Set(monthTx.map(t => t.category))];
  const days = [...new Set(monthTx.map(t => t.day))];

  const passType = (t) => {
    if (filter.type === 'income')  return t.amount > 0;
    if (filter.type === 'expense') return t.amount < 0 && t.category !== 'Jar';
    if (filter.type === 'jars')    return t.category === 'Jar';
    return true;
  };
  const filtered = monthTx.filter(t => {
    if (!passType(t)) return false;
    if (filter.cat !== 'all' && t.category !== filter.cat) return false;
    if (filter.day !== 'all' && t.day !== filter.day) return false;
    const abs = Math.abs(t.amount);
    if (filter.min !== '' && abs < parseFloat(filter.min)) return false;
    if (filter.max !== '' && abs > parseFloat(filter.max)) return false;
    if (isPro && accts.length && !accts.includes(t.acctId)) return false;
    if (query.trim() && !(`${t.label} ${t.category}`).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const net = filtered.reduce((s, t) => s + t.amount, 0);
  const acctName = (id) => (MOBILE_ACCOUNTS.find(a => a.id === id) || {}).name || '';
  const acctColor = (id) => (MOBILE_ACCOUNTS.find(a => a.id === id) || {}).color;
  const combinedUSD = MOBILE_ACCOUNTS.filter(a => accts.includes(a.id)).reduce((s, a) => s + mToUSD(a.balance, a.currency), 0);

  // smart-filter badge counts cat/day/amount only (type has its own chips, accounts its own pill)
  const smartCount = (filter.cat !== 'all' ? 1 : 0) + (filter.day !== 'all' ? 1 : 0) + ((filter.min !== '' || filter.max !== '') ? 1 : 0);

  // removable active chips
  const chips = [];
  if (filter.cat !== 'all') chips.push({ k: 'cat', icon: 'label', label: filter.cat, clear: () => setFilter(f => ({ ...f, cat: 'all' })) });
  if (filter.day !== 'all') chips.push({ k: 'day', icon: 'event', label: filter.day, clear: () => setFilter(f => ({ ...f, day: 'all' })) });
  if (filter.min !== '' || filter.max !== '') chips.push({ k: 'amt', icon: 'payments', label: `${filter.min !== '' ? '≥$' + filter.min : ''}${filter.min !== '' && filter.max !== '' ? ' · ' : ''}${filter.max !== '' ? '≤$' + filter.max : ''}`, clear: () => setFilter(f => ({ ...f, min: '', max: '' })) });
  if (isPro) accts.forEach(id => chips.push({ k: 'a' + id, dot: acctColor(id), label: acctName(id), clear: () => setAccts(accts.filter(x => x !== id)) }));
  if (query.trim()) chips.push({ k: 'q', icon: 'search', label: `"${query}"`, clear: () => setQuery('') });

  const TYPE_CHIPS = [['all','Todos'],['income','Ingresos'],['expense','Gastos'],['jars','Jars']];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <MobileHeader
        title="Transacciones"
        subtitle={mnmLabel(month)}
        onBack={onBack}
        rightActions={[{ icon: search ? 'close' : 'search', onPress: () => { setSearch(s => !s); if (search) setQuery(''); } }]}
      />

      {/* Search field */}
      {search && (
        <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--surface-1)', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-card)' }}>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>search</span>
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar concepto o categoría…"
              style={{ border: 0, outline: 'none', background: 'transparent', flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)' }} />
          </div>
        </div>
      )}

      {/* Date-interval navigation */}
      <MonthBar month={month} onChange={setMonth} accent={accent} />

      {/* Filter pills row */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 10px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
        {isPro && <AccountFilter selected={accts} onChange={setAccts} hidden={hidden} accent={accent} />}
        {isPro && <ExchangeRates rates={rates} onChange={setRates} accent={accent} />}
        <SmartFilter value={filter} onChange={setFilter} categories={categories} days={days} count={smartCount} accent={accent} />
      </div>

      {/* Quick type chips */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 10px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
        {TYPE_CHIPS.map(([id, label]) => {
          const on = filter.type === id;
          return (
            <button key={id} onClick={() => setFilter(f => ({ ...f, type: id }))} style={{
              flexShrink: 0, border: 0, cursor: 'pointer', padding: '8px 16px', borderRadius: 'var(--radius-pill)',
              background: on ? accent : 'var(--surface-1)', color: on ? '#fff' : 'var(--fg-1)',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: on ? 600 : 500,
              boxShadow: on ? 'none' : 'var(--shadow-card)',
            }}>{label}</button>
          );
        })}
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 10px', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
          {chips.map(c => (
            <span key={c.k} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 8px 6px 12px', borderRadius: 'var(--radius-pill)', background: `color-mix(in srgb, ${accent} 12%, var(--surface-1))`, color: accent, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>
              {c.dot ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot }} /> : c.icon ? <span className="material-icons" style={{ fontSize: 14 }}>{c.icon}</span> : null}
              {c.label}
              <span className="material-icons" onClick={c.clear} style={{ fontSize: 15, cursor: 'pointer', opacity: 0.7 }}>close</span>
            </span>
          ))}
        </div>
      )}

      {/* Context line */}
      <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>
          <strong style={{ color: 'var(--fg-1)', fontWeight: 700 }}>{filtered.length}</strong> {filtered.length === 1 ? 'movimiento' : 'movimientos'}
          {filtered.length > 0 && <span style={{ color: 'var(--fg-3)' }}> · neto </span>}
          {filtered.length > 0 && <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, color: net >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : `${net >= 0 ? '+' : '−'} $ ${Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</span>}
        </span>
        {isPro
          ? <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="material-icons" style={{ fontSize: 14 }}>currency_exchange</span>
              1 USD = <span style={{ fontFamily: 'var(--font-money)', color: 'var(--fg-2)' }}>Bs {rates.VES}</span>
              {accts.length > 0 && !hidden && <span> · {mUSD(combinedUSD)}</span>}
            </span>
          : <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="material-icons" style={{ fontSize: 14 }}>account_balance_wallet</span>Billetera única
            </span>}
      </div>
      <Divider mx={16} />

      {/* Ledger */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingTop: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: 42, color: 'var(--fg-3)' }}>{monthTx.length === 0 ? 'event_busy' : 'search_off'}</span>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', marginTop: 12 }}>
              {monthTx.length === 0 ? `Sin movimientos en ${mnmLabel(month)}.` : 'Ningún movimiento coincide con estos filtros.'}
            </div>
            {monthTx.length === 0 && (
              <button onClick={() => setMonth({ ...MNM_TODAY })} style={{ marginTop: 14, border: 0, cursor: 'pointer', padding: '10px 18px', borderRadius: 'var(--radius-pill)', background: `color-mix(in srgb, ${accent} 14%, var(--surface-1))`, color: accent, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>
                Volver a {mnmLabel(MNM_TODAY)}
              </button>
            )}
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
