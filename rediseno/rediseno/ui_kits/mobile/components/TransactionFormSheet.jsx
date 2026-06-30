/* ─── Structured Transaction Form — Mobile PRO ──────────────────────────
 * Brings the desktop tabular form to mobile Pro:
 *   • Tipo: Gasto · Ingreso · Transferir
 *   • Pago compuesto  — una operación pagada con VARIAS cuentas (split)
 *   • Monto compuesto — factura con ARTÍCULOS detallados (items)
 *   • Comisión        — fija · pago móvil · porcentaje (Venezuela)
 *
 * Lives in a bottom sheet. On submit it pushes a new movement into MOBILE_TX
 * so it shows up in the ledger immediately. Real app → POST /transactions.
 *
 * Props: open · onClose · mode('pro') · initialType · onSubmit
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useTFSState, useEffect: useTFSEffect } = React;

const TFS_CATS = ['Vivienda', 'Supermercado', 'Transporte', 'Salud', 'Entretenimiento', 'Educación', 'Suscripciones', 'Otro'];
const TFS_JAR_TONE = { brand: 'var(--brand-primary)', income: 'var(--income)', warn: 'var(--warning)' };
const tfsFmt = (n) => Math.abs(Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── field label ───────────────────────────────────────────────────── */
function MFLabel({ children }) {
  return <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{children}</span>;
}

