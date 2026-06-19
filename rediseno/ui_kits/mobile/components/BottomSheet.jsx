/* ─── OW Finance Mobile — BottomSheet (reusable) ─────────────────────────
 * Slide-up modal sheet used by the transaction filters, account selector,
 * exchange rates and month picker. Backdrop + drag handle + title row.
 *
 * Props:
 *   open(bool) onClose(fn) title(string?) onClear(fn?) clearLabel(string)
 *   maxHeight(css) children
 *
 * RN MAPPING: @gorhom/bottom-sheet <BottomSheetModal> with a backdrop.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

if (typeof document !== 'undefined' && !document.getElementById('mbs-style')) {
  const s = document.createElement('style');
  s.id = 'mbs-style';
  s.textContent =
    '@keyframes mbsFade{from{opacity:0}to{opacity:1}}' +
    '@keyframes mbsUp{from{transform:translateY(100%);opacity:.4}to{transform:translateY(0);opacity:1}}';
  document.head.appendChild(s);
}

function MobileBottomSheet({ open, onClose, title, onClear, clearLabel = 'Limpiar', maxHeight = '82%', children }) {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 95 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,18,0.72)', animation: 'mbsFade 200ms' }} />

      {/* Sheet */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', maxHeight,
        background: 'var(--surface-1)', borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.42)',
        animation: 'mbsUp 280ms var(--ease-out)',
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)', margin: '10px auto 4px', flexShrink: 0 }} />

        {/* Title row */}
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)' }}>{title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {onClear && <button onClick={onClear} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{clearLabel}</button>}
              <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', padding: 2, display: 'flex' }}>
                <span className="material-icons" style={{ fontSize: 22 }}>close</span>
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileBottomSheet });
