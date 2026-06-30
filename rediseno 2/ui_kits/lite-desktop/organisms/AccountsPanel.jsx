/* ─── Accounts Panel — Pro Desktop Right Column ──────────────────────────
 * Shows multi-currency accounts + debts + Cashea.
 * Renders as a fixed right column inside ProShell (280px wide).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useAPState } = React;

/* one-time keyframes for the recalc spinner (guarded id, independent of AccountFilter) */
if (typeof document !== 'undefined' && !document.getElementById('ap-spin-style')) {
  const s = document.createElement('style');
  s.id = 'ap-spin-style';
  s.textContent = '@keyframes ap-spin { to { transform: rotate(360deg); } } .ap-spin { animation: ap-spin .8s linear infinite; }';
  document.head.appendChild(s);
}

/* Checkbox visual for multi-select (on / partial / off) */
function APCheck({ on, partial = false, accent = 'var(--info)' }) {
  return (
    <span style={{
      width: 19, height: 19, flexShrink: 0, borderRadius: 6, display: 'grid', placeItems: 'center',
      border: (on || partial) ? '1.5px solid ' + accent : '1.5px solid var(--border-strong, var(--fg-3))',
      backgroundColor: (on || partial) ? accent : 'transparent', transition: 'border-color 120ms',
    }}>
      {on && <span className="material-icons" style={{ fontSize: 15, color: '#fff' }}>check</span>}
      {partial && !on && <span style={{ width: 9, height: 2, borderRadius: 2, background: '#fff' }} />}
    </span>
  );
}

/* Accounts aligned with data/finance-data.jsx (SAMPLE_ACCOUNTS) */
const ACCOUNTS_DATA = [
  { id: 1, name: 'BofA · Corriente', short: 'BofA', sub: 'Cuenta corriente', currency: 'USD', balance: 3420.50,  color: '#1E3A8A', flag: '🇺🇸' },
  { id: 2, name: 'BofA · Ahorros',   short: 'BofA', sub: 'Cuenta ahorros',   currency: 'USD', balance: 12480.00, color: '#2D4DA6', flag: '🇺🇸' },
  { id: 3, name: 'Efectivo USD',     short: 'EFE',  sub: 'Caja',             currency: 'USD', balance: 340.00,   color: '#10B981', flag: '🇺🇸' },
  { id: 4, name: 'Mercantil',        short: 'MER',  sub: 'Cuenta corriente', currency: 'VES', balance: 48500.00, color: '#F59E0B', flag: '🇻🇪' },
];

const DEBTS_DATA = [
  { id: 1, name: 'Visa · Crédito', type: 'credit',  icon: 'credit_card',  balance: 1240.20, currency: 'USD', apr: 17.9, next: 120.00, dueDate: '5 Jun',  status: 'due_soon' },
  { id: 2, name: 'Cashea · iPhone',type: 'bnpl',    icon: 'shopping_bag', balance: 445.50,  currency: 'USD', cuota: '3/6', next: 148.50, dueDate: '8 Jun', status: 'pending' },
  { id: 3, name: 'Cashea · TV',    type: 'bnpl',    icon: 'shopping_bag', balance: 320.00,  currency: 'USD', cuota: '2/6', next: 80.00,  dueDate: '12 Jun', status: 'pending' },
  { id: 4, name: 'Préstamo personal', type: 'loan', icon: 'account_balance', balance: 6400.00, currency: 'USD', apr: 12.5, next: 320.00, dueDate: '15 Jun', status: 'active' },
];

/* Local fallback rates (flat). Real rates come from finance-data DEFAULT_RATES
 * (nested: { USD: { current, official } }) via the `rates` prop — toUSD handles both. */
const AP_RATES = { USD: 1, EUR: 0.92, VES: 40.50, COP: 4100 };
const AP_ACCENT = 'var(--info)'; // Pro primary (cyan)

