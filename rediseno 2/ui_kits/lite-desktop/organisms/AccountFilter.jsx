/* global React, accountsByGroup, SAMPLE_ACCOUNTS, DEFAULT_RATES */
/* ─── Account filter — intelligent grouped multi-select widget ───────────
 * Replaces the old always-on account sidebar with a compact, first-class
 * popover: accounts clustered into folders (Mis cuentas / Venezolanas /
 * Tarjetas y deudas), each with native + USD balance, per-group select-all,
 * smart segments (Todas · USD · VES · Con deuda) and a combined-balance
 * footer. Controlled: pass `selected` (array of acctIds) + `onChange`.
 * ──────────────────────────────────────────────────────────────────────── */
const { useState: useAfState, useRef: useAfRef, useEffect: useAfEffect } = React;

/* one-time keyframes for the recalc spinner */
if (typeof document !== 'undefined' && !document.getElementById('af-spin-style')) {
  const s = document.createElement('style');
  s.id = 'af-spin-style';
  s.textContent = '@keyframes af-spin { to { transform: rotate(360deg); } } .af-spin { animation: af-spin .8s linear infinite; }';
  document.head.appendChild(s);
}

const AF_TYPE_ICON = { bank: 'account_balance', cash: 'payments', card: 'credit_card', cashea: 'shopping_bag' };