/* ── inline accordion picker ───────────────────────────────────────── */
function MFPicker({ value, onChange, options, placeholder = 'Seleccionar', accent }) {
  const [open, setOpen] = useTFSState(false);
  const sel = options.find(o => o.value === value);
  return (
    <div style={{ border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, border: 0, background: 'transparent', cursor: 'pointer', padding: '12px 14px', textAlign: 'left' }}>
        {sel?.color && <span style={{ width: 9, height: 9, borderRadius: 3, background: sel.color, flexShrink: 0 }} />}
        {sel?.icon && !sel?.color && <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>{sel.icon}</span>}
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)', fontSize: 14, color: sel ? 'var(--fg-1)' : 'var(--fg-3)' }}>{sel ? sel.label : placeholder}</span>
        {sel?.right && <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, color: 'var(--fg-2)' }}>{sel.right}</span>}
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div style={{ borderTop: '1px solid var(--border-hairline)', maxHeight: 220, overflowY: 'auto', scrollbarWidth: 'none' }}>
          {options.map(o => {
            const on = o.value === value;
            return (
              <button key={String(o.value)} type="button" onClick={() => { onChange(o.value); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, border: 0, cursor: 'pointer', padding: '11px 14px', textAlign: 'left', background: on ? `color-mix(in srgb, ${accent} 12%, var(--surface-1))` : 'transparent' }}>
                {o.color && <span style={{ width: 9, height: 9, borderRadius: 3, background: o.color, flexShrink: 0 }} />}
                {o.icon && !o.color && <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>{o.icon}</span>}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 500, color: 'var(--fg-1)' }}>{o.label}</span>
                  {o.sub && <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>{o.sub}</span>}
                </span>
                {on && <span className="material-icons" style={{ fontSize: 17, color: accent }}>check</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── toggle row ────────────────────────────────────────────────────── */
function MFSwitch({ on, onChange, icon, label, sub, accent }) {
  return (
    <button type="button" onClick={() => onChange(!on)} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', border: on ? `1px solid ${accent}` : '1px solid var(--border-hairline)', cursor: 'pointer', borderRadius: 'var(--radius-md)', padding: '12px 14px', background: on ? `color-mix(in srgb, ${accent} 10%, var(--surface-1))` : 'var(--surface-2)', textAlign: 'left' }}>
      {icon && <span className="material-icons" style={{ fontSize: 19, color: on ? accent : 'var(--fg-2)' }}>{icon}</span>}
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>{label}</span>
        {sub && <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>{sub}</span>}
      </span>
      <span style={{ width: 40, height: 23, borderRadius: 999, background: on ? accent : 'var(--surface-3)', position: 'relative', flexShrink: 0, transition: 'background 180ms' }}>
        <span style={{ position: 'absolute', top: 2.5, left: on ? 19 : 2.5, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 180ms', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
      </span>
    </button>
  );
}

/* ── commission bar ────────────────────────────────────────────────── */
function MFCommission({ on, setOn, kind, setKind, value, setValue, amount, base, accent }) {
  const types = window.MOBILE_COMMISSION_TYPES || [];
  const total = Math.abs(Number(base) || 0) + (Number(amount) || 0);
  return (
    <div>
      <MFSwitch on={on} onChange={setOn} icon="receipt_long" label="Cobrar comisión" sub="Pago móvil, fija o porcentaje" accent={accent} />
      {on && (
        <div style={{ marginTop: 10, padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {types.map(ty => {
              const active = kind === ty.id;
              return (
                <button key={ty.id} type="button" onClick={() => setKind(ty.id)} style={{ flex: 1, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: active ? `1px solid ${accent}` : '1px solid var(--border-hairline)', cursor: 'pointer', padding: '9px 4px', borderRadius: 'var(--radius-sm)', background: active ? `color-mix(in srgb, ${accent} 12%, var(--surface-1))` : 'var(--surface-1)', color: active ? accent : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: active ? 700 : 500 }}>
                  <span className="material-icons" style={{ fontSize: 18 }}>{ty.icon}</span>{ty.label}
                </button>
              );
            })}
          </div>

          {kind === 'fija' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-3)' }}>$</span>
              <input type="number" inputMode="decimal" value={value} placeholder="0.00" onChange={e => setValue(e.target.value)} style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>monto fijo</span>
            </div>
          )}
          {kind === 'porcentaje' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <input type="number" inputMode="decimal" value={value} placeholder="1.50" onChange={e => setValue(e.target.value)} style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
              <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-3)' }}>%</span>
            </div>
          )}
          {kind === 'pagomovil' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', background: 'var(--info-soft)', borderRadius: 'var(--radius-sm)' }}>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--info-fg)' }}>smartphone</span>
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-1)' }}>Tarifa P2P <strong>0,30%</strong> · mín. Bs 2</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-3)' }}>BCV</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px solid var(--border-hairline)', paddingTop: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>Comisión ≈ <strong style={{ color: 'var(--fg-1)', fontFamily: 'var(--font-money)' }}>$ {tfsFmt(amount)}</strong></span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>Total <strong style={{ color: 'var(--fg-1)', fontFamily: 'var(--font-money)' }}>$ {tfsFmt(total)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── pago compuesto (split across accounts) ─────────────────────────── */
function MFPaymentsEditor({ payments, setPayments, acctOpts, accent }) {
  const upd = (i, k, v) => setPayments(payments.map((p, idx) => idx === i ? { ...p, [k]: v } : p));
  const add = () => setPayments([...payments, { accountId: acctOpts[0].value, amount: '' }]);
  const rm = (i) => setPayments(payments.filter((_, idx) => idx !== i));
  const total = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>Pagos ({payments.length})</span>
        <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: 'var(--fg-1)' }}>Σ $ {tfsFmt(total)}</span>
      </div>
      {payments.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1.5 }}><MFPicker value={p.accountId} onChange={v => upd(i, 'accountId', v)} options={acctOpts} accent={accent} /></div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, padding: '11px 10px', background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-3)' }}>$</span>
            <input type="number" inputMode="decimal" value={p.amount} placeholder="0.00" onChange={e => upd(i, 'amount', e.target.value)} style={{ width: '100%', minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
          </div>
          {payments.length > 1 && <button type="button" onClick={() => rm(i)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 18 }}>close</span></button>}
        </div>
      ))}
      <button type="button" onClick={add} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', color: accent, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '2px 0' }}><span className="material-icons" style={{ fontSize: 16 }}>add</span>Añadir cuenta</button>
    </div>
  );
}

