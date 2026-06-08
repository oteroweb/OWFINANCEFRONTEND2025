/* global React, AN_JARS, AN_TOTAL, AN_RANGES, AN_FMT, AN_CONIC */
/* ─── Análisis · reusable parts (Lite + Pro) ─────────────────────────────
 * PeriodNavigator (collapsed gadget), SpendDonut+legend, TopJars, Budget vs
 * actual, Unassigned callout, KPIs, Insight, Detalle drill-down.
 * `accent` = navy in Lite, cyan in Pro. */
const { useState: useAnState, useRef: useAnRef, useEffect: useAnEffect } = React;

const AN_JARCOLOR = id => { const j = (window.AN_JARS||[]).find(x=>x.id===id); return j ? j.color : 'var(--surface-3)'; };

/* ── Period navigator: collapsed range menu + stepper ─────────────────── */
function AnPeriodNav({ accent = 'var(--brand-primary)', simple = false, onAdd }) {
  const [open, setOpen] = useAnState(false);
  const [range, setRange] = useAnState('Mensual');
  const ref = useAnRef(null);
  useAnEffect(() => {
    if (!open) return;
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const t = setTimeout(() => document.addEventListener('mousedown', close), 0);
    return () => { document.removeEventListener('mousedown', close); clearTimeout(t); };
  }, [open]);

  const stepBtn = { width: 34, height: 34, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--fg-1)' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
      {simple ? (
        <div style={{ display: 'inline-flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 3, gap: 2 }}>
          {['Mes','Trimestre','Año'].map((p,i) => (
            <button key={p} onClick={() => setRange(p)}
              style={{ border: 0, cursor: 'pointer', padding: '7px 13px', borderRadius: 'var(--radius-pill)', background: (range===p || (i===0&&range==='Mensual'))?accent:'transparent', color: (range===p || (i===0&&range==='Mensual'))?'#fff':'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>{p}</button>
          ))}
        </div>
      ) : (
        <div ref={ref} style={{ position: 'relative' }}>
          <button onClick={() => setOpen(o=>!o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '10px 16px', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>calendar_view_month</span>{t(range)}
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>expand_more</span>
          </button>
          {open && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 'var(--z-popover)', minWidth: 200, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-popover)', padding: 5 }}>
              {AN_RANGES.map(r => {
                const on = r === range;
                return (
                  <button key={r} onClick={() => { setRange(r); setOpen(false); }}
                    onMouseEnter={e => { if(!on) e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { if(!on) e.currentTarget.style.background = 'transparent'; }}
                    style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', border: 0, background: on?'var(--surface-2)':'transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: on?600:500, color: 'var(--fg-1)', textAlign: 'left' }}>
                    {t(r)}{on && <span className="material-icons" style={{ fontSize: 18, color: accent }}>check</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <button style={stepBtn}><span className="material-icons">chevron_left</span></button>
        <span style={{ minWidth: 116, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>Junio 2026</span>
        <button style={stepBtn}><span className="material-icons">chevron_right</span></button>
      </div>
    </div>
  );
}

/* ── Scannable cántaro strip ──────────────────────────────────────────── */
function AnJarStrip({ jars = AN_JARS }) {
  const max = Math.max(...jars.map(j=>j.spent));
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0 10px' }}>
      {jars.map(j => (
        <div key={j.id} style={{ flex: '0 0 auto', minWidth: 134, padding: '9px 13px', borderRadius: 'var(--radius-md)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: j.color, flex: '0 0 auto' }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.name}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 15, marginTop: 4, color: 'var(--expense-fg)' }}>-{AN_FMT(j.spent)}</div>
          <div style={{ height: 3, borderRadius: 2, background: 'var(--surface-3)', marginTop: 7, overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: (j.spent/max*100).toFixed(0)+'%', background: j.color }} /></div>
        </div>
      ))}
    </div>
  );
}

/* ── Donut + interactive legend ───────────────────────────────────────── */
function AnDonutLegend({ jars = AN_JARS, total = AN_TOTAL, size = 220 }) {
  const [focus, setFocus] = useAnState(null);
  const sorted = [...jars].sort((a,b)=>b.spent-a.spent);
  const f = focus ? jars.find(x=>x.id===focus) : null;
  const hole = size - 60;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto', borderRadius: '50%', background: AN_CONIC(jars, total) }}>
        <div style={{ position: 'absolute', inset: 30, background: 'var(--surface-1)', borderRadius: '50%', display: 'grid', placeContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>{f ? f.name : 'Gastos'}</div>
          <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 23, marginTop: 3, color: f ? f.color : 'var(--fg-1)' }}>{AN_FMT(f ? f.spent : total)}</div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{f ? (f.spent/total*100).toFixed(1)+'% del gasto' : jars.length+' cántaros'}</div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 210, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sorted.map(j => (
          <div key={j.id}
            onMouseEnter={() => setFocus(j.id)} onMouseLeave={() => setFocus(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: focus===j.id?'var(--surface-2)':'transparent' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: j.color, flex: '0 0 auto' }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--fg-1)' }}>{j.name}</span>
            <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>{(j.spent/total*100).toFixed(1)}%</span>
            <span style={{ fontFamily: 'var(--font-money)', fontWeight: 600, fontSize: 13, minWidth: 64, textAlign: 'right' }}>{AN_FMT(j.spent)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Top cántaros list (mini-bars) ────────────────────────────────────── */
function AnTopList({ jars = AN_JARS }) {
  const sorted = [...jars].sort((a,b)=>b.spent-a.spent); const max = sorted[0].spent;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {sorted.map(j => (
        <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 4px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: j.color, flex: '0 0 auto' }} />
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 116 }}>{j.name}</span>
          <span style={{ flex: 1, height: 9, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: (j.spent/max*100).toFixed(0)+'%', background: j.color, borderRadius: 999 }} /></span>
          <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 13, minWidth: 62, textAlign: 'right', color: 'var(--expense-fg)' }}>{AN_FMT(j.spent)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Budget vs actual (diverging) ─────────────────────────────────────── */
function AnBudget({ jars = AN_JARS }) {
  const maxV = Math.max(...jars.map(j=>Math.max(j.spent,j.budget)));
  return (
    <div>
      {jars.map(j => {
        const over = j.spent > j.budget; const pct = Math.round(j.spent/j.budget*100);
        return (
          <div key={j.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-hairline)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: j.color }} />{j.name}</span>
              <span style={{ fontSize: 12, color: 'var(--fg-2)' }}><b style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{AN_FMT(j.spent)}</b> / {AN_FMT(j.budget)} <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 999, background: over?'var(--expense-soft)':'var(--surface-2)', color: over?'var(--expense-fg)':'var(--fg-2)' }}>{pct}%</span></span>
            </div>
            <div style={{ position: 'relative', height: 8, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
              <span style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 999, width: Math.min(j.spent/maxV*100,100).toFixed(1)+'%', background: over?'var(--expense)':j.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Unassigned callout ───────────────────────────────────────────────── */
function AnUnassigned() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 18px', borderRadius: 'var(--radius-md)', background: 'var(--warning-soft)', border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', display: 'grid', placeItems: 'center', color: 'var(--warning-fg)', flex: '0 0 auto' }}><span className="material-icons">savings</span></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t('Tienes')} <span style={{ fontFamily: 'var(--font-money)', color: 'var(--warning-fg)' }}>$17,787,042.81</span> {t('sin asignar a un cántaro')}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 1 }}>{t('Un ingreso atípico entró fuera del método 55/10/10/10/10. Asígnalo para que tu análisis cuadre.')}</div>
      </div>
      <button style={{ border: 0, cursor: 'pointer', background: 'var(--warning)', color: '#3a2a00', fontWeight: 700, fontSize: 12.5, padding: '9px 16px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}><span className="material-icons" style={{ fontSize: 18 }}>call_split</span>{t('Asignar')}</button>
    </div>
  );
}

/* ── KPI row ──────────────────────────────────────────────────────────── */
function AnKpis({ kpis = window.AN_KPIS }) {
  const isMobile = useViewportMobile();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 16 }}>
      {kpis.map((k,i) => (
        <div key={i} style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: isMobile ? '14px 16px' : '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>{t(k.label)}</div>
          <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: isMobile ? 22 : 30, letterSpacing: '-.01em', marginTop: 8, color: k.color }}>{k.val}</div>
          <div style={{ fontSize: 12, color: k.flag?'var(--warning-fg)':'var(--fg-3)', marginTop: 6 }}>{t(k.meta)}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Insight card (violet) ────────────────────────────────────────────── */
function AnInsight({ icon = 'bolt', children }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 16, borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, var(--violet-500) 10%, var(--surface-1))', border: '1px solid color-mix(in srgb, var(--violet-500) 22%, transparent)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: 'color-mix(in srgb, var(--violet-500) 18%, transparent)', color: 'var(--violet-500)', display: 'grid', placeItems: 'center', flex: '0 0 auto' }}><span className="material-icons">{icon}</span></div>
      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

/* ── Detalle agrupado (drill-down) ────────────────────────────────────── */
function AnDetalle({ groups = window.AN_DETALLE }) {
  const [open, setOpen] = useAnState({ 0: true });
  return (
    <div>
      {groups.map((g, gi) => {
        const isOpen = !!open[gi];
        return (
          <div key={gi} style={{ border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 12 }}>
            <div onClick={() => setOpen(o => ({ ...o, [gi]: !o[gi] }))}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', background: 'var(--surface-1)' }}>
              <span className="material-icons" style={{ color: 'var(--fg-3)', transform: isOpen?'rotate(90deg)':'none', transition: 'transform .2s' }}>chevron_right</span>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: AN_JARCOLOR(g.jar), flex: '0 0 auto' }} />
              <span><span style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</span> · <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>{g.count} {t('transacciones')}</span></span>
              <span style={{ flex: 1 }} />
              <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--expense-fg)' }}>-{AN_FMT(g.total)}</span><span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{t('Ingresos')} $0.00</span></span>
            </div>
            {isOpen && (
              <div style={{ padding: '4px 8px 8px', background: 'var(--bg-canvas)' }}>
                {g.subs.map((s, si) => (
                  <div key={si}>
                    <div style={{ padding: '8px 10px 2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 12.5 }}>{s.name} <span style={{ fontWeight: 500, color: 'var(--fg-2)' }}>· {s.count} tx</span></span>
                      <span style={{ fontFamily: 'var(--font-money)', fontWeight: 600, fontSize: 12.5, color: 'var(--expense-fg)' }}>-{AN_FMT(s.total)}</span>
                    </div>
                    {s.tx.map((tr, ti) => (
                      <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'grid', placeItems: 'center', flex: '0 0 auto', background: 'var(--expense-soft)', color: 'var(--expense-fg)' }}><span className="material-icons" style={{ fontSize: 18 }}>south_west</span></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tr.nm}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 999, border: '1px solid color-mix(in srgb, var(--info) 40%, transparent)', color: 'var(--info-fg)' }}>{t('Gasto')}</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--fg-2)', marginTop: 2 }}>{tr.date} · {tr.acct} · {tr.cat}</div>
                          <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>{tr.src} ({tr.rate})</div>
                        </div>
                        <div style={{ textAlign: 'right', flex: '0 0 auto' }}><div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--expense-fg)' }}>-{AN_FMT(tr.amt)}</div></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { AnPeriodNav, AnJarStrip, AnDonutLegend, AnTopList, AnBudget, AnUnassigned, AnKpis, AnInsight, AnDetalle });
