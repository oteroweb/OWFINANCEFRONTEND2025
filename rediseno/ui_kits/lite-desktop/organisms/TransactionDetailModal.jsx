/* ─── Transaction Detail / Edit Modal — Desktop (Lite + Pro) ────────────
 * Click any transaction row (Home recents or the ledger) → this opens.
 *   • Cada campo es editable directo en el detalle: click al valor → control
 *     inline → guarda solo (auto-save), sin modo "editar" separado.
 *   • Soporta los 3 tipos de movimiento: Gasto, Ingreso, Transferencia
 *     (categoría+cántaro para gasto/ingreso; cuenta origen→destino para
 *     transferencia), más edición de comisión cuando aplica.
 *   • Delete    — inline confirmation
 *
 * Mutates the shared SAMPLE_TX seed in place; the host shell re-renders on
 * close. Real app: PATCH / DELETE /api/v1/transactions/:id.
 *
 * Props: open · tx · mode('lite'|'pro') · hidden · onClose · onChanged
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useTxdState, useEffect: useTxdEffect } = React;

function txdAcct(id) { return (window.SAMPLE_ACCOUNTS || []).find(a => a.id === id) || null; }

/* Cántaro derivado de la categoría (solo lectura) — el cántaro nunca se elige
 * a mano: entra anclado a la categoría seleccionada. */
function TxdAnchoredJar({ category }) {
  const jar = window.owfJarForCategory ? window.owfJarForCategory(category) : null;
  const T = (s) => (window.t ? window.t(s) : s);
  if (!category) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px dashed var(--border-hairline)' }}>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>savings</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-3)' }}>{T('El cántaro entra con la categoría')}</span>
      </div>
    );
  }
  if (!jar) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)' }}>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>block</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>{T('Esta categoría no aporta a ningún cántaro')}</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 'var(--radius-sm)', background: `color-mix(in srgb, ${jar.color} 9%, var(--surface-1))`, border: `1px solid color-mix(in srgb, ${jar.color} 26%, transparent)` }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, background: jar.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-icons" style={{ fontSize: 16, color: '#fff' }}>{jar.icon}</span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{T(jar.name)}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{jar.percent}% · {T('anclado a la categoría')}</div>
      </div>
      <span className="material-icons" title={T('Definido por la categoría')} style={{ fontSize: 16, color: 'var(--fg-3)' }}>lock</span>
    </div>
  );
}

/* Fila de detalle editable en el sitio: click en el valor → abre el control
 * pasado en `edit`, se cierra y guarda solo al confirmar. `editable=false`
 * deja la fila de solo lectura (p.ej. el cántaro, derivado). */
