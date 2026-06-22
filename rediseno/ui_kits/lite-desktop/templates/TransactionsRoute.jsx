/* global React */
const { useState: useTxState, useRef: useTxRef, useEffect: useTxEffect } = React;

/* ── Dropdown compacto reutilizable (cántaro / categoría / día) ─────── */
function TxDropdown({ icon, label, value, options, onChange, full }) {
  const [open, setOpen] = useTxState(false);
  const ref = useTxRef(null);
  useTxEffect(() => {
    if (!open) return;
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);
  const active = value !== 'all';
  const current = options.find(o => o.id === value);
  return (
    <div ref={ref} style={{ position: 'relative', width: full ? '100%' : 'auto' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer', width: full ? '100%' : 'auto',
          padding: '9px 12px', borderRadius: full ? 'var(--radius-md)' : 'var(--radius-pill)', border: 0,
          background: active ? 'color-mix(in srgb, var(--brand-primary) 12%, var(--surface-1))' : 'var(--surface-2)',
          color: active ? 'var(--brand-primary)' : 'var(--fg-1)',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 500,
        }}>
        <span className="material-icons" style={{ fontSize: 17 }}>{icon}</span>
        <span style={{ flex: full ? 1 : 'unset', textAlign: 'left' }}>{active ? (current ? t(current.label) : label) : label}</span>
        <span className="material-icons" style={{ fontSize: 18, opacity: .6 }}>{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 60,
          minWidth: 230, width: full ? '100%' : 'auto', maxHeight: 300, overflowY: 'auto',
          background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)',
          boxShadow: '0 18px 50px rgba(15,23,42,.18)', border: '1px solid var(--border-hairline)', padding: 6,
        }}>
          {options.map(o => {
            const on = o.id === value;
            return (
              <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: 10,
                  padding: '9px 11px', border: 0, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left',
                  background: on ? 'var(--surface-2)' : 'transparent',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: on ? 600 : 500, color: 'var(--fg-1)',
                }}>
                {o.color
                  ? <span style={{ width: 9, height: 9, borderRadius: '50%', background: o.color, flexShrink: 0 }}></span>
                  : o.icon ? <span className="material-icons" style={{ fontSize: 17, color: 'var(--fg-3)' }}>{o.icon}</span> : <span style={{ width: 9 }}></span>}
                <span style={{ flex: 1 }}>{t(o.label)}</span>
                {o.count != null && <span style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-money)' }}>{o.count}</span>}
                {on && <span className="material-icons" style={{ fontSize: 17, color: 'var(--brand-primary)' }}>check</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const TX_AMOUNT_PRESETS = [
  { id: 'any', label: 'Cualquiera', min: '', max: '' },
  { id: 'lt50', label: '< $50', min: '', max: '50' },
  { id: '50-200', label: '$50 – $200', min: '50', max: '200' },
  { id: 'gt200', label: '> $200', min: '200', max: '' },
];

function TransactionsRoute({ hidden }) {
  const [type, setType]   = useTxState('all');
  const [jar, setJar]     = useTxState('all');
  const [cat, setCat]     = useTxState('all');
  const [day, setDay]     = useTxState('all');
  const [min, setMin]     = useTxState('');
  const [max, setMax]     = useTxState('');
  const [accts, setAccts] = useTxState([]);   // selected account ids
  const [query, setQuery] = useTxState('');
  const [panel, setPanel] = useTxState(false);
  const panelRef = useTxRef(null);
  const month = useAppMonth();
  const isPro = !!(window.getMode && window.getMode() === 'pro');
  const accent = isPro ? 'var(--info)' : 'var(--brand-primary)';
  const acctName = (id) => (SAMPLE_ACCOUNTS.find(a => a.id === id) || {}).name || '';
  const acctColor = (id) => (SAMPLE_ACCOUNTS.find(a => a.id === id) || {}).color;

  useTxEffect(() => {
    if (!panel) return;
    const close = e => { if (panelRef.current && !panelRef.current.contains(e.target)) setPanel(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [panel]);

  const types = [
    { id: 'all',     label: window.t('Todas') },
    { id: 'income',  label: window.t('Ingresos') },
    { id: 'expense', label: window.t('Gastos') },
  ];

  // Campos derivados de los datos (con conteo)
  const jarOptions = (() => {
    const seen = {};
    SAMPLE_TX.forEach(t => { if (t.jar) seen[t.jar] = { color: t.jarColor, count: (seen[t.jar]?.count || 0) + 1 }; });
    return [{ id: 'all', label: window.t('Todos los cántaros'), icon: 'savings' },
            { id: '__none', label: window.t('Sin cántaro'), icon: 'block', count: SAMPLE_TX.filter(t => !t.jar).length },
            ...Object.keys(seen).map(n => ({ id: n, label: n, color: seen[n].color, count: seen[n].count }))];
  })();
  const catOptions = (() => {
    const seen = {};
    SAMPLE_TX.forEach(t => { seen[t.category] = (seen[t.category] || 0) + 1; });
    return [{ id: 'all', label: window.t('Todas las categorías'), icon: 'sell' },
            ...Object.keys(seen).map(n => ({ id: n, label: n, icon: 'label', count: seen[n] }))];
  })();
  const dayOptions = (() => {
    const seen = {};
    SAMPLE_TX.forEach(t => { seen[t.day] = (seen[t.day] || 0) + 1; });
    return [{ id: 'all', label: window.t('Cualquier día'), icon: 'event' },
            ...Object.keys(seen).map(n => ({ id: n, label: n, icon: 'calendar_today', count: seen[n] }))];
  })();

  const filtered = SAMPLE_TX.filter(t => {
    if (type === 'income'  && !(t.amount > 0)) return false;
    if (type === 'expense' && !(t.amount < 0)) return false;
    if (jar === '__none' && t.jar) return false;
    if (jar !== 'all' && jar !== '__none' && t.jar !== jar) return false;
    if (cat !== 'all' && t.category !== cat) return false;
    if (day !== 'all' && t.day !== day) return false;
    if (accts.length && !accts.includes(t.acctId)) return false;
    const abs = Math.abs(t.amount);
    if (min !== '' && abs < parseFloat(min)) return false;
    if (max !== '' && abs > parseFloat(max)) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!(`${t.label} ${t.category} ${t.jar || ''} ${t.meta} ${Math.abs(t.amount)}`).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Chips activos (cada campo posible)
  const chips = [];
  if (type !== 'all') chips.push({ k: 'type', icon: 'swap_vert', label: types.find(x => x.id === type).label, clear: () => setType('all') });
  if (jar !== 'all')  chips.push({ k: 'jar', dot: jar !== '__none' ? (jarOptions.find(o => o.id === jar)?.color) : null, icon: jar === '__none' ? 'block' : null, label: jar === '__none' ? window.t('Sin cántaro') : jar, clear: () => setJar('all') });
  if (cat !== 'all')  chips.push({ k: 'cat', icon: 'label', label: cat, clear: () => setCat('all') });
  if (day !== 'all')  chips.push({ k: 'day', icon: 'event', label: day, clear: () => setDay('all') });
  if (min !== '' || max !== '') chips.push({ k: 'amt', icon: 'payments', label: `${min !== '' ? '≥ $' + min : ''}${min !== '' && max !== '' ? ' · ' : ''}${max !== '' ? '≤ $' + max : ''}`, clear: () => { setMin(''); setMax(''); } });
  accts.forEach(id => chips.push({ k: 'acct-' + id, dot: acctColor(id), label: acctName(id), clear: () => setAccts(accts.filter(x => x !== id)) }));
  if (query.trim()) chips.push({ k: 'q', icon: 'search', label: `"${query}"`, clear: () => setQuery('') });

  const activeCount = chips.length;
  const clearAll = () => { setType('all'); setJar('all'); setCat('all'); setDay('all'); setMin(''); setMax(''); setAccts([]); setQuery(''); };
  const total = filtered.reduce((s, t) => s + t.amount, 0);

  const panelField = (label, node) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{label}</span>
      {node}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Eyebrow>{t("Transacciones")}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{window.periodLabel ? window.periodLabel() : window.monthLabel(month)}</h1>
      </div>

      {/* ── Filtro inteligente ─────────────────────────────────────── */}
      <Card padding={16} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Selector de cuentas — widget inteligente (solo Pro; Lite usa billetera única) */}
          {isPro && <AccountFilter selected={accts} onChange={setAccts} accent={accent} hidden={hidden} />}

          {/* Búsqueda en todos los campos */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220,
            padding: '9px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)',
          }}>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>search</span>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder={t('Buscar en concepto, cántaro, categoría, monto…')}
              style={{ border: 0, outline: 'none', background: 'transparent', flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)' }} />
            {query && <span className="material-icons" onClick={() => setQuery('')} style={{ fontSize: 17, color: 'var(--fg-3)', cursor: 'pointer' }}>close</span>}
          </div>

          {/* Botón panel de filtros */}
          <div ref={panelRef} style={{ position: 'relative' }}>
            <button onClick={() => setPanel(p => !p)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                padding: '9px 16px', borderRadius: 'var(--radius-pill)', border: 0,
                background: activeCount ? 'var(--brand-primary)' : 'var(--surface-2)',
                color: activeCount ? 'var(--fg-on-brand)' : 'var(--fg-1)',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              }}>
              <span className="material-icons" style={{ fontSize: 18 }}>tune</span>
              {t('Filtros')}
              {activeCount > 0 && (
                <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 'var(--radius-pill)', minWidth: 18, height: 18, display: 'inline-grid', placeItems: 'center', fontSize: 11, fontFamily: 'var(--font-money)', padding: '0 5px' }}>{activeCount}</span>
              )}
            </button>

            {panel && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 70, width: 340, maxWidth: '88vw',
                background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)',
                boxShadow: '0 24px 60px rgba(15,23,42,.22)', border: '1px solid var(--border-hairline)', padding: 18,
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{t('Filtro inteligente')}</span>
                  {activeCount > 0 && <button onClick={clearAll} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>{t('Limpiar todo')}</button>}
                </div>

                {panelField(t('Tipo'), (
                  <div style={{ display: 'inline-flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 3, gap: 2, width: '100%' }}>
                    {types.map(f => {
                      const on = type === f.id;
                      return <button key={f.id} onClick={() => setType(f.id)} style={{ flex: 1, border: 0, cursor: 'pointer', padding: '7px 0', borderRadius: 'var(--radius-pill)', background: on ? 'var(--brand-primary)' : 'transparent', color: on ? 'var(--fg-on-brand)' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: on ? 600 : 500 }}>{f.label}</button>;
                    })}
                  </div>
                ))}

                {panelField(t('Cántaro'), <TxDropdown full icon="savings" label={t('Todos los cántaros')} value={jar} options={jarOptions} onChange={setJar} />)}
                {panelField(t('Categoría'), <TxDropdown full icon="sell" label={t('Todas las categorías')} value={cat} options={catOptions} onChange={setCat} />)}
                {panelField(t('Día'), <TxDropdown full icon="event" label={t('Cualquier día')} value={day} options={dayOptions} onChange={setDay} />)}

                {panelField(t('Monto'), (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['min', 'max'].map(which => (
                        <div key={which} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-3)' }}>{which === 'min' ? '≥ $' : '≤ $'}</span>
                          <input type="number" value={which === 'min' ? min : max}
                            onChange={e => which === 'min' ? setMin(e.target.value) : setMax(e.target.value)}
                            placeholder={which === 'min' ? '0' : '∞'}
                            style={{ border: 0, outline: 'none', background: 'transparent', width: '100%', minWidth: 0, fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-1)' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {TX_AMOUNT_PRESETS.map(p => {
                        const on = min === p.min && max === p.max;
                        return <button key={p.id} onClick={() => { setMin(p.min); setMax(p.max); }}
                          style={{ border: 0, cursor: 'pointer', padding: '5px 11px', borderRadius: 'var(--radius-pill)', background: on ? 'color-mix(in srgb, var(--brand-primary) 14%, var(--surface-1))' : 'var(--surface-2)', color: on ? 'var(--brand-primary)' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: on ? 600 : 500 }}>{t(p.label)}</button>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chips activos + resultados */}
        {(activeCount > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {chips.map(c => (
              <span key={c.k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 8px 5px 11px', borderRadius: 'var(--radius-pill)', background: 'color-mix(in srgb, var(--brand-primary) 10%, var(--surface-1))', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>
                {c.dot ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot }}></span> : c.icon ? <span className="material-icons" style={{ fontSize: 14 }}>{c.icon}</span> : null}
                {t(c.label)}
                <span className="material-icons" onClick={c.clear} style={{ fontSize: 15, cursor: 'pointer', opacity: .7 }}>close</span>
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderTop: '1px solid var(--border-hairline)', paddingTop: 12 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>
            <b style={{ color: 'var(--fg-1)', fontWeight: 700 }}>{filtered.length}</b> {filtered.length === 1 ? t('movimiento') : t('movimientos')}
            {activeCount > 0 && <span style={{ color: 'var(--fg-3)' }}> · {t('neto')} </span>}
            {activeCount > 0 && <Money value={total} sign hidden={hidden} color={total >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)'} style={{ fontSize: 13 }} />}
          </span>
          {activeCount > 0 && (
            <button onClick={clearAll} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, cursor: 'pointer', padding: '6px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-2)', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>
              <span className="material-icons" style={{ fontSize: 16 }}>filter_alt_off</span>
              {t('Limpiar')} ({activeCount})
            </button>
          )}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card padding={0}>
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: 36, color: 'var(--fg-3)' }}>search_off</span>
            <div className="t-body" style={{ color: 'var(--fg-2)', marginTop: 10 }}>{t('Ningún movimiento coincide con estos filtros.')}</div>
          </div>
        </Card>
      ) : (
        <TransactionsLedger transactions={filtered} hidden={hidden} />
      )}
    </div>
  );
}

Object.assign(window, { TransactionsRoute, TxDropdown });
