/* global React, window */
/* ─── Ledger con selección múltiple ───────────────────────────────────
 *  · Hover sobre una fila → aparece el checkbox de selección.
 *  · Doble clic en la fila → entra en "modo seleccionar varios".
 *  · En modo selección, clic en filas suma sus montos (barra inferior).
 *  · Doble clic sobre la categoría → la fija como filtro (junto al mes).
 * ──────────────────────────────────────────────────────────────────── */

function Checkbox({ checked, dim }) {
  return (
    <span style={{
      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      border: checked ? '2px solid var(--info)' : '2px solid var(--fg-3)',
      background: checked ? 'var(--info)' : 'var(--surface-1)',
      opacity: dim ? 0.6 : 1, transition: 'background 120ms, border-color 120ms',
    }}>
      {checked && <span className="material-icons" style={{ fontSize: 15, color: '#fff' }}>check</span>}
    </span>
  );
}

function LedgerRow({ tx, selectMode, selected, hidden, onEnterSelect, onToggle, onOpen, onFilterCat }) {
  const [hov, setHov] = React.useState(false);
  const clickTimer = React.useRef(null);
  const isIncome = tx.amount > 0;
  const showBox = selectMode || hov;

  const handleClick = () => {
    if (selectMode) { onToggle(tx.id); return; }
    // fuera de modo selección: clic simple abre detalle (con retardo para no chocar con doble clic)
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => onOpen(tx), 220);
  };
  const handleDouble = () => {
    clearTimeout(clickTimer.current);
    onEnterSelect(tx.id);   // entra en modo selección y marca esta fila
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDouble}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      role="button" tabIndex={0}
      style={{
        display: 'grid', gridTemplateColumns: '26px 34px 1fr auto auto', gap: 13,
        alignItems: 'center', cursor: selectMode ? 'pointer' : 'default',
        padding: '11px 18px', borderTop: '1px solid var(--border-hairline)',
        background: selected ? 'color-mix(in srgb, var(--info) 9%, var(--surface-1))'
                  : hov ? 'var(--surface-2)' : 'transparent',
        transition: 'background 130ms',
      }}>

      {/* checkbox slot (visible al hover o en modo selección) */}
      <span
        onClick={(e) => { if (!selectMode) { e.stopPropagation(); onEnterSelect(tx.id); } }}
        title={selectMode ? 'Seleccionar' : 'Seleccionar varios'}
        style={{ display: 'inline-flex', justifyContent: 'center', cursor: 'pointer' }}>
        {showBox
          ? <Checkbox checked={selected} dim={!selected && !selectMode} />
          : <span style={{ width: 20, height: 20 }}></span>}
      </span>

      {/* avatar tipo */}
      <span style={{
        width: 34, height: 34, borderRadius: 'var(--radius-pill)',
        background: isIncome ? 'var(--income-soft)' : 'var(--expense-soft)',
        color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-icons" style={{ fontSize: 18 }}>{isIncome ? 'arrow_downward' : 'arrow_outward'}</span>
      </span>

      {/* concepto */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13.5, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.label}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>{tx.meta}</span>
      </div>

      {/* píldoras: cántaro + categoría (doble clic en categoría = filtrar) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
        {tx.jar && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
            padding: '4px 10px 4px 8px', borderRadius: 'var(--radius-pill)',
            background: 'color-mix(in srgb, ' + tx.jarColor + ' 12%, var(--surface-1))',
            color: 'color-mix(in srgb, ' + tx.jarColor + ' 70%, var(--fg-1))',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: tx.jarColor }}></span>{tx.jar}
          </span>
        )}
        <span
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => { e.stopPropagation(); onFilterCat(tx.category); }}
          title="Doble clic para filtrar por esta categoría"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
            padding: '4px 10px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
            background: 'var(--surface-2)', color: 'var(--fg-2)',
          }}>
          <span className="material-icons" style={{ fontSize: 13, opacity: .7 }}>{tx.catIcon}</span>{tx.category}
        </span>
      </div>

      {/* monto */}
      <span style={{
        fontFamily: 'var(--font-money)', fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 600,
        textAlign: 'right', whiteSpace: 'nowrap',
        color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)',
      }}>{hidden ? '••••' : window.fmtMoney(tx.amount)}</span>
    </div>
  );
}

function TxLedger({ transactions, selectMode, selected, hidden, onEnterSelect, onToggle, onOpen, onFilterCat }) {
  const grouped = transactions.reduce((acc, tx) => { (acc[tx.day] = acc[tx.day] || []).push(tx); return acc; }, {});
  const days = Object.keys(grouped);

  if (transactions.length === 0) {
    return (
      <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-hairline)', padding: '48px 20px', textAlign: 'center' }}>
        <span className="material-icons" style={{ fontSize: 34, color: 'var(--fg-3)' }}>search_off</span>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', marginTop: 8 }}>Ningún movimiento coincide con estos filtros.</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-hairline)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      {days.map((d, i) => {
        const dayTotal = grouped[d].reduce((s, t) => s + t.amount, 0);
        return (
          <div key={d}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px 7px', borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
            }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{d}</span>
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 11.5, fontWeight: 600, color: dayTotal >= 0 ? 'var(--income-fg)' : 'var(--fg-3)' }}>{hidden ? '••' : window.fmtMoney(dayTotal)}</span>
            </div>
            {grouped[d].map(tx => (
              <LedgerRow key={tx.id} tx={tx} selectMode={selectMode} selected={selected.has(tx.id)} hidden={hidden}
                onEnterSelect={onEnterSelect} onToggle={onToggle} onOpen={onOpen} onFilterCat={onFilterCat} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { TxLedger, LedgerRow, Checkbox });