function TxdRow({ icon, label, value, editable = true, active, onActivate, onClose, edit }) {
  const T = (s) => (window.t ? window.t(s) : s);
  return (
    <div style={{ borderTop: '1px solid var(--border-hairline)' }}>
      <div
        onClick={editable && !active ? onActivate : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '13px 4px', margin: '0 -4px',
          borderRadius: 'var(--radius-sm)', cursor: editable && !active ? 'pointer' : 'default',
          transition: 'background 120ms',
        }}
        onMouseEnter={e => { if (editable && !active) e.currentTarget.style.background = 'var(--surface-2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span className="material-icons" style={{ fontSize: 19, color: 'var(--fg-3)', flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)' }}>{label}</span>
        {!active && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', textAlign: 'right' }}>{value}</span>}
        {editable && !active && <span className="material-icons" style={{ fontSize: 15, color: 'var(--fg-3)', flexShrink: 0 }}>edit</span>}
        {active && (
          <button onClick={onClose} title={T('Listo')} style={{ border: 0, background: 'var(--brand-primary)', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <span className="material-icons" style={{ fontSize: 15 }}>check</span>
          </button>
        )}
      </div>
      {active && <div style={{ padding: '2px 4px 12px' }}>{edit}</div>}
    </div>
  );
}

function TransactionDetailModal({ open, tx, mode = 'lite', hidden = false, onClose, onChanged }) {
  const isPro = mode === 'pro';
  const isMobile = useViewportMobile();
  const accent = isPro ? 'var(--info)' : 'var(--brand-primary)';
  const T = (s) => (window.t ? window.t(s) : s);

  const [confirmDel, setConfirmDel] = useTxdState(false);
  const [editing, setEditing] = useTxdState(false);
  const [live, setLive] = useTxdState(null);

  useTxdEffect(() => {
    setConfirmDel(false); setEditing(false);
    if (tx) setLive({
      type: tx.type || (tx.amount > 0 ? 'income' : 'expense'),
      amount: String(Math.abs(tx.amount)),
      label: tx.label,
      category: tx.category,
      jar: tx.jar || null,
      acctId: tx.acctId,
      destAcctId: tx.destAcctId || null,
      commission: tx.commission ? { ...tx.commission } : null,
    });
  }, [tx]);

  useTxdEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') { if (editing) setEditing(false); else onClose(); } };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onClose, editing]);

  if (!open || !tx || !live) return null;

  const isTransfer = live.type === 'transfer';
  const isIncome = live.type === 'income';
  const txColor = isTransfer ? '#8B5CF6' : (isIncome ? 'var(--income-fg)' : 'var(--expense-fg)');
  const txSoft  = isTransfer ? 'color-mix(in srgb, #8B5CF6 12%, var(--surface-1))' : (isIncome ? 'var(--income-soft)' : 'var(--expense-soft)');
  const acct = txdAcct(live.acctId);
  const destAcct = txdAcct(live.destAcctId);
  const fmtAmt = (n) => Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* Editar = misma pantalla que crear (fase 2 del TransactionForm), sólo
   * que prellenada con los datos de este movimiento. */
  const editPrefill = {
    merchant: tx.label,
    amount: Math.abs(tx.amount),
    dateLabel: tx.day && tx.day.toLowerCase().startsWith('hoy') ? 'Hoy' : (tx.day || 'Hoy'),
    categoryId: window.owfCategory ? (window.owfCategory(tx.category) || {}).id ?? null : null,
    accountId: tx.acctId,
    toAccountId: tx.destAcctId || (window.SAMPLE_ACCOUNTS || []).find(a => a.id !== tx.acctId)?.id,
    tags: tx.tags || [],
    commission: tx.commission ? { type: tx.commission.type, value: tx.commission.amount } : null,
  };

  const applyEdit = (payload) => {
    tx.label = payload.name || tx.label;
    tx.category = live.type === 'transfer' ? null : ((window.SAMPLE_CATEGORIES || []).find(c => c.id === payload.category_id) || {}).name ?? tx.category;
    const dj = window.owfJarForCategory ? window.owfJarForCategory(tx.category) : null;
    tx.jar = live.type === 'transfer' ? null : (dj ? dj.name : null);
    tx.jarColor = live.type === 'transfer' ? null : (dj ? dj.color : null);
    tx.type = live.type;
    tx.acctId = payload.payments?.[0]?.account_id ?? tx.acctId;
    tx.destAcctId = live.type === 'transfer' ? (payload.payments?.[1]?.account_id ?? tx.destAcctId) : null;
    tx.commission = payload.commission || null;
    tx.amount = payload.amount != null ? payload.amount : tx.amount;
    setLive(l => ({ ...l, label: tx.label, amount: String(Math.abs(tx.amount)), category: tx.category, jar: tx.jar, acctId: tx.acctId, destAcctId: tx.destAcctId, commission: tx.commission }));
    setEditing(false);
    onChanged && onChanged();
  };

  const del = () => {
    const i = (window.SAMPLE_TX || []).indexOf(tx);
    if (i > -1) window.SAMPLE_TX.splice(i, 1);
    onChanged && onChanged();
    onClose();
  };

  const duplicate = () => {
    const list = window.SAMPLE_TX || [];
    const i = list.indexOf(tx);
    const copy = { ...tx, label: `${tx.label} (${T('copia')})` };
    if (i > -1) list.splice(i + 1, 0, copy); else list.push(copy);
    onChanged && onChanged();
    if (window.__owOpenTxDetailDesktop) window.__owOpenTxDetailDesktop(copy);
  };

  const width = 520;

  const row = (icon, label, value) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: '1px solid var(--border-hairline)' }}>
      <span className="material-icons" style={{ fontSize: 19, color: 'var(--fg-3)', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <div onClick={onClose} style={{
      position: isMobile ? 'absolute' : 'fixed', inset: 0, zIndex: 'var(--z-modal)',
      background: 'rgba(10,14,28,0.60)', backdropFilter: 'blur(4px)', display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'flex-start', justifyContent: 'center',
      padding: isMobile ? 0 : '6vh 16px', overflowY: isMobile ? 'hidden' : 'auto',
      animation: 'txdFade 200ms',
    }}>
      <style>{`
        @keyframes txdFade { from{opacity:0} to{opacity:1} }
        @keyframes txdRise { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={isMobile ? {
        position: 'absolute', left: 0, right: 0, bottom: 0, boxSizing: 'border-box',
        background: 'var(--surface-1)', borderRadius: '22px 22px 0 0', padding: '10px 20px calc(20px + env(safe-area-inset-bottom))',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.28)', maxHeight: '92%', overflowY: 'auto',
      } : {
        width: '100%', maxWidth: width, boxSizing: 'border-box', background: 'var(--surface-1)',
        borderRadius: 'var(--radius-xl)', padding: 26, boxShadow: 'var(--shadow-popover)',
        animation: 'txdRise 240ms var(--ease-out)', marginBottom: '6vh',
      }}>

        {isMobile && <div style={{ width: 38, height: 4, borderRadius: 999, background: 'var(--border-hairline)', margin: '0 auto 14px' }} />}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div className="t-eyebrow">{editing ? T('Editar movimiento') : T('Detalle del movimiento')}{isPro ? ' · Pro' : ' · Lite'}</div>
            <div className="t-h2" style={{ marginTop: 4 }}>{editing ? T('Editar') : tx.label}</div>
          </div>
          <IconButton icon="close" ariaLabel="Cerrar" onClick={editing ? () => setEditing(false) : onClose} />
        </div>

        {/* ── EDITAR: mismo formulario de creación, prellenado ── */}
        {editing && (
          <TransactionForm
            key={tx.id || tx.label}
            mode={mode}
            type={live.type}
            prefill={editPrefill}
            rates={window.DEFAULT_RATES}
            onClose={() => setEditing(false)}
            onSubmit={applyEdit}
            submitLabel={T('Guardar cambios')}
          />
        )}

        {/* ── VISTA DE DETALLE (solo lectura) ── */}
        {!editing && (
          <div>
            {/* Hero amount */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: txSoft, marginBottom: 18 }}>
              <div style={{ width: 46, height: 46, borderRadius: 23, background: 'var(--surface-1)', color: txColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-icons" style={{ fontSize: 22 }}>{isTransfer ? 'swap_horiz' : (isIncome ? 'arrow_downward' : 'arrow_outward')}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 28, color: txColor, fontVariantNumeric: 'tabular-nums' }}>
                  {hidden ? '$ ••••••' : `${isTransfer ? '' : (isIncome ? '+' : '−')} $ ${fmtAmt(parseFloat(live.amount) || 0)}`}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>{tx.meta || tx.day}</div>
              </div>
            </div>

            {row(isTransfer ? 'swap_horiz' : (isIncome ? 'south_west' : 'north_east'), T('Tipo'), (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: txColor }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: 'currentColor' }} />{isTransfer ? T('Transferencia') : (isIncome ? T('Ingreso') : T('Gasto'))}
              </span>
            ))}
            {!isTransfer && row('label', T('Categoría'), T(tx.category))}
            {!isTransfer && row('savings', T('Cántaro'), tx.jar ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: tx.jarColor || 'var(--fg-3)' }} />{T(tx.jar)}
              </span>
            ) : T('Sin cántaro'))}
            {isTransfer && isPro && destAcct && row('account_balance_wallet', T('Cuenta destino'), (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: destAcct.color }} />{destAcct.name}
              </span>
            ))}
            {isPro && acct && row('account_balance_wallet', isTransfer ? T('Cuenta origen') : T('Cuenta'), (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: acct.color }} />{acct.name}
              </span>
            ))}
            {tx.commission && row('receipt_long', T('Comisión'), (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--info-soft)', color: 'var(--info-fg)' }}>{T((window.COMMISSION_TYPES.find(c => c.id === tx.commission.type) || {}).label || 'Comisión')}</span>
                <span style={{ fontFamily: 'var(--font-money)' }}>{(window.CURRENCIES[tx.commission.currency] || { symbol: '$' }).symbol} {Number(tx.commission.amount).toFixed(2)}</span>
              </span>
            ))}
            {row('event', T('Fecha'), tx.day)}

            {/* Footer */}
            {!confirmDel ? (
              <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                <PillButton variant="danger" icon="delete_outline" onClick={() => setConfirmDel(true)}>{T('Eliminar')}</PillButton>
                <PillButton variant="ghost" icon="content_copy" onClick={duplicate}>{T('Duplicar')}</PillButton>
                <div style={{ flex: 1 }} />
                <PillButton variant="ghost" onClick={onClose}>{T('Cerrar')}</PillButton>
                <button onClick={() => setEditing(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', padding: '12px 22px', borderRadius: 'var(--radius-pill)', background: accent, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}>
                  <span className="material-icons" style={{ fontSize: 18 }}>edit</span>{T('Editar')}
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--expense-soft)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--expense-fg)', fontWeight: 600, marginBottom: 12 }}>{T('¿Eliminar este movimiento? No se puede deshacer.')}</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <PillButton variant="ghost" onClick={() => setConfirmDel(false)}>{T('Cancelar')}</PillButton>
                  <button onClick={del} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', padding: '12px 22px', borderRadius: 'var(--radius-pill)', background: 'var(--expense)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}>
                    <span className="material-icons" style={{ fontSize: 18 }}>delete</span>{T('Eliminar')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { TransactionDetailModal });
