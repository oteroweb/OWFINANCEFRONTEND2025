/* global React, window */
/* ─── Fila superior · tres pools armónicos ────────────────────────────
 *  [ Filtros activos ]   [ Categorías ]   [ Cántaros ]
 *  · Filtros: mes (fijo) + tipo + categorías + cántaros elegidos.
 *  · Categorías / Cántaros: clic = filtrar (toggle). Se sincronizan con
 *    el pool de filtros y con el doble clic sobre la lista.
 * ──────────────────────────────────────────────────────────────────── */
const ACCENT = 'var(--info)';

function PoolShell({ icon, title, hint, count, children, footer }) {
  return (
    <div style={{
      background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-hairline)', boxShadow: 'var(--shadow-card)',
      padding: 14, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="material-icons" style={{ fontSize: 17, color: ACCENT }}>{icon}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-1)' }}>{title}</span>
        {count != null && (
          <span style={{ fontFamily: 'var(--font-money)', fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', background: 'var(--surface-2)', borderRadius: 999, padding: '1px 7px' }}>{count}</span>
        )}
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-3)' }}>{hint}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignContent: 'flex-start', minHeight: 34 }}>
        {children}
      </div>
      {footer}
    </div>
  );
}

/* chip seleccionable (categoría / cántaro) */
function PickChip({ label, icon, dot, active, count, onToggle }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        padding: '6px 11px', borderRadius: 'var(--radius-pill)', border: '1px solid',
        borderColor: active ? 'transparent' : 'var(--border-hairline)',
        background: active ? 'color-mix(in srgb, var(--info) 14%, var(--surface-1))'
                  : hov ? 'var(--surface-2)' : 'var(--surface-1)',
        color: active ? 'var(--info-fg)' : 'var(--fg-2)',
        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: active ? 700 : 500,
        transition: 'background 130ms, color 130ms',
      }}>
      {dot
        ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }}></span>
        : icon ? <span className="material-icons" style={{ fontSize: 15, color: active ? 'var(--info)' : 'var(--fg-3)' }}>{icon}</span> : null}
      <span>{label}</span>
      {count != null && <span style={{ fontFamily: 'var(--font-money)', fontSize: 10.5, opacity: .65 }}>{count}</span>}
      {active && <span className="material-icons" style={{ fontSize: 14 }}>check</span>}
    </button>
  );
}

/* chip de filtro activo (removible) */
function ActiveChip({ label, icon, dot, locked, onClear }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: locked ? '6px 11px' : '6px 7px 6px 11px',
      borderRadius: 'var(--radius-pill)',
      background: locked ? 'var(--info)' : 'color-mix(in srgb, var(--info) 12%, var(--surface-1))',
      color: locked ? '#fff' : 'var(--info-fg)',
      fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
    }}>
      {dot ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot }}></span>
           : icon ? <span className="material-icons" style={{ fontSize: 14 }}>{icon}</span> : null}
      {label}
      {locked
        ? <span className="material-icons" style={{ fontSize: 13, opacity: .8 }}>lock</span>
        : <span className="material-icons" onClick={onClear} style={{ fontSize: 15, cursor: 'pointer', opacity: .7 }}>close</span>}
    </span>
  );
}

/* chip de categoría dentro de un grupo de cántaro (icono + nombre + monto) */
function CatChip({ cat, color, active, onToggle }) {
  const [hov, setHov] = React.useState(false);
  const tint = (p) => `color-mix(in srgb, ${color} ${p}%, var(--surface-1))`;
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={cat.count + (cat.count === 1 ? ' movimiento' : ' movimientos')}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        padding: '8px 13px', borderRadius: 'var(--radius-pill)', border: '1px solid',
        borderColor: active ? 'transparent' : tint(22),
        background: active ? tint(20) : hov ? tint(12) : tint(8),
        color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: 13,
        fontWeight: active ? 700 : 500, transition: 'background 130ms',
      }}>
      <span className="material-icons" style={{ fontSize: 15, color }}>{cat.icon}</span>
      <span style={{ whiteSpace: 'nowrap' }}>{cat.name}</span>
      <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', whiteSpace: 'nowrap' }}>{window.fmtAbs(cat.amount)}</span>
      {active && <span className="material-icons" style={{ fontSize: 14, color }}>check</span>}
    </button>
  );
}

