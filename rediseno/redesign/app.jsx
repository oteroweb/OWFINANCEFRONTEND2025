/* global React, ReactDOM, window */
/* ─── App · Transacciones Pro (redesign / staging) ───────────────────── */
const { useState, useMemo } = React;
const MONTH_LABEL = 'Mayo 2026';

function App() {
  const TX = window.TX;
  const [type, setType]       = useState('all');
  const [selCats, setSelCats] = useState([]);
  const [selJars, setSelJars] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected]     = useState(() => new Set());
  const [hidden]              = useState(false);
  const [toast, setToast]     = useState(null);

  const flash = (msg) => { setToast(msg); clearTimeout(window.__t); window.__t = setTimeout(() => setToast(null), 2200); };

  // catálogos con conteo
  const cats = useMemo(() => {
    const m = {}; TX.forEach(t => { m[t.category] = (m[t.category] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [TX]);
  const jars = useMemo(() => {
    const m = {}; TX.forEach(t => { if (t.jar) m[t.jar] = (m[t.jar] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [TX]);

  const toggleCat = (c) => setSelCats(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c]);
  const toggleJar = (j) => setSelJars(s => s.includes(j) ? s.filter(x => x !== j) : [...s, j]);
  const clearFilters = () => { setType('all'); setSelCats([]); setSelJars([]); };
  const hasFilters = type !== 'all' || selCats.length > 0 || selJars.length > 0;

  const filtered = useMemo(() => TX.filter(t => {
    if (type === 'income'  && !(t.amount > 0)) return false;
    if (type === 'expense' && !(t.amount < 0)) return false;
    if (selCats.length && !selCats.includes(t.category)) return false;
    if (selJars.length && !(t.jar && selJars.includes(t.jar))) return false;
    return true;
  }), [TX, type, selCats, selJars]);

  // selección múltiple
  const enterSelect = (id) => { setSelectMode(true); setSelected(new Set([id])); };
  const toggleSel = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const exitSelect = () => { setSelectMode(false); setSelected(new Set()); };
  const selectAllVisible = () => setSelected(new Set(filtered.map(t => t.id)));

  const onFilterCat = (c) => { if (!selCats.includes(c)) { toggleCat(c); flash('Categoría «' + c + '» añadida al filtro'); } };
  const onOpen = (tx) => flash('Abrir detalle · ' + tx.label);

  const selSum   = filtered.filter(t => selected.has(t.id)).reduce((s, t) => s + t.amount, 0);
  const selCount = [...selected].filter(id => filtered.some(t => t.id === id)).length;
  const total    = filtered.reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 28px 120px' }}>

      {/* encabezado */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--info)' }}>Transacciones · Pro</div>
          <h1 style={{ margin: '6px 0 0', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em', color: 'var(--fg-1)' }}>{MONTH_LABEL}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>
            <b style={{ color: 'var(--fg-1)' }}>{filtered.length}</b> movimientos · neto{' '}
            <b style={{ fontFamily: 'var(--font-money)', color: total >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)' }}>{window.fmtMoney(total)}</b>
          </span>
          {!selectMode && (
            <button onClick={() => setSelectMode(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--border-hairline)', cursor: 'pointer',
              padding: '8px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', color: 'var(--fg-1)',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            }}>
              <span className="material-icons" style={{ fontSize: 17 }}>checklist</span>Seleccionar
            </button>
          )}
        </div>
      </div>

      {/* fila superior · tres pools */}
      <TxPoolsHeader
        monthLabel={MONTH_LABEL} type={type} setType={setType}
        cats={cats} jars={jars} selCats={selCats} selJars={selJars}
        toggleCat={toggleCat} toggleJar={toggleJar} clearFilters={clearFilters} hasFilters={hasFilters} />

      {/* ledger */}
      <div style={{ marginTop: 20 }}>
        <TxLedger
          transactions={filtered} selectMode={selectMode} selected={selected} hidden={hidden}
          onEnterSelect={enterSelect} onToggle={toggleSel} onOpen={onOpen} onFilterCat={onFilterCat} />
      </div>

      {/* barra de suma (modo selección) */}
      {selectMode && (
        <div style={{
          position: 'fixed', left: '50%', bottom: 22, transform: 'translateX(-50%)', zIndex: 200,
          display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px 12px 20px',
          background: 'var(--fg-1)', color: 'var(--surface-1)', borderRadius: 'var(--radius-pill)',
          boxShadow: '0 18px 50px rgba(15,23,42,.34)', maxWidth: '94vw',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-icons" style={{ fontSize: 20, opacity: .8 }}>checklist</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600 }}>
              {selCount} {selCount === 1 ? 'seleccionada' : 'seleccionadas'}
            </span>
          </div>
          <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.2)' }}></span>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, opacity: .6, textTransform: 'uppercase', letterSpacing: '.08em' }}>Suma</span>
            <span style={{ fontFamily: 'var(--font-money)', fontVariantNumeric: 'tabular-nums', fontSize: 19, fontWeight: 700, color: selSum >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)' }}>
              {selCount === 0 ? '—' : window.fmtMoney(selSum)}
            </span>
          </div>
          <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.2)' }}></span>
          <button onClick={selectAllVisible} style={pillBtn('rgba(255,255,255,.12)', 'var(--surface-1)')}>Todas</button>
          <button onClick={exitSelect} style={pillBtn('var(--info)', '#fff')}>
            <span className="material-icons" style={{ fontSize: 16 }}>check</span>Listo
          </button>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div style={{
          position: 'fixed', left: '50%', top: 64, transform: 'translateX(-50%)', zIndex: 300,
          padding: '10px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--fg-1)', color: 'var(--surface-1)',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, boxShadow: '0 12px 34px rgba(15,23,42,.3)',
        }}>{toast}</div>
      )}
    </div>
  );
}

function pillBtn(bg, fg) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, cursor: 'pointer',
    padding: '8px 14px', borderRadius: 'var(--radius-pill)', background: bg, color: fg,
    fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700,
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
