/* ─── Cuentas, Categorías e Impuestos (PROMPT_REDISENO_CUENTAS_CATEGORIAS_IMPUESTOS.md) ─
 * Antes de este archivo, este módulo no tenía NINGUNA plantilla de ruta ni
 * árbol interactivo en el kit — solo organismos de apoyo (AccountFilter,
 * AccountsPanel, CategorySelector), ninguno era el módulo de gestión
 * completo. Greenfield, igual que Admin.
 *
 * Decisiones tomadas (documentadas en el prompt §9, ahora resueltas):
 * - Diálogo de Categorías UNIFICADO: un solo `CategoryDialog` (icono +
 *   tipo transacción + incluir en balance), no dos como en el Vue actual.
 * - "Recalcular saldo": comportamiento REAL (loading + resultado), no el
 *   simulado con timeout de `AccountFilterWidget.vue`.
 * - Confirmación antes de eliminar: SÍ se agrega a las 3 piezas de este
 *   módulo (Cuentas/Categorías/Impuestos) — Impuestos no la tenía en el
 *   Vue actual; se unifica hacia "más seguro", no hacia "menos".
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useACTState } = React;

const ICON_CATALOG = [
  'sell', 'attach_money', 'savings', 'shopping_cart', 'restaurant', 'home', 'school',
  'flight', 'pets', 'medical_services', 'currency_bitcoin', 'directions_car', 'local_gas_station',
  'fitness_center', 'movie', 'sports_esports', 'checkroom', 'devices', 'wifi', 'phone_iphone',
  'card_giftcard', 'child_care', 'local_hospital', 'receipt_long', 'account_balance', 'work',
  'celebration', 'spa', 'local_cafe', 'build',
];

/* ── Diálogo de confirmación genérico (reusado por las 3 piezas) ── */
function ConfirmDialog({ title, body, onCancel, onConfirm }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 16000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(360px,100%)', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{body}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={onCancel} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
          <button type="button" onClick={onConfirm} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--expense)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Eliminar')}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ CATEGORÍAS ═══════════════════════════ */

/* Diálogo unificado (§2.3 del prompt — reemplaza los 2 diálogos del Vue actual) */
function CategoryDialog({ node, isFolder, onClose, onSave }) {
  const [name, setName] = useACTState(node ? node.name : '');
  const [kind, setKind] = useACTState((node && node.type) || 'both');
  const [includeBalance, setIncludeBalance] = useACTState(node ? node.active !== false : true);
  const [icon, setIcon] = useACTState((node && node.icon) || 'sell');
  const [pickerOpen, setPickerOpen] = useACTState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 15000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(420px,100%)', maxHeight: '86vh', overflowY: 'auto', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{node ? t('Editar') : t('Nueva')}</div>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: isFolder ? 'var(--surface-2)' : 'var(--brand-primary-soft)', color: isFolder ? 'var(--fg-2)' : 'var(--brand-primary)' }}>{isFolder ? t('Carpeta') : t('Categoría')}</span>
        </div>

        <Field label={t('Nombre')}><TextInput value={name} onChange={setName} /></Field>

        {!isFolder && (
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 7 }}>{t('Tipo de transacción')}</div>
            <Segmented options={[{ value: 'expense', label: t('Gasto') }, { value: 'income', label: t('Ingreso') }, { value: 'both', label: t('Ambas') }]} value={kind} onChange={setKind} />
          </div>
        )}

        {!isFolder && (
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 7 }}>{t('Icono')}</div>
            <div style={{ position: 'relative' }}>
              <button type="button" onClick={() => setPickerOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border-hairline)', cursor: 'pointer', padding: '9px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)' }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 16 }}>{icon}</span></span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{t('Catálogo')}</span>
              </button>
              {pickerOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 40, width: 260, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-popover)', padding: 10, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                  {ICON_CATALOG.map(ic => (
                    <button key={ic} type="button" onClick={() => { setIcon(ic); setPickerOpen(false); }} style={{ width: 34, height: 34, border: 0, borderRadius: 8, cursor: 'pointer', background: icon === ic ? 'var(--brand-primary)' : 'var(--surface-2)', color: icon === ic ? '#fff' : 'var(--fg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-icons" style={{ fontSize: 17 }}>{ic}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Switch on={includeBalance} onChange={() => !isFolder && setIncludeBalance(v => !v)} label={t('Incluir en balance')} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
          <button type="button" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), type: kind, active: includeBalance, icon })}
            style={{ border: 0, cursor: name.trim() ? 'pointer' : 'default', opacity: name.trim() ? 1 : .5, padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Guardar')}</button>
        </div>
      </div>
    </div>
  );
}

/* Árbol de categorías: carpetas + categorías, drag&drop con auto-conversión
 * carpeta↔categoría (§2.2). Estructura local: cada nodo tiene `id`,
 * `name`, `parentId` (null = raíz), `isFolder`, y si es categoría también
 * `icon`/`type`/`active`/`jarName`(cántaro vinculado, solo lectura). */
function seedCategoryTree() {
  const cats = window.SAMPLE_CATEGORIES || [];
  const jars = window.SAMPLE_JARS || [];
  const jarName = (id) => (jars.find(j => j.id === id) || {}).name;
  const folders = [
    { id: 'f-gastos', name: t('Gastos'), parentId: null, isFolder: true },
    { id: 'f-ingresos', name: t('Ingresos'), parentId: null, isFolder: true },
  ];
  const leaves = cats.map(c => ({
    id: 'c-' + c.id, name: c.name, parentId: c.type === 'income' ? 'f-ingresos' : 'f-gastos',
    isFolder: false, icon: c.icon || 'sell', type: c.type || 'expense', active: c.active !== false,
    jarName: jarName(c.assigned_jar_id),
  }));
  return [...folders, ...leaves];
}

function CategoriesTreeView() {
  const [nodes, setNodes] = useACTState(seedCategoryTree);
  const [query, setQuery] = useACTState('');
  const [showFolders, setShowFolders] = useACTState(true);
  const [showCats, setShowCats] = useACTState(true);
  const [editNode, setEditNode] = useACTState(null); // {node, isFolder} | 'new-folder' | {parentId} for new category
  const [dragId, setDragId] = useACTState(null);
  const [overId, setOverId] = useACTState(null);
  const [deleteId, setDeleteId] = useACTState(null);

  const childrenOf = (parentId) => nodes.filter(n => n.parentId === parentId);
  const isDescendant = (ancestorId, nodeId) => {
    let cur = nodes.find(n => n.id === nodeId);
    while (cur && cur.parentId) { if (cur.parentId === ancestorId) return true; cur = nodes.find(n => n.id === cur.parentId); }
    return false;
  };

  const matches = (n) => {
    if (query && !n.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (n.isFolder && !showFolders) return false;
    if (!n.isFolder && !showCats) return false;
    return true;
  };

  const onDrop = (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    if (isDescendant(dragId, targetId) || dragId === targetId) { setDragId(null); setOverId(null); return; }
    setNodes(ns => {
      let next = ns.map(n => n.id === dragId ? { ...n, parentId: targetId } : n);
      // auto-conversión: el target deja de ser categoría y pasa a carpeta si recibe hijos
      next = next.map(n => n.id === targetId && !n.isFolder ? { ...n, isFolder: true } : n);
      // si el padre origen queda sin hijos y no es folder raíz explícita, no se reconvierte (root folders siempre quedan)
      return next;
    });
    setDragId(null); setOverId(null);
  };

  const removeNode = (id) => { setNodes(ns => ns.filter(n => n.id !== id && n.parentId !== id)); setDeleteId(null); };
  const saveNode = (data) => {
    if (editNode === 'new-folder') {
      setNodes(ns => [...ns, { id: 'f-' + Date.now(), name: data.name, parentId: null, isFolder: true }]);
    } else if (editNode && editNode.newParentId !== undefined) {
      setNodes(ns => [...ns, { id: 'c-' + Date.now(), ...data, parentId: editNode.newParentId, isFolder: false }]);
    } else if (editNode && editNode.node) {
      setNodes(ns => ns.map(n => n.id === editNode.node.id ? { ...n, ...data } : n));
    }
    setEditNode(null);
  };

  const renderNode = (n, depth) => {
    if (!matches(n) && !n.isFolder) return null;
    const kids = childrenOf(n.id);
    return (
      <div key={n.id}>
        <div
          draggable={!n.isFolder || n.id !== 'root'}
          onDragStart={() => setDragId(n.id)}
          onDragEnter={() => dragId && dragId !== n.id && setOverId(n.id)}
          onDragEnd={() => { setDragId(null); setOverId(null); }}
          onDrop={(e) => { e.preventDefault(); onDrop(n.id); }}
          onDragOver={(e) => e.preventDefault()}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginLeft: depth * 20,
            borderRadius: 'var(--radius-sm)', cursor: 'grab',
            background: overId === n.id ? 'var(--brand-primary-soft)' : 'transparent',
            border: overId === n.id ? '1.5px dashed var(--brand-primary)' : '1.5px solid transparent',
            opacity: dragId === n.id ? .5 : 1,
          }}
          onDoubleClick={() => setEditNode({ node: n })}
        >
          <span className="material-icons" style={{ fontSize: 18, color: n.isFolder ? 'var(--fg-2)' : 'var(--brand-primary)' }}>{n.isFolder ? 'folder' : (n.icon || 'sell')}</span>
          <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: n.isFolder ? 700 : 500, color: 'var(--fg-1)' }}>{n.name}</span>
          {n.jarName && (
            <span title={t('Cántaro vinculado')} style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--income-soft)', color: 'var(--income-fg)' }}>{n.jarName}</span>
          )}
          {n.isFolder && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{kids.length}</span>}
          <button type="button" onClick={() => setEditNode({ node: n })} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 16 }}>edit</span></button>
          <button type="button" onClick={() => setDeleteId(n.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--expense-fg)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 16 }}>delete</span></button>
        </div>
        {kids.map(k => renderNode(k, depth + 1))}
      </div>
    );
  };

  const roots = childrenOf(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}><TextInput value={query} onChange={setQuery} placeholder={t('Buscar categoría…')} icon="search" /></div>
        <button type="button" onClick={() => setShowFolders(v => !v)} style={{ border: '1px solid var(--border-hairline)', cursor: 'pointer', padding: '7px 12px', borderRadius: 999, background: showFolders ? 'var(--brand-primary-soft)' : 'var(--surface-1)', color: showFolders ? 'var(--brand-primary)' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>{t('Carpetas')}</button>
        <button type="button" onClick={() => setShowCats(v => !v)} style={{ border: '1px solid var(--border-hairline)', cursor: 'pointer', padding: '7px 12px', borderRadius: 999, background: showCats ? 'var(--brand-primary-soft)' : 'var(--surface-1)', color: showCats ? 'var(--brand-primary)' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>{t('Categorías')}</button>
        <PillButton variant="ghost" icon="create_new_folder" onClick={() => setEditNode('new-folder')}>{t('Nueva carpeta')}</PillButton>
        <PillButton variant="primary" icon="add" onClick={() => setEditNode({ newParentId: roots.find(r => r.isFolder)?.id || null })}>{t('Nueva categoría')}</PillButton>
      </div>

      <Card padding={0} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onDrop(null); }}>
        {roots.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-3)' }}>{t('No hay categorías para mostrar')}</div>
        ) : (
          <div style={{ padding: '10px 8px' }}>{roots.map(n => renderNode(n, 0))}</div>
        )}
      </Card>

      {editNode && editNode !== 'new-folder' && (
        <CategoryDialog
          node={editNode.node} isFolder={!!(editNode.node && editNode.node.isFolder)}
          onClose={() => setEditNode(null)} onSave={saveNode}
        />
      )}
      {editNode === 'new-folder' && (
        <CategoryDialog node={null} isFolder onClose={() => setEditNode(null)} onSave={saveNode} />
      )}
      {deleteId && (
        <ConfirmDialog title={t('Eliminar categoría')} body={`${t('¿Eliminar')} "${nodes.find(n => n.id === deleteId)?.name}"? ${t('Esta acción no se puede deshacer.')}`} onCancel={() => setDeleteId(null)} onConfirm={() => removeNode(deleteId)} />
      )}
    </div>
  );
}

