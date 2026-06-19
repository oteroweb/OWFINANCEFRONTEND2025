/* global React */
/* ─── App-wide Month / Date navigator ───────────────────────────────────
 * A single global period selector that lives in BOTH shells (Lite + Pro),
 * above the route content, so every screen shares the same selected month.
 * Steppers move month-by-month (rolling the year), the centre pill opens a
 * month+year grid picker, and "Hoy" jumps back to the current month.
 * ──────────────────────────────────────────────────────────────────────── */
const { useState: useMnState, useRef: useMnRef, useEffect: useMnEffect, useSyncExternalStore: useMnSync } = React;

const MN_MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MN_ABBR   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

/* "Today" for this prototype = June 2026 (matches the live data). */
const MN_TODAY = { m: 5, y: 2026 };

/* ── Tiny global store so shells + routes stay in sync without prop drilling ── */
const MonthStore = (() => {
  let state = window.__appMonth || { m: 4, y: 2026 }; // default: Mayo 2026
  window.__appMonth = state;
  const subs = new Set();
  return {
    get: () => state,
    set: (next) => {
      state = next; window.__appMonth = next;
      subs.forEach(fn => fn());
    },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
  };
})();
window.MonthStore = MonthStore;

/* Hook: read the shared month anywhere. */
function useAppMonth() {
  return useMnSync(MonthStore.subscribe, MonthStore.get, MonthStore.get);
}
window.useAppMonth = useAppMonth;

/* Helpers for screens that want the label / range text. */
window.monthLabel = (mo = MonthStore.get()) => `${t(MN_MONTHS[mo.m])} ${mo.y}`;

function MonthNavigator({ accent = 'var(--brand-primary)', compact = false }) {
  const month = useAppMonth();
  const [open, setOpen] = useMnState(false);
  const [pickYear, setPickYear] = useMnState(month.y);
  const ref = useMnRef(null);

  useMnEffect(() => {
    if (!open) return;
    setPickYear(month.y);
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const id = setTimeout(() => document.addEventListener('mousedown', close), 0);
    return () => { document.removeEventListener('mousedown', close); clearTimeout(id); };
  }, [open]); // eslint-disable-line

  const step = (dir) => {
    let m = month.m + dir, y = month.y;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    MonthStore.set({ m, y });
  };
  const isToday = month.m === MN_TODAY.m && month.y === MN_TODAY.y;
  const isFuture = month.y > MN_TODAY.y || (month.y === MN_TODAY.y && month.m >= MN_TODAY.m);

  const stepBtn = {
    width: 36, height: 36, flexShrink: 0,
    border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)',
    background: 'var(--surface-1)', cursor: 'pointer',
    display: 'grid', placeItems: 'center', color: 'var(--fg-1)',
    transition: 'background 150ms, border-color 150ms',
  };
  const hoverOn  = e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'color-mix(in srgb, ' + accent + ' 40%, var(--border-hairline))'; };
  const hoverOff = e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.borderColor = 'var(--border-hairline)'; };

  return (
    <div
      data-comment-anchor="month-navigator"
      style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        marginBottom: compact ? 16 : 22,
      }}
    >
      <button onClick={() => step(-1)} aria-label="Mes anterior" style={stepBtn} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
        <span className="material-icons" style={{ fontSize: 20 }}>chevron_left</span>
      </button>

      {/* Centre pill — opens the month/year picker */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 16px', minWidth: 168, justifyContent: 'center',
            border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)',
            background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', cursor: 'pointer',
            color: 'var(--fg-1)',
          }}>
          <span className="material-icons" style={{ fontSize: 19, color: accent }}>calendar_month</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
            {t(MN_MONTHS[month.m])} {month.y}
          </span>
          <span className="material-icons" style={{ fontSize: 19, color: 'var(--fg-3)' }}>{open ? 'expand_less' : 'expand_more'}</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
            zIndex: 'var(--z-popover, 80)', width: 280,
            background: 'var(--surface-1)', border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-lg)', boxShadow: '0 22px 60px rgba(15,23,42,.22)', padding: 14,
          }}>
            {/* Year stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button onClick={() => setPickYear(y => y - 1)} style={{ ...stepBtn, width: 30, height: 30 }}>
                <span className="material-icons" style={{ fontSize: 18 }}>chevron_left</span>
              </button>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{pickYear}</span>
              <button onClick={() => setPickYear(y => y + 1)} style={{ ...stepBtn, width: 30, height: 30 }}>
                <span className="material-icons" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
            </div>
            {/* Month grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {MN_ABBR.map((ab, i) => {
                const on = i === month.m && pickYear === month.y;
                const today = i === MN_TODAY.m && pickYear === MN_TODAY.y;
                return (
                  <button key={ab}
                    onClick={() => { MonthStore.set({ m: i, y: pickYear }); setOpen(false); }}
                    onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                    style={{
                      position: 'relative',
                      border: 0, cursor: 'pointer', padding: '10px 0', borderRadius: 'var(--radius-md)',
                      background: on ? accent : 'transparent',
                      color: on ? '#fff' : 'var(--fg-1)',
                      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: on ? 700 : 500,
                      transition: 'background 120ms',
                    }}>
                    {t(ab)}
                    {today && !on && <span style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 999, background: accent }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button onClick={() => step(1)} aria-label="Mes siguiente" disabled={isFuture}
        style={{ ...stepBtn, opacity: isFuture ? 0.4 : 1, cursor: isFuture ? 'not-allowed' : 'pointer' }}
        onMouseEnter={e => { if (!isFuture) hoverOn(e); }} onMouseLeave={hoverOff}>
        <span className="material-icons" style={{ fontSize: 20 }}>chevron_right</span>
      </button>

      {!isToday && (
        <button onClick={() => MonthStore.set({ ...MN_TODAY })}
          style={{
            marginLeft: 2, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-pill)',
            background: 'color-mix(in srgb, ' + accent + ' 12%, var(--surface-1))', color: accent,
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          }}>
          <span className="material-icons" style={{ fontSize: 17 }}>today</span>{t('Hoy')}
        </button>
      )}
    </div>
  );
}

Object.assign(window, { MonthNavigator });