/* ── monto compuesto (itemized invoice) ─────────────────────────────── */
function MFItemsEditor({ items, setItems, catOpts, accent }) {
  const upd = (i, k, v) => setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const add = () => setItems([...items, { name: '', qty: 1, amount: '', category: null }]);
  const rm = (i) => setItems(items.filter((_, idx) => idx !== i));
  // Estado vacío (2.2): aún no hay ítems en la factura
  if (!items.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '26px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px dashed var(--border-hairline)', textAlign: 'center' }}>
        <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--surface-1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-icons" style={{ fontSize: 24, color: 'var(--fg-3)' }}>receipt_long</span>
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>Sin ítems todavía</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-3)', marginTop: 2 }}>Desglosa la factura línea por línea. El total se suma solo.</div>
        </div>
        <button type="button" onClick={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, cursor: 'pointer', padding: '10px 16px', borderRadius: 'var(--radius-pill)', background: accent, color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700 }}><span className="material-icons" style={{ fontSize: 16 }}>add</span>Añadir primer ítem</button>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>Ítems de la factura</span>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 11, borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <input value={it.name} placeholder={`Ítem ${i + 1}`} onChange={e => upd(i, 'name', e.target.value)} style={{ flex: 1, minWidth: 0, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '9px 11px', outline: 'none', background: 'var(--surface-2)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)' }} />
            {items.length > 1 && <button type="button" onClick={() => rm(i)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 18 }}>close</span></button>}
          </div>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <input type="number" value={it.qty} onChange={e => upd(i, 'qty', e.target.value)} title="Cantidad" style={{ width: 50, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '9px 8px', outline: 'none', background: 'var(--surface-2)', fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-1)', textAlign: 'center' }} />
            <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>×</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, padding: '9px 10px', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-3)' }}>$</span>
              <input type="number" inputMode="decimal" value={it.amount} placeholder="0.00" onChange={e => upd(i, 'amount', e.target.value)} style={{ width: '100%', minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-1)' }} />
            </div>
          </div>
          <MFPicker value={it.category} onChange={v => upd(i, 'category', v)} options={catOpts} placeholder="Categoría" accent={accent} />
        </div>
      ))}
      <button type="button" onClick={add} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', color: accent, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '2px 0' }}><span className="material-icons" style={{ fontSize: 16 }}>add</span>Añadir ítem</button>
    </div>
  );
}

/* ═══════════════════════════ MAIN SHEET ═══════════════════════════════ */
/* ── Selector de categorías B+C (mobile: trigger + bottom sheet) ──────────
 * Buscador siempre arriba (C); en frío, cuadrícula agrupada y coloreada por
 * cántaro (B); al escribir, lista plana filtrada. El cántaro entra anclado. */
const MFC_DISP = { '#1E3A8A': '#5B7FD6' };
const mfcJarColor = (j) => j ? (MFC_DISP[j.color] || j.color) : 'var(--fg-3)';
const mfcTint = (c, p) => `color-mix(in srgb, ${c} ${p}%, var(--surface-1))`;

