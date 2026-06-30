/* ─── Cántaros Mobile — Pantalla principal + 3 patrones de detalle ───────
 * CmCantarosScreen: header, barra de distribución, periodo, lista de filas
 * reordenables (drag), footer. El detalle se abre en: acordeón | sheet |
 * pantalla, según el tweak `detailPattern`.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useCmScrState } = React;

/* ── Status bar mínima ── */
function CmStatusBar() {
  return (
    <div style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 26px 6px', background: 'var(--bg-canvas)' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-1)' }}>
        <span className="material-icons" style={{ fontSize: 16 }}>signal_cellular_alt</span>
        <span className="material-icons" style={{ fontSize: 16 }}>wifi</span>
        <span className="material-icons" style={{ fontSize: 18 }}>battery_full</span>
      </div>
    </div>
  );
}

/* ── Fila colapsada de un cántaro ── */
function CmJarRow({ jar, expectedIncome, expanded, onToggleExpand, onOpen, update, onOpenCategories,
                    pattern, dragHandlers, isDragging, isDropTarget }) {
  const budget = cmJarBudget(jar, expectedIncome);
  const available = budget + (jar.carry === 'accum' ? (jar.carriedIn || 0) : 0);
  const usedPct = available > 0 ? Math.min(100, (jar.spent || 0) / available * 100) : 0;
  const over = (available - (jar.spent || 0)) < 0;
  const dim = !jar.active;

  const openDetail = () => { if (pattern === 'inline') onToggleExpand(); else onOpen(); };

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)', background: 'var(--surface-1)',
      boxShadow: isDragging ? 'var(--shadow-float)' : 'var(--shadow-card)',
      border: isDropTarget ? '1.5px dashed var(--brand-primary)' : '1.5px solid transparent',
      opacity: isDragging ? 0.6 : 1, overflow: 'hidden',
      transition: 'box-shadow 160ms, border-color 120ms',
    }}>
      {/* Cabecera de la fila */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px' }}>
        {/* Drag handle */}
        <div {...dragHandlers} style={{ cursor: 'grab', color: 'var(--fg-3)', display: 'flex', flexShrink: 0, touchAction: 'none', padding: '2px 0' }} title="Arrastra para reordenar">
          <span className="material-icons" style={{ fontSize: 20 }}>drag_indicator</span>
        </div>
        {/* Color + tap zone */}
        <button type="button" onClick={openDetail} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 11, border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: jar.color, opacity: dim ? 0.4 : 1, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 18, color: '#fff' }}>savings</span>
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5, color: dim ? 'var(--fg-2)' : 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{jar.name}</span>
              {!jar.active && <CmTag>Inactivo</CmTag>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
              {jar.carry === 'accum' ? <CmTag icon="all_inclusive" tone="accum">Acumula</CmTag> : <CmTag icon="restart_alt" tone="reset">Reset</CmTag>}
              {jar.mode === 'fixed' ? <CmTag icon="attach_money" tone="fixed">Fijo</CmTag> : null}
              {over && <CmTag icon="error" tone="over">Excedido</CmTag>}
            </div>
          </div>
        </button>
        {/* Valor + toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 17, color: dim ? 'var(--fg-3)' : 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>
            {jar.mode === 'fixed' ? `$${cmMoney(jar.fixed, 0)}` : `${jar.percent}%`}
          </span>
          <CmToggle on={jar.active} onChange={() => update({ active: !jar.active })} />
        </div>
        {/* Expand chevron */}
        <button type="button" onClick={openDetail} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', flexShrink: 0, padding: 2 }}>
          <span className="material-icons" style={{ fontSize: 22, transition: 'transform 200ms', transform: (pattern === 'inline' && expanded) ? 'rotate(180deg)' : 'none' }}>
            {pattern === 'inline' ? 'expand_more' : 'chevron_right'}
          </span>
        </button>
      </div>

      {/* Barra de uso fina */}
      <div style={{ padding: '0 14px 12px' }}>
        <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: usedPct + '%', borderRadius: 3, background: dim ? 'var(--surface-3)' : over ? 'var(--expense)' : usedPct > 85 ? 'var(--warning)' : jar.color, transition: 'width 280ms var(--ease-out)' }} />
        </div>
      </div>

      {/* Acordeón inline */}
      {pattern === 'inline' && expanded && (
        <div style={{ padding: '4px 16px 18px', borderTop: '1px solid var(--border-hairline)', marginTop: 2 }}>
          <div style={{ height: 8 }} />
          <CmJarDetail jar={jar} expectedIncome={expectedIncome} update={update} onOpenCategories={onOpenCategories} variant="inline" />
        </div>
      )}
    </div>
  );
}

