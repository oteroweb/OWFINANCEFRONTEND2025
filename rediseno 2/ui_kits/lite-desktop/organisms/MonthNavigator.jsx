/* global React */
/* ─── App-wide Period navigator (selector de periodo) ───────────────────
 * A single global PERIOD selector shared by both shells (Lite + Pro), above
 * the route content, so every screen (incluyendo Transacciones y Cántaros)
 * comparte el mismo periodo. Granularidades: Día · Semana · Quincena · Mes ·
 * Bimestre · Trimestre · Semestre · Año · Todo. Flechas para navegar periodo
 * a periodo; el grano se elige en el desplegable; el centro abre un picker
 * adaptado al grano y "Hoy" vuelve al periodo actual.
 *
 * Compat: mantiene MonthStore { m, y }, useAppMonth() y monthLabel() para las
 * pantallas que ya leían el mes; además expone PeriodStore, useAppPeriod() y
 * periodLabel(). Cada cambio de periodo sincroniza el mes ancla.
 * ──────────────────────────────────────────────────────────────────────── */
const { useState: useMnState, useRef: useMnRef, useEffect: useMnEffect, useSyncExternalStore: useMnSync } = React;
const mnT = (s) => (window.t ? window.t(s) : s);

const MN_MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MN_ABBR   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MN_DOW    = ['L','M','M','J','V','S','D'];

/* "Hoy" de este prototipo = junio 2026 (coincide con los datos vivos). */
const MN_TODAY = { m: 5, y: 2026 };
const PERIOD_TODAY = new Date(2026, 5, 7);

/* ── Catálogo de granos ── */
const PERIOD_GRAINS = [
  { id: 'dia',       name: 'Día',          icon: 'today',               group: 'Cortos' },
  { id: 'semana',    name: 'Semana',       icon: 'date_range',          group: 'Cortos' },
  { id: 'quincena',  name: 'Quincena',     icon: 'splitscreen',         group: 'Cortos' },
  { id: 'mes',       name: 'Mes',          icon: 'calendar_view_month', group: 'Estándar' },
  { id: 'bimestre',  name: 'Bimestre',     icon: 'calendar_view_week',  group: 'Estándar' },
  { id: 'trimestre', name: 'Trimestre',    icon: 'event_note',          group: 'Estándar' },
  { id: 'semestre',  name: 'Semestre',     icon: 'calendar_month',      group: 'Estándar' },
  { id: 'anio',      name: 'Año',          icon: 'calendar_today',      group: 'Largos' },
  { id: 'todo',      name: 'Todo',         icon: 'all_inclusive',       group: 'Especiales' },
];
const PERIOD_GRAIN_BY_ID = Object.fromEntries(PERIOD_GRAINS.map(g => [g.id, g]));

/* ── Helpers de fecha ── */
const pdClone = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
const pdAddDays = (dt, n) => { const x = pdClone(dt); x.setDate(x.getDate() + n); return x; };
const pdAddMonths = (dt, n) => { const x = pdClone(dt); x.setMonth(x.getMonth() + n, 1); return x; };
const pdLastDay = (y, m) => new Date(y, m + 1, 0).getDate();
const pdD = (y, m, day) => new Date(y, m, day);
const pdMondayOf = (dt) => { const x = pdClone(dt); const wd = (x.getDay() + 6) % 7; return pdAddDays(x, -wd); };
const pdIsoWeek = (dt) => { const tt = pdClone(dt); tt.setDate(tt.getDate() + 4 - ((tt.getDay() + 6) % 7)); const ys = new Date(tt.getFullYear(), 0, 1); return Math.ceil((((tt - ys) / 86400000) + 1) / 7); };