function MFCategoryField({ value, onChange, kind = 'expense', accent }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const cats = (window.OWF_CATEGORIES || []).filter(c => kind ? c.kind === kind : true);
  const sel = value != null ? cats.find(c => c.id === value) : null;
  const selJar = sel ? window.owfJarForCategory(sel.id) : null;
  const groups = (window.OWF_CATEGORY_GROUPS || []).filter(g => g.jarId && cats.some(c => c.jarId === g.jarId));
  const ql = q.trim().toLowerCase();
  const matches = ql ? cats.filter(c => c.name.toLowerCase().includes(ql)) : [];
  const pick = (id) => { onChange(id); setOpen(false); setQ(''); };

  return (
    <React.Fragment>
      <button type="button" onClick={() => setOpen(true)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '13px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', cursor: 'pointer', minHeight: 47 }}>
        <span className="material-icons" style={{ fontSize: 18, color: sel ? mfcJarColor(selJar) : 'var(--fg-3)' }}>{sel ? sel.icon : 'sell'}</span>
        <span style={{ flex: 1, minWidth: 0, textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? 'var(--fg-1)' : 'var(--fg-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sel ? sel.name : (value === null ? 'Sin categoría' : 'Elegir categoría')}</span>
        <span className="material-icons" style={{ fontSize: 20, color: 'var(--fg-3)' }}>unfold_more</span>
      </button>

      <MobileBottomSheet open={open} onClose={() => { setOpen(false); setQ(''); }} title="Categoría" maxHeight="86%">
        <div style={{ padding: '0 20px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
            <span className="material-icons" style={{ fontSize: 19, color: 'var(--fg-3)' }}>search</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Escribe para buscar…" autoFocus
              style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-1)' }} />
            {q && <span className="material-icons" onClick={() => setQ('')} style={{ fontSize: 18, color: 'var(--fg-3)' }}>close</span>}
          </div>
        </div>

        <div style={{ padding: '8px 20px 28px' }}>
          {kind !== 'income' && !ql && (
            <button type="button" onClick={() => pick(null)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', marginBottom: 12, border: 0, borderRadius: 'var(--radius-md)', background: value === null ? 'var(--surface-2)' : 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)' }}>
              <span className="material-icons" style={{ fontSize: 19, color: 'var(--fg-3)' }}>block</span>Sin categoría
            </button>
          )}

          {!ql && groups.map(g => {
            const jar = window.owfJar(g.jarId); const c = mfcJarColor(jar);
            return (
              <div key={g.jarId} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', color: c }}>{g.label.toUpperCase()}</span>
                  <span style={{ fontFamily: 'var(--font-money)', fontSize: 10.5, color: 'var(--fg-3)' }}>{jar.percent}%</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-hairline)' }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {cats.filter(x => x.jarId === g.jarId).map(cat => {
                    const on = cat.id === value;
                    return (
                      <button key={cat.id} type="button" onClick={() => pick(cat.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 13px', borderRadius: 999, cursor: 'pointer', minHeight: 44,
                          background: on ? c : mfcTint(c, 12), border: `1px solid ${on ? c : mfcTint(c, 28)}`,
                          fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? '#fff' : 'var(--fg-1)' }}>
                        <span className="material-icons" style={{ fontSize: 16, color: on ? '#fff' : c }}>{cat.icon}</span>{cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {ql && (matches.length ? matches.map(cat => {
            const jar = window.owfJarForCategory(cat.id); const c = mfcJarColor(jar); const on = cat.id === value;
            return (
              <button key={cat.id} type="button" onClick={() => pick(cat.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: 0, borderRadius: 'var(--radius-md)', background: on ? mfcTint(c, 14) : 'transparent', cursor: 'pointer' }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: mfcTint(c, 16), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-icons" style={{ fontSize: 18, color: c }}>{cat.icon}</span>
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: on ? 700 : 500, color: 'var(--fg-1)' }}>{cat.name}</span>
                {jar && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: mfcTint(c, 14) }}><span style={{ width: 7, height: 7, borderRadius: 2, background: c }} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, color: 'var(--fg-2)' }}>{jar.name}</span></span>}
              </button>
            );
          }) : <div style={{ padding: '24px 8px', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-3)' }}>Sin resultados para “{q}”</div>)}
        </div>
      </MobileBottomSheet>
    </React.Fragment>
  );
}

/* cántaro anclado (solo lectura, derivado de la categoría) */
function MFAnchoredJar({ category, accent }) {
  const jar = window.owfJarForCategory ? window.owfJarForCategory(category) : null;
  if (!category) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px dashed var(--border-hairline)', minHeight: 47 }}>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>savings</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.25 }}>Entra con la categoría</span>
      </div>
    );
  }
  if (!jar) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', minHeight: 47 }}>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>block</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.25 }}>Sin cántaro</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: `color-mix(in srgb, ${jar.color} 11%, var(--surface-1))`, border: `1px solid color-mix(in srgb, ${jar.color} 28%, transparent)`, minHeight: 47 }}>
      <span style={{ width: 24, height: 24, borderRadius: 7, background: jar.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-icons" style={{ fontSize: 15, color: '#fff' }}>{jar.icon}</span>
      </span>
      <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{jar.name}</span>
      <span className="material-icons" style={{ fontSize: 14, color: 'var(--fg-3)', flexShrink: 0 }}>lock</span>
    </div>
  );
}

function TransactionFormSheet({ open, onClose, mode = 'pro', initialType = 'expense', onSubmit }) {
  const accounts = window.MOBILE_ACCOUNTS || [];
  const acctOpts = accounts.map(a => ({ value: a.id, label: a.name, sub: a.currency, color: a.color }));
  const catOpts = [{ value: null, label: 'Sin categoría', icon: 'block' }, ...(window.OWF_CATEGORIES || []).filter(c => c.kind !== 'income').map(c => ({ value: c.id, label: c.name, icon: c.icon }))];

  const [type, setType]         = useTFSState(initialType);
  const [amount, setAmount]     = useTFSState('');
  const [concept, setConcept]   = useTFSState('');
  const [accountId, setAccountId] = useTFSState(1);
  const [toAccountId, setToAcct]  = useTFSState(2);
  const [categoryId, setCat]    = useTFSState(null);
  const [jarId, setJar]         = useTFSState(null);
  const [splitOn, setSplitOn]   = useTFSState(false);
  const [itemsOn, setItemsOn]   = useTFSState(false);
  const [payments, setPayments] = useTFSState([{ accountId: 1, amount: '' }, { accountId: 4, amount: '' }]);
  const [items, setItems]       = useTFSState([{ name: '', qty: 1, amount: '', category: null }]);
  const [commOn, setCommOn]     = useTFSState(false);
  const [commKind, setCommKind] = useTFSState('pagomovil');
  const [commValue, setCommVal] = useTFSState('');
  const [targetBalance, setTargetBalance] = useTFSState('');

  useTFSEffect(() => {
    if (open) {
      setType(initialType); setAmount(''); setConcept(''); setAccountId(1); setToAcct(2);
      setCat(null); setJar(null); setSplitOn(false); setItemsOn(false);
      setPayments([{ accountId: 1, amount: '' }, { accountId: 4, amount: '' }]);
      setItems([]); setCommOn(false); setCommKind('pagomovil'); setCommVal(''); setTargetBalance('');
    }
  }, [open, initialType]);

  if (!open) return null;

  const accentMap = { expense: 'var(--info)', income: 'var(--income)', transfer: '#8B5CF6', ajuste: 'var(--warning)' };
  const accent = accentMap[type] || 'var(--info)';
  const isTransfer = type === 'transfer';
  const isIncome = type === 'income';
  const isAjuste = type === 'ajuste';
  const selAccount = accounts.find(a => a.id === accountId);
  const adjustDelta = (Number(targetBalance) || 0) - (selAccount ? selAccount.balance : 0);
  const itemsTotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.amount) || 0), 0);
  const splitTotal = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const baseAmount = itemsOn ? itemsTotal : (splitOn && !isTransfer ? splitTotal : (Number(amount) || 0));

  const commValForCalc = commKind === 'pagomovil' ? window.MOBILE_PAGOMOVIL_PCT : (Number(commValue) || 0);
  const commAmount = commOn ? window.mobileComputeCommission(commKind, commValForCalc, baseAmount) : 0;

  const submit = () => {
    const newId = Math.max(0, ...window.MOBILE_TX.map(t => t.id)) + 1;
    if (isAjuste) {
      window.MOBILE_TX.unshift({ id: newId, label: concept.trim() || 'Ajuste de saldo', amount: adjustDelta, day: 'Hoy · Mar 14', time: '', category: 'Ajuste', acctId: accountId, m: 2, y: 2026, commission: null });
      onSubmit && onSubmit(); onClose(); return;
    }
    const total = baseAmount;
    const sign = isIncome ? 1 : -1;
    const commission = commOn ? { type: commKind, value: commValForCalc, amount: +commAmount.toFixed(2), currency: 'USD' } : null;
    const acctFor = splitOn && !isTransfer ? payments[0].accountId : accountId;
    const label = concept.trim() || (isTransfer ? 'Transferencia' : itemsOn ? 'Factura' : isIncome ? 'Ingreso' : 'Movimiento');
    const category = isTransfer ? 'Transferencia' : (categoryId ? ((window.owfCategory && window.owfCategory(categoryId) || {}).name || 'Otro') : (itemsOn ? 'Factura' : 'Otro'));
    window.MOBILE_TX.unshift({ id: newId, label, amount: sign * Math.abs(total), day: 'Hoy · Mar 14', time: '', category, acctId: acctFor, m: 2, y: 2026, commission });
    onSubmit && onSubmit();
    onClose();
  };

  // ── Vista-resumen para preview card (2.6) + validación (2.5) ──
  const summaryView = {
    type,
    amount: isAjuste ? Math.abs(adjustDelta) : baseAmount,
    currencySym: '$',
    account: selAccount ? selAccount.name : null,
    toAccount: isTransfer ? (accounts.find(a => a.id === toAccountId) || {}).name : null,
    sameAccount: accountId === toAccountId,
    category: !isTransfer && !isAjuste && categoryId != null ? ((window.owfCategory && window.owfCategory(categoryId) || {}).name) : null,
    jar: (!isTransfer && !isAjuste && window.owfJarForCategory && window.owfJarForCategory(categoryId)) ? window.owfJarForCategory(categoryId).name : null,
    itemsCount: itemsOn ? items.length : 1,
    splitCount: splitOn && !isTransfer ? payments.length : 1,
    splitBalanced: true,
    commission: commOn ? commAmount : 0,
    targetBalance: Number(targetBalance) || 0,
    balanceDelta: adjustDelta,
  };

  const moneyInput = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
      <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 28, color: 'var(--fg-3)' }}>$</span>
      <input type="number" inputMode="decimal" value={amount} placeholder="0.00" onChange={e => setAmount(e.target.value)} style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 28, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
    </div>
  );

  const conceptInput = (
    <input value={concept} onChange={e => setConcept(e.target.value)} placeholder="Concepto (opcional)" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)', background: 'var(--surface-2)', outline: 'none' }} />
  );

  return (
    <MobileBottomSheet open={open} onClose={onClose} title="Nuevo movimiento · Pro" maxHeight="94%">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 20px 28px' }}>

        {/* Tipo */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
          {[['expense', 'Gasto', 'arrow_outward'], ['income', 'Ingreso', 'arrow_downward'], ['transfer', 'Transferir', 'swap_horiz'], ['ajuste', 'Ajuste', 'tune']].map(([k, lbl, icon]) => {
            const on = type === k;
            return (
              <button key={k} onClick={() => setType(k)} style={{ flex: 1, border: 0, cursor: 'pointer', padding: '9px 2px', borderRadius: 'var(--radius-pill)', background: on ? 'var(--surface-1)' : 'transparent', color: on ? accentMap[k] : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontWeight: on ? 700 : 500, fontSize: 11.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, boxShadow: on ? 'var(--shadow-card)' : 'none' }}>
                <span className="material-icons" style={{ fontSize: 14 }}>{icon}</span>{lbl}
              </button>
            );
          })}
        </div>

        {/* ── TRANSFERENCIA ── */}
        {isTransfer && (
          <>
            {moneyInput}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <MFLabel>Desde (origen)</MFLabel>
              <MFPicker value={accountId} onChange={setAccountId} options={acctOpts} accent={accent} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <MFLabel>Hacia (destino)</MFLabel>
              <MFPicker value={toAccountId} onChange={setToAcct} options={acctOpts.filter(o => o.value !== accountId)} accent={accent} />
            </div>
            <MFCommission on={commOn} setOn={setCommOn} kind={commKind} setKind={setCommKind} value={commValue} setValue={setCommVal} amount={commAmount} base={baseAmount} accent={accent} />
            {conceptInput}
          </>
        )}

        {/* ── AJUSTE DE SALDO ── */}
        {isAjuste && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <MFLabel>Cuenta a ajustar</MFLabel>
              <MFPicker value={accountId} onChange={setAccountId} options={acctOpts} accent={accent} />
              {selAccount && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>Saldo actual <span style={{ fontFamily: 'var(--font-money)', color: 'var(--fg-2)' }}>$ {tfsFmt(selAccount.balance)}</span></span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <MFLabel>Nuevo saldo</MFLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 28, color: 'var(--fg-3)' }}>$</span>
                <input type="number" inputMode="decimal" value={targetBalance} placeholder={selAccount ? tfsFmt(selAccount.balance) : '0.00'} onChange={e => setTargetBalance(e.target.value)} style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 28, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
              </div>
            </div>
            {/* delta preview */}
            {targetBalance !== '' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: adjustDelta >= 0 ? 'var(--income-soft)' : 'var(--expense-soft)' }}>
                <span className="material-icons" style={{ fontSize: 22, color: adjustDelta >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)' }}>{adjustDelta >= 0 ? 'trending_up' : 'trending_down'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>Se creará un ajuste de</div>
                  <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 18, color: adjustDelta >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)' }}>{adjustDelta >= 0 ? '+' : '−'} $ {tfsFmt(Math.abs(adjustDelta))}</div>
                </div>
              </div>
            )}
            <input value={concept} onChange={e => setConcept(e.target.value)} placeholder="Motivo (opcional)" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)', background: 'var(--surface-2)', outline: 'none' }} />
          </>
        )}

        {/* ── GASTO / INGRESO ── */}
        {!isTransfer && !isAjuste && (
          <>
            {!itemsOn && moneyInput}
            {itemsOn && (
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>Total (suma de ítems)</span>
                <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)' }}>$ {tfsFmt(itemsTotal)}</span>
              </div>
            )}

            {/* cuenta / pago compuesto */}
            {!splitOn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <MFLabel>Cuenta de origen</MFLabel>
                <MFPicker value={accountId} onChange={setAccountId} options={acctOpts} accent={accent} />
              </div>
            ) : (
              <MFPaymentsEditor payments={payments} setPayments={setPayments} acctOpts={acctOpts} accent={accent} />
            )}

            {/* categoría + cántaro (cuando no es factura) */}
            {!itemsOn && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <MFLabel>Categoría</MFLabel>
                  <MFCategoryField value={categoryId} onChange={setCat} kind={isIncome ? 'income' : 'expense'} accent={accent} />
                </div>
                {!isIncome && (
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <MFLabel>Cántaro</MFLabel>
                  <MFAnchoredJar category={categoryId} accent={accent} />
                </div>
                )}
              </div>
            )}

            {/* factura (monto compuesto) */}
            {itemsOn && <MFItemsEditor items={items} setItems={setItems} catOpts={catOpts} accent={accent} />}

            {!itemsOn && conceptInput}

            {/* avanzado */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <MFSwitch on={splitOn} onChange={setSplitOn} icon="call_split" label="Pago compuesto" sub="Una operación, varias cuentas" accent={accent} />
              <MFSwitch on={itemsOn} onChange={setItemsOn} icon="receipt_long" label="Monto compuesto" sub="Factura con ítems detallados" accent={accent} />
            </div>

            <MFCommission on={commOn} setOn={setCommOn} kind={commKind} setKind={setCommKind} value={commValue} setValue={setCommVal} amount={commAmount} base={baseAmount} accent={accent} />
          </>
        )}

        {/* Preview card + validación + guardar con estados (2.4/2.5/2.6) */}
        <MFReview view={summaryView} accent={accent} onClose={onClose} onSubmit={submit}
          label={isTransfer ? 'Registrar transferencia' : isAjuste ? 'Aplicar ajuste' : isIncome ? 'Registrar ingreso' : 'Registrar gasto'} />
      </div>
    </MobileBottomSheet>
  );
}