/* ── Pantalla principal ── */
function CmCantarosScreen({ detailPattern = 'sheet', expectedIncome = 1200, onBack }) {
  const [jars, setJars] = useCmScrState(() => (window.CM_JARS || []).map(j => ({ ...j })));
  const [period, setPeriod] = useCmScrState('Mensual');
  const [expandedId, setExpandedId] = useCmScrState(null);
  const [openId, setOpenId] = useCmScrState(null);          // sheet / screen
  const [catFor, setCatFor] = useCmScrState(null);          // jar id para selector de categorías
  const [dragIndex, setDragIndex] = useCmScrState(null);
  const [overIndex, setOverIndex] = useCmScrState(null);

  const update = (id, patch) => setJars(js => js.map(j => j.id === id ? { ...j, ...patch } : j));
  const remove = (id) => { setJars(js => js.filter(j => j.id !== id)); setOpenId(null); setExpandedId(null); };
  const addJar = () => {
    const id = 'new-' + Date.now();
    setJars(js => [...js, { id, name: 'Nuevo cántaro', color: '#64748B', active: true, mode: 'percent', carry: 'reset', percent: 0, fixed: 0, source: 'salario', categories: [], spent: 0, carriedIn: 0 }]);
    if (detailPattern === 'inline') setExpandedId(id); else setOpenId(id);
  };

  /* Drag reorder (HTML5) */
  const onDragStart = (i) => (e) => { setDragIndex(i); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(i)); } catch (_) {} };
  const onDragEnter = (i) => () => { if (dragIndex === null || dragIndex === i) return; setOverIndex(i); };
  const onDrop = () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) { setDragIndex(null); setOverIndex(null); return; }
    setJars(js => { const next = [...js]; const [moved] = next.splice(dragIndex, 1); next.splice(overIndex, 0, moved); return next; });
    setDragIndex(null); setOverIndex(null);
  };
  const onDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  /* Totales */
  const activePct = jars.filter(j => j.active && j.mode === 'percent').reduce((s, j) => s + (Number(j.percent) || 0), 0);
  const fixedTotal = jars.filter(j => j.active && j.mode === 'fixed').reduce((s, j) => s + (Number(j.fixed) || 0), 0);
  const over100 = activePct > 100;
  const exact = activePct === 100;

  /* Segmentos para barra de distribución */
  const segments = jars.map(j => ({
    color: j.color, dim: !j.active,
    value: j.mode === 'fixed' ? cmJarBudget(j, expectedIncome) : (Number(j.percent) || 0) / 100 * expectedIncome,
    label: j.name,
  }));

  const openJar = jars.find(j => j.id === openId);
  const catJar = jars.find(j => j.id === catFor);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-canvas)', position: 'relative' }}>
      <CmStatusBar />

      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px 12px' }}>
        <button type="button" onClick={onBack} style={{ border: 0, background: 'var(--surface-1)', cursor: 'pointer', width: 38, height: 38, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-1)', boxShadow: 'var(--shadow-card)' }}>
          <span className="material-icons" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--fg-1)' }}>Mis cántaros</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>Distribuye tu ingreso por frascos</div>
        </div>
        <button type="button" onClick={addJar} style={{ border: 0, background: 'var(--brand-primary)', cursor: 'pointer', height: 38, borderRadius: 19, padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: 5, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>
          <span className="material-icons" style={{ fontSize: 19 }}>add</span>Añadir
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', minHeight: 0 }}>
        {/* Resumen: barra de distribución + total */}
        <div style={{ margin: '0 14px 14px', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>Distribución</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: over100 ? 'var(--expense-fg)' : exact ? 'var(--income-fg)' : 'var(--fg-1)' }}>
              {over100 && <span className="material-icons" style={{ fontSize: 16 }}>error</span>}
              {exact && <span className="material-icons" style={{ fontSize: 16 }}>check_circle</span>}
              Total {activePct}%
            </span>
          </div>
          <CmMiniBar segments={segments} height={16} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 18 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activos</div>
                <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{jars.filter(j => j.active).length}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sin asignar</div>
                <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: over100 ? 'var(--expense-fg)' : 'var(--fg-1)' }}>{Math.max(0, 100 - activePct)}%</div>
              </div>
              {fixedTotal > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fijo</div>
                  <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--info-fg)' }}>${cmMoney(fixedTotal, 0)}</div>
                </div>
              )}
            </div>
          </div>
          {over100 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '9px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--expense-soft)' }}>
              <span className="material-icons" style={{ fontSize: 16, color: 'var(--expense-fg)' }}>error</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-1)' }}>Tus porcentajes suman más de 100%. Ajusta antes de guardar.</span>
            </div>
          )}
        </div>

        {/* Periodo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px 12px' }}>
          <div style={{ flex: 1, display: 'flex', gap: 7, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
            {(window.CM_PERIODS || []).map(p => {
              const on = period === p;
              return (
                <button key={p} type="button" onClick={() => setPeriod(p)} style={{
                  flexShrink: 0, border: 0, cursor: 'pointer', padding: '7px 13px', borderRadius: 999,
                  background: on ? 'var(--brand-primary)' : 'var(--surface-1)', color: on ? '#fff' : 'var(--fg-2)',
                  fontFamily: 'var(--font-body)', fontWeight: on ? 700 : 600, fontSize: 12.5, boxShadow: on ? 'none' : 'var(--shadow-card)',
                }}>{p}</button>
              );
            })}
          </div>
        </div>

        {/* Lista de cántaros */}
        <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 10 }} onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
          {jars.map((jar, i) => (
            <div key={jar.id}
              draggable={false}
              onDragEnter={onDragEnter(i)}
              onDragEnd={onDragEnd}
              style={{ transition: 'transform 160ms' }}>
              <CmJarRow
                jar={jar} expectedIncome={expectedIncome}
                pattern={detailPattern}
                expanded={expandedId === jar.id}
                onToggleExpand={() => setExpandedId(id => id === jar.id ? null : jar.id)}
                onOpen={() => setOpenId(jar.id)}
                update={(patch) => update(jar.id, patch)}
                onOpenCategories={() => setCatFor(jar.id)}
                isDragging={dragIndex === i}
                isDropTarget={overIndex === i && dragIndex !== i}
                dragHandlers={{
                  draggable: true,
                  onDragStart: onDragStart(i),
                  onDragEnd: onDragEnd,
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ padding: '14px' }}>
          <button type="button" onClick={addJar} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1.5px dashed var(--border-hairline)', background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, padding: '14px', borderRadius: 'var(--radius-lg)' }}>
            <span className="material-icons" style={{ fontSize: 19 }}>add</span>Añadir cántaro
          </button>
        </div>

        <div style={{ height: 92 }} />
      </div>

      {/* Footer fijo: aplicar plantilla + guardar */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 10, padding: '12px 14px calc(14px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-1)' }}>
        <CmBtn variant="soft" icon="dashboard_customize" onClick={() => {}}>Plantilla</CmBtn>
        <CmBtn variant="primary" fullWidth icon="check" onClick={() => {}}>Guardar cambios</CmBtn>
      </div>

      {/* ── Patrón SHEET ── */}
      {detailPattern === 'sheet' && openJar && (
        <CmJarDetailSheet jar={openJar} expectedIncome={expectedIncome}
          update={(patch) => update(openJar.id, patch)}
          onOpenCategories={() => setCatFor(openJar.id)}
          onRemove={() => remove(openJar.id)}
          onClose={() => setOpenId(null)} />
      )}

      {/* ── Patrón SCREEN ── */}
      {detailPattern === 'screen' && openJar && (
        <CmJarDetailScreen jar={openJar} expectedIncome={expectedIncome}
          update={(patch) => update(openJar.id, patch)}
          onOpenCategories={() => setCatFor(openJar.id)}
          onRemove={() => remove(openJar.id)}
          onClose={() => setOpenId(null)} />
      )}

      {/* Selector de categorías (compartido por los 3 patrones) */}
      <CmCategorySheet open={!!catJar} jar={catJar} selected={catJar ? catJar.categories : []}
        onClose={() => setCatFor(null)}
        onApply={(cats) => { if (catJar) update(catJar.id, { categories: cats }); setCatFor(null); }} />
    </div>
  );
}

