/* ─── OW Finance Mobile — Month Navigator ────────────────────────────────
 * Date-interval navigation for Transactions (and any period-scoped screen).
 * Mirrors lite-desktop/organisms/MonthNavigator.jsx as a mobile bar:
 *   ‹ prev   [ Mes Año ▾ ]   next ›   (Hoy)
 * Tapping the center pill opens a month+year picker as a bottom sheet.
 *
 * Controlled: pass `month` ({m:0-11, y}) + `onChange`.
 * RN: same logic; picker → BottomSheetModal with a 4-col month grid.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useMnMobState } = React;

const MNM_MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MNM_ABBR   = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
/* "Hoy" para este prototipo = Marzo 2026 (coincide con los datos). */
const MNM_TODAY = { m: 2, y: 2026 };

const mnmLabel = (mo) => `${MNM_MONTHS[mo.m]} ${mo.y}`;

function MonthBar({ month, onChange, accent = 'var(--brand-primary)' }) {
  const [open, setOpen] = useMnMobState(false);
  const [pickYear, setPickYear] = useMnMobState(month.y);

  const step = (dir) => {
    let m = month.m + dir, y = month.y;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    onChange({ m, y });
  };
  const isToday  = month.m === MNM_TODAY.m && month.y === MNM_TODAY.y;
  const isFuture = month.y > MNM_TODAY.y || (month.y === MNM_TODAY.y && month.m >= MNM_TODAY.m);

  const stepBtn = (disabled) => ({
    width: 40, height: 40, flexShrink: 0,
    border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)',
    background: 'var(--surface-1)', cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'grid', placeItems: 'center', color: 'var(--fg-1)', opacity: disabled ? 0.4 : 1,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px 10px' }}>
      <button onClick={() => step(-1)} aria-label="Mes anterior" style={stepBtn(false)}>
        <span className="material-icons" style={{ fontSize: 22 }}>chevron_left</span>
      </button>

      {/* Center pill */}
      <button onClick={() => { setPickYear(month.y); setOpen(true); }} style={{
        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px 14px', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)',
        background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', color: 'var(--fg-1)',
      }}>
        <span className="material-icons" style={{ fontSize: 19, color: accent }}>calendar_month</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{mnmLabel(month)}</span>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>expand_more</span>
      </button>

      <button onClick={() => step(1)} aria-label="Mes siguiente" disabled={isFuture} style={stepBtn(isFuture)}>
        <span className="material-icons" style={{ fontSize: 22 }}>chevron_right</span>
      </button>

      {!isToday && (
        <button onClick={() => onChange({ ...MNM_TODAY })} style={{
          flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '0 14px', height: 40, border: 0, cursor: 'pointer', borderRadius: 'var(--radius-pill)',
          background: 'color-mix(in srgb, ' + accent + ' 14%, var(--surface-1))', color: accent,
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
        }}>
          <span className="material-icons" style={{ fontSize: 17 }}>today</span>Hoy
        </button>
      )}

      {/* Picker sheet */}
      <MobileBottomSheet open={open} onClose={() => setOpen(false)} title="Elegir período" maxHeight="58%">
        <div style={{ padding: '0 20px 24px' }}>
          {/* Year stepper */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 16px' }}>
            <button onClick={() => setPickYear(y => y - 1)} style={stepBtn(false)}>
              <span className="material-icons" style={{ fontSize: 20 }}>chevron_left</span>
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>{pickYear}</span>
            <button onClick={() => setPickYear(y => y + 1)} style={stepBtn(false)}>
              <span className="material-icons" style={{ fontSize: 20 }}>chevron_right</span>
            </button>
          </div>
          {/* Month grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {MNM_ABBR.map((ab, i) => {
              const on = i === month.m && pickYear === month.y;
              const today = i === MNM_TODAY.m && pickYear === MNM_TODAY.y;
              return (
                <button key={ab} onClick={() => { onChange({ m: i, y: pickYear }); setOpen(false); }} style={{
                  position: 'relative', border: 0, cursor: 'pointer', padding: '14px 0', borderRadius: 'var(--radius-md)',
                  background: on ? accent : 'var(--surface-2)', color: on ? '#fff' : 'var(--fg-1)',
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: on ? 700 : 500,
                }}>
                  {ab}
                  {today && !on && <span style={{ position: 'absolute', bottom: 7, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 999, background: accent }} />}
                </button>
              );
            })}
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  );
}

Object.assign(window, { MonthBar, MNM_TODAY, mnmLabel });
