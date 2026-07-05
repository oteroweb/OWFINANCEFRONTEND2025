/* ─── Form controls — molecules for the transaction form ────────────────
 * Field · TextInput · MoneyInput · Segmented · Picker · Switch · DateField
 * All styled from design-system tokens; used by TransactionForm + Bulk.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useFcState, useRef: useFcRef, useEffect: useFcEffect } = React;

/* ---------- Field (label + control + hint) ---------- */
function Field({ label, hint, required, children, style = {} }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>
          {label}{required && <span style={{ color: 'var(--expense)' }}> *</span>}
        </span>
      )}
      {children}
      {hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>{hint}</span>}
    </label>
  );
}

const FC_INPUT_STYLE = {
  width: '100%', boxSizing: 'border-box',
  border: '1px solid var(--border-hairline)',
  borderRadius: 'var(--radius-sm)',
  padding: '11px 13px',
  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)',
  background: 'var(--surface-2)', outline: 'none',
  transition: 'border-color 150ms, background 150ms',
};

function fcFocus(e) { e.target.style.borderColor = 'var(--brand-primary)'; e.target.style.background = 'var(--surface-1)'; }
function fcBlur(e)  { e.target.style.borderColor = 'var(--border-hairline)'; e.target.style.background = 'var(--surface-2)'; }

/* ---------- TextInput ---------- */
function TextInput({ value, onChange, placeholder, type = 'text', icon, style = {} }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && <span className="material-icons" style={{ position: 'absolute', left: 11, fontSize: 18, color: 'var(--fg-3)', pointerEvents: 'none' }}>{icon}</span>}
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={fcFocus} onBlur={fcBlur}
        style={{ ...FC_INPUT_STYLE, paddingLeft: icon ? 38 : 13, ...style }}
      />
    </div>
  );
}