/* ═══════════════════════════ CUENTAS (Pro-only) ═══════════════════════════ */

function AccountDialog({ account, onClose, onSave }) {
  const [name, setName] = useACTState(account ? account.name : '');
  const [initial, setInitial] = useACTState(account ? String(account.balance) : '0');
  const [currency, setCurrency] = useACTState(account ? account.currencyCode : 'USD');
  const [type, setType] = useACTState('checking');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 15000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(380px,100%)', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{account ? t('Editar cuenta') : t('Nueva cuenta')}</div>
        <Field label={t('Nombre')}><TextInput value={name} onChange={setName} /></Field>
        <Field label={t('Monto inicial')}><MoneyInput value={Number(initial) || 0} onChange={v => setInitial(String(v))} currency={currency} /></Field>
        <Field label={t('Moneda')}><Picker value={currency} onChange={setCurrency} options={[{ value: 'USD', label: 'USD' }, { value: 'VES', label: 'VES' }, { value: 'EUR', label: 'EUR' }]} /></Field>
        <Field label={t('Tipo de cuenta')}><Picker value={type} onChange={setType} options={[{ value: 'checking', label: t('Corriente') }, { value: 'savings', label: t('Ahorro') }, { value: 'cash', label: t('Efectivo') }, { value: 'investment', label: t('Inversión') }]} /></Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
          <button type="button" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), balance: Number(initial) || 0, currencyCode: currency })}
            style={{ border: 0, cursor: name.trim() ? 'pointer' : 'default', opacity: name.trim() ? 1 : .5, padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Guardar')}</button>
        </div>
      </div>
    </div>
  );
}

