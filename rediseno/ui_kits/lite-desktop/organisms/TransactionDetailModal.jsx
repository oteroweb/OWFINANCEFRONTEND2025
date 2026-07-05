/* ─── Transaction Detail / Edit Modal — Desktop (Lite + Pro) ────────────
 * Click any transaction row (Home recents or the ledger) → this opens.
 *   • View mode — full detail: amount, concept, type, category, jar, account, date
 *   • Edit mode — inline editable fields, reusing the kit's form controls
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

function TransactionDetailModal({ open, tx, mode = 'lite', hidden = false, onClose, onChanged }) {
  const isPro = mode === 'pro';
  const isMobile = useViewportMobile();
  const accent = isPro ? 'var(--info)' : 'var(--brand-primary)';

  const [editing, setEditing] = useTxdState(false);
  const [confirmDel, setConfirmDel] = useTxdState(false);
  const [draft, setDraft] = useTxdState(null);

  useTxdEffect(() => {
    setEditing(false); setConfirmDel(false);
    if (tx) setDraft({
      type: tx.amount > 0 ? 'income' : 'expense',
      amount: String(Math.abs(tx.amount)),
      label: tx.label,
      category: tx.category,
      jar: tx.jar || null,
      acctId: tx.acctId,
    });
  }, [tx]);

  useTxdEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open || !tx || !draft) return null;

  const isIncome = draft.type === 'income';
  const txColor = isIncome ? 'var(--income-fg)' : 'var(--expense-fg)';
  const txSoft  = isIncome ? 'var(--income-soft)' : 'var(--expense-soft)';
  const acct = txdAcct(draft.acctId);
  const fmtAmt = (n) => Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const catOptions = (() => {
    const names = (window.SAMPLE_CATEGORIES || []).map(c => c.name);
    return [...new Set([draft.category, ...names])].map(n => ({ value: n, label: window.t ? window.t(n) : n, icon: 'label' }));
  })();
  const jarOptions = [{ value: null, label: window.t ? window.t('Sin cántaro') : 'Sin cántaro' },
    ...(window.SAMPLE_JARS || []).map(j => ({ value: j.name, label: window.t ? window.t(j.name) : j.name, color: j.color }))];
  const acctOptions = (window.SAMPLE_ACCOUNTS || []).map(a => ({ value: a.id, label: a.name, sub: `${a.currency}`, color: a.color }));

  const save = () => {
    const amt = parseFloat(draft.amount) || 0;
    tx.label = draft.label.trim() || tx.label;
    tx.category = draft.category;
    const dj = window.owfJarForCategory ? window.owfJarForCategory(draft.category) : null;
    tx.jar = dj ? dj.name : null;
    tx.jarColor = dj ? dj.color : null;
    tx.acctId = draft.acctId;
    tx.amount = (isIncome ? 1 : -1) * Math.abs(amt);
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
    // Reopen the detail modal on the new copy, straight into edit mode.
    if (window.__owOpenTxDetailDesktop) window.__owOpenTxDetailDesktop(copy);
  };

  const T = (s) => (window.t ? window.t(s) : s);

  const detailRow = (icon, label, value) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: '1px solid var(--border-hairline)' }}>
      <span className="material-icons" style={{ fontSize: 19, color: 'var(--fg-3)', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-2)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', textAlign: 'right' }}>{value}</span>
    </div>
  );

  const width = 520;

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
            <div className="t-h2" style={{ marginTop: 4 }}>{editing ? T('Editar') : (tx.label)}</div>
          </div>
          <IconButton icon="close" ariaLabel="Cerrar" onClick={onClose} />
        </div>

        {/* Hero amount */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: txSoft, marginBottom: 18 }}>
          <div style={{ width: 46, height: 46, borderRadius: 23, background: 'var(--surface-1)', color: txColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span className="material-icons" style={{ fontSize: 22 }}>{isIncome ? 'arrow_downward' : 'arrow_outward'}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 28, color: txColor, fontVariantNumeric: 'tabular-nums' }}>
              {hidden ? '$ ••••••' : `${isIncome ? '+' : '−'} $ ${fmtAmt(parseFloat(draft.amount) || 0)}`}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>{tx.meta || tx.day}</div>
          </div>
        </div>

        {/* ── VIEW MODE ── */}
        {!editing && (
          <div>
            {detailRow(isIncome ? 'south_west' : 'north_east', T('Tipo'), (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: txColor }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: 'currentColor' }} />{isIncome ? T('Ingreso') : T('Gasto')}
              </span>
            ))}
            {detailRow('label', T('Categoría'), T(tx.category))}
            {detailRow('savings', T('Cántaro'), tx.jar ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: tx.jarColor || 'var(--fg-3)' }} />{T(tx.jar)}
              </span>
            ) : T('Sin cántaro'))}
            {isPro && acct && detailRow('account_balance_wallet', T('Cuenta'), (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: acct.color }} />{acct.name}
              </span>
            ))}
            {tx.commission && detailRow('receipt_long', T('Comisión'), (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--info-soft)', color: 'var(--info-fg)' }}>{T((window.COMMISSION_TYPES.find(c => c.id === tx.commission.type) || {}).label || 'Comisión')}</span>
                <span style={{ fontFamily: 'var(--font-money)' }}>{(window.CURRENCIES[tx.commission.currency] || { symbol: '$' }).symbol} {Number(tx.commission.amount).toFixed(2)}</span>
              </span>
            ))}
            {detailRow('event', T('Fecha'), tx.day)}

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

        {/* ── EDIT MODE ── */}
        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Segmented value={draft.type} onChange={v => setDraft(d => ({ ...d, type: v }))}
              accentMap={{ income: 'var(--income)', expense: 'var(--expense)' }}
              options={[{ value: 'expense', label: T('Gasto'), icon: 'arrow_outward' }, { value: 'income', label: T('Ingreso'), icon: 'arrow_downward' }]} />

            <MoneyInput value={draft.amount} onChange={v => setDraft(d => ({ ...d, amount: v }))} currency="USD" accent={accent} />

            <Field label={T('Concepto')}>
              <TextInput value={draft.label} onChange={v => setDraft(d => ({ ...d, label: v }))} placeholder={T('Ej: Mercado del super')} icon="notes" />
            </Field>

            <div style={{ display: 'flex', gap: 14, flexDirection: isMobile ? 'column' : 'row' }}>
              <Field label={T('Categoría')} style={{ flex: 1 }}>
                <CategorySelector
                  value={window.owfCategory ? (window.owfCategory(draft.category) || {}).id ?? null : null}
                  onChange={id => { const c = window.owfCategory && window.owfCategory(id); setDraft(d => ({ ...d, category: c ? c.name : d.category })); }}
                  kind={null} placeholder={T('Categoría')} />
              </Field>
              <Field label={T('Cántaro')} hint={T('Anclado a la categoría')} style={{ flex: 1 }}>
                <TxdAnchoredJar category={draft.category} />
              </Field>
            </div>

            {isPro && (
              <Field label={T('Cuenta')}>
                <Picker value={draft.acctId} onChange={v => setDraft(d => ({ ...d, acctId: v }))} options={acctOptions} />
              </Field>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <PillButton variant="ghost" onClick={() => setEditing(false)}>{T('Cancelar')}</PillButton>
              <button onClick={save} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', padding: '12px 24px', borderRadius: 'var(--radius-pill)', background: accent, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5 }}>
                <span className="material-icons" style={{ fontSize: 19 }}>check</span>{T('Guardar cambios')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { TransactionDetailModal });
