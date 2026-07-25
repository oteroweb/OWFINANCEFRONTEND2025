/* ─── JarsLiteConfig — pantalla completa "Cántaros" (Lite) ────────────────
 * Reemplaza el placeholder mínimo que vivía antes en templates/JarsRoute.jsx
 * (hero + grid, sin acciones reales). Implementa PROMPT_REDISENO_CANTAROS.md
 * §2 completo: card resumen, selector de periodo, lista con drag reorder +
 * toggle activo inline, modal de detalle (acciones rápidas Agregar/Retirar),
 * modal de edición (nombre + % + color de paleta fija) y modal de alta.
 * Deliberadamente más simple que Pro (organisms/JarsProConfig.jsx +
 * JarsProEditor.jsx): sin tipo fijo/%, sin acumulativo editable, sin
 * categorías vinculadas, sin apalancamiento, sin meta, sin plantillas, sin
 * tabla mensual — ver la tabla de diferencias del prompt (§3). No portar
 * ninguna de esas piezas acá "por completitud": es simplicidad a propósito,
 * no una versión recortada por accidente.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useJlState } = React;

const JL_PALETTE = ['#1E3A8A', '#2D4DA6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#0EA5E9', '#F97316'];

function jlBudget(jar) {
  const n = parseFloat(String(jar.goalText || '0').replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

/* ── Barra de distribución (segmentos por % de cántaro activo) ── */
function JarsLiteDistBar({ jars }) {
  const active = jars.filter(j => j.active);
  const totalPct = active.reduce((s, j) => s + (Number(j.percent) || 0), 0);
  return (
    <div style={{ display: 'flex', height: 12, borderRadius: 'var(--radius-pill)', overflow: 'hidden', background: 'var(--surface-2)' }}>
      {active.map(j => (
        <div key={j.id} title={`${j.name} · ${j.percent}%`} style={{ width: `${j.percent || 0}%`, background: j.color, flexShrink: 0 }} />
      ))}
      {totalPct < 100 && <div style={{ width: `${100 - totalPct}%`, flexShrink: 0 }} />}
    </div>
  );
}

/* ── Fila de cántaro (drag reorder solo visual, no persiste — ver prompt §3) ── */
function JarsLiteRow({ jar, index, dragging, dropTarget, onDragStart, onDragEnter, onDragEnd, onDrop, onToggleActive, onOpen }) {
  const over = jar.progress >= 100;
  const excedido = jar.amount < 0;
  return (
    <div
      draggable
      onDragStart={onDragStart(index)}
      onDragEnter={onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
        borderRadius: 'var(--radius-md)', background: 'var(--surface-1)',
        border: dropTarget ? '1.5px dashed var(--brand-primary)' : '1px solid var(--border-hairline)',
        opacity: dragging ? 0.55 : jar.active ? 1 : 0.55,
        cursor: 'pointer', transition: 'opacity 120ms, border-color 120ms',
      }}
    >
      <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)', cursor: 'grab', flexShrink: 0 }}>drag_indicator</span>

      <button type="button" onClick={onOpen} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 11, border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
        <span style={{ width: 32, height: 32, borderRadius: 'var(--radius-pill)', background: jar.color, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-icons" style={{ fontSize: 16, color: '#fff' }}>savings</span>
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13.5, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(jar.name)}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, color: 'var(--fg-3)', background: 'var(--surface-2)', padding: '1px 7px', borderRadius: 999 }}>{jar.percent}%</span>
            {!jar.active && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)', background: 'var(--surface-2)', padding: '1px 7px', borderRadius: 999 }}>{t('Inactivo')}</span>}
            {excedido && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, color: 'var(--expense-fg)', background: 'var(--expense-soft)', padding: '1px 7px', borderRadius: 999 }}>{t('Excedido')}</span>}
            {!excedido && over && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, color: 'var(--warning-fg)', background: 'var(--warning-soft)', padding: '1px 7px', borderRadius: 999 }}>{t('Lleno')}</span>}
          </div>
          {jar.active && (
            <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden', marginTop: 6, maxWidth: 220 }}>
              <div style={{ height: '100%', width: `${Math.min(100, jar.progress)}%`, background: excedido ? 'var(--expense)' : jar.color, borderRadius: 999 }} />
            </div>
          )}
        </div>
      </button>

      <Money value={jar.amount} className="t-body-sm" style={{ fontWeight: 700, flexShrink: 0 }} />

      <button type="button" onClick={() => onToggleActive(jar.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', flexShrink: 0 }} aria-label={t('Activo')}>
        <span style={{ width: 32, height: 19, borderRadius: 999, background: jar.active ? 'var(--income-fg)' : 'var(--surface-3)', position: 'relative', display: 'inline-block' }}>
          <span style={{ position: 'absolute', top: 2, left: jar.active ? 15 : 2, width: 15, height: 15, borderRadius: 999, background: '#fff', transition: 'left 150ms' }} />
        </span>
      </button>
    </div>
  );
}