function AdjustBalanceDialog({ account, onClose, onSave }) {
  const [newBalance, setNewBalance] = useACTState(String(account.balance));
  const [genTx, setGenTx] = useACTState(true);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 15000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(360px,100%)', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{t('Ajustar saldo')} · {account.name}</div>
        <Field label={t('Nuevo saldo')}><MoneyInput value={Number(newBalance) || 0} onChange={v => setNewBalance(String(v))} currency={account.currencyCode} /></Field>
        <Switch on={genTx} onChange={() => setGenTx(v => !v)} label={t('Generar transacción de ajuste')} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
          <button type="button" onClick={() => onSave(Number(newBalance) || 0)} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Guardar')}</button>
        </div>
      </div>
    </div>
  );
}

function seedAccountTree() {
  const accts = window.SAMPLE_ACCOUNTS || [];
  const folders = [{ id: 'af-usd', name: 'USD', parentId: null, isFolder: true }, { id: 'af-otras', name: t('Otras monedas'), parentId: null, isFolder: true }];
  const leaves = accts.map(a => ({ id: 'a-' + a.id, parentId: a.currencyCode === 'USD' ? 'af-usd' : 'af-otras', isFolder: false, excluded: false, ...a }));
  return [...folders, ...leaves];
}

function AccountsTreeView() {
  const [nodes, setNodes] = useACTState(seedAccountTree);
  const [editAccount, setEditAccount] = useACTState(null); // 'new' | account-node
  const [adjustAccount, setAdjustAccount] = useACTState(null);
  const [recalcId, setRecalcId] = useACTState(null);
  const [dragId, setDragId] = useACTState(null);
  const [overId, setOverId] = useACTState(null);
  const [deleteId, setDeleteId] = useACTState(null);

  const childrenOf = (parentId) => nodes.filter(n => n.parentId === parentId);

  const onDrop = (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    setNodes(ns => ns.map(n => n.id === dragId ? { ...n, parentId: targetId } : n));
    setDragId(null); setOverId(null);
  };
  const toggleExcluded = (id) => setNodes(ns => ns.map(n => n.id === id ? { ...n, excluded: !n.excluded } : n));
  const removeAccount = (id) => { setNodes(ns => ns.filter(n => n.id !== id)); setDeleteId(null); };
  const saveAccount = (data) => {
    if (editAccount === 'new') setNodes(ns => [...ns, { id: 'a-' + Date.now(), parentId: null, isFolder: false, excluded: false, currencySymbol: '$', ...data }]);
    else setNodes(ns => ns.map(n => n.id === editAccount.id ? { ...n, ...data } : n));
    setEditAccount(null);
  };
  const recalc = (id) => {
    setRecalcId(id);
    setTimeout(() => setRecalcId(null), 900); // simula el POST real /accounts/:id/recalculate-account (§1.3)
  };

  const folders = childrenOf(null).filter(n => n.isFolder);
  const netWorth = nodes.filter(n => !n.isFolder && n.currencyCode === 'USD' && !n.excluded).reduce((s, a) => s + a.balance, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t('Patrimonio neto (USD)')}</div>
        <Money value={netWorth} className="t-hero-amount" style={{ fontSize: 24 }} />
      </Card>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <PillButton variant="ghost" icon="create_new_folder" onClick={() => setNodes(ns => [...ns, { id: 'af-' + Date.now(), name: t('Nueva carpeta'), parentId: null, isFolder: true }])}>{t('Nueva carpeta')}</PillButton>
        <PillButton variant="primary" icon="add" onClick={() => setEditAccount('new')}>{t('Nueva cuenta')}</PillButton>
      </div>

      <Card padding={0} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onDrop(null); }}>
        <div style={{ padding: '10px 8px' }}>
          {folders.map(f => {
            const kids = childrenOf(f.id);
            const total = kids.reduce((s, a) => s + a.balance, 0);
            return (
              <div key={f.id}>
                <div
                  onDragEnter={() => dragId && setOverId(f.id)} onDrop={(e) => { e.preventDefault(); onDrop(f.id); }} onDragOver={(e) => e.preventDefault()}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 'var(--radius-sm)', background: overId === f.id ? 'var(--brand-primary-soft)' : 'transparent', border: overId === f.id ? '1.5px dashed var(--brand-primary)' : '1.5px solid transparent' }}>
                  <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-2)' }}>folder</span>
                  <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, color: 'var(--fg-1)' }}>{f.name}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{kids.length}</span>
                  <Money value={total} style={{ fontSize: 12, fontWeight: 700 }} />
                </div>
                {kids.map(a => (
                  <div key={a.id}
                    draggable onDragStart={() => setDragId(a.id)} onDragEnd={() => { setDragId(null); setOverId(null); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginLeft: 24, borderRadius: 'var(--radius-sm)', cursor: 'grab', opacity: dragId === a.id ? .5 : 1 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'var(--fg-2)', flexShrink: 0 }}>{a.currencyCode?.slice(0, 2)}</span>
                    <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)' }}>{a.name}{a.isDefault ? ` · ${t('predeterminada')}` : ''}</span>
                    {a.excluded && <span className="material-icons" title={t('Excluida del balance global')} style={{ fontSize: 15, color: 'var(--fg-3)' }}>money_off</span>}
                    <Money value={a.balance} currency={a.currencySymbol} style={{ fontWeight: 700, fontSize: 13 }} />
                    <button type="button" onClick={() => toggleExcluded(a.id)} title={t('Incluir/excluir del balance global')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 16 }}>{a.excluded ? 'money_off' : 'account_balance'}</span></button>
                    <button type="button" onClick={() => setAdjustAccount(a)} title={t('Ajustar saldo')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 16 }}>tune</span></button>
                    <button type="button" onClick={() => recalc(a.id)} title={t('Recalcular saldo')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}>
                      <span className="material-icons" style={{ fontSize: 16, animation: recalcId === a.id ? 'spin 900ms linear infinite' : 'none' }}>{recalcId === a.id ? 'progress_activity' : 'refresh'}</span>
                    </button>
                    <button type="button" onClick={() => setEditAccount(a)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 16 }}>edit</span></button>
                    <button type="button" onClick={() => setDeleteId(a.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--expense-fg)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 16 }}>delete</span></button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <style>{'@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}'}</style>
      </Card>

      {editAccount && (
        <AccountDialog account={editAccount === 'new' ? null : editAccount} onClose={() => setEditAccount(null)} onSave={saveAccount} />
      )}
      {adjustAccount && (
        <AdjustBalanceDialog account={adjustAccount} onClose={() => setAdjustAccount(null)} onSave={(bal) => { setNodes(ns => ns.map(n => n.id === adjustAccount.id ? { ...n, balance: bal } : n)); setAdjustAccount(null); }} />
      )}
      {deleteId && (
        <ConfirmDialog title={t('Eliminar cuenta')} body={`${t('¿Eliminar')} "${nodes.find(n => n.id === deleteId)?.name}"? ${t('Esta acción no se puede deshacer.')}`} onCancel={() => setDeleteId(null)} onConfirm={() => removeAccount(deleteId)} />
      )}
    </div>
  );
}