function AccountsPanel({ hidden = false, rates = AP_RATES, mobile = false, accent = AP_ACCENT }) {
  const [section, setSection] = useAPState('accounts'); // 'accounts' | 'debts'

  // ── Multi-select + per-account actions state ──────────────────
  const [selectMode, setSelectMode] = useAPState(false);
  const [selected, setSelected]     = useAPState(() => new Set());
  const [overrides, setOverrides]   = useAPState({});  // { acctId: newBalance } from "Ajustar saldo"
  const [menuId, setMenuId]         = useAPState(null); // open row kebab
  const [editId, setEditId]         = useAPState(null); // row in inline "Ajustar saldo"
  const [editVal, setEditVal]       = useAPState('');
  const [recalcSet, setRecalcSet]   = useAPState(() => new Set()); // ids currently "Recalculando…"
  const [toast, setToast]           = useAPState(null); // transient confirmation text

  const balanceOf = (a) => (a.id in overrides ? overrides[a.id] : a.balance);

  // Robust to flat ({VES: 40.5}) or nested ({VES: {current: 40.5}}) rate maps
  const rateOf = (currency) => {
    const r = rates[currency];
    const f = (r && typeof r === 'object') ? r.current : r;
    return f || AP_RATES[currency] || 1;
  };
  const toUSD = (amount, currency) => amount / rateOf(currency);
  const totalUSD = ACCOUNTS_DATA.reduce((s, a) => s + toUSD(balanceOf(a), a.currency), 0);
  const totalDebt = DEBTS_DATA.reduce((s, d) => s + d.balance, 0);

  const flashToast = (msg) => { setToast(msg); setTimeout(() => setToast(t0 => (t0 === msg ? null : t0)), 2200); };

  // ── Actions ───────────────────────────────────────────────────
  const enterSelect = () => { setSelectMode(true); setMenuId(null); setEditId(null); };
  const exitSelect  = () => { setSelectMode(false); setSelected(new Set()); };
  const toggleSel   = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = selected.size === ACCOUNTS_DATA.length && ACCOUNTS_DATA.length > 0;
  const someSelected = selected.size > 0 && !allSelected;
  const selectAll   = () => setSelected(new Set(ACCOUNTS_DATA.map(a => a.id)));
  const deselectAll = () => setSelected(new Set());

  const openEdit = (a) => { setMenuId(null); setEditId(a.id); setEditVal(String(balanceOf(a))); };
  const saveEdit = (a) => { const v = parseFloat(editVal); if (!isNaN(v)) { setOverrides(o => ({ ...o, [a.id]: v })); flashToast(t('Saldo ajustado')); } setEditId(null); };

  const recalcIds = (ids) => {
    if (!ids.length) return;
    setMenuId(null);
    setRecalcSet(prev => { const n = new Set(prev); ids.forEach(i => n.add(i)); return n; });
    setTimeout(() => {
      setRecalcSet(prev => { const n = new Set(prev); ids.forEach(i => n.delete(i)); return n; });
      flashToast(ids.length === 1 ? t('Saldo actualizado') : ids.length + ' ' + t('cuentas actualizadas'));
    }, 1000);
  };

  // Bulk: "Ajustar saldo" only makes sense for one account → open its inline editor
  const bulkAdjust = () => {
    if (selected.size !== 1) { flashToast(t('Selecciona una sola cuenta para ajustar')); return; }
    const id = [...selected][0];
    const a = ACCOUNTS_DATA.find(x => x.id === id);
    if (a) { setEditId(a.id); setEditVal(String(balanceOf(a))); }
  };

  return (
    <aside style={mobile ? {
      width: '100%', background: 'transparent',
      display: 'flex', flexDirection: 'column',
    } : {
      width: 280, flexShrink: 0,
      background: 'var(--surface-1)',
      borderLeft: '1px solid var(--border-hairline)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Transient confirmation toast */}
      {toast && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: mobile ? 'auto' : 14, top: mobile ? 4 : 'auto', display: 'flex', justifyContent: 'center', zIndex: 120, pointerEvents: 'none' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--fg-1)', color: 'var(--surface-1)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, boxShadow: '0 10px 30px rgba(15,23,42,.28)' }}>
            <span className="material-icons" style={{ fontSize: 16 }}>check_circle</span>{toast}
          </span>
        </div>
      )}
      {/* Header — segmented toggle, OR contextual selection toolbar in select mode */}
      <div style={{ padding: mobile ? '0 0 12px' : '18px 18px 12px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        {(selectMode && section === 'accounts') ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Row 1 — partial/all indicator + live count + close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <APCheck on={allSelected} partial={someSelected} accent={accent} />
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--fg-1)' }}>
                {selected.size > 0 ? selected.size + ' ' + t('seleccionadas') : t('Seleccionar cuentas')}
              </span>
              <button onClick={exitSelect} aria-label={t('Cancelar')} title={t('Cancelar')}
                style={{ width: 34, height: 34, flexShrink: 0, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', color: 'var(--fg-2)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-1)'}>
                <span className="material-icons" style={{ fontSize: 19 }}>close</span>
              </button>
            </div>
            {/* Row 2 — explicit Select all / Deselect buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { ic: 'done_all',    label: t('Seleccionar todo'), fn: selectAll,   off: allSelected },
                { ic: 'remove_done', label: t('Deseleccionar'),    fn: deselectAll, off: selected.size === 0 },
              ].map(({ ic, label, fn, off }) => (
                <button key={label} onClick={off ? undefined : fn} disabled={off} aria-label={label}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 6px', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', color: off ? 'var(--fg-3)' : 'var(--fg-1)', cursor: off ? 'default' : 'pointer', opacity: off ? 0.55 : 1, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, transition: 'all 150ms' }}
                  onMouseEnter={e => { if (!off) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-1)'; }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>{ic}</span>{label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div style={{ display: 'flex', flex: 1, background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 3, gap: 2 }}>
              {[['accounts', t('Cuentas')], ['debts', t('Deudas')]].map(([s, label]) => (
                <button key={s} onClick={() => { setSection(s); if (s === 'debts') exitSelect(); }} style={{ flex: 1, border: 0, cursor: 'pointer', padding: '7px', borderRadius: 'var(--radius-pill)', background: section === s ? 'var(--surface-1)' : 'transparent', color: section === s ? (s === 'debts' ? 'var(--expense-fg)' : 'var(--fg-1)') : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: section === s ? 700 : 500, boxShadow: section === s ? 'var(--shadow-card)' : 'none', transition: 'all 150ms' }}>
                  {label}
                </button>
              ))}
            </div>
            {/* Multi-select entry (accounts only) */}
            {section === 'accounts' && (
              <button onClick={enterSelect} aria-label={t('Seleccionar varias')} title={t('Seleccionar varias')}
                style={{ width: 34, height: 34, flexShrink: 0, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', color: 'var(--fg-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-1)'}>
                <span className="material-icons" style={{ fontSize: 19 }}>checklist</span>
              </button>
            )}
          </React.Fragment>
        )}
      </div>

      {/* ── Accounts section ───────────────────────────────────── */}
      {section === 'accounts' && (
        <div style={mobile ? {} : { flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {/* Net total */}
          <div style={{ padding: mobile ? '0 2px 14px' : '0 18px 14px' }}>
            <div className="t-eyebrow" style={{ marginBottom: 4 }}>{t('Patrimonio neto · USD')}</div>
            <div className="t-amount-lg">{hidden ? '$ ••••••' : `$ ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
          </div>
          <div style={{ height: 1, background: 'var(--border-hairline)', margin: mobile ? '0 2px 12px' : '0 18px 12px' }} />

          {/* Account list */}
          {ACCOUNTS_DATA.map(acc => (
            <AccountRow key={acc.id} account={acc} hidden={hidden}
              usdValue={toUSD(balanceOf(acc), acc.currency)} balance={balanceOf(acc)} mobile={mobile} accent={accent}
              selectMode={selectMode} selected={selected.has(acc.id)} onToggleSel={() => toggleSel(acc.id)}
              edited={acc.id in overrides}
              editing={editId === acc.id} editVal={editVal} setEditVal={setEditVal}
              onSaveEdit={() => saveEdit(acc)} onCancelEdit={() => setEditId(null)}
              recalcing={recalcSet.has(acc.id)}
              menuOpen={menuId === acc.id} onToggleMenu={() => setMenuId(m => m === acc.id ? null : acc.id)}
              onAdjust={() => openEdit(acc)} onRecalc={() => recalcIds([acc.id])} />
          ))}

          {/* Add account (hidden in select mode to keep focus) */}
          {!selectMode && (
            <button style={{ width: '100%', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: mobile ? '12px 2px' : '12px 18px', background: 'transparent', color: 'var(--info)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>add_circle_outline</span>
              {t('Agregar cuenta')}
            </button>
          )}

          {/* Bulk action bar (select mode + ≥1 selected) */}
          {selectMode && selected.size > 0 && (
            <div style={{ position: mobile ? 'static' : 'sticky', bottom: 0, marginTop: 4, padding: mobile ? '12px 2px' : '12px 18px', background: 'var(--surface-1)', borderTop: '1px solid var(--border-hairline)', display: 'flex', gap: 8 }}>
              <button onClick={bulkAdjust}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', color: selected.size === 1 ? 'var(--fg-1)' : 'var(--fg-3)', cursor: 'pointer', padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-1)'}>
                <span className="material-icons" style={{ fontSize: 17 }}>tune</span>{t('Ajustar saldo')}
              </button>
              <button onClick={() => recalcIds([...selected])}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 0, borderRadius: 'var(--radius-pill)', background: accent, color: '#fff', cursor: 'pointer', padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>
                <span className="material-icons" style={{ fontSize: 17 }}>autorenew</span>{t('Recalcular')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Debts section ──────────────────────────────────────── */}
      {section === 'debts' && (
        <div style={mobile ? {} : { flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {/* Total debt */}
          <div style={{ padding: mobile ? '0 2px 14px' : '0 18px 14px' }}>
            <div className="t-eyebrow" style={{ marginBottom: 4 }}>{t('Total adeudado · USD')}</div>
            <div className="t-amount-lg" style={{ color: 'var(--expense-fg)' }}>{hidden ? '$ ••••••' : `$ ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</div>
          </div>
          <div style={{ height: 1, background: 'var(--border-hairline)', margin: mobile ? '0 2px 12px' : '0 18px 12px' }} />

          {/* Debt list */}
          {DEBTS_DATA.map(d => <DebtRow key={d.id} debt={d} hidden={hidden} mobile={mobile} />)}

          {/* Add debt */}
          <button style={{ width: '100%', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: mobile ? '12px 2px' : '12px 18px', background: 'transparent', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>add_circle_outline</span>
            {t('Registrar deuda')}
          </button>
        </div>
      )}
    </aside>
  );
}

function AccountRow({ account: a, hidden, usdValue, balance, mobile = false, accent = AP_ACCENT,
  selectMode = false, selected = false, onToggleSel,
  edited = false, editing = false, editVal = '', setEditVal, onSaveEdit, onCancelEdit,
  recalcing = false, menuOpen = false, onToggleMenu, onAdjust, onRecalc }) {
  const bal = balance != null ? balance : a.balance;
  const fmt = (n, cur) => {
    if (cur === 'VES' || cur === 'COP') return `${cur} ${(n / 1000).toFixed(0)}k`;
    return `${cur} ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };
  const rowClick = () => { if (selectMode) onToggleSel && onToggleSel(); };
  return (
    <div onClick={rowClick}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: mobile ? '11px 2px' : '11px 18px', cursor: selectMode ? 'pointer' : 'default', transition: 'background 150ms',
        background: selected ? 'color-mix(in srgb, ' + accent + ' 8%, var(--surface-1))' : 'transparent' }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      {selectMode && <APCheck on={selected} accent={accent} />}
      <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', flexShrink: 0 }}>{a.short.slice(0,3)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t(a.sub)}{edited ? <span style={{ color: accent, fontWeight: 600 }}>{' · ' + t('ajustado')}</span> : null}</div>
      </div>

      {editing ? (
        /* Inline "Ajustar saldo" editor */
        <div onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '5px 8px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontFamily: 'var(--font-money)', fontSize: 11.5, color: 'var(--fg-3)' }}>{a.currency === 'VES' ? 'Bs.' : a.currency === 'EUR' ? '€' : '$'}</span>
            <input autoFocus type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit(); }}
              style={{ border: 0, outline: 'none', background: 'transparent', width: 66, fontFamily: 'var(--font-money)', fontSize: 12.5, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
          </div>
          <button onClick={onSaveEdit} aria-label={t('Guardar')} style={{ width: 28, height: 28, border: 0, borderRadius: 'var(--radius-pill)', background: accent, color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <span className="material-icons" style={{ fontSize: 16 }}>check</span>
          </button>
          <button onClick={onCancelEdit} aria-label={t('Cancelar')} style={{ width: 28, height: 28, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', color: 'var(--fg-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <span className="material-icons" style={{ fontSize: 15 }}>close</span>
          </button>
        </div>
      ) : (
        <React.Fragment>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, minWidth: 56 }}>
            {recalcing ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: accent }}>
                <span className="material-icons ap-spin" style={{ fontSize: 14 }}>autorenew</span>{t('Recalculando…')}
              </span>
            ) : (
              <React.Fragment>
                <div style={{ fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : fmt(bal, a.currency)}</div>
                {a.currency !== 'USD' && <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-3)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '' : `≈ $ ${usdValue.toFixed(2)}`}</div>}
              </React.Fragment>
            )}
          </div>
          {/* Kebab (hidden in select mode) */}
          {!selectMode && (
            <button onClick={e => { e.stopPropagation(); onToggleMenu && onToggleMenu(); }} aria-label={t('Opciones de cuenta')}
              style={{ width: 26, height: 26, border: 0, borderRadius: 'var(--radius-pill)', background: menuOpen ? 'var(--surface-3, var(--surface-2))' : 'transparent', color: 'var(--fg-3)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3, var(--surface-2))'}
              onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent'; }}>
              <span className="material-icons" style={{ fontSize: 17 }}>more_vert</span>
            </button>
          )}
          {menuOpen && !selectMode && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% - 6px)', right: mobile ? 2 : 14, zIndex: 90, minWidth: 176, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', boxShadow: '0 16px 40px rgba(15,23,42,.20)', padding: 5 }}>
              {[['tune', t('Ajustar saldo'), onAdjust], ['autorenew', t('Recalcular saldo'), onRecalc]].map(([ic, label, fn]) => (
                <button key={label} onClick={fn}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '9px 11px', border: 0, background: 'transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--fg-1)' }}>
                  <span className="material-icons" style={{ fontSize: 17, color: 'var(--fg-3)' }}>{ic}</span>{label}
                </button>
              ))}
            </div>
          )}
        </React.Fragment>
      )}
    </div>
  );
}

function DebtRow({ debt: d, hidden, mobile = false }) {
  const statusColor = { pending: 'var(--fg-2)', due_soon: 'var(--warning-fg)', overdue: 'var(--expense-fg)', active: 'var(--fg-2)' }[d.status];
  const statusBg    = { pending: 'var(--surface-2)', due_soon: 'var(--warning-soft)', overdue: 'var(--expense-soft)', active: 'var(--surface-2)' }[d.status];
  const statusLabel = { pending: t('Pendiente'), due_soon: t('Vence pronto'), overdue: t('Vencido'), active: t('Activo') }[d.status];

  return (
    <div style={{ padding: mobile ? '12px 2px' : '12px 18px', cursor: 'pointer', transition: 'background 150ms' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--expense-soft)', color: 'var(--expense-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-icons" style={{ fontSize: 16 }}>{d.icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{d.name}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t('Vence:')} {d.dueDate}{d.apr ? ` · ${d.apr}% APR` : ''}{d.cuota ? ` · ${t('cuota')} ${d.cuota}` : ''}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-money)', fontSize: 14, fontWeight: 700, color: 'var(--expense-fg)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : `$ ${d.balance.toFixed(2)}`}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: statusBg, color: statusColor }}>{statusLabel}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t('Próx. pago:')} <strong style={{ color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••' : `$ ${d.next.toFixed(2)}`}</strong></span>
      </div>
    </div>
  );
}

Object.assign(window, { AccountsPanel, ACCOUNTS_DATA, DEBTS_DATA });