/* ── Modal centrado (mismo patrón visual que JarAdjustModal en JarsProEditor.jsx) ── */
function JlModal({ title, onClose, children, width = 380 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 15000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: `min(${width}px,100%)`, background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{title}</div>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 20 }}>close</span></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Detalle de un cántaro: hero + stats 2x2 + acciones rápidas + footer ── */
function JarsLiteDetail({ jar, onClose, onEdit, onDelete, onQuickAdd }) {
  const budget = jlBudget(jar);
  const disponible = jar.amount;
  return (
    <JlModal title={t('Detalle del cántaro')} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '4px 0 6px' }}>
        <span style={{ width: 48, height: 48, borderRadius: 'var(--radius-pill)', background: jar.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>savings</span>
        </span>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{t(jar.name)}</div>
        <Money value={disponible} className="t-hero-amount" style={{ fontSize: 26 }} />
        <div style={{ width: '100%', height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(100, jar.progress)}%`, background: jar.color }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          [t('Porcentaje'), `${jar.percent}%`],
          [t('Asignado'), `$ ${budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
          [t('Utilizado'), `${jar.progress}%`],
          [t('Disponible'), `$ ${Math.abs(disponible).toLocaleString('en-US', { minimumFractionDigits: 2 })}`],
        ].map(([label, val], i) => (
          <div key={i} style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-2)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => onQuickAdd('income')} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 0, cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12.5 }}>
          <span className="material-icons" style={{ fontSize: 16 }}>add</span>{t('Agregar')}
        </button>
        <button type="button" onClick={() => onQuickAdd('expense')} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid var(--border-hairline)', cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5 }}>
          <span className="material-icons" style={{ fontSize: 16 }}>remove</span>{t('Retirar')}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6, borderTop: '1px solid var(--border-hairline)' }}>
        <button type="button" onClick={onDelete} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>{t('Eliminar')}</button>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cerrar')}</button>
        <button type="button" onClick={onEdit} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Editar')}</button>
      </div>
    </JlModal>
  );
}