/* ---------- MoneyInput (big amount + currency chip) ---------- */
function MoneyInput({ value, onChange, currency = 'USD', onCurrency, currencies, accent = 'var(--brand-primary)', autoFocus }) {
  const sym = (window.CURRENCIES?.[currency]?.symbol) || '$';
  const ref = useFcRef(null);
  useFcEffect(() => { if (autoFocus && ref.current) ref.current.focus(); }, [autoFocus]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
      <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 30, color: 'var(--fg-3)' }}>{sym}</span>
      <input
        ref={ref} type="number" inputMode="decimal" value={value} placeholder="0.00"
        onChange={e => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 30, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}
      />
      {currencies && (
        <div style={{ display: 'flex', gap: 3, background: 'var(--surface-1)', borderRadius: 'var(--radius-pill)', padding: 3 }}>
          {currencies.map(c => {
            const active = c === currency;
            return (
              <button key={c} onClick={() => onCurrency && onCurrency(c)} type="button"
                style={{ border: 0, cursor: 'pointer', padding: '5px 11px', borderRadius: 'var(--radius-pill)', background: active ? accent : 'transparent', color: active ? '#fff' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, transition: 'all 150ms' }}>
                {c}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Segmented control ---------- */
function Segmented({ options, value, onChange, accentMap }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
      {options.map(o => {
        const active = value === o.value;
        const accent = (accentMap && accentMap[o.value]) || 'var(--brand-primary)';
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            style={{ flex: 1, border: 0, cursor: 'pointer', padding: '9px 8px', borderRadius: 'var(--radius-pill)', background: active ? 'var(--surface-1)' : 'transparent', color: active ? accent : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontWeight: active ? 700 : 500, fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: active ? 'var(--shadow-card)' : 'none', transition: 'all 150ms' }}>
            {o.icon && <span className="material-icons" style={{ fontSize: 16 }}>{o.icon}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Picker (custom dropdown) ----------
 * options: [{ value, label, sub?, icon?, color?, right? }]
 */
function Picker({ value, onChange, options, placeholder = 'Seleccionar', leadingIcon, searchable, onCreate, createLabel = 'Crear' }) {
  const [open, setOpen] = useFcState(false);
  const [query, setQuery] = useFcState('');
  const boxRef = useFcRef(null);
  const searchRef = useFcRef(null);
  const canSearch = searchable || !!onCreate;
  useFcEffect(() => {
    if (!open) return;
    const fn = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', fn);
    if (canSearch && searchRef.current) searchRef.current.focus();
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);
  const sel = options.find(o => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = canSearch && q ? options.filter(o => String(o.label).toLowerCase().includes(q)) : options;
  const exact = options.some(o => String(o.label).trim().toLowerCase() === q);
  const showCreate = !!onCreate && q.length > 0 && !exact;
  const pick = (v) => { onChange(v); setOpen(false); setQuery(''); };
  const handleCreate = () => { const created = onCreate(query.trim()); if (created != null) onChange(created); setOpen(false); setQuery(''); };
  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ ...FC_INPUT_STYLE, display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', textAlign: 'left', borderColor: open ? 'var(--brand-primary)' : 'var(--border-hairline)', background: open ? 'var(--surface-1)' : 'var(--surface-2)' }}>
        {sel?.color && <span style={{ width: 9, height: 9, borderRadius: 3, background: sel.color, flexShrink: 0 }} />}
        {(sel?.icon || leadingIcon) && !sel?.color && <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-2)' }}>{sel?.icon || leadingIcon}</span>}
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: sel ? 'var(--fg-1)' : 'var(--fg-3)' }}>
          {sel ? sel.label : placeholder}
        </span>
        {sel?.right && <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, color: 'var(--fg-2)', fontVariantNumeric: 'tabular-nums' }}>{sel.right}</span>}
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 40, background: 'var(--surface-1)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-popover)', padding: 6, maxHeight: 280, overflowY: 'auto', border: '1px solid var(--border-hairline)' }}>
          {canSearch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '4px 8px', marginBottom: 4, borderBottom: '1px solid var(--border-hairline)' }}>
              <span className="material-icons" style={{ fontSize: 17, color: 'var(--fg-3)' }}>search</span>
              <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (showCreate) handleCreate(); else if (filtered[0]) pick(filtered[0].value); } }}
                placeholder={onCreate ? 'Buscar o crear…' : 'Buscar…'}
                style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)', padding: '5px 0' }} />
            </div>
          )}
          {filtered.map(o => {
            const active = o.value === value;
            return (
              <button key={String(o.value)} type="button" onClick={() => pick(o.value)}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = active ? 'var(--brand-primary-soft)' : 'transparent'}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-xs)', background: active ? 'var(--brand-primary-soft)' : 'transparent', textAlign: 'left', transition: 'background 120ms' }}>
                {o.color && <span style={{ width: 9, height: 9, borderRadius: 3, background: o.color, flexShrink: 0 }} />}
                {o.icon && !o.color && <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-2)' }}>{o.icon}</span>}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.label}</span>
                  {o.sub && <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>{o.sub}</span>}
                </span>
                {o.right && <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, color: 'var(--fg-2)', fontVariantNumeric: 'tabular-nums' }}>{o.right}</span>}
                {active && <span className="material-icons" style={{ fontSize: 16, color: 'var(--brand-primary)' }}>check</span>}
              </button>
            );
          })}
          {canSearch && filtered.length === 0 && !showCreate && (
            <div style={{ padding: '10px', fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-3)', textAlign: 'center' }}>Sin resultados</div>
          )}
          {showCreate && (
            <button type="button" onClick={handleCreate}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-primary-soft)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-xs)', background: 'transparent', textAlign: 'left', marginTop: filtered.length ? 4 : 0, borderTop: filtered.length ? '1px solid var(--border-hairline)' : 0 }}>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--brand-primary)' }}>add_circle</span>
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--brand-primary)' }}>{createLabel} “{query.trim()}”</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Switch ---------- */
function Switch({ on, onChange, label, sub, icon }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', border: '1px solid var(--border-hairline)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', padding: '11px 13px', background: on ? 'var(--brand-primary-soft)' : 'var(--surface-2)', transition: 'background 150ms', textAlign: 'left' }}>
      {icon && <span className="material-icons" style={{ fontSize: 19, color: on ? 'var(--brand-primary)' : 'var(--fg-2)' }}>{icon}</span>}
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>{label}</span>
        {sub && <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>{sub}</span>}
      </span>
      <span style={{ width: 38, height: 22, borderRadius: 999, background: on ? 'var(--brand-primary)' : 'var(--surface-3)', position: 'relative', flexShrink: 0, transition: 'background 180ms' }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 180ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </span>
    </button>
  );
}

Object.assign(window, { Field, TextInput, MoneyInput, Segmented, Picker, Switch, FC_INPUT_STYLE, fcFocus, fcBlur });