/* ── Resolución periodo: grano + ancla → { from, to, label, noStep } ── */
function periodResolve(grain, anchor) {
  const a = pdClone(anchor);
  const y = a.getFullYear(), m = a.getMonth(), day = a.getDate();
  switch (grain) {
    case 'dia': return { from: a, to: a, label: `${day} ${MN_ABBR[m]} ${y}` };
    case 'semana': {
      const mon = pdMondayOf(a), sun = pdAddDays(mon, 6);
      const span = sun.getMonth() === mon.getMonth()
        ? `${mon.getDate()}–${sun.getDate()} ${MN_ABBR[mon.getMonth()]}`
        : `${mon.getDate()} ${MN_ABBR[mon.getMonth()]}–${sun.getDate()} ${MN_ABBR[sun.getMonth()]}`;
      return { from: mon, to: sun, label: `Sem ${pdIsoWeek(a)} · ${span}` };
    }
    case 'quincena': {
      const first = day <= 15;
      const from = pdD(y, m, first ? 1 : 16), to = pdD(y, m, first ? 15 : pdLastDay(y, m));
      return { from, to, label: `Q${first ? 1 : 2} ${MN_ABBR[m]} · ${from.getDate()}–${to.getDate()}` };
    }
    case 'mes': return { from: pdD(y, m, 1), to: pdD(y, m, pdLastDay(y, m)), label: `${mnT(MN_MONTHS[m])} ${y}` };
    case 'bimestre': {
      const bStart = Math.floor(m / 2) * 2;
      return { from: pdD(y, bStart, 1), to: pdD(y, bStart + 1, pdLastDay(y, bStart + 1)), label: `${MN_ABBR[bStart]}–${MN_ABBR[bStart + 1]} ${y}` };
    }
    case 'trimestre': {
      const qStart = Math.floor(m / 3) * 3, q = qStart / 3 + 1;
      return { from: pdD(y, qStart, 1), to: pdD(y, qStart + 2, pdLastDay(y, qStart + 2)), label: `T${q} ${y} · ${MN_ABBR[qStart]}–${MN_ABBR[qStart + 2]}` };
    }
    case 'semestre': {
      const sStart = m < 6 ? 0 : 6, s = sStart === 0 ? 1 : 2;
      return { from: pdD(y, sStart, 1), to: pdD(y, sStart + 5, pdLastDay(y, sStart + 5)), label: `S${s} ${y} · ${MN_ABBR[sStart]}–${MN_ABBR[sStart + 5]}` };
    }
    case 'anio': return { from: pdD(y, 0, 1), to: pdD(y, 11, 31), label: `${y}` };
    case 'todo': return { from: null, to: null, label: mnT('Todo el histórico'), noStep: true };
    default: return { from: pdD(y, m, 1), to: pdD(y, m, pdLastDay(y, m)), label: `${mnT(MN_MONTHS[m])} ${y}` };
  }
}
function periodStep(grain, anchor, dir) {
  switch (grain) {
    case 'dia':       return pdAddDays(anchor, dir);
    case 'semana':    return pdAddDays(anchor, dir * 7);
    case 'quincena': {
      const first = anchor.getDate() <= 15;
      if (dir > 0) return first ? pdD(anchor.getFullYear(), anchor.getMonth(), 16) : pdAddMonths(anchor, 1);
      return first ? (() => { const p = pdAddMonths(anchor, -1); return pdD(p.getFullYear(), p.getMonth(), 16); })() : pdD(anchor.getFullYear(), anchor.getMonth(), 1);
    }
    case 'mes':       return pdAddMonths(anchor, dir);
    case 'bimestre':  return pdAddMonths(anchor, dir * 2);
    case 'trimestre': return pdAddMonths(anchor, dir * 3);
    case 'semestre':  return pdAddMonths(anchor, dir * 6);
    case 'anio':      return pdAddMonths(anchor, dir * 12);
    default:          return anchor;
  }
}

/* ── Store de mes (compat) ── */
const MonthStore = (() => {
  let state = window.__appMonth || { m: 4, y: 2026 };
  window.__appMonth = state;
  const subs = new Set();
  return {
    get: () => state,
    set: (next) => { state = next; window.__appMonth = next; subs.forEach(fn => fn()); },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
  };
})();
window.MonthStore = MonthStore;

/* ── Store de periodo (grano + ancla) ── */
const PeriodStore = (() => {
  let state = window.__appPeriod || { grain: 'mes', anchor: new Date(2026, 4, 1) }; // Mayo 2026
  window.__appPeriod = state;
  const subs = new Set();
  const syncMonth = () => MonthStore.set({ m: state.anchor.getMonth(), y: state.anchor.getFullYear() });
  const api = {
    get: () => state,
    set: (next) => { state = { ...state, ...next }; window.__appPeriod = state; syncMonth(); subs.forEach(fn => fn()); },
    setGrain: (grain) => api.set({ grain }),
    setAnchor: (anchor) => api.set({ anchor: pdClone(anchor) }),
    step: (dir) => { const r = periodResolve(state.grain, state.anchor); if (r.noStep) return; api.set({ anchor: periodStep(state.grain, state.anchor, dir) }); },
    today: () => api.set({ anchor: pdClone(PERIOD_TODAY) }),
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
  };
  return api;
})();
window.PeriodStore = PeriodStore;
// sincroniza el mes ancla al cargar
MonthStore.set({ m: PeriodStore.get().anchor.getMonth(), y: PeriodStore.get().anchor.getFullYear() });

function useAppMonth() { return useMnSync(MonthStore.subscribe, MonthStore.get, MonthStore.get); }
function useAppPeriod() { return useMnSync(PeriodStore.subscribe, PeriodStore.get, PeriodStore.get); }
window.useAppMonth = useAppMonth;
window.useAppPeriod = useAppPeriod;
window.monthLabel = (mo = MonthStore.get()) => `${mnT(MN_MONTHS[mo.m])} ${mo.y}`;
window.periodLabel = () => { const s = PeriodStore.get(); return periodResolve(s.grain, s.anchor).label; };

/* ── Picker adaptado al grano ── */
function PeriodPicker({ grain, anchor, accent, onPick }) {
  const [page, setPage] = useMnState(pdClone(anchor));
  const sel = periodResolve(grain, anchor);
  const inSel = (dt) => sel.from && sel.to && dt >= sel.from && dt <= sel.to;
  const cell = (on, extra = {}) => ({
    border: 0, cursor: 'pointer', borderRadius: 'var(--radius-md)', padding: '10px 0',
    background: on ? accent : 'transparent', color: on ? '#fff' : 'var(--fg-1)',
    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: on ? 700 : 500, transition: 'background 120ms', ...extra,
  });
  const nav = (delta, title) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <button onClick={() => setPage(p => pdAddMonths(p, -delta))} style={{ width: 30, height: 30, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--fg-1)' }}><span className="material-icons" style={{ fontSize: 18 }}>chevron_left</span></button>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{title}</span>
      <button onClick={() => setPage(p => pdAddMonths(p, delta))} style={{ width: 30, height: 30, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--fg-1)' }}><span className="material-icons" style={{ fontSize: 18 }}>chevron_right</span></button>
    </div>
  );
  const y = page.getFullYear(), m = page.getMonth();

  if (grain === 'todo') {
    return <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6, padding: '4px 2px' }}>{mnT('Sin límite de fechas — incluye cada movimiento registrado.')}</div>;
  }
  if (grain === 'dia' || grain === 'semana' || grain === 'quincena') {
    const first = pdMondayOf(pdD(y, m, 1));
    return (
      <div>
        {nav(1, `${mnT(MN_MONTHS[m])} ${y}`)}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {MN_DOW.map((w, i) => <div key={i} style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, color: 'var(--fg-3)', padding: '2px 0' }}>{w}</div>)}
          {Array.from({ length: 42 }).map((_, i) => {
            const cur = pdAddDays(first, i);
            const inMonth = cur.getMonth() === m;
            return <button key={i} onClick={() => onPick(cur)} style={cell(inSel(cur), { padding: '8px 0', opacity: inMonth ? 1 : 0.32, fontSize: 12.5 })}>{cur.getDate()}</button>;
          })}
        </div>
      </div>
    );
  }
  if (grain === 'mes' || grain === 'bimestre') {
    return (
      <div>
        {nav(12, `${y}`)}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {MN_ABBR.map((ab, mo) => <button key={mo} onClick={() => onPick(pdD(y, mo, 1))} style={cell(inSel(pdD(y, mo, 1)))}>{mnT(ab)}</button>)}
        </div>
      </div>
    );
  }
  if (grain === 'trimestre' || grain === 'semestre') {
    const n = grain === 'trimestre' ? 4 : 2;
    return (
      <div>
        {nav(12, `${y}`)}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {Array.from({ length: n }).map((_, i) => {
            const mo = grain === 'trimestre' ? i * 3 : i * 6;
            const tag = grain === 'trimestre' ? `T${i + 1}` : `S${i + 1}`;
            const sub = grain === 'trimestre' ? `${MN_ABBR[mo]}–${MN_ABBR[mo + 2]}` : `${MN_ABBR[mo]}–${MN_ABBR[mo + 5]}`;
            const on = inSel(pdD(y, mo, 1));
            return <button key={i} onClick={() => onPick(pdD(y, mo, 1))} style={cell(on, { padding: '14px 4px', lineHeight: 1.5 })}>{tag}<br /><span style={{ fontSize: 10.5, fontWeight: 600, opacity: 0.7 }}>{sub}</span></button>;
          })}
        </div>
      </div>
    );
  }
  // anio
  const base = y - 4;
  return (
    <div>
      {nav(108, `${base}–${base + 8}`)}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {Array.from({ length: 9 }).map((_, i) => { const yr = base + i; return <button key={yr} onClick={() => onPick(pdD(yr, 0, 1))} style={cell(yr === anchor.getFullYear())}>{yr}</button>; })}
      </div>
    </div>
  );
}