/* ── Editar: solo Nombre + Porcentaje + Color de paleta fija (§2.7 del prompt) ── */
function JarsLiteEdit({ jar, onClose, onSave }) {
  const [name, setName] = useJlState(jar.name);
  const [percent, setPercent] = useJlState(String(jar.percent));
  const [color, setColor] = useJlState(jar.color);
  return (
    <JlModal title={t('Editar cántaro')} onClose={onClose}>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Nombre')}</div>
        <input value={name} onChange={e => setName(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Porcentaje')}</div>
        <input type="number" min="0" max="100" value={percent} onChange={e => setPercent(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Color')}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {JL_PALETTE.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: 999, background: c, border: color === c ? '2px solid var(--fg-1)' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
        <button type="button" onClick={() => onSave({ name, percent: Number(percent) || 0, color })} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Guardar')}</button>
      </div>
    </JlModal>
  );
}

/* ── Nuevo cántaro: mismos 3 campos que Editar, default 10% ── */
function JarsLiteNew({ onClose, onCreate }) {
  const [name, setName] = useJlState('');
  const [percent, setPercent] = useJlState('10');
  const [color, setColor] = useJlState(JL_PALETTE[0]);
  const [error, setError] = useJlState('');
  const submit = () => {
    if (!name.trim()) { setError(t('El nombre es obligatorio')); return; }
    onCreate({ name: name.trim(), percent: Number(percent) || 0, color });
  };
  return (
    <JlModal title={t('Nuevo cántaro')} onClose={onClose}>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Nombre')}</div>
        <input autoFocus value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder={t('Ej: Vacaciones')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
        {error && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--expense-fg)', marginTop: 5 }}>{error}</div>}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Porcentaje')}</div>
        <input type="number" min="0" max="100" value={percent} onChange={e => setPercent(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{t('Color')}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {JL_PALETTE.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: 999, background: c, border: color === c ? '2px solid var(--fg-1)' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
        <button type="button" onClick={submit} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Crear cántaro')}</button>
      </div>
    </JlModal>
  );
}

/* ── Ensamblador de la pantalla Lite completa ── */
function JarsLiteConfigPage({ hidden, onQuickAdd }) {
  const [jars, setJars] = useJlState(() => SAMPLE_JARS.map(j => ({ ...j, active: true })));
  const [period, setPeriod] = useJlState('Mensual');
  const [detailId, setDetailId] = useJlState(null);
  const [editId, setEditId] = useJlState(null);
  const [newOpen, setNewOpen] = useJlState(false);
  const [dragIndex, setDragIndex] = useJlState(null);
  const [overIndex, setOverIndex] = useJlState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useJlState(null);

  const activeJars = jars.filter(j => j.active);
  const totalDisponible = activeJars.reduce((s, j) => s + j.amount, 0);
  const totalAsignado = activeJars.reduce((s, j) => s + jlBudget(j), 0);
  const usoGlobal = totalAsignado > 0
    ? Math.round(activeJars.reduce((s, j) => s + j.progress * jlBudget(j), 0) / totalAsignado)
    : 0;

  const detailJar = jars.find(j => j.id === detailId);
  const editJar = jars.find(j => j.id === editId);

  const toggleActive = (id) => setJars(js => js.map(j => j.id === id ? { ...j, active: !j.active } : j));
  const updateJar = (id, patch) => setJars(js => js.map(j => j.id === id ? { ...j, ...patch } : j));
  const removeJar = (id) => { setJars(js => js.filter(j => j.id !== id)); setDetailId(null); setConfirmDeleteId(null); };
  const createJar = (data) => {
    const id = 'jl-' + Date.now();
    setJars(js => [...js, { id, ...data, type: 'percent', icon: 'savings', amount: 0, progress: 0, goalText: '$ 0', statusText: t('Sin uso todavía'), tone: 'brand', active: true }]);
    setNewOpen(false);
  };

  const onDragStart = (i) => (e) => { setDragIndex(i); e.dataTransfer.effectAllowed = 'move'; };
  const onDragEnter = (i) => () => { if (dragIndex !== null && dragIndex !== i) setOverIndex(i); };
  const onDragEnd = () => { setDragIndex(null); setOverIndex(null); };
  const onDrop = () => {
    if (dragIndex === null || overIndex === null || dragIndex === overIndex) { onDragEnd(); return; }
    setJars(js => { const next = [...js]; const [moved] = next.splice(dragIndex, 1); next.splice(overIndex, 0, moved); return next; });
    onDragEnd();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow>{t('Cántaros')}</Eyebrow>
          <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Mis cántaros')}</h1>
          <div className="t-body-sm" style={{ marginTop: 2 }}>{t('Distribuye tu dinero por frascos')}</div>
        </div>
        <PillButton variant="primary" icon="add" onClick={() => setNewOpen(true)}>{t('Añadir')}</PillButton>
      </div>

      <Card>
        <Eyebrow>{t('Total en cántaros · USD')}</Eyebrow>
        <Money value={totalDisponible} className="t-hero-amount" hidden={hidden} style={{ margin: '6px 0 14px' }} />
        <JarsLiteDistBar jars={jars} />
        <div style={{ display: 'flex', gap: 24, marginTop: 14, flexWrap: 'wrap' }}>
          <div>
            <div className="t-caption" style={{ color: 'var(--fg-2)' }}>{t('Activos')}</div>
            <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{activeJars.length}</div>
          </div>
          <div>
            <div className="t-caption" style={{ color: 'var(--fg-2)' }}>{t('Asignado')}</div>
            <Money value={totalAsignado} hidden={hidden} style={{ fontWeight: 700, fontSize: 16 }} />
          </div>
          <div>
            <div className="t-caption" style={{ color: 'var(--fg-2)' }}>{t('Uso global')}</div>
            <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{usoGlobal}%</div>
          </div>
        </div>
      </Card>

      {/* Selector de periodo — cosmético, no dispara recarga (mismo gap conocido que en producción, ver prompt §3) */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['Mensual', 'Semestral', 'Anual'].map(p => (
          <button key={p} type="button" onClick={() => setPeriod(p)} style={{
            border: 0, cursor: 'pointer', padding: '8px 16px', borderRadius: 999,
            background: period === p ? 'var(--brand-primary)' : 'var(--surface-1)',
            color: period === p ? '#fff' : 'var(--fg-2)', fontFamily: 'var(--font-body)',
            fontWeight: period === p ? 700 : 600, fontSize: 12.5, boxShadow: period === p ? 'none' : 'var(--shadow-card)',
          }}>{t(p)}</button>
        ))}
      </div>

      {jars.length === 0 ? (
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40, textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: 34, color: 'var(--fg-3)' }}>water_drop</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{t('Tus cántaros están vacíos')}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <PillButton variant="ghost" icon="add" onClick={() => onQuickAdd && onQuickAdd('income')}>{t('Registrar ingreso')}</PillButton>
            <PillButton variant="primary" icon="add" onClick={() => setNewOpen(true)}>{t('Crear cántaro')}</PillButton>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onDragOver={e => e.preventDefault()} onDrop={onDrop}>
          {jars.map((jar, i) => (
            <JarsLiteRow key={jar.id} jar={jar} index={i}
              dragging={dragIndex === i} dropTarget={overIndex === i && dragIndex !== i}
              onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd} onDrop={onDrop}
              onToggleActive={toggleActive} onOpen={() => setDetailId(jar.id)} />
          ))}
        </div>
      )}

      {detailJar && (
        <JarsLiteDetail jar={detailJar} onClose={() => setDetailId(null)}
          onEdit={() => { setEditId(detailJar.id); setDetailId(null); }}
          onDelete={() => setConfirmDeleteId(detailJar.id)}
          onQuickAdd={(type) => { setDetailId(null); onQuickAdd && onQuickAdd(type); }} />
      )}
      {editJar && (
        <JarsLiteEdit jar={editJar} onClose={() => setEditId(null)}
          onSave={(patch) => { updateJar(editJar.id, patch); setEditId(null); }} />
      )}
      {newOpen && <JarsLiteNew onClose={() => setNewOpen(false)} onCreate={createJar} />}
      {confirmDeleteId && (
        <JlModal title={t('Eliminar cántaro')} onClose={() => setConfirmDeleteId(null)} width={340}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>
            {t('¿Eliminar')} "{jars.find(j => j.id === confirmDeleteId)?.name}"? {t('Esta acción no se puede deshacer.')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={() => setConfirmDeleteId(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
            <button type="button" onClick={() => removeJar(confirmDeleteId)} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--expense)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Eliminar')}</button>
          </div>
        </JlModal>
      )}
    </div>
  );
}

Object.assign(window, { JarsLiteConfigPage });