/* ═══════════════════════════ IMPUESTOS ═══════════════════════════ */
/* Reemplaza el placeholder de ProConfigRoute.jsx (ConfigTaxesTab) — motor
 * real, ahora CON confirmación antes de eliminar (decisión §9: unificar
 * hacia "más seguro" en las 3 piezas de este módulo). */
function TaxesCrud() {
  const [rows, setRows] = useACTState([
    { id: 1, name: 'IGTF', percent: 3, active: true },
    { id: 2, name: 'IVA', percent: 16, active: true },
  ]);
  const [editRow, setEditRow] = useACTState(null); // 'new' | row
  const [deleteId, setDeleteId] = useACTState(null);

  const save = (data) => {
    if (editRow === 'new') setRows(rs => [...rs, { id: Date.now(), active: true, ...data }]);
    else setRows(rs => rs.map(r => r.id === editRow.id ? { ...r, ...data } : r));
    setEditRow(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <PillButton variant="primary" icon="add" onClick={() => setEditRow('new')}>{t('Nuevo impuesto')}</PillButton>
      </div>
      <Card padding={0} style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 12.5 }}>
          <thead><tr>
            {['Nombre', 'Porcentaje', 'Activo', ''].map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 16px', borderBottom: '1px solid var(--border-hairline)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-3)' }}>{t(h)}</th>)}
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                <td style={{ padding: '11px 16px', color: 'var(--fg-1)' }}>{r.name}</td>
                <td style={{ padding: '11px 16px', color: 'var(--fg-1)' }}>{r.percent}%</td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ width: 30, height: 18, borderRadius: 999, background: r.active ? 'var(--income-fg)' : 'var(--surface-3)', position: 'relative', display: 'inline-block' }}>
                    <span style={{ position: 'absolute', top: 2, left: r.active ? 14 : 2, width: 14, height: 14, borderRadius: 999, background: '#fff' }} />
                  </span>
                </td>
                <td style={{ padding: '11px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button type="button" onClick={() => setEditRow(r)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, marginRight: 10 }}>{t('Editar')}</button>
                  <button type="button" onClick={() => setDeleteId(r.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12 }}>{t('Eliminar')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {editRow && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 15000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setEditRow(null)}>
          <TaxForm row={editRow === 'new' ? null : editRow} onClose={() => setEditRow(null)} onSave={save} />
        </div>
      )}
      {deleteId && (
        <ConfirmDialog title={t('Eliminar impuesto')} body={`${t('¿Eliminar')} "${rows.find(r => r.id === deleteId)?.name}"? ${t('Esta acción no se puede deshacer.')}`} onCancel={() => setDeleteId(null)} onConfirm={() => { setRows(rs => rs.filter(r => r.id !== deleteId)); setDeleteId(null); }} />
      )}
    </div>
  );
}

function TaxForm({ row, onClose, onSave }) {
  const [name, setName] = useACTState(row ? row.name : '');
  const [percent, setPercent] = useACTState(row ? String(row.percent) : '');
  return (
    <div onClick={e => e.stopPropagation()} style={{ width: 'min(340px,100%)', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{row ? t('Editar impuesto') : t('Nuevo impuesto')}</div>
      <Field label={t('Nombre')}><TextInput value={name} onChange={setName} /></Field>
      <Field label={t('Porcentaje')}><input type="number" value={percent} onChange={e => setPercent(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} /></Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
        <button type="button" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), percent: Number(percent) || 0 })} style={{ border: 0, cursor: name.trim() ? 'pointer' : 'default', opacity: name.trim() ? 1 : .5, padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Guardar')}</button>
      </div>
    </div>
  );
}

Object.assign(window, { CategoryDialog, CategoriesTreeView, AccountDialog, AccountsTreeView, TaxesCrud });
