/* ─── Cántaros Mobile — Bottom sheet + selector de categorías ────────────
 * CmSheet      → contenedor slide-up reutilizable (backdrop + handle + título)
 * CmCategorySheet → árbol Ingresos/Gastos con buscador y multi-selección
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useCmCatState } = React;

if (typeof document !== 'undefined' && !document.getElementById('cm-sheet-style')) {
  const s = document.createElement('style');
  s.id = 'cm-sheet-style';
  s.textContent =
    '@keyframes cmFade{from{opacity:0}to{opacity:1}}' +
    '@keyframes cmUp{from{transform:translateY(100%)}to{transform:translateY(0)}}';
  document.head.appendChild(s);
}

function CmSheet({ open, onClose, title, subtitle, headerRight, maxHeight = '88%', children, footer }) {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 95 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,18,0.66)', animation: 'cmFade 200ms' }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', maxHeight,
        background: 'var(--surface-1)', borderRadius: '26px 26px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.45)', animation: 'cmUp 280ms var(--ease-out)',
      }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: 'var(--surface-3)', margin: '10px auto 2px', flexShrink: 0 }} />
        {title && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 18px 12px', flexShrink: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)' }}>{title}</div>
              {subtitle && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', marginTop: 2 }}>{subtitle}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {headerRight}
              <button onClick={onClose} style={{ border: 0, background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--fg-2)', width: 30, height: 30, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ fontSize: 19 }}>close</span>
              </button>
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', minHeight: 0 }}>{children}</div>
        {footer && <div style={{ flexShrink: 0, padding: '12px 18px calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-1)' }}>{footer}</div>}
      </div>
    </div>
  );
}

/* Selector de categorías — multi-select sobre el árbol */
function CmCategorySheet({ open, onClose, jar, selected, onApply }) {
  const tree = window.CM_CATEGORY_TREE || [];
  const [sel, setSel] = useCmCatState(selected || []);
  const [q, setQ] = useCmCatState('');
  const [openFolders, setOpenFolders] = useCmCatState(() => ({ gastos: true, ingresos: false, f_alim: true, f_hogar: false, f_trans: false, f_ocio: false, f_edu: false, f_otros: false }));
  React.useEffect(() => { if (open) { setSel(selected || []); setQ(''); } }, [open]);

  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleFolder = (id) => setOpenFolders(s => ({ ...s, [id]: !s[id] }));
  const ql = q.trim().toLowerCase();

  const leafRow = (leaf, depth, kind) => {
    if (ql && !leaf.name.toLowerCase().includes(ql)) return null;
    const on = sel.includes(leaf.id);
    return (
      <button key={leaf.id} type="button" onClick={() => toggle(leaf.id)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 18px 11px ' + (18 + depth * 16) + 'px',
        border: 0, background: on ? 'var(--brand-primary-soft)' : 'transparent', cursor: 'pointer', textAlign: 'left',
      }}>
        <span className="material-icons" style={{ fontSize: 19, color: kind === 'income' ? 'var(--income-fg)' : 'var(--fg-2)', flexShrink: 0 }}>{leaf.icon}</span>
        <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: on ? 600 : 500, color: 'var(--fg-1)' }}>{leaf.name}</span>
        <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--brand-primary)' : 'transparent', border: on ? 'none' : '1.5px solid var(--surface-3)' }}>
          {on && <span className="material-icons" style={{ fontSize: 15, color: '#fff' }}>check</span>}
        </span>
      </button>
    );
  };

  const renderNode = (node, depth, kind) => {
    if (node.children) {
      const isRoot = depth === 0;
      const folderOpen = openFolders[node.id] !== false && (openFolders[node.id] || ql);
      const childKind = node.kind || kind;
      // When searching, always show children that match
      const showChildren = ql ? true : folderOpen;
      return (
        <div key={node.id}>
          <button type="button" onClick={() => toggleFolder(node.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 18px 10px ' + (18 + depth * 16) + 'px',
            border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left',
          }}>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)', transition: 'transform 160ms', transform: showChildren ? 'rotate(0deg)' : 'rotate(-90deg)' }}>expand_more</span>
            <span className="material-icons" style={{ fontSize: 18, color: childKind === 'income' ? 'var(--income-fg)' : 'var(--fg-2)' }}>{node.icon || 'folder'}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: isRoot ? 700 : 600, fontSize: isRoot ? 14 : 13, color: 'var(--fg-1)', textTransform: isRoot ? 'uppercase' : 'none', letterSpacing: isRoot ? '0.05em' : 0 }}>{node.name}</span>
          </button>
          {showChildren && node.children.map(c => renderNode(c, depth + 1, childKind))}
        </div>
      );
    }
    return leafRow(node, depth, kind);
  };

  const segments = (window.CM_CAT_INDEX || {});
  return (
    <CmSheet open={open} onClose={onClose} title="Asignar categorías" subtitle={jar ? jar.name : ''}
      headerRight={sel.length > 0 ? <button onClick={() => setSel([])} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>Limpiar</button> : null}
      footer={(
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', flexShrink: 0 }}>{sel.length} seleccionada{sel.length === 1 ? '' : 's'}</span>
          <CmBtn variant="primary" fullWidth icon="check" onClick={() => onApply(sel)}>Aplicar</CmBtn>
        </div>
      )}>
      {/* Buscador */}
      <div style={{ padding: '4px 18px 12px', position: 'sticky', top: 0, background: 'var(--surface-1)', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
          <span className="material-icons" style={{ fontSize: 19, color: 'var(--fg-3)' }}>search</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrar categorías"
            style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)' }} />
          {q && <button onClick={() => setQ('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 17 }}>close</span></button>}
        </div>
        {/* Chips ya seleccionados */}
        {sel.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {sel.map(id => segments[id] && (
              <button key={id} type="button" onClick={() => toggle(id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px 4px 10px', borderRadius: 999, border: 0, cursor: 'pointer', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary-fg-soft)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>
                {segments[id].name}<span className="material-icons" style={{ fontSize: 14 }}>close</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ paddingBottom: 12 }}>
        {tree.map(root => renderNode(root, 0, root.kind))}
        {ql && !Object.values(segments).some(c => c.name.toLowerCase().includes(ql)) && (
          <div style={{ padding: '24px 18px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>Sin resultados para “{q}”.</div>
        )}
      </div>
    </CmSheet>
  );
}

Object.assign(window, { CmSheet, CmCategorySheet });
