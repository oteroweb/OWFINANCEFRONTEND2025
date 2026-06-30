/* ─── OW Finance Mobile — Transaction Filters ────────────────────────────
 * Mobile-native versions of the desktop filter organisms:
 *   AccountFilter   — smart grouped multi-select (segments · search · folders)   [PRO]
 *   ExchangeRates   — editable USD-base rate sheet                                [PRO]
 *   SmartFilter     — type · category · day · amount, all as a bottom sheet       [both]
 *
 * All built on <MobileBottomSheet>. Controlled components.
 * Currency helpers convert native balances to USD for combined totals.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useTfState } = React;

/* ── currency helpers ──────────────────────────────────────────────────── */
function mAcctRate(cur) { return (window.MOBILE_RATES || {})[cur] || 1; }
function mToUSD(amount, cur) { return amount / mAcctRate(cur); }
function mFmtNative(n, cur) {
  const a = Math.abs(n);
  if (cur === 'VES') return `Bs. ${a.toLocaleString('es-VE', { maximumFractionDigits: 0 })}`;
  if (cur === 'EUR') return `€ ${a.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  return `$ ${a.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}
function mUSD(n) { return `${n < 0 ? '−' : ''}$ ${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`; }

const TF_TYPE_ICON = { bank: 'account_balance', cash: 'payments', card: 'credit_card', cashea: 'shopping_bag' };

/* ── checkbox visual ───────────────────────────────────────────────────── */
function TfCheck({ on, partial = false, accent }) {
  return (
    <span style={{
      width: 20, height: 20, flexShrink: 0, borderRadius: 6, display: 'grid', placeItems: 'center',
      border: (on || partial) ? `1.5px solid ${accent}` : '1.5px solid var(--fg-3)',
      background: (on || partial) ? accent : 'transparent', transition: 'all 120ms',
    }}>
      {on && <span className="material-icons" style={{ fontSize: 15, color: '#fff' }}>check</span>}
      {partial && !on && <span style={{ width: 9, height: 2, borderRadius: 2, background: '#fff' }} />}
    </span>
  );
}

/* ── trigger pill (shared look) ────────────────────────────────────────── */
function FilterPill({ icon, label, count, active, accent, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
      padding: '9px 15px', borderRadius: 'var(--radius-pill)', border: 0,
      background: active ? accent : 'var(--surface-1)',
      color: active ? '#fff' : 'var(--fg-1)',
      boxShadow: active ? 'none' : 'var(--shadow-card)',
      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
    }}>
      <span className="material-icons" style={{ fontSize: 18 }}>{icon}</span>
      {label}
      {count > 0 && (
        <span style={{ background: active ? 'rgba(255,255,255,.28)' : 'var(--brand-primary)', color: '#fff', borderRadius: 'var(--radius-pill)', minWidth: 18, height: 18, display: 'inline-grid', placeItems: 'center', fontSize: 11, fontFamily: 'var(--font-money)', padding: '0 5px' }}>{count}</span>
      )}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * AccountFilter — PRO
 * ════════════════════════════════════════════════════════════════════════ */
function AccountFilter({ selected = [], onChange, hidden = false, accent = 'var(--info)' }) {
  const [open, setOpen] = useTfState(false);
  const [q, setQ] = useTfState('');
  const all = window.MOBILE_ACCOUNTS || [];
  const groups = window.MOBILE_ACCOUNT_GROUPS || [];
  const sel = new Set(selected);
  const set = (arr) => onChange(Array.from(new Set(arr)));
  const toggle = (id) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); set([...n]); };

  const segments = [
    { id: 'all',  label: 'Todas',     test: null },
    { id: 'usd',  label: 'Solo USD',  test: a => a.currency === 'USD' },
    { id: 'ves',  label: 'Solo VES',  test: a => a.currency === 'VES' },
    { id: 'debt', label: 'Con deuda', test: a => a.balance < 0 },
  ];
  const applySeg = (seg) => seg.test ? set(all.filter(seg.test).map(a => a.id)) : set([]);
  const activeSeg = (() => {
    if (sel.size === 0) return 'all';
    for (const seg of segments) {
      if (!seg.test) continue;
      const ids = all.filter(seg.test).map(a => a.id);
      if (ids.length === sel.size && ids.every(i => sel.has(i))) return seg.id;
    }
    return null;
  })();

  const matchesQ = (a) => !q.trim() || a.name.toLowerCase().includes(q.toLowerCase());
  const selCount = sel.size;
  const combinedUSD = all.filter(a => sel.has(a.id)).reduce((s, a) => s + mToUSD(a.balance, a.currency), 0);
  const pillLabel = selCount === 0 ? 'Todas las cuentas' : selCount === 1 ? (all.find(a => sel.has(a.id))?.name || 'Cuenta') : `${selCount} cuentas`;

  return (
    <React.Fragment>
      <FilterPill icon="account_balance_wallet" label={pillLabel} count={selCount > 1 ? selCount : 0} active={selCount > 0} accent={accent} onClick={() => setOpen(true)} />

      <MobileBottomSheet open={open} onClose={() => setOpen(false)} title="Filtrar por cuenta" onClear={selCount > 0 ? () => set([]) : null}>
        {/* Segments */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {segments.map(seg => {
            const on = activeSeg === seg.id;
            return (
              <button key={seg.id} onClick={() => applySeg(seg)} style={{
                flexShrink: 0, border: 0, cursor: 'pointer', padding: '8px 14px', borderRadius: 'var(--radius-pill)',
                background: on ? `color-mix(in srgb, ${accent} 16%, var(--surface-1))` : 'var(--surface-2)',
                color: on ? accent : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: on ? 700 : 500,
              }}>{seg.label}</button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)' }}>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>search</span>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cuenta…"
              style={{ border: 0, outline: 'none', background: 'transparent', flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)' }} />
            {q && <span className="material-icons" onClick={() => setQ('')} style={{ fontSize: 17, color: 'var(--fg-3)', cursor: 'pointer' }}>close</span>}
          </div>
        </div>

        {/* Grouped list */}
        <div style={{ padding: '4px 12px' }}>
          {groups.map(group => {
            const accts = all.filter(a => a.group === group);
            const visible = accts.filter(matchesQ);
            if (!visible.length) return null;
            const ids = accts.map(a => a.id);
            const allOn = ids.every(i => sel.has(i));
            const someOn = ids.some(i => sel.has(i));
            const groupUSD = accts.reduce((s, a) => s + mToUSD(a.balance, a.currency), 0);
            return (
              <div key={group} style={{ marginBottom: 6 }}>
                <div onClick={() => { const n = new Set(sel); ids.forEach(i => allOn ? n.delete(i) : n.add(i)); set([...n]); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 10px', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}>
                  <TfCheck on={allOn} partial={someOn && !allOn} accent={accent} />
                  <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{group}</span>
                  <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, fontWeight: 600, color: groupUSD < 0 ? 'var(--expense-fg)' : 'var(--fg-2)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : mUSD(groupUSD)}</span>
                </div>
                {visible.map(a => {
                  const on = sel.has(a.id);
                  return (
                    <div key={a.id} onClick={() => toggle(a.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 11, padding: '10px', cursor: 'pointer', borderRadius: 'var(--radius-md)',
                      background: on ? `color-mix(in srgb, ${accent} 9%, var(--surface-1))` : 'transparent',
                    }}>
                      <TfCheck on={on} accent={accent} />
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <span className="material-icons" style={{ fontSize: 18, color: '#fff' }}>{TF_TYPE_ICON[a.type] || 'account_balance'}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{a.currency}{a.last4 ? ` · ····${a.last4}` : ''}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: a.balance < 0 ? 'var(--expense-fg)' : 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : (a.balance < 0 ? '−' : '') + mFmtNative(a.balance, a.currency)}</span>
                        {a.currency !== 'USD' && !hidden && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-3)', fontVariantNumeric: 'tabular-nums' }}>≈ {mUSD(mToUSD(a.balance, a.currency))}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ position: 'sticky', bottom: 0, padding: '12px 20px 20px', background: 'var(--surface-1)', borderTop: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{selCount === 0 ? 'Todas las cuentas' : `${selCount} ${selCount === 1 ? 'cuenta' : 'cuentas'}`}</span>
            {selCount > 0 && <span style={{ fontFamily: 'var(--font-money)', fontSize: 15, fontWeight: 700, color: combinedUSD < 0 ? 'var(--expense-fg)' : 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '$ ••••' : mUSD(combinedUSD)} <span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--fg-3)' }}>combinado</span></span>}
          </div>
          <button onClick={() => setOpen(false)} style={{ border: 0, cursor: 'pointer', padding: '12px 26px', borderRadius: 'var(--radius-pill)', background: accent, color: '#fff', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700 }}>Listo</button>
        </div>
      </MobileBottomSheet>
    </React.Fragment>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * ExchangeRates — PRO
 * ════════════════════════════════════════════════════════════════════════ */
const TF_RATE_DEFS = [
  { code: 'VES', name: 'Bolívar venezolano', flag: 'VE' },
  { code: 'EUR', name: 'Euro',               flag: 'EU' },
  { code: 'COP', name: 'Peso colombiano',    flag: 'CO' },
  { code: 'CLP', name: 'Peso chileno',       flag: 'CL' },
];

function ExchangeRates({ rates, onChange, accent = 'var(--info)' }) {
  const [open, setOpen] = useTfState(false);
  const ves = rates.VES;
  return (
    <React.Fragment>
      <button onClick={() => setOpen(true)} style={{
        flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
        padding: '9px 15px', borderRadius: 'var(--radius-pill)', border: 0,
        background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', color: 'var(--fg-1)',
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
      }}>
        <span className="material-icons" style={{ fontSize: 18, color: accent }}>currency_exchange</span>
        Tasas
        <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, color: 'var(--fg-3)', fontVariantNumeric: 'tabular-nums' }}>Bs {ves}</span>
      </button>

      <MobileBottomSheet open={open} onClose={() => setOpen(false)} title="Tasas de cambio" maxHeight="64%">
        <div style={{ padding: '0 20px 8px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', margin: '0 0 14px', lineHeight: 1.5 }}>
            USD es tu moneda base. Define cuánto vale <strong style={{ color: 'var(--fg-1)' }}>1 USD</strong> en cada moneda; los saldos se convierten para los totales combinados.
          </p>
        </div>
        <div style={{ padding: '0 12px 24px' }}>
          {TF_RATE_DEFS.map(def => (
            <RateRowMobile key={def.code} def={def} value={rates[def.code]} accent={accent}
              onChange={v => onChange({ ...rates, [def.code]: v })} />
          ))}
        </div>
      </MobileBottomSheet>
    </React.Fragment>
  );
}

function RateRowMobile({ def, value, onChange, accent }) {
  const [focused, setFocused] = useTfState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px' }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--fg-2)', flexShrink: 0 }}>{def.flag}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{def.code}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{def.name}</div>
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-3)', flexShrink: 0 }}>1 USD =</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: `1px solid ${focused ? accent : 'var(--border-hairline)'}`, borderRadius: 'var(--radius-md)', padding: '8px 12px', minWidth: 116 }}>
        <input type="number" min="0" step="any" value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ border: 0, background: 'transparent', fontFamily: 'var(--font-money)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', outline: 'none', width: 70, fontVariantNumeric: 'tabular-nums' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>{def.code}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * SmartFilter — type · category · day · amount   (both modes)
 * value = { type, cat, day, min, max }
 * ════════════════════════════════════════════════════════════════════════ */
const TF_AMOUNT_PRESETS = [
  { id: 'any',    label: 'Cualquiera', min: '', max: '' },
  { id: 'lt50',   label: '< $50',      min: '', max: '50' },
  { id: '50-200', label: '$50 – $200', min: '50', max: '200' },
  { id: 'gt200',  label: '> $200',     min: '200', max: '' },
];

function SmartFilter({ value, onChange, categories, days, count, accent = 'var(--brand-primary)' }) {
  const [open, setOpen] = useTfState(false);
  const v = value;
  const setV = (patch) => onChange({ ...v, ...patch });

  const Section = ({ label, children }) => (
    <div style={{ padding: '0 20px 18px' }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
  const Chip = ({ on, label, dot, onClick }) => (
    <button onClick={onClick} style={{
      flexShrink: 0, border: 0, cursor: 'pointer', padding: '8px 14px', borderRadius: 'var(--radius-pill)',
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: on ? `color-mix(in srgb, ${accent} 15%, var(--surface-1))` : 'var(--surface-2)',
      color: on ? accent : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: on ? 700 : 500,
    }}>
      {dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />}
      {label}
    </button>
  );

  const clearAll = () => onChange({ type: 'all', cat: 'all', day: 'all', min: '', max: '' });

  return (
    <React.Fragment>
      <FilterPill icon="tune" label="Filtros" count={count} active={count > 0} accent={accent} onClick={() => setOpen(true)} />

      <MobileBottomSheet open={open} onClose={() => setOpen(false)} title="Filtro inteligente" onClear={count > 0 ? clearAll : null} clearLabel="Limpiar todo">
        {/* Tipo */}
        <Section label="Tipo">
          <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
            {[['all','Todos'],['income','Ingresos'],['expense','Gastos'],['jars','Jars']].map(([id, label]) => {
              const on = v.type === id;
              return <button key={id} onClick={() => setV({ type: id })} style={{ flex: 1, border: 0, cursor: 'pointer', padding: '9px 0', borderRadius: 'var(--radius-pill)', background: on ? accent : 'transparent', color: on ? '#fff' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: on ? 700 : 500 }}>{label}</button>;
            })}
          </div>
        </Section>

        {/* Categoría */}
        <Section label="Categoría">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Chip on={v.cat === 'all'} label="Todas" onClick={() => setV({ cat: 'all' })} />
            {categories.map(c => <Chip key={c} on={v.cat === c} label={c} onClick={() => setV({ cat: v.cat === c ? 'all' : c })} />)}
          </div>
        </Section>

        {/* Día */}
        <Section label="Día">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Chip on={v.day === 'all'} label="Cualquiera" onClick={() => setV({ day: 'all' })} />
            {days.map(d => <Chip key={d} on={v.day === d} label={d} onClick={() => setV({ day: v.day === d ? 'all' : d })} />)}
          </div>
        </Section>

        {/* Monto */}
        <Section label="Monto">
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {['min','max'].map(which => (
              <div key={which} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-3)' }}>{which === 'min' ? '≥ $' : '≤ $'}</span>
                <input type="number" value={which === 'min' ? v.min : v.max} placeholder={which === 'min' ? '0' : '∞'}
                  onChange={e => setV(which === 'min' ? { min: e.target.value } : { max: e.target.value })}
                  style={{ border: 0, outline: 'none', background: 'transparent', width: '100%', minWidth: 0, fontFamily: 'var(--font-money)', fontSize: 14, color: 'var(--fg-1)' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TF_AMOUNT_PRESETS.map(p => {
              const on = v.min === p.min && v.max === p.max;
              return <Chip key={p.id} on={on} label={p.label} onClick={() => setV({ min: p.min, max: p.max })} />;
            })}
          </div>
        </Section>

        {/* Apply */}
        <div style={{ padding: '4px 20px 24px' }}>
          <button onClick={() => setOpen(false)} style={{ width: '100%', border: 0, cursor: 'pointer', padding: '14px', borderRadius: 'var(--radius-pill)', background: accent, color: '#fff', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700 }}>Ver resultados</button>
        </div>
      </MobileBottomSheet>
    </React.Fragment>
  );
}

Object.assign(window, { AccountFilter, ExchangeRates, SmartFilter, mToUSD, mUSD, mFmtNative });
