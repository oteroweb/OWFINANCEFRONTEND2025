/* ─── CategorySelector — selector de categorías B+C (desktop) ───────────
 * Híbrido aprobado:
 *   · Buscador siempre visible arriba (enfoque C — "buscar primero").
 *   · En frío: categorías en cuadrícula, AGRUPADAS Y COLOREADAS por cántaro
 *     (enfoque B). El color enseña el modelo categoría→cántaro.
 *   · Al escribir: colapsa a lista plana filtrada, con el cántaro como
 *     píldora al final de cada fila.
 * El cántaro NUNCA se elige aquí: entra anclado a la categoría (lo muestra
 * el <AnchoredJar> del formulario, fuera de este selector).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useCsState, useRef: useCsRef, useEffect: useCsEffect } = React;

/* Color de cántaro tuneado para superficies oscuras (navy se aclara) */
const CS_DISP = { '#1E3A8A': '#5B7FD6' };
function csJarColor(jar) { return jar ? (CS_DISP[jar.color] || jar.color) : 'var(--fg-3)'; }
function csTint(c, p) { return `color-mix(in srgb, ${c} ${p}%, var(--surface-1))`; }

function CategorySelector({ value, onChange, kind = 'expense', allowNull = false, placeholder = 'Elige una categoría' }) {
  const [open, setOpen] = useCsState(false);
  const [q, setQ] = useCsState('');
  const ref = useCsRef(null);
  const inputRef = useCsRef(null);
  const T = (s) => (window.t ? window.t(s) : s);

  useCsEffect(() => {
    if (!open) return;
    const close = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQ(''); } };
    document.addEventListener('mousedown', close);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 40);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const cats = (window.OWF_CATEGORIES || []).filter(c => kind ? c.kind === kind : true);
  const sel = value != null ? cats.find(c => c.id === value) : null;
  const selJar = sel ? (window.owfJarForCategory ? window.owfJarForCategory(sel.id) : null) : null;
  const groups = (window.OWF_CATEGORY_GROUPS || []).filter(g => g.jarId && cats.some(c => c.jarId === g.jarId));
  const ql = q.trim().toLowerCase();
  const matches = ql ? cats.filter(c => T(c.name).toLowerCase().includes(ql)) : [];

  const pick = (id) => { onChange(id); setOpen(false); setQ(''); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
          border: `1px solid ${open ? 'var(--brand-primary)' : 'var(--border-hairline)'}`, borderRadius: 'var(--radius-sm)',
          padding: '11px 13px', background: open ? 'var(--surface-1)' : 'var(--surface-2)', textAlign: 'left', transition: 'border-color 150ms, background 150ms' }}>
        {sel
          ? <span className="material-icons" style={{ fontSize: 18, color: csJarColor(selJar) }}>{sel.icon}</span>
          : <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>sell</span>}
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? 'var(--fg-1)' : 'var(--fg-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sel ? T(sel.name) : (value === null && allowNull ? T('Sin categoría') : T(placeholder))}
        </span>
        <span className="material-icons" style={{ fontSize: 20, color: 'var(--fg-3)' }}>{open ? 'expand_less' : 'expand_more'}</span>
      </button>

      {/* Popover */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 80,
          background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)',
          boxShadow: '0 22px 60px rgba(0,0,0,.5)', overflow: 'hidden', minWidth: 320 }}>
          {/* Search (always visible — enfoque C) */}
          <div style={{ padding: 12, borderBottom: '1px solid var(--border-hairline)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }}>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>search</span>
              <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder={T('Escribe para buscar…')}
                style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)' }} />
              {q && <span className="material-icons" onClick={() => setQ('')} style={{ fontSize: 17, color: 'var(--fg-3)', cursor: 'pointer' }}>close</span>}
            </div>
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto', padding: 12 }}>
            {allowNull && !ql && (
              <button type="button" onClick={() => pick(null)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', marginBottom: 10, border: 0, borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: value === null ? 'var(--surface-2)' : 'transparent', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>
                <span className="material-icons" style={{ fontSize: 17, color: 'var(--fg-3)' }}>block</span>{T('Sin categoría')}
              </button>
            )}

            {/* COLD: grid grouped by jar (enfoque B) */}
            {!ql && groups.map(g => {
              const jar = window.owfJar(g.jarId); const c = csJarColor(jar);
              return (
                <div key={g.jarId} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: c }}>{T(g.label).toUpperCase()}</span>
                    <span style={{ fontFamily: 'var(--font-money)', fontSize: 10.5, color: 'var(--fg-3)' }}>{jar.percent}%</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {cats.filter(x => x.jarId === g.jarId).map(cat => {
                      const on = cat.id === value;
                      return (
                        <button key={cat.id} type="button" onClick={() => pick(cat.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 11px', borderRadius: 999, cursor: 'pointer',
                            background: on ? c : csTint(c, 12), border: `1px solid ${on ? c : csTint(c, 28)}`,
                            fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: on ? 700 : 500, color: on ? '#fff' : 'var(--fg-1)' }}>
                          <span className="material-icons" style={{ fontSize: 15, color: on ? '#fff' : c }}>{cat.icon}</span>
                          {T(cat.name)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* HOT: flat filtered list (enfoque C) */}
            {ql && (matches.length ? matches.map(cat => {
              const jar = window.owfJarForCategory(cat.id); const c = csJarColor(jar); const on = cat.id === value;
              return (
                <button key={cat.id} type="button" onClick={() => pick(cat.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 11px', border: 0, borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: on ? csTint(c, 14) : 'transparent', marginBottom: 2 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: csTint(c, 16), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-icons" style={{ fontSize: 17, color: c }}>{cat.icon}</span>
                  </span>
                  <span style={{ flex: 1, textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: on ? 700 : 500, color: 'var(--fg-1)' }}>{T(cat.name)}</span>
                  {jar && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: csTint(c, 14) }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: c }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)' }}>{T(jar.name)}</span>
                    </span>
                  )}
                </button>
              );
            }) : (
              <div style={{ padding: '20px 8px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-3)' }}>{T('Sin resultados para')} “{q}”</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CategorySelector });