/* pool de CATEGORÍAS agrupado por cántaro (diseño unificado aprobado) */
function CatPoolGrouped({ catPool, selCats, toggleCat }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px 28px', width: '100%' }}>
      {catPool.map(g => (
        <div key={g.key}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: g.color, flexShrink: 0 }}></span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: g.color }}>{g.short}</span>
            {g.pct != null && <span style={{ fontFamily: 'var(--font-money)', fontSize: 10.5, color: 'var(--fg-3)' }}>{g.pct}%</span>}
            <span style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }}></span>
            <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: 'var(--fg-1)', whiteSpace: 'nowrap' }}>{window.fmtAbs(g.total)}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {g.cats.map(c => (
              <CatChip key={c.name} cat={c} color={g.color}
                active={selCats.includes(c.name)} onToggle={() => toggleCat(c.name)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TxPoolsHeader({
  monthLabel, type, setType,
  cats, catPool, catCount, jars, selCats, selJars, toggleCat, toggleJar, clearFilters, hasFilters,
}) {
  const typeMeta = { all: null, income: { label: 'Ingresos', icon: 'arrow_downward' }, expense: { label: 'Gastos', icon: 'arrow_outward' } };

  return (
    <div className="pools-grid">

      {/* ── Pool 1 · Filtros activos ───────────────────────────── */}
      <PoolShell icon="filter_alt" title="Filtros activos" hint={hasFilters ? '' : 'sólo el mes'}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border-hairline)', paddingTop: 10 }}>
            <div style={{ display: 'inline-flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 3, gap: 2 }}>
              {[['all', 'Todas'], ['income', 'Ingresos'], ['expense', 'Gastos']].map(([id, lbl]) => {
                const on = type === id;
                return (
                  <button key={id} onClick={() => setType(id)} style={{
                    border: 0, cursor: 'pointer', padding: '5px 12px', borderRadius: 'var(--radius-pill)',
                    background: on ? 'var(--info)' : 'transparent', color: on ? '#fff' : 'var(--fg-2)',
                    fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: on ? 700 : 500,
                  }}>{lbl}</button>
                );
              })}
            </div>
            {hasFilters && (
              <button onClick={clearFilters} style={{
                marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, border: 0, cursor: 'pointer',
                padding: '6px 11px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-2)', color: 'var(--fg-2)',
                fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600,
              }}>
                <span className="material-icons" style={{ fontSize: 15 }}>filter_alt_off</span>Limpiar
              </button>
            )}
          </div>
        }>
        <ActiveChip label={monthLabel} icon="calendar_view_month" locked />
        {typeMeta[type] && <ActiveChip label={typeMeta[type].label} icon={typeMeta[type].icon} onClear={() => setType('all')} />}
        {selCats.map(c => <ActiveChip key={'c' + c} label={c} icon={window.CAT_ICON[c] || 'label'} onClear={() => toggleCat(c)} />)}
        {selJars.map(j => <ActiveChip key={'j' + j} label={j} dot={window.JAR_META[j].color} onClear={() => toggleJar(j)} />)}
      </PoolShell>

      {/* ── Pool 2 · Categorías ────────────────────────────────── */}
      <PoolShell icon="sell" title="Categorías" hint="clic para filtrar" count={catCount != null ? catCount : cats.length}>
        {catPool && catPool.length
          ? <CatPoolGrouped catPool={catPool} selCats={selCats} toggleCat={toggleCat} />
          : cats.map(([name, n]) => (
              <PickChip key={name} label={name} icon={window.CAT_ICON[name] || 'label'} count={n}
                active={selCats.includes(name)} onToggle={() => toggleCat(name)} />
            ))}
      </PoolShell>

      {/* ── Pool 3 · Cántaros ──────────────────────────────────── */}
      <PoolShell icon="savings" title="Cántaros" hint="clic para filtrar" count={jars.length}>
        {jars.map(([name, n]) => (
          <PickChip key={name} label={name} dot={window.JAR_META[name] ? window.JAR_META[name].color : 'var(--fg-3)'} count={n}
            active={selJars.includes(name)} onToggle={() => toggleJar(name)} />
        ))}
      </PoolShell>
    </div>
  );
}

Object.assign(window, { TxPoolsHeader, PoolShell, PickChip, ActiveChip, CatChip, CatPoolGrouped, ACCENT });