function MonthNavigator({ accent = 'var(--brand-primary)', compact = false }) {
  const period = useAppPeriod();
  const { grain, anchor } = period;
  const resolved = periodResolve(grain, anchor);
  const grainMeta = PERIOD_GRAIN_BY_ID[grain] || PERIOD_GRAIN_BY_ID.mes;
  const [grainOpen, setGrainOpen] = useMnState(false);
  const [pickOpen, setPickOpen] = useMnState(false);
  const grainRef = useMnRef(null);
  const pickRef = useMnRef(null);

  useMnEffect(() => {
    if (!grainOpen && !pickOpen) return;
    const close = (e) => {
      if (grainRef.current && !grainRef.current.contains(e.target)) setGrainOpen(false);
      if (pickRef.current && !pickRef.current.contains(e.target)) setPickOpen(false);
    };
    const id = setTimeout(() => document.addEventListener('mousedown', close), 0);
    return () => { document.removeEventListener('mousedown', close); clearTimeout(id); };
  }, [grainOpen, pickOpen]);

  const todayResolved = periodResolve(grain, PERIOD_TODAY);
  const isToday = resolved.label === todayResolved.label;

  const stepBtn = {
    width: 36, height: 36, flexShrink: 0, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)',
    background: 'var(--surface-1)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--fg-1)',
    transition: 'background 150ms, border-color 150ms',
  };
  const hoverOn  = e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'color-mix(in srgb, ' + accent + ' 40%, var(--border-hairline))'; };
  const hoverOff = e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.borderColor = 'var(--border-hairline)'; };

  const groups = ['Cortos', 'Estándar', 'Largos', 'Especiales'];

  return (
    <div data-comment-anchor="month-navigator" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: compact ? 16 : 22 }}>
      {/* Selector de grano */}
      <div ref={grainRef} style={{ position: 'relative' }}>
        <button onClick={() => { setGrainOpen(o => !o); setPickOpen(false); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', cursor: 'pointer', color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}>
          <span className="material-icons" style={{ fontSize: 18, color: accent }}>{grainMeta.icon}</span>
          {mnT(grainMeta.name)}
          <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>{grainOpen ? 'expand_less' : 'expand_more'}</span>
        </button>
        {grainOpen && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 'var(--z-popover, 80)', width: 230, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', boxShadow: '0 22px 60px rgba(15,23,42,.22)', padding: 6 }}>
            {groups.map(grp => (
              <div key={grp}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', padding: '8px 10px 4px' }}>{grp}</div>
                {PERIOD_GRAINS.filter(g => g.group === grp).map(g => {
                  const on = g.id === grain;
                  return (
                    <button key={g.id} onClick={() => { PeriodStore.setGrain(g.id); setGrainOpen(false); }}
                      onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-2)'; }}
                      onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', border: 0, cursor: 'pointer', padding: '9px 10px', borderRadius: 'var(--radius-sm)', background: on ? 'color-mix(in srgb, ' + accent + ' 12%, var(--surface-1))' : 'transparent', color: on ? accent : 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: on ? 700 : 500 }}>
                      <span className="material-icons" style={{ fontSize: 18, color: on ? accent : 'var(--fg-2)' }}>{g.icon}</span>
                      <span style={{ flex: 1 }}>{mnT(g.name)}</span>
                      {on && <span className="material-icons" style={{ fontSize: 17 }}>check</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flecha anterior */}
      <button onClick={() => PeriodStore.step(-1)} aria-label="Periodo anterior" disabled={resolved.noStep}
        style={{ ...stepBtn, opacity: resolved.noStep ? 0.4 : 1, cursor: resolved.noStep ? 'not-allowed' : 'pointer' }}
        onMouseEnter={e => { if (!resolved.noStep) hoverOn(e); }} onMouseLeave={hoverOff}>
        <span className="material-icons" style={{ fontSize: 20 }}>chevron_left</span>
      </button>

      {/* Pill central — etiqueta del periodo + picker */}
      <div ref={pickRef} style={{ position: 'relative' }}>
        <button onClick={() => { if (resolved.noStep) return; setPickOpen(o => !o); setGrainOpen(false); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', minWidth: 180, justifyContent: 'center', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', cursor: resolved.noStep ? 'default' : 'pointer', color: 'var(--fg-1)' }}>
          <span className="material-icons" style={{ fontSize: 19, color: accent }}>{grainMeta.icon}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>{resolved.label}</span>
          {!resolved.noStep && <span className="material-icons" style={{ fontSize: 19, color: 'var(--fg-3)' }}>{pickOpen ? 'expand_less' : 'expand_more'}</span>}
        </button>
        {pickOpen && !resolved.noStep && (
          <div style={{ position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', zIndex: 'var(--z-popover, 80)', width: 280, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', boxShadow: '0 22px 60px rgba(15,23,42,.22)', padding: 14 }}>
            <PeriodPicker grain={grain} anchor={anchor} accent={accent} onPick={(dt) => { PeriodStore.setAnchor(dt); setPickOpen(false); }} />
          </div>
        )}
      </div>

      {/* Flecha siguiente */}
      <button onClick={() => PeriodStore.step(1)} aria-label="Periodo siguiente" disabled={resolved.noStep}
        style={{ ...stepBtn, opacity: resolved.noStep ? 0.4 : 1, cursor: resolved.noStep ? 'not-allowed' : 'pointer' }}
        onMouseEnter={e => { if (!resolved.noStep) hoverOn(e); }} onMouseLeave={hoverOff}>
        <span className="material-icons" style={{ fontSize: 20 }}>chevron_right</span>
      </button>

      {/* Hoy */}
      {!isToday && (
        <button onClick={() => PeriodStore.today()}
          style={{ marginLeft: 2, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-pill)', background: 'color-mix(in srgb, ' + accent + ' 12%, var(--surface-1))', color: accent, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>
          <span className="material-icons" style={{ fontSize: 17 }}>today</span>{mnT('Hoy')}
        </button>
      )}
    </div>
  );
}

Object.assign(window, { MonthNavigator, periodResolve, periodStep });