/* ── Review mobile: preview card + validación + guardar con estados ── */
function MFReview({ view, accent, onClose, onSubmit, label }) {
  const [status, setStatus] = useTFSState('idle');
  const valid = window.owfValidateTx ? window.owfValidateTx(view) : { ok: true, reasons: [] };
  const complex = window.owfTxIsComplex ? window.owfTxIsComplex(view) : false;
  const summary = window.owfTxSummary ? window.owfTxSummary(view) : '';
  const go = () => {
    if (!valid.ok || status !== 'idle') return;
    setStatus('loading');
    setTimeout(() => { setStatus('success'); setTimeout(() => { onSubmit && onSubmit(); }, 650); }, 720);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
      {/* preview card */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: complex ? `color-mix(in srgb, ${accent} 9%, var(--surface-1))` : 'var(--surface-2)', border: `1px solid ${complex ? `color-mix(in srgb, ${accent} 26%, transparent)` : 'var(--border-hairline)'}` }}>
        <span className="material-icons" style={{ fontSize: 19, color: accent, marginTop: 1 }}>{complex ? 'fact_check' : 'visibility'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 3 }}>Vas a registrar</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--fg-1)' }}>{summary}</div>
        </div>
      </div>
      {/* reasons */}
      {!valid.ok && valid.reasons.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>
          <span className="material-icons" style={{ fontSize: 16, color: 'var(--warning)' }}>error_outline</span>{r}
        </div>
      ))}
      {/* footer */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: '0 0 auto', border: '1px solid var(--border-hairline)', background: 'var(--surface-2)', cursor: 'pointer', padding: '13px 20px', borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>Cancelar</button>
        <button onClick={go} disabled={!valid.ok || status !== 'idle'} style={{ flex: 1, border: 0, cursor: valid.ok && status === 'idle' ? 'pointer' : 'not-allowed', padding: '13px', borderRadius: 'var(--radius-pill)', background: status === 'success' ? 'var(--income)' : valid.ok ? accent : 'var(--surface-3)', color: valid.ok || status === 'success' ? '#fff' : 'var(--fg-3)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 200ms' }}>
          {status === 'loading' && <><span className="material-icons mfs-spin" style={{ fontSize: 18 }}>progress_activity</span>Guardando…</>}
          {status === 'success' && <><span className="material-icons" style={{ fontSize: 18 }}>check_circle</span>Registrado</>}
          {status === 'idle' && <><span className="material-icons" style={{ fontSize: 18 }}>{complex ? 'task_alt' : 'check'}</span>{complex ? 'Confirmar y registrar' : label}</>}
        </button>
      </div>
      <style>{`@keyframes mfsSpin{to{transform:rotate(360deg)}}.mfs-spin{animation:mfsSpin 800ms linear infinite}`}</style>
    </div>
  );
}

Object.assign(window, { TransactionFormSheet });
