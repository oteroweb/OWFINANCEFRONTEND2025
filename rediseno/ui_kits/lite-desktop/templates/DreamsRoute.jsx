/* global React */
/* DreamsRoute — implementa PROMPT_REDISENO_DEUDAS_SUENOS_PERFIL.md §2 completo.
 * Antes solo tenía hero + grid de solo-lectura (DreamsFullGrid), sin ninguna
 * acción real ni sección "Completados" separada. Agregado acá: menú
 * contextual (Aportar/Editar/Marcar completado-Reabrir/Eliminar), formulario
 * de alta/edición con los campos reales, diálogo de aporte con celebración,
 * sección Completados y estado vacío. Misma pantalla para Pro y Lite (ver
 * prompt §6). */
const { useState: useDrState } = React;

const DREAM_PALETTE = ['#8B5CF6', '#EC4899', '#0EA5E9', '#F59E0B', '#10B981', '#EF4444', '#F97316', '#64748B'];
const DREAM_TONE_BY_COLOR = (c) => (c === '#EC4899' ? 'dream-secondary' : 'dream-primary');

function DrModal({ title, onClose, children, width = 400 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 15000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: `min(${width}px,100%)`, maxHeight: '86vh', overflowY: 'auto', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{title}</div>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 20 }}>close</span></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DrField({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

/* ── Menú contextual: Aportar / Editar / Completar-Reabrir / Eliminar ── */
function DreamMenu({ dream, onClose, onAportar, onEdit, onToggleComplete, onDelete }) {
  const completed = dream.progress >= 100 || dream.completed;
  const Item = ({ icon, label, onClick, danger }) => (
    <button type="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 0, background: 'transparent', cursor: 'pointer', padding: '11px 4px', color: danger ? 'var(--expense-fg)' : 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, textAlign: 'left' }}>
      <span className="material-icons" style={{ fontSize: 19 }}>{icon}</span>{label}
    </button>
  );
  return (
    <DrModal title={dream.name} onClose={onClose} width={340}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Item icon="favorite" label={t('Aportar')} onClick={onAportar} />
        <Item icon="edit" label={t('Editar sueño')} onClick={onEdit} />
        <Item icon={completed ? 'restart_alt' : 'check_circle'} label={completed ? t('Reabrir sueño') : t('Marcar como completado')} onClick={onToggleComplete} />
        <div style={{ height: 1, background: 'var(--border-hairline)', margin: '4px 0' }} />
        <Item icon="delete" label={t('Eliminar')} onClick={onDelete} danger />
      </div>
    </DrModal>
  );
}

/* ── Formulario alta/edición (§2.5) ── */
function DreamForm({ dream, onClose, onSave }) {
  const isEdit = !!dream;
  const [f, setF] = useDrState(() => dream ? { ...dream, emoji: dream.emoji || '' } : {
    name: '', emoji: '', color: DREAM_PALETTE[0], subtitle: '', goal: '', amount: '0',
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.name.trim() && Number(f.goal) >= 1;
  const submit = () => {
    if (!valid) return;
    const goal = Number(f.goal) || 1;
    const amount = Number(f.amount) || 0;
    onSave({
      ...f,
      id: dream ? dream.id : 's-' + Date.now(),
      goal, amount,
      progress: Math.min(100, Math.round((amount / goal) * 100)),
      icon: f.emoji ? undefined : (dream ? dream.icon : 'auto_awesome'),
      tone: DREAM_TONE_BY_COLOR(f.color),
      monthly: dream ? dream.monthly : 0,
      eta: dream ? dream.eta : '—',
      contributors: dream ? dream.contributors : 1,
    });
  };
  return (
    <DrModal title={isEdit ? t('Editar sueño') : t('Nuevo sueño')} onClose={onClose} width={420}>
      <DrField label={t('Nombre') + ' *'}>
        <input maxLength={100} value={f.name} onChange={e => set('name', e.target.value)} placeholder={t('Ej: Casa propia')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
      </DrField>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <DrField label={t('Emoji')}>
            <input maxLength={4} value={f.emoji} onChange={e => set('emoji', e.target.value)} placeholder="🏠" style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} />
          </DrField>
        </div>
        <div style={{ flex: 2 }}>
          <DrField label={t('Color')}>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', paddingTop: 6 }}>
              {DREAM_PALETTE.map(c => (
                <button key={c} type="button" onClick={() => set('color', f.color === c ? null : c)} style={{ width: 24, height: 24, borderRadius: 999, background: c, border: f.color === c ? '2px solid var(--fg-1)' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
          </DrField>
        </div>
      </div>
      <DrField label={t('Descripción')}>
        <input maxLength={200} value={f.subtitle || ''} onChange={e => set('subtitle', e.target.value)} placeholder={t('Opcional')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} />
      </DrField>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <DrField label={t('Meta $') + ' *'}>
            <input type="number" min="1" value={f.goal} onChange={e => set('goal', e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
          </DrField>
        </div>
        <div style={{ flex: 1 }}>
          <DrField label={t('Ahorrado $')}>
            <input type="number" min="0" value={f.amount} onChange={e => set('amount', e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
          </DrField>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
        <button type="button" disabled={!valid} onClick={submit} style={{ border: 0, cursor: valid ? 'pointer' : 'default', opacity: valid ? 1 : .5, padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{isEdit ? t('Guardar') : t('Crear sueño')}</button>
      </div>
    </DrModal>
  );
}

/* ── Aportar (§2.6): barra de progreso actual + monto + celebración si completa ── */
function DreamContribute({ dream, onClose, onContribute }) {
  const [monto, setMonto] = useDrState('');
  const valid = parseFloat(monto) > 0;
  return (
    <DrModal title={t('Aportar')} onClose={onClose} width={360}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{dream.name}</div>
      <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${dream.progress}%`, background: '#8B5CF6' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>
        ${dream.amount.toLocaleString('en-US')} {t('ahorrado')} / ${dream.goal.toLocaleString('en-US')} {t('meta')}
      </div>
      <DrField label={t('Monto a aportar $') + ' *'}>
        <input autoFocus type="number" min="0.01" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
      </DrField>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
        <button type="button" disabled={!valid} onClick={() => onContribute(parseFloat(monto))} style={{ border: 0, cursor: valid ? 'pointer' : 'default', opacity: valid ? 1 : .5, padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Confirmar aporte')}</button>
      </div>
    </DrModal>
  );
}

function DreamsRoute({ hidden }) {
  const [dreams, setDreams] = useDrState(() => SAMPLE_DREAMS.map(d => ({ ...d, completed: d.progress >= 100 })));
  const [menuId, setMenuId] = useDrState(null);
  const [editId, setEditId] = useDrState(null);
  const [contributeId, setContributeId] = useDrState(null);
  const [newOpen, setNewOpen] = useDrState(false);
  const [celebration, setCelebration] = useDrState(null);

  const active = dreams.filter(d => !d.completed);
  const completed = dreams.filter(d => d.completed);
  const totalSaved = active.reduce((s, d) => s + d.amount, 0);
  const totalGoal = active.reduce((s, d) => s + d.goal, 0) || 1;
  const overallProgress = Math.round((totalSaved / totalGoal) * 100);

  const menuDream = dreams.find(d => d.id === menuId);
  const editDream = dreams.find(d => d.id === editId);
  const contributeDream = dreams.find(d => d.id === contributeId);

  const saveDream = (data) => {
    setDreams(ds => ds.some(d => d.id === data.id) ? ds.map(d => d.id === data.id ? { ...d, ...data, completed: data.progress >= 100 } : d) : [...ds, { ...data, completed: data.progress >= 100 }]);
    setEditId(null); setNewOpen(false);
  };
  const removeDream = (id) => { setDreams(ds => ds.filter(d => d.id !== id)); setMenuId(null); };
  const toggleComplete = (id) => { setDreams(ds => ds.map(d => d.id === id ? { ...d, completed: !d.completed } : d)); setMenuId(null); };
  const contribute = (id, monto) => {
    setDreams(ds => ds.map(d => {
      if (d.id !== id) return d;
      const amount = d.amount + monto;
      const progress = Math.min(100, Math.round((amount / d.goal) * 100));
      const justCompleted = progress >= 100 && d.progress < 100;
      if (justCompleted) setCelebration(d.name);
      return { ...d, amount, progress, completed: progress >= 100 };
    }));
    setContributeId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <Eyebrow>{t("Sueños")}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Lo que estás construyendo')}</h1>
      </div>

      <Card hero style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(236,72,153,0.06) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Eyebrow>{t("Total acumulado · USD")}</Eyebrow>
            <Money value={totalSaved} className="t-hero-amount" hidden={hidden} color="#8B5CF6" />
            <div className="t-body-sm">
              {active.length} {t("sueños activos · meta combinada")}{' '}
              <strong className="tabular" style={{ color: 'var(--fg-1)' }}>${totalGoal.toLocaleString('en-US')}</strong>
              {' '}· <span style={{ color: '#8B5CF6', fontWeight: 600 }}>{overallProgress}% {t("del camino")}</span>
            </div>
          </div>
          <PillButton variant="primary" icon="add" onClick={() => setNewOpen(true)}>{t("Nuevo sueño")}</PillButton>
        </div>
      </Card>

      {dreams.length === 0 ? (
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40, textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: 34, color: 'var(--fg-3)' }}>auto_awesome</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{t('Aún no tienes sueños')}</div>
          <PillButton variant="primary" icon="add" onClick={() => setNewOpen(true)}>{t('Crear primer sueño')}</PillButton>
        </Card>
      ) : (
        <React.Fragment>
          <DreamsFullGrid dreams={active} hidden={hidden} onOpen={setMenuId} />
          {completed.length > 0 && (
            <div>
              <h3 className="t-h3" style={{ margin: '0 0 12px' }}>{t('Completados')} ({completed.length})</h3>
              <DreamsFullGrid dreams={completed} hidden={hidden} onOpen={setMenuId} />
            </div>
          )}
        </React.Fragment>
      )}

      {menuDream && (
        <DreamMenu dream={menuDream} onClose={() => setMenuId(null)}
          onAportar={() => { setContributeId(menuDream.id); setMenuId(null); }}
          onEdit={() => { setEditId(menuDream.id); setMenuId(null); }}
          onToggleComplete={() => toggleComplete(menuDream.id)}
          onDelete={() => removeDream(menuDream.id)} />
      )}
      {editDream && <DreamForm dream={editDream} onClose={() => setEditId(null)} onSave={saveDream} />}
      {newOpen && <DreamForm onClose={() => setNewOpen(false)} onSave={saveDream} />}
      {contributeDream && <DreamContribute dream={contributeDream} onClose={() => setContributeId(null)} onContribute={(monto) => contribute(contributeDream.id, monto)} />}
      {celebration && (
        <DrModal title="🎉" onClose={() => setCelebration(null)} width={320}>
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)', padding: '6px 0' }}>
            {t('¡Sueño')} "{celebration}" {t('completado!')}
          </div>
        </DrModal>
      )}
    </div>
  );
}

Object.assign(window, { DreamsRoute });
