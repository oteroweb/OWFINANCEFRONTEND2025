/* ─── JarsProEditor — editor completo de "Mis Cántaros" + panel de
 * Categorías (columna derecha). Ensambla la pantalla Pro de Cántaros
 * junto con JarsProConfig.jsx (KPI bar · resumen · tabla · config global).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useJeState } = React;

const JE_PALETTE = ['#1E3A8A', '#2D4DA6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#0EA5E9', '#F97316', '#64748B'];

function jeTint(c, p) { return `color-mix(in srgb, ${c} ${p}%, var(--surface-1))`; }

/* ── Fila editable de un cántaro (Mis Cántaros) ── */
function JarsFullEditorRow({ jar, jars, onUpdate, onDelete, expanded, onToggleExpand, expectedIncome, accounts }) {
  const [colorOpen, setColorOpen] = useJeState(false);
  const [advOpen, setAdvOpen] = useJeState(false);
  const [dragOver, setDragOver] = useJeState(false);
  const [adjustOpen, setAdjustOpen] = useJeState(false);
  const [useOpen, setUseOpen] = useJeState(false);
  const [desgloseOpen, setDesgloseOpen] = useJeState(false);
  const [deleteConfirm, setDeleteConfirm] = useJeState(false);
  const [, forceJe] = useJeState(0);
  React.useEffect(() => window.OwCategoryStore.subscribe(() => forceJe(n => n + 1)), []);
  const upd = (patch) => onUpdate({ ...jar, ...patch });
  const myCats = (window.OwCategoryStore ? window.OwCategoryStore.getAll() : (window.OWF_CATEGORIES || [])).filter(c => window.OwCategoryStore.getJarId(c) === jar.id);
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const catId = Number(e.dataTransfer.getData('text/plain')); if (catId) window.OwCategoryStore.setJarId(catId, jar.id); };

  const asignado = expectedIncome * (jar.percent || 0) / 100;
  const gastado = jar.gastado || 0;
  const disponible = asignado - gastado;
  const usedPct = asignado > 0 ? Math.min(100, Math.round(gastado / asignado * 100)) : 0;
  const linkedAccount = accounts.find(a => a.id === jar.linkedAccountId);

  const Seg = ({ options, value, onChange }) => (
    <div style={{ display: 'inline-flex', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', flexShrink: 0 }}>
      {options.map(([id, label]) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          style={{ border: 0, cursor: 'pointer', padding: '7px 12px', background: value === id ? 'var(--brand-primary)' : 'var(--surface-2)', color: value === id ? '#fff' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div onDragOver={onDragOver} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
      style={{ border: dragOver ? `2px dashed ${jar.color}` : `1.5px solid ${jeTint(jar.color, 45)}`, borderRadius: 'var(--radius-md)', padding: 13, display: 'flex', flexDirection: 'column', gap: 10, background: dragOver ? jeTint(jar.color, 16) : 'var(--surface-1)', transition: 'background 120ms, border-color 120ms' }}>
      {/* Row 1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)', cursor: 'grab' }}>drag_indicator</span>
        <input value={jar.name} onChange={e => upd({ name: e.target.value })} placeholder={t('Nombre del cántaro')}
          style={{ ...window.FC_INPUT_STYLE, flex: '1 1 160px', minWidth: 0, padding: '9px 11px' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
        <button type="button" onClick={() => upd({ active: !jar.active })} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 0, background: 'transparent', cursor: 'pointer', flexShrink: 0 }}>
          <span style={{ width: 34, height: 20, borderRadius: 999, background: jar.active !== false ? 'var(--income-fg)' : 'var(--surface-3)', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 2, left: jar.active !== false ? 16 : 2, width: 16, height: 16, borderRadius: 999, background: '#fff', transition: 'left 150ms' }} />
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, color: 'var(--fg-2)' }}>{t('Activo')}</span>
        </button>
        <Seg options={[['reset', t('Reset')], ['acumulativo', t('Acumulativo')]]} value={jar.mode || 'reset'} onChange={v => upd({ mode: v })} />
        <Seg options={[['percent', t('% Porcentaje')], ['fixed', t('$ Monto Fijo')]]} value={jar.unit || 'percent'} onChange={v => upd({ unit: v })} />
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button type="button" onClick={() => setColorOpen(o => !o)} style={{ width: 30, height: 30, borderRadius: 9, background: jar.color, border: 0, cursor: 'pointer' }} aria-label={t('Color')} />
          {colorOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 40, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-popover)', padding: 8, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {JE_PALETTE.map(c => <button key={c} type="button" onClick={() => { upd({ color: c }); setColorOpen(false); }} style={{ width: 22, height: 22, borderRadius: 6, background: c, border: jar.color === c ? '2px solid var(--fg-1)' : '2px solid transparent', cursor: 'pointer' }} />)}
            </div>
          )}
        </div>
      </div>

      {/* Row 2 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => { if (myCats.length && !deleteConfirm) { setDeleteConfirm(true); return; } onDelete(jar.id); }} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--expense-fg)', display: 'flex', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 18 }}>delete</span></button>
        <button type="button" onClick={onToggleExpand} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 20 }}>{expanded ? 'expand_less' : 'expand_more'}</span></button>
        {jar.unit === 'fixed' ? (
          <input type="number" value={jar.fixedAmount || 0} onChange={e => upd({ fixedAmount: e.target.value })} style={{ ...window.FC_INPUT_STYLE, flex: 1, minWidth: 100, padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
        ) : (
          <input type="range" min="0" max="100" value={jar.percent || 0} onChange={e => upd({ percent: Number(e.target.value) })} style={{ flex: 1, minWidth: 100 }} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, ...window.FC_INPUT_STYLE, width: 70, flexShrink: 0, padding: '8px 9px' }}>
          <input type="number" value={jar.percent || 0} onChange={e => upd({ percent: Number(e.target.value) || 0 })} style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 13, color: 'var(--fg-1)', textAlign: 'right' }} />
          <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, color: 'var(--fg-3)' }}>%</span>
        </div>
        <select value={jar.leverageJarId || ''} onChange={e => upd({ leverageJarId: e.target.value })} style={{ ...window.FC_INPUT_STYLE, flexShrink: 0, minWidth: 150, padding: '9px 11px', fontSize: 12 }}>
          <option value="">{t('Apalancamiento …')}</option>
          {jars.filter(j => j.id !== jar.id).map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
      </div>

      <textarea value={jar.description || ''} placeholder={t('Propósito (opcional)')} rows={1} onChange={e => upd({ description: e.target.value })}
        style={{ ...window.FC_INPUT_STYLE, resize: 'vertical', minHeight: 38, padding: '9px 11px', fontFamily: 'var(--font-body)' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />

      {deleteConfirm && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--expense-soft)' }}>
          <span className="material-icons" style={{ fontSize: 17, color: 'var(--expense-fg)' }}>warning</span>
          <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-1)' }}>{t('Este cántaro tiene')} {myCats.length} {t('categoría(s) vinculada(s). Al eliminarlo quedarán sin cántaro.')}</span>
          <button type="button" onClick={() => setDeleteConfirm(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>{t('Cancelar')}</button>
          <button type="button" onClick={() => onDelete(jar.id)} style={{ border: 0, background: 'var(--expense)', color: '#fff', cursor: 'pointer', padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700 }}>{t('Eliminar')}</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.03em', color: 'var(--fg-3)', marginRight: 2 }}>{myCats.length} {t('categorías')}</span>
        {myCats.map(c => (
          <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999, background: 'color-mix(in srgb, ' + window.OwCategoryStore.getColor(c) + ' 16%, var(--surface-1))', border: '1px solid color-mix(in srgb, ' + window.OwCategoryStore.getColor(c) + ' 36%, var(--surface-1))', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-1)' }}>
            <span style={{ width: 7, height: 7, borderRadius: 3, background: window.OwCategoryStore.getColor(c), flexShrink: 0 }} />{t(window.OwCategoryStore.getName(c))}
          </span>
        ))}
        {myCats.length === 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)', fontStyle: 'italic' }}>{t('Arrastra una categoría aquí desde el panel derecho')}</span>}
      </div>

      {expanded && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{jar.name}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 9px', borderRadius: 999, background: 'var(--surface-3, var(--surface-1))', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)' }}>{jar.percent}%</span>
            <span style={{ padding: '3px 9px', borderRadius: 999, background: 'var(--surface-3, var(--surface-1))', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{jar.percent}% {t('de')} {jpMoneySafe(expectedIncome)} {t('ingreso esperado')} = {jpMoneySafe(asignado)}</span>
            {jar.mode === 'acumulativo' && <span style={{ padding: '3px 9px', borderRadius: 999, background: 'var(--info-soft)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--info)' }}>{t('Acumulativo')}</span>}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-3)' }}>{t('DISPONIBLE')}</span>
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 20, fontWeight: 800, color: disponible < 0 ? 'var(--expense-fg)' : 'var(--fg-1)' }}>{disponible < 0 ? '-' : ''}{jpMoneySafe(Math.abs(disponible))}</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-1)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${usedPct}%`, background: disponible < 0 ? 'var(--expense)' : jar.color }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: disponible < 0 ? 'var(--expense-fg)' : 'var(--fg-2)' }}>
              <span>{usedPct}% {t('utilizado')}{disponible < 0 ? ` — ${t('excedido')} ${jpMoneySafe(Math.abs(disponible))}` : ''}</span>
              <span>{jpMoneySafe(asignado)} {t('presupuesto')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '5px 11px', borderRadius: 999, background: 'var(--expense-soft)', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600 }}>{jpMoneySafe(gastado)} {t('gastado')}</span>
            {disponible < 0 && <span style={{ padding: '5px 11px', borderRadius: 999, background: 'var(--expense-soft)', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600 }}>{jpMoneySafe(Math.abs(disponible))} {t('excedido')}</span>}
          </div>
          <div>
            <button type="button" onClick={() => setDesgloseOpen(o => !o)} style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>
              {t('Ver desglose completo')}<span className="material-icons" style={{ fontSize: 16 }}>{desgloseOpen ? 'expand_less' : 'expand_more'}</span>
            </button>
            {desgloseOpen && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)' }}>
                {[
                  [t('Saldo anterior'), jar.carriedIn || 0],
                  [t('Asignado'), asignado],
                  [t('Gastado'), -gastado],
                  [t('Ajuste'), jar.ajuste || 0],
                  [t('Transferencias entrada'), 0],
                  [t('Transferencias salida'), 0],
                  [t('Apalancamiento entrada'), 0],
                  [t('Apalancamiento salida'), 0],
                ].map(([label, val], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 12 }}>
                    <span style={{ color: 'var(--fg-2)' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-money)', fontWeight: 600, color: val < 0 ? 'var(--expense-fg)' : 'var(--fg-1)' }}>{val < 0 ? '-' : ''}{jpMoneySafe(Math.abs(val))}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--border-hairline)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700 }}>
                  <span style={{ color: 'var(--fg-1)' }}>{t('Balance final')}</span>
                  <span style={{ fontFamily: 'var(--font-money)', color: disponible < 0 ? 'var(--expense-fg)' : 'var(--fg-1)' }}>{jpMoneySafe(disponible)}</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setAdjustOpen(true)} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 0, cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12.5 }}><span className="material-icons" style={{ fontSize: 16 }}>tune</span>{t('Ajustar')}</button>
            <button type="button" onClick={() => setUseOpen(true)} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: '1px solid var(--border-hairline)', cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}><span className="material-icons" style={{ fontSize: 16 }}>photo_camera</span>{t('Registrar uso')}</button>
          </div>
          <div>
            <button type="button" onClick={() => setAdvOpen(o => !o)} style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0, color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>
              {t('Opciones avanzadas')}<span className="material-icons" style={{ fontSize: 16 }}>{advOpen ? 'expand_less' : 'expand_more'}</span>
            </button>
            {advOpen && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {linkedAccount ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 999, background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>
                      <span className="material-icons" style={{ fontSize: 14 }}>auto_awesome</span>{linkedAccount.name}
                      <span className="material-icons" style={{ fontSize: 14, cursor: 'pointer' }} onClick={() => upd({ linkedAccountId: null })}>close</span>
                    </span>
                  ) : (
                    <select value="" onChange={e => upd({ linkedAccountId: e.target.value })} style={{ ...window.FC_INPUT_STYLE, padding: '7px 10px', fontSize: 12 }}>
                      <option value="">{t('Vincular a una cuenta…')}</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button type="button" onClick={() => upd({ useGlobalDate: jar.useGlobalDate === false ? true : false })} style={{ width: 34, height: 20, border: 0, borderRadius: 999, background: jar.useGlobalDate === false ? 'var(--surface-3)' : 'var(--brand-primary)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', top: 2, left: jar.useGlobalDate === false ? 2 : 16, width: 16, height: 16, borderRadius: 999, background: '#fff', transition: 'left 150ms' }} />
                  </button>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t('Usar fecha global')}</span>
                  {jar.useGlobalDate === false && (
                    <input type="date" value={jar.startDate || ''} onChange={e => upd({ startDate: e.target.value })} style={{ ...window.FC_INPUT_STYLE, padding: '6px 9px', fontSize: 12 }} />
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <select value={jar.ciclo || ''} onChange={e => upd({ ciclo: e.target.value })} style={{ ...window.FC_INPUT_STYLE, padding: '6px 9px', fontSize: 12 }}>
                    <option value="">{t('Ciclo (usar global)')}</option>
                    <option value="none">{t('Sin reinicio')}</option>
                    <option value="monthly">{t('Mensual')}</option>
                    <option value="biweekly">{t('Quincenal')}</option>
                  </select>
                  {jar.ciclo && <input type="number" min="1" max="28" value={jar.cicloDay || ''} onChange={e => upd({ cicloDay: e.target.value })} placeholder={t('Día')} style={{ ...window.FC_INPUT_STYLE, width: 70, padding: '6px 9px', fontSize: 12 }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => upd({ allowNeg: !jar.allowNeg })} style={{ width: 34, height: 20, border: 0, borderRadius: 999, background: jar.allowNeg ? 'var(--brand-primary)' : 'var(--surface-3)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', top: 2, left: jar.allowNeg ? 16 : 2, width: 16, height: 16, borderRadius: 999, background: '#fff', transition: 'left 150ms' }} />
                  </button>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t('Permitir negativo (propio)')}</span>
                  {jar.allowNeg && <input type="number" value={jar.negLimit || ''} onChange={e => upd({ negLimit: e.target.value })} placeholder={t('Límite')} style={{ ...window.FC_INPUT_STYLE, width: 100, padding: '6px 9px', fontSize: 12, fontFamily: 'var(--font-money)' }} />}
                </div>
              </div>
            )}
            <div style={{ marginTop: 4 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Meta / objetivo ($)')}</div>
              <input type="number" min="0" value={jar.meta || ''} onChange={e => upd({ meta: e.target.value === '' ? null : Number(e.target.value) })} placeholder={t('Sin meta definida')} style={{ ...window.FC_INPUT_STYLE, width: 140, padding: '7px 10px', fontSize: 12.5, fontFamily: 'var(--font-money)' }} />
              {jar.meta > 0 && <span style={{ marginLeft: 8, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{Math.min(100, Math.round(disponible / jar.meta * 100)) || 0}% {t('de la meta')}</span>}
            </div>
          </div>
        </div>
      )}
      {adjustOpen && (
        <JarAdjustModal jar={jar} disponible={disponible} onClose={() => setAdjustOpen(false)} onSave={(patch) => { upd(patch); setAdjustOpen(false); }} />
      )}
      {useOpen && (
        <JarRegisterUseModal jar={jar} onClose={() => setUseOpen(false)} onSave={(monto) => { upd({ gastado: (jar.gastado || 0) + monto }); setUseOpen(false); }} />
      )}
    </div>
  );
}

/* ── Modal de Ajuste (§1.9): balance objetivo + split Usado/Restante ── */
function JarAdjustModal({ jar, disponible, onClose, onSave }) {
  const [usado, setUsado] = useJeState(String(jar.gastado || 0));
  const [restante, setRestante] = useJeState(String(disponible));
  const [desc, setDesc] = useJeState('');
  const [confirming, setConfirming] = useJeState(false);
  const balanceActual = disponible;
  const objetivo = (Number(usado) || 0) + (Number(restante) || 0);
  const delta = objetivo - balanceActual;
  const reduces = delta < 0;

  const doSave = () => {
    if (reduces && !confirming) { setConfirming(true); return; }
    onSave({ ajuste: (jar.ajuste || 0) + delta, gastado: Number(usado) || jar.gastado || 0 });
  };
  const clearAdj = () => onSave({ ajuste: 0 });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 15000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(420px,100%)', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{t('Ajustar')} · {jar.name}</div>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t('Disponible a gastar')}</div>
            <div style={{ fontFamily: 'var(--font-money)', fontSize: 16, fontWeight: 700, color: 'var(--fg-1)' }}>{jpMoneySafe(disponible)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t('Balance contable')}</div>
            <div style={{ fontFamily: 'var(--font-money)', fontSize: 16, fontWeight: 700, color: 'var(--fg-1)' }}>{jpMoneySafe(balanceActual)}</div>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Balance objetivo')}</div>
          <div style={{ fontFamily: 'var(--font-money)', fontSize: 20, fontWeight: 800, color: 'var(--fg-1)' }}>{jpMoneySafe(objetivo)}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Usado')}</div>
            <input type="number" value={usado} onChange={e => setUsado(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Restante')}</div>
            <input type="number" value={restante} onChange={e => setRestante(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Descripción')}</div>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder={t('Opcional')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} />
        </div>
        <div style={{ padding: '9px 12px', borderRadius: 'var(--radius-sm)', background: reduces ? 'var(--expense-soft)' : 'var(--income-soft)', color: reduces ? 'var(--expense-fg)' : 'var(--income-fg)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>
          {delta === 0 ? t('Sin cambio de balance') : (reduces ? t('Vas a reducir en') : t('Vas a incrementar en')) + ' ' + jpMoneySafe(Math.abs(delta))}
        </div>
        {confirming && reduces && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--expense-fg)' }}>{t('Este ajuste reduce el balance del cántaro — confirma para guardar.')}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={clearAdj} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>{t('Borrar ajustes del mes')}</button>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
          <button type="button" onClick={doSave} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: reduces && confirming ? 'var(--expense)' : 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{reduces && confirming ? t('Confirmar reducción') : t('Guardar')}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Diálogo "Registrar uso" (§1.10): monto + descripción + fecha ── */
function JarRegisterUseModal({ jar, onClose, onSave }) {
  const [monto, setMonto] = useJeState('');
  const [desc, setDesc] = useJeState('');
  const [fecha, setFecha] = useJeState(new Date().toISOString().slice(0, 10));
  const submit = () => { const v = parseFloat(monto); if (!isNaN(v) && v > 0) onSave(v); };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 15000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(360px,100%)', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{t('Registrar uso')} · {jar.name}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Monto')}</div>
          <input autoFocus type="number" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0.00" style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Descripción')}</div>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder={t('Opcional')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Fecha')}</div>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
          <button type="button" onClick={submit} disabled={!monto} style={{ border: 0, cursor: monto ? 'pointer' : 'default', opacity: monto ? 1 : .5, padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Guardar')}</button>
        </div>
      </div>
    </div>
  );
}
function jpMoneySafe(n) { return `${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} US$`; }

/* ── Ensamblador de la pantalla Pro completa ── */
function JarsProConfigPage({ hidden }) {
  const [jars, setJars] = useJeState(() => (window.SAMPLE_JARS || []).map((j, i) => ({
    ...j, active: true, mode: 'reset', unit: 'percent', fixedAmount: 0, leverageJarId: null,
    gastado: Math.round(j.amount * (0.05 + (i % 3) * 0.05) * 100) / 100,
    carriedIn: i === 0 ? 0 : (i % 2 === 0 ? Math.round(j.amount * 0.08 * 100) / 100 : -Math.round(j.amount * 0.03 * 100) / 100),
    ajuste: i === 2 ? -1.55 : 0,
  })));
  const [expected, setExpected] = useJeState(1200);
  const [realIncome] = useJeState(0);
  const [useReal, setUseReal] = useJeState(false);
  const [expandedId, setExpandedId] = useJeState(null);
  const [templateOpen, setTemplateOpen] = useJeState(false);

  const totalPercent = jars.reduce((s, j) => s + (Number(j.percent) || 0), 0);
  const rows = jars.map(j => {
    const expectedAsg = expected * (j.percent || 0) / 100;
    const realAsg = useReal ? realIncome * (j.percent || 0) / 100 : 0;
    const disponibleMes = j.carriedIn + expectedAsg;
    const totalGasto = j.gastado - j.ajuste;
    return { id: j.id, name: j.name, color: j.color, percent: j.percent, carriedIn: j.carriedIn, expected: expectedAsg, real: realAsg, gastado: j.gastado, ajuste: j.ajuste, disponibleMes, totalGasto, balance: disponibleMes - totalGasto };
  });

  const updJar = (patch) => setJars(js => js.map(j => j.id === patch.id ? patch : j));
  const delJar = (id) => setJars(js => js.filter(j => j.id !== id));
  const addJar = () => setJars(js => [...js, { id: 'jn-' + Date.now(), name: '', percent: 0, color: '#64748B', active: true, mode: 'reset', unit: 'percent', description: '', gastado: 0, carriedIn: 0, ajuste: 0 }]);
  const applyTemplate = (slug) => {
    const tpl = (window.JAR_TEMPLATES || []).find(t0 => t0.slug === slug);
    if (!tpl) return;
    setJars(tpl.segments.map((sg, idx) => ({ id: 'tpl-' + idx, name: sg.name, percent: sg.percent, color: sg.color, active: true, mode: 'reset', unit: 'percent', description: '', gastado: 0, carriedIn: 0, ajuste: 0 })));
    setTemplateOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Eyebrow>{t("Cántaros")}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Tu dinero, repartido')}</h1>
      </div>

      <JarsKpiBar expectedIncome={expected} setExpectedIncome={setExpected} realIncome={realIncome} useReal={useReal} setUseReal={setUseReal} totalPercent={totalPercent} hidden={hidden} />
      <JarsMonthSummary rows={rows} hidden={hidden} />
      <JarsFullTable rows={rows} hidden={hidden} />
      <JarsGlobalConfig jars={jars} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--info-soft)', color: 'var(--info)' }}>
        <span className="material-icons" style={{ fontSize: 17 }}>touch_app</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 500 }}>{t('Arrastra categorías desde el panel Categorías (columna derecha) y suéltalas sobre un cántaro para reasignarlas.')}</span>
      </div>

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)' }}>{t('Mis Cántaros')}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>{t('Distribuye y visualiza tus porcentajes por frascos')}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <PillButton variant="ghost" icon="dashboard_customize" onClick={() => setTemplateOpen(true)}>{t('Aplicar plantilla')}</PillButton>
              <PillButton variant="ghost" icon="add" onClick={addJar}>{t('Añadir cántaro')}</PillButton>
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: totalPercent > 100 ? 'var(--expense-fg)' : 'var(--fg-2)' }}>{t('Total:')} {totalPercent}%</span>
              <button type="button" disabled={totalPercent > 100} title={totalPercent > 100 ? t('No puedes guardar: la suma supera 100%') : ''}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, border: 0, borderRadius: 'var(--radius-pill)', padding: '9px 18px', background: totalPercent > 100 ? 'var(--surface-3)' : 'var(--brand-primary)', color: totalPercent > 100 ? 'var(--fg-3)' : 'var(--fg-on-brand)', cursor: totalPercent > 100 ? 'not-allowed' : 'pointer' }}>
                <span className="material-icons" style={{ fontSize: 17 }}>save</span>{t('Guardar Cambios')}
              </button>
            </div>
          </div>
          <JarsDistributionBar jars={jars} expectedIncome={expected} totalPercent={totalPercent} hidden={hidden} />
          {jars.map(j => (
            <JarsFullEditorRow key={j.id} jar={j} jars={jars} onUpdate={updJar} onDelete={delJar}
              expanded={expandedId === j.id} onToggleExpand={() => setExpandedId(id => id === j.id ? null : j.id)}
              expectedIncome={expected} accounts={window.ACCOUNTS_DATA || []} />
          ))}
        </Card>
      {templateOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 14000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setTemplateOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(760px,100%)', maxHeight: '86vh', overflowY: 'auto', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)' }}>{t('Aplicar plantilla')}</h3>
              <button type="button" onClick={() => setTemplateOpen(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 20 }}>close</span></button>
            </div>
            <JarTemplateSelector value={null} onChange={applyTemplate} />
          </div>
        </div>
      )}
    </div>
  );
}

function JarsDistributionBar({ jars, expectedIncome, totalPercent, hidden }) {
  const remaining = Math.max(0, 100 - totalPercent);
  return (
    <div style={{ display: 'flex', height: 14, borderRadius: 'var(--radius-pill)', overflow: 'hidden', background: 'var(--surface-3)', border: '1px solid var(--border-hairline)' }}>
      {jars.map(j => {
        const asignado = expectedIncome * (j.percent || 0) / 100;
        return <div key={j.id} title={`${j.name} · ${j.percent}% · ${jpMoney(asignado, hidden)}`} style={{ width: (j.percent || 0) + '%', background: j.color, flexShrink: 0 }} />;
      })}
      {remaining > 0 && (
        <div title={`${window.t('Sin asignar')} · ${remaining}%`} style={{ width: remaining + '%', flexShrink: 0, background: 'repeating-linear-gradient(45deg, var(--surface-2) 0 4px, var(--border-hairline) 4px 8px)' }} />
      )}
    </div>
  );
}

Object.assign(window, { JarsFullEditorRow, JarsProConfigPage, JarsDistributionBar });