/* ── Wrapper SHEET ── */
function CmJarDetailSheet({ jar, expectedIncome, update, onOpenCategories, onRemove, onClose }) {
  return (
    <CmSheet open onClose={onClose} title={jar.name}
      subtitle={jar.mode === 'fixed' ? 'Monto fijo' : `${jar.percent}% del ingreso`}
      headerRight={(
        <button onClick={onRemove} style={{ border: 0, background: 'var(--expense-soft)', cursor: 'pointer', width: 30, height: 30, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--expense-fg)' }}>
          <span className="material-icons" style={{ fontSize: 17 }}>delete</span>
        </button>
      )}>
      <div style={{ padding: '6px 18px 22px' }}>
        <CmJarDetail jar={jar} expectedIncome={expectedIncome} update={update} onOpenCategories={onOpenCategories} variant="sheet" />
      </div>
    </CmSheet>
  );
}

/* ── Wrapper SCREEN (full push) ── */
function CmJarDetailScreen({ jar, expectedIncome, update, onOpenCategories, onRemove, onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', animation: 'cmSlideIn 260ms var(--ease-out)' }}>
      <style>{`@keyframes cmSlideIn{from{transform:translateX(28px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <CmStatusBar />
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px 12px' }}>
        <button type="button" onClick={onClose} style={{ border: 0, background: 'var(--surface-1)', cursor: 'pointer', width: 38, height: 38, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-1)', boxShadow: 'var(--shadow-card)' }}>
          <span className="material-icons" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: jar.color, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 17, color: '#fff' }}>savings</span></span>
          <input value={jar.name} onChange={e => update({ name: e.target.value })} style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }} />
        </div>
        <button type="button" onClick={onRemove} style={{ border: 0, background: 'var(--expense-soft)', cursor: 'pointer', width: 38, height: 38, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--expense-fg)' }}>
          <span className="material-icons" style={{ fontSize: 20 }}>delete</span>
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '6px 16px 28px', minHeight: 0 }}>
        <CmJarDetail jar={jar} expectedIncome={expectedIncome} update={update} onOpenCategories={onOpenCategories} variant="screen" />
      </div>
    </div>
  );
}

Object.assign(window, { CmCantarosScreen, CmJarRow, CmStatusBar });