function afRateOf(cur) {
  const r = (window.DEFAULT_RATES || {})[cur];
  const f = (r && typeof r === 'object') ? r.current : r;
  return f || 1;
}
function afToUSD(amount, cur) { return amount / afRateOf(cur); }
function afFmtNative(n, cur) {
  if (cur === 'VES') return `Bs. ${Math.abs(n).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`;
  if (cur === 'EUR') return `€ ${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$ ${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function afUSD(n) {
  const neg = n < 0;
  return `${neg ? '−' : ''}$ ${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AccountFilter({ selected = [], onChange, accent = 'var(--brand-primary)', hidden = false }) {
  const [open, setOpen] = useAfState(false);
  const [q, setQ] = useAfState('');
  const [overrides, setOverrides] = useAfState({}); // { acctId: newBalance } from "Ajustar saldo"
  const [menuId, setMenuId] = useAfState(null);      // open row kebab menu
  const [editId, setEditId] = useAfState(null);      // row in inline "Ajustar saldo" mode
  const [editVal, setEditVal] = useAfState('');
  const [recalcId, setRecalcId] = useAfState(null);  // row showing "Recalculando…"
  const ref = useAfRef(null);

  const balanceOf = (a) => (a.id in overrides ? overrides[a.id] : a.balance);
  const openEdit = (a) => { setMenuId(null); setEditId(a.id); setEditVal(String(balanceOf(a))); };
  const saveEdit = (a) => { const v = parseFloat(editVal); if (!isNaN(v)) setOverrides(o => ({ ...o, [a.id]: v })); setEditId(null); };
  const recalc = (a) => {
    setMenuId(null); setRecalcId(a.id);
    setTimeout(() => setRecalcId(r => (r === a.id ? null : r)), 950);
  };

  useAfEffect(() => {
    if (!open) return;
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const id = setTimeout(() => document.addEventListener('mousedown', close), 0);
    return () => { document.removeEventListener('mousedown', close); clearTimeout(id); };
  }, [open]);

  const groups = accountsByGroup();
  const all = SAMPLE_ACCOUNTS;
  const sel = new Set(selected);
  const set = (arr) => onChange(Array.from(new Set(arr)));

  const toggle = (id) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); set([...n]); };
  const toggleGroup = (accts) => {
    const ids = accts.map(a => a.id);
    const allOn = ids.every(i => sel.has(i));
    const n = new Set(sel);
    ids.forEach(i => allOn ? n.delete(i) : n.add(i));
    set([...n]);
  };

  // Smart segments
  const segments = [
    { id: 'all',  label: 'Todas',    test: null },
    { id: 'usd',  label: 'Solo USD', test: a => a.currency === 'USD' },
    { id: 'ves',  label: 'Solo VES', test: a => a.currency === 'VES' },
    { id: 'debt', label: 'Con deuda', test: a => balanceOf(a) < 0 },
  ];
  const applySeg = (seg) => {
    if (!seg.test) { set([]); return; }
    set(all.filter(seg.test).map(a => a.id));
  };
  const activeSeg = (() => {
    if (sel.size === 0) return 'all';
    for (const seg of segments) {
      if (!seg.test) continue;
      const ids = all.filter(seg.test).map(a => a.id);
      if (ids.length === sel.size && ids.every(i => sel.has(i))) return seg.id;
    }
    return null;
  })();

  const matchesQ = (a) => !q.trim() || a.name.toLowerCase().includes(q.toLowerCase());
  const selCount = sel.size;
  const combinedUSD = all.filter(a => sel.has(a.id)).reduce((s, a) => s + afToUSD(balanceOf(a), a.currency), 0);

  const buttonActive = selCount > 0;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          padding: '9px 16px', borderRadius: 'var(--radius-pill)', border: 0,
          background: buttonActive ? accent : 'var(--surface-2)',
          color: buttonActive ? '#fff' : 'var(--fg-1)',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
        }}>
        <span className="material-icons" style={{ fontSize: 18 }}>account_balance_wallet</span>
        {selCount === 0 ? t('Todas las cuentas') : selCount === 1
          ? (all.find(a => sel.has(a.id))?.name || t('Cuentas'))
          : `${selCount} ${t('cuentas')}`}
        {selCount > 1 && (
          <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 'var(--radius-pill)', minWidth: 18, height: 18, display: 'inline-grid', placeItems: 'center', fontSize: 11, fontFamily: 'var(--font-money)', padding: '0 5px' }}>{selCount}</span>
        )}
        <span className="material-icons" style={{ fontSize: 18, opacity: .7 }}>{open ? 'expand_less' : 'expand_more'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: 0, zIndex: 80, width: 360, maxWidth: '90vw',
          maxHeight: 'min(70vh, 560px)', display: 'flex', flexDirection: 'column',
          background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 60px rgba(15,23,42,.22)', border: '1px solid var(--border-hairline)',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border-hairline)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{t('Filtrar por cuenta')}</span>
              {selCount > 0 && <button onClick={() => set([])} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: accent, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>{t('Limpiar')}</button>}
            </div>
            {/* Smart segments */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {segments.map(seg => {
                const on = activeSeg === seg.id;
                return (
                  <button key={seg.id} onClick={() => applySeg(seg)}
                    style={{ border: 0, cursor: 'pointer', padding: '6px 12px', borderRadius: 'var(--radius-pill)',
                      background: on ? 'color-mix(in srgb, ' + accent + ' 14%, var(--surface-1))' : 'var(--surface-2)',
                      color: on ? accent : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: on ? 700 : 500 }}>
                    {t(seg.label)}
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)' }}>
              <span className="material-icons" style={{ fontSize: 17, color: 'var(--fg-3)' }}>search</span>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('Buscar cuenta…')}
                style={{ border: 0, outline: 'none', background: 'transparent', flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)' }} />
              {q && <span className="material-icons" onClick={() => setQ('')} style={{ fontSize: 16, color: 'var(--fg-3)', cursor: 'pointer' }}>close</span>}
            </div>
          </div>

          {/* Grouped account list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
            {groups.map(({ group, accounts }) => {
              const visible = accounts.filter(matchesQ);
              if (!visible.length) return null;
              const ids = accounts.map(a => a.id);
              const allOn = ids.every(i => sel.has(i));
              const someOn = ids.some(i => sel.has(i));
              const groupUSD = accounts.reduce((s, a) => s + afToUSD(balanceOf(a), a.currency), 0);
              return (
                <div key={group} style={{ marginBottom: 6 }}>
                  {/* Group header */}
                  <div onClick={() => toggleGroup(accounts)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <AfCheck on={allOn} partial={someOn && !allOn} accent={accent} />
                    <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{t(group)}</span>
                    <span style={{ fontFamily: 'var(--font-money)', fontSize: 11.5, fontWeight: 600, color: groupUSD < 0 ? 'var(--expense-fg)' : 'var(--fg-2)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : afUSD(groupUSD)}</span>
                  </div>
                  {/* Accounts */}
                  {visible.map(a => {
                    const on = sel.has(a.id);
                    const bal = balanceOf(a);
                    const usd = afToUSD(bal, a.currency);
                    const editing = editId === a.id;
                    const recalcing = recalcId === a.id;
                    const edited = (a.id in overrides);
                    return (
                      <div key={a.id} onClick={() => { if (!editing) toggle(a.id); }}
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', cursor: editing ? 'default' : 'pointer', borderRadius: 'var(--radius-md)',
                          background: on ? 'color-mix(in srgb, ' + accent + ' 8%, var(--surface-1))' : 'transparent' }}
                        onMouseEnter={e => { if (!on && !editing) e.currentTarget.style.background = 'var(--surface-2)'; }}
                        onMouseLeave={e => { if (!on && !editing) e.currentTarget.style.background = 'transparent'; }}>
                        <AfCheck on={on} accent={accent} />
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: a.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <span className="material-icons" style={{ fontSize: 17, color: '#fff' }}>{AF_TYPE_ICON[a.type] || 'account_balance'}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>
                            {a.currency}{a.last4 ? ` · ····${a.last4}` : ''}{edited ? ' · ' : ''}{edited ? <span style={{ color: accent, fontWeight: 600 }}>{t('ajustado')}</span> : null}
                          </div>
                        </div>

                        {editing ? (
                          /* Inline "Ajustar saldo" editor */
                          <div onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
                              <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, color: 'var(--fg-3)' }}>{a.currency === 'VES' ? 'Bs.' : a.currency === 'EUR' ? '€' : '$'}</span>
                              <input autoFocus type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(a); if (e.key === 'Escape') setEditId(null); }}
                                style={{ border: 0, outline: 'none', background: 'transparent', width: 84, fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
                            </div>
                            <button onClick={() => saveEdit(a)} aria-label="Guardar saldo" style={{ width: 30, height: 30, border: 0, borderRadius: 'var(--radius-pill)', background: accent, color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <span className="material-icons" style={{ fontSize: 17 }}>check</span>
                            </button>
                            <button onClick={() => setEditId(null)} aria-label="Cancelar" style={{ width: 30, height: 30, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', color: 'var(--fg-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <span className="material-icons" style={{ fontSize: 16 }}>close</span>
                            </button>
                          </div>
                        ) : (
                          <React.Fragment>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, minWidth: 64 }}>
                              {recalcing ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, color: accent }}>
                                  <span className="material-icons af-spin" style={{ fontSize: 15 }}>autorenew</span>{t('Recalculando…')}
                                </span>
                              ) : (
                                <React.Fragment>
                                  <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: bal < 0 ? 'var(--expense-fg)' : 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : (bal < 0 ? '−' : '') + afFmtNative(bal, a.currency)}</span>
                                  {a.currency !== 'USD' && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-3)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '' : `≈ ${afUSD(usd)}`}</span>}
                                </React.Fragment>
                              )}
                            </div>
                            {/* Kebab */}
                            <button onClick={e => { e.stopPropagation(); setMenuId(m => m === a.id ? null : a.id); }} aria-label="Opciones de cuenta"
                              style={{ width: 28, height: 28, border: 0, borderRadius: 'var(--radius-pill)', background: menuId === a.id ? 'var(--surface-3)' : 'transparent', color: 'var(--fg-3)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                              onMouseLeave={e => { if (menuId !== a.id) e.currentTarget.style.background = 'transparent'; }}>
                              <span className="material-icons" style={{ fontSize: 18 }}>more_vert</span>
                            </button>
                            {menuId === a.id && (
                              <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% - 4px)', right: 8, zIndex: 90, minWidth: 180, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', boxShadow: '0 16px 40px rgba(15,23,42,.20)', padding: 5 }}>
                                {[['tune', t('Ajustar saldo'), () => openEdit(a)], ['autorenew', t('Recalcular saldo'), () => recalc(a)]].map(([ic, label, fn]) => (
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
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>
                {selCount === 0 ? t('Todas las cuentas') : `${selCount} ${selCount === 1 ? t('cuenta') : t('cuentas')}`}
              </span>
              {selCount > 0 && (
                <span style={{ fontFamily: 'var(--font-money)', fontSize: 14, fontWeight: 700, color: combinedUSD < 0 ? 'var(--expense-fg)' : 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>
                  {hidden ? '$ ••••' : afUSD(combinedUSD)} <span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--fg-3)' }}>{t('combinado')}</span>
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)}
              style={{ border: 0, cursor: 'pointer', padding: '9px 20px', borderRadius: 'var(--radius-pill)', background: accent, color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>
              {t('Listo')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Checkbox visual (on / partial / off) */
function AfCheck({ on, partial = false, accent = 'var(--brand-primary)' }) {
  return (
    <span style={{
      width: 19, height: 19, flexShrink: 0, borderRadius: 6, display: 'grid', placeItems: 'center',
      border: (on || partial) ? `1.5px solid ${accent}` : '1.5px solid var(--border-strong, var(--fg-3))',
      background: (on || partial) ? accent : 'transparent', transition: 'all 120ms',
    }}>
      {on && <span className="material-icons" style={{ fontSize: 15, color: '#fff' }}>check</span>}
      {partial && !on && <span style={{ width: 9, height: 2, borderRadius: 2, background: '#fff' }} />}
    </span>
  );
}

Object.assign(window, { AccountFilter });
