/* ─── Cántaros Mobile — Detalle del cántaro (contenido compartido) ───────
 * Usado por los 3 patrones: acordeón, bottom sheet y pantalla.
 * Props:
 *   jar, expectedIncome, period
 *   update(patch)        → muta el cántaro
 *   onOpenCategories()   → abre el selector de categorías
 *   variant 'inline'|'sheet'|'screen'  → ajustes finos de padding
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useCmDetState } = React;

function cmJarBudget(jar, expectedIncome) {
  return jar.mode === 'fixed' ? (Number(jar.fixed) || 0) : (Number(jar.percent) || 0) / 100 * expectedIncome;
}

function CmDetailLabel({ children, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>{children}</span>
      {hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>{hint}</span>}
    </div>
  );
}

function CmJarDetail({ jar, expectedIncome, update, onOpenCategories, variant = 'sheet' }) {
  const [colorOpen, setColorOpen] = useCmDetState(false);
  const budget = cmJarBudget(jar, expectedIncome);
  const available = budget + (jar.carry === 'accum' ? (jar.carriedIn || 0) : 0);
  const disponible = available - (jar.spent || 0);
  const usedPct = available > 0 ? Math.min(100, (jar.spent || 0) / available * 100) : 0;
  const over = disponible < 0;
  const catIndex = window.CM_CAT_INDEX || {};
  const srcName = (catIndex[jar.source] || {}).name || 'Sin fuente';

  const pad = variant === 'inline' ? 0 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: pad, position: 'relative' }}>

      {/* ── Nombre editable (acordeón / sheet; en 'screen' va en el header) ── */}
      {variant !== 'screen' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: jar.color, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 17, color: '#fff' }}>savings</span></span>
          <input value={jar.name} onChange={e => update({ name: e.target.value })} placeholder="Nombre del cántaro"
            style={{ flex: 1, minWidth: 0, border: 0, borderBottom: '1.5px solid transparent', outline: 'none', background: 'transparent', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)', padding: '2px 0' }}
            onFocus={e => e.target.style.borderBottomColor = 'var(--border-hairline)'} onBlur={e => e.target.style.borderBottomColor = 'transparent'} />
          <CmToggle on={jar.active} onChange={() => update({ active: !jar.active })} />
        </div>
      )}

      {/* ── Tracker DISPONIBLE ── */}
      <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', flexDirection: 'column', gap: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 12, color: '#fff', background: jar.color, padding: '3px 8px', borderRadius: 7 }}>
            {jar.mode === 'fixed' ? `$ ${cmMoney(jar.fixed, 0)}` : `${jar.percent}%`}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>
            {jar.mode === 'fixed'
              ? <>monto fijo mensual</>
              : <><strong style={{ color: 'var(--fg-1)' }}>{jar.percent}%</strong> de $ {cmMoney(expectedIncome, 0)} <span style={{ fontStyle: 'italic' }}>esperado</span> = <strong style={{ color: 'var(--fg-1)' }}>$ {cmMoney(budget)}</strong></>}
          </span>
        </div>

        {/* Barra utilizado */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>Disponible</span>
            <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 22, color: over ? 'var(--expense-fg)' : 'var(--income-fg)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>$ {cmMoney(disponible)}</span>
          </div>
          <div style={{ height: 9, borderRadius: 5, background: 'var(--surface-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: usedPct + '%', borderRadius: 5, background: over ? 'var(--expense)' : usedPct > 85 ? 'var(--warning)' : jar.color, transition: 'width 280ms var(--ease-out)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>
            <span style={{ color: over ? 'var(--expense-fg)' : 'inherit' }}>{Math.round(usedPct)}% utilizado</span>
            <span>$ {cmMoney(budget)} presupuesto{jar.carry === 'accum' && jar.carriedIn ? ` · +$ ${cmMoney(jar.carriedIn)} acum.` : ''}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 3 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-money)', fontSize: 12.5, fontWeight: 600, color: 'var(--expense-fg)', background: 'var(--expense-soft)', padding: '5px 10px', borderRadius: 999 }}>
            <span className="material-icons" style={{ fontSize: 14 }}>south_east</span>$ {cmMoney(jar.spent)} gastado
          </span>
          <button type="button" style={{ marginLeft: 'auto', border: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--brand-primary)' }}>
            Ver desglose<span className="material-icons" style={{ fontSize: 16 }}>expand_more</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 9 }}>
          <CmBtn variant="primary" fullWidth icon="tune" size="sm" onClick={() => {}}>Ajustar</CmBtn>
          <CmBtn variant="ghost" fullWidth icon="post_add" size="sm" onClick={() => {}}>Registrar uso</CmBtn>
        </div>
      </div>

      {/* ── Modo de cálculo ── */}
      <div>
        <CmDetailLabel>Modo de cálculo</CmDetailLabel>
        <CmSeg value={jar.mode} onChange={v => update({ mode: v })}
          options={[{ value: 'percent', label: '% Porcentaje', icon: 'percent' }, { value: 'fixed', label: '$ Monto fijo', icon: 'attach_money', accent: 'var(--info)' }]} />
        {/* Slider + input según modo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
          {jar.mode === 'percent' ? (
            <CmSlider value={jar.percent} onChange={v => update({ percent: v })} color={jar.color} />
          ) : (
            <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>Monto asignado por periodo, independiente del ingreso.</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '8px 11px', width: jar.mode === 'fixed' ? 120 : 92, flexShrink: 0 }}>
            {jar.mode === 'fixed' && <span style={{ fontFamily: 'var(--font-money)', fontSize: 14, color: 'var(--fg-3)' }}>$</span>}
            <input type="number" value={jar.mode === 'fixed' ? jar.fixed : jar.percent}
              onChange={e => update(jar.mode === 'fixed' ? { fixed: e.target.value } : { percent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
              style={{ width: '100%', minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)', textAlign: 'right' }} />
            {jar.mode === 'percent' && <span style={{ fontFamily: 'var(--font-money)', fontSize: 14, color: 'var(--fg-3)' }}>%</span>}
          </div>
        </div>
      </div>

      {/* ── Al cerrar el periodo (reset / acumulativo) ── */}
      <div>
        <CmDetailLabel>Al cerrar el periodo</CmDetailLabel>
        <CmSeg value={jar.carry} onChange={v => update({ carry: v })}
          options={[{ value: 'reset', label: 'Reset', icon: 'restart_alt' }, { value: 'accum', label: 'Acumulativo', icon: 'savings', accent: 'var(--income)' }]} />
        <div style={{ display: 'flex', gap: 8, marginTop: 11, padding: '11px 13px', borderRadius: 'var(--radius-md)', background: jar.carry === 'accum' ? 'var(--income-soft)' : 'var(--surface-2)' }}>
          <span className="material-icons" style={{ fontSize: 18, color: jar.carry === 'accum' ? 'var(--income-fg)' : 'var(--fg-3)', flexShrink: 0, marginTop: 1 }}>{jar.carry === 'accum' ? 'all_inclusive' : 'restart_alt'}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.45, color: 'var(--fg-1)' }}>
            {jar.carry === 'accum'
              ? <><strong>Acumula el remanente.</strong> Lo que no gastes (o el excedente) se arrastra al próximo periodo y se suma al presupuesto.</>
              : <><strong>Se reinicia cada periodo.</strong> El contador vuelve a empezar sin importar cuánto gastaste; no se arrastra saldo.</>}
          </span>
        </div>
      </div>

      {/* ── Fuente (apalancamiento) ── */}
      <div>
        <CmDetailLabel hint="Ingreso que lo alimenta">Apalancamiento de</CmDetailLabel>
        <button type="button" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: 0, cursor: 'pointer', textAlign: 'left' }}>
          <span className="material-icons" style={{ fontSize: 19, color: 'var(--income-fg)' }}>{(catIndex[jar.source] || {}).icon || 'work'}</span>
          <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{srcName}</span>
          <span className="material-icons" style={{ fontSize: 20, color: 'var(--fg-3)' }}>unfold_more</span>
        </button>
      </div>

      {/* ── Categorías vinculadas ── */}
      <div>
        <CmDetailLabel hint={`${(jar.categories || []).length} vinculada${(jar.categories || []).length === 1 ? '' : 's'}`}>Categorías de gasto</CmDetailLabel>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {(jar.categories || []).map(id => catIndex[id] && (
            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 9px 6px 11px', borderRadius: 999, background: jar.color, color: '#fff', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>
              {catIndex[id].name}
              <button type="button" onClick={() => update({ categories: jar.categories.filter(x => x !== id) })} style={{ border: 0, background: 'rgba(255,255,255,0.25)', cursor: 'pointer', width: 16, height: 16, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <span className="material-icons" style={{ fontSize: 12 }}>close</span>
              </button>
            </span>
          ))}
          <button type="button" onClick={onOpenCategories} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 999, border: '1px dashed var(--border-hairline)', background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>
            <span className="material-icons" style={{ fontSize: 15 }}>add</span>{(jar.categories || []).length ? 'Editar' : 'Añadir categorías'}
          </button>
        </div>
      </div>

      {/* ── Color + eliminar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 2 }}>
        <button type="button" onClick={() => setColorOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-2)', border: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>
          <span style={{ width: 16, height: 16, borderRadius: 5, background: jar.color }} />Color
        </button>
        {colorOpen && <CmColorPicker value={jar.color} onChange={c => update({ color: c })} onClose={() => setColorOpen(false)} />}
      </div>
    </div>
  );
}

Object.assign(window, { CmJarDetail, cmJarBudget, CmDetailLabel });
