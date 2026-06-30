/* ─── Transaction Detail / Edit Sheet — Mobile ──────────────────────────
 * Tap any TransactionRow → opens this sheet.
 *   • View mode  — full detail: amount, concept, type, category, account, date
 *   • Edit mode  — inline editable fields (type · amount · concept · category · account · date)
 *   • Delete     — inline confirmation
 *
 * Mutates the shared MOBILE_TX seed in place and asks the Shell to re-render
 * (onSave / onDelete). In a real app these map to PATCH/DELETE /transactions/:id.
 *
 * Props: open · tx · mode('lite'|'pro') · hidden · onClose · onSave · onDelete
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useTxDetailState, useEffect: useTxDetailEffect } = React;

/* Categories the editor offers (current value always included). */
const TX_DETAIL_CATEGORIES = ['Ingreso', 'Supermercado', 'Transporte', 'Vivienda', 'Suscripciones', 'Salud', 'Entretenimiento', 'Educación', 'Deuda', 'Jar', 'Sueño', 'Otro'];

function txAcct(id) { return (window.MOBILE_ACCOUNTS || []).find(a => a.id === id) || null; }

function TransactionDetailSheet({ open, tx, mode = 'lite', hidden = false, onClose, onSave, onDelete }) {
  const isPro = mode === 'pro';
  const [editing, setEditing] = useTxDetailState(false);
  const [confirmDel, setConfirmDel] = useTxDetailState(false);
  const [draft, setDraft] = useTxDetailState(null);

  // (Re)hydrate the draft whenever a new tx is opened.
  useTxDetailEffect(() => {
    setEditing(false);
    setConfirmDel(false);
    if (tx) {
      setDraft({
        type: tx.amount > 0 ? 'income' : 'expense',
        amount: String(Math.abs(tx.amount)),
        label: tx.label,
        category: tx.category,
        acctId: tx.acctId,
        day: tx.day,
      });
    }
  }, [tx]);

  if (!open || !tx || !draft) return null;

  const accent = isPro ? 'var(--info)' : 'var(--brand-primary)';
  const isIncome = draft.type === 'income';
  const txColor = isIncome ? 'var(--income-fg)' : 'var(--expense-fg)';
  const txSoft  = isIncome ? 'var(--income-soft)' : 'var(--expense-soft)';
  const acct = txAcct(draft.acctId);

  const catOptions = [...new Set([draft.category, ...TX_DETAIL_CATEGORIES])];

  const fmtAmt = (n) => Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const save = () => {
    const amt = parseFloat(draft.amount) || 0;
    tx.label    = draft.label.trim() || tx.label;
    tx.category = draft.category;
    tx.acctId   = draft.acctId;
    tx.day      = draft.day.trim() || tx.day;
    tx.amount   = (isIncome ? 1 : -1) * Math.abs(amt);
    setEditing(false);
    onSave && onSave(tx);
  };

  const del = () => { onDelete && onDelete(tx); };

  /* ── shared bits ───────────────────────────────────────────────── */
  const Hero = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '4px 0 18px' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 28, background: txSoft, color: txColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-icons" style={{ fontSize: 26 }}>{isIncome ? 'arrow_downward' : 'arrow_outward'}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 34, color: txColor, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
        {hidden ? '$ ••••••' : `${isIncome ? '+' : '−'} $ ${fmtAmt(parseFloat(draft.amount) || 0)}`}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--fg-1)', textAlign: 'center' }}>
        {editing ? (draft.label || 'Sin concepto') : tx.label}
      </div>
    </div>
  );

  const fieldLabel = (txt) => (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{txt}</span>
  );

  const detailRow = (icon, label, value) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px' }}>
      <span className="material-icons" style={{ fontSize: 19, color: 'var(--fg-3)', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', textAlign: 'right' }}>{value}</span>
    </div>
  );

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-hairline)',
    borderRadius: 'var(--radius-md)', padding: '12px 14px', fontFamily: 'var(--font-body)',
    fontSize: 15, color: 'var(--fg-1)', background: 'var(--surface-2)', outline: 'none',
  };

  return (
    <MobileBottomSheet open={open} onClose={onClose} title={editing ? 'Editar movimiento' : 'Detalle'} maxHeight="90%">
      {Hero}

      {/* ── VIEW MODE ──────────────────────────────────────────── */}
      {!editing && (
        <div>
          <Divider mx={20} />
          {detailRow(isIncome ? 'south_west' : 'north_east', 'Tipo', (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: txColor }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: 'currentColor' }} />
              {isIncome ? 'Ingreso' : 'Gasto'}
            </span>
          ))}
          <Divider mx={20} />
          {detailRow('label', 'Categoría', <MobileChip variant={isIncome ? 'income' : 'default'} size="sm">{tx.category}</MobileChip>)}
          {isPro && acct && (<><Divider mx={20} />{detailRow('account_balance_wallet', 'Cuenta', (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: acct.color }} />
              {acct.name}
            </span>
          ))}</>)}
          {tx.commission && (<><Divider mx={20} />{detailRow('receipt_long', 'Comisión', (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--info-soft)', color: 'var(--info-fg)' }}>{((window.MOBILE_COMMISSION_TYPES || []).find(c => c.id === tx.commission.type) || {}).label || 'Comisión'}</span>
              <span style={{ fontFamily: 'var(--font-money)' }}>$ {Number(tx.commission.amount).toFixed(2)}</span>
            </span>
          ))}</>)}
          <Divider mx={20} />
          {detailRow('event', 'Fecha', tx.day)}
          {tx.time && (<><Divider mx={20} />{detailRow('schedule', 'Hora', tx.time)}</>)}
          <Divider mx={20} />

          {/* Footer actions */}
          {!confirmDel ? (
            <div style={{ display: 'flex', gap: 10, padding: '18px 20px 24px' }}>
              <button onClick={() => setConfirmDel(true)} style={{
                flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 7, border: 0, cursor: 'pointer',
                padding: '13px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--expense-soft)', color: 'var(--expense-fg)',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
              }}>
                <span className="material-icons" style={{ fontSize: 18 }}>delete_outline</span>Eliminar
              </button>
              <button onClick={() => setEditing(true)} style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 0, cursor: 'pointer',
                padding: '13px 18px', borderRadius: 'var(--radius-pill)', background: accent, color: '#fff',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
              }}>
                <span className="material-icons" style={{ fontSize: 18 }}>edit</span>Editar
              </button>
            </div>
          ) : (
            <div style={{ padding: '16px 20px 24px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)', marginBottom: 12, textAlign: 'center' }}>
                ¿Eliminar este movimiento? No se puede deshacer.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmDel(false)} style={{
                  flex: 1, border: '1px solid var(--border-hairline)', background: 'var(--surface-2)', cursor: 'pointer',
                  padding: '13px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)',
                }}>Cancelar</button>
                <button onClick={del} style={{
                  flex: 1, border: 0, background: 'var(--expense)', color: '#fff', cursor: 'pointer',
                  padding: '13px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
                }}>Eliminar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EDIT MODE ──────────────────────────────────────────── */}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 20px 24px' }}>
          {/* Type */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
            {[['expense', 'Gasto', 'arrow_outward', 'var(--expense)'], ['income', 'Ingreso', 'arrow_downward', 'var(--income)']].map(([k, lbl, icon, col]) => {
              const on = draft.type === k;
              return (
                <button key={k} onClick={() => setDraft(d => ({ ...d, type: k }))} style={{
                  flex: 1, border: 0, cursor: 'pointer', padding: '9px 4px', borderRadius: 'var(--radius-pill)',
                  background: on ? 'var(--surface-1)' : 'transparent', color: on ? col : 'var(--fg-2)',
                  fontFamily: 'var(--font-body)', fontWeight: on ? 700 : 500, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  boxShadow: on ? 'var(--shadow-card)' : 'none',
                }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>{icon}</span>{lbl}
                </button>
              );
            })}
          </div>

          {/* Amount */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {fieldLabel('Monto')}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '8px 14px' }}>
              <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 26, color: 'var(--fg-3)' }}>$</span>
              <input type="number" inputMode="decimal" value={draft.amount} onChange={e => setDraft(d => ({ ...d, amount: e.target.value }))}
                style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 26, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
            </div>
          </div>

          {/* Concept */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {fieldLabel('Concepto')}
            <input value={draft.label} onChange={e => setDraft(d => ({ ...d, label: e.target.value }))} placeholder="Ej: Mercado del super" style={inputStyle} />
          </div>

          {/* Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fieldLabel('Categoría')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {catOptions.map(c => {
                const on = draft.category === c;
                return (
                  <button key={c} onClick={() => setDraft(d => ({ ...d, category: c }))} style={{
                    border: 0, cursor: 'pointer', padding: '8px 14px', borderRadius: 'var(--radius-pill)',
                    background: on ? `color-mix(in srgb, ${accent} 14%, var(--surface-1))` : 'var(--surface-2)',
                    color: on ? accent : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: on ? 600 : 500,
                  }}>{c}</button>
                );
              })}
            </div>
          </div>

          {/* Account (Pro) */}
          {isPro && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fieldLabel('Cuenta')}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {(window.MOBILE_ACCOUNTS || []).map(a => {
                  const on = draft.acctId === a.id;
                  return (
                    <button key={a.id} onClick={() => setDraft(d => ({ ...d, acctId: a.id }))} style={{
                      border: on ? `1px solid ${a.color}` : '1px solid var(--border-hairline)', cursor: 'pointer',
                      padding: '8px 12px', borderRadius: 'var(--radius-pill)', background: on ? `color-mix(in srgb, ${a.color} 12%, var(--surface-1))` : 'var(--surface-2)',
                      color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: on ? 600 : 500,
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: 4, background: a.color }} />{a.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {fieldLabel('Fecha')}
            <input value={draft.day} onChange={e => setDraft(d => ({ ...d, day: e.target.value }))} style={inputStyle} />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => { setEditing(false); }} style={{
              flex: 1, border: '1px solid var(--border-hairline)', background: 'var(--surface-2)', cursor: 'pointer',
              padding: '13px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)',
            }}>Cancelar</button>
            <button onClick={save} style={{
              flex: 1, border: 0, background: accent, color: '#fff', cursor: 'pointer',
              padding: '13px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <span className="material-icons" style={{ fontSize: 18 }}>check</span>Guardar
            </button>
          </div>
        </div>
      )}
    </MobileBottomSheet>
  );
}

Object.assign(window, { TransactionDetailSheet });
