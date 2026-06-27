/* ─── Exchange Rates Widget ──────────────────────────────────────────────
 * Manual rate setter for multi-currency Pro accounts.
 * Two rates per currency:
 *   · official  → tasa oficial (BCV) — referencia
 *   · current   → tasa del momento / provisional — la que se APLICA en todo Pro
 * Plus a per-currency history (sparkline + list) that records changes.
 * Rates flow up via onChange; conversions everywhere read `.current`.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useERState } = React;

const RATE_DEFS = [
  { code: 'EUR', name: 'Euro',               flag: 'EU', dp: 4 },
  { code: 'VES', name: 'Bolívar venezolano', flag: 'VE', dp: 2 },
  { code: 'COP', name: 'Peso colombiano',    flag: 'CO', dp: 2 },
  { code: 'CLP', name: 'Peso chileno',       flag: 'CL', dp: 2 },
  { code: 'PEN', name: 'Sol peruano',        flag: 'PE', dp: 4 },
];

const ER_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function erFmtDate(d) { return d.getDate() + ' ' + ER_MONTHS[d.getMonth()]; }
function erRound(n, dp) { return n == null ? null : +(Number(n).toFixed(dp)); }

/* Plausible recent history ending at the live values (prototype seed) */
function erSeedHistory(current, official, dp) {
  const base = current || official;
  if (!base) return [];
  const offsetDays = [18, 13, 9, 5, 2, 0];
  const drift = [-0.058, -0.041, -0.027, -0.016, -0.006, 0];
  const now = new Date();
  return offsetDays.map((days, i) => {
    const d = new Date(now); d.setDate(now.getDate() - days);
    return {
      label: days === 0 ? 'Hoy' : erFmtDate(d),
      current: current ? erRound(current * (1 + drift[i]), dp) : null,
      official: official ? erRound(official * (1 + drift[i] * 0.72), dp) : null,
    };
  });
}

function ExchangeRatesWidget({ rates, onChange }) {
  // Tolerant to flat ({VES: 40.5}) or nested ({VES: {current, official}}) shapes.
  const readField = (code, field) => {
    const r = rates[code];
    if (r && typeof r === 'object') return r[field] ?? '';
    return field === 'current' ? (r ?? '') : '';
  };

  // Local history store, seeded once from incoming rates.
  const [history, setHistory] = useERState(() => {
    const h = {};
    RATE_DEFS.forEach(def => {
      const r = rates[def.code];
      const cur = (r && typeof r === 'object') ? r.current : r;
      const off = (r && typeof r === 'object') ? r.official : null;
      h[def.code] = erSeedHistory(cur || '', off || '', def.dp);
    });
    return h;
  });
  const [openCode, setOpenCode] = useERState(null);

  const writeField = (code, field, v) => {
    const r = rates[code];
    const next = (r && typeof r === 'object') ? { ...r, [field]: v } : { current: (field === 'current' ? v : (r ?? '')), official: (field === 'official' ? v : '') };
    onChange({ ...rates, [code]: next });
    // Update / create today's history entry live.
    setHistory(prev => {
      const list = (prev[code] || []).slice();
      const today = list.length && list[list.length - 1].label === 'Hoy'
        ? { ...list[list.length - 1] }
        : { label: 'Hoy', current: null, official: null };
      today[field] = v === '' ? null : v;
      if (list.length && list[list.length - 1].label === 'Hoy') list[list.length - 1] = today;
      else list.push(today);
      return { ...prev, [code]: list };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {RATE_DEFS.map((def, i) => (
        <RateRow
          key={def.code}
          def={def}
          current={readField(def.code, 'current')}
          official={readField(def.code, 'official')}
          history={history[def.code] || []}
          open={openCode === def.code}
          onToggle={() => setOpenCode(c => c === def.code ? null : def.code)}
          onChange={(field, v) => writeField(def.code, field, v)}
          first={i === 0}
        />
      ))}
    </div>
  );
}

function RateRow({ def, current, official, history, open, onToggle, onChange, first }) {
  const [focus, setFocus] = useERState(null); // 'current' | 'official' | null
  const hasRate = current !== '' || official !== '';
  const spread = (current !== '' && official !== '' && official > 0)
    ? ((Number(current) - Number(official)) / Number(official)) * 100 : null;
  const spreadUp = spread != null && spread >= 0;

  return (
    <div style={{ borderTop: first ? 'none' : '1px solid var(--border-hairline)' }}>
      {/* ── Main row ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', flexWrap: 'wrap' }}>
        {/* Flag */}
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--fg-2)', letterSpacing: '0.04em', flexShrink: 0 }}>
          {def.flag}
        </div>
        {/* Name */}
        <div style={{ width: 140, minWidth: 110, flex: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{def.code}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{def.name}</span>
        </div>

        {/* Two rate inputs */}
        <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
          <RateField label={t('Oficial (BCV)')} code={def.code} value={official}
            focused={focus === 'official'} onFocus={() => setFocus('official')} onBlur={() => setFocus(null)}
            onChange={v => onChange('official', v)} accent="var(--fg-3)" />
          <RateField label={t('Tasa actual')} code={def.code} value={current} badge={t('aplica')}
            focused={focus === 'current'} onFocus={() => setFocus('current')} onBlur={() => setFocus(null)}
            onChange={v => onChange('current', v)} accent="var(--brand-primary)" />
        </div>

        {/* Spread + history toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {spread != null && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-money)', fontSize: 11.5, fontWeight: 700, padding: '4px 9px', borderRadius: 'var(--radius-pill)', whiteSpace: 'nowrap',
              background: spreadUp ? 'var(--warning-soft)' : 'var(--income-soft)', color: spreadUp ? 'var(--warning-fg)' : 'var(--income-fg)' }}
              title={spreadUp ? t('por encima del BCV') : t('por debajo del BCV')}>
              <span className="material-icons" style={{ fontSize: 14 }}>{spreadUp ? 'trending_up' : 'trending_down'}</span>
              {(spreadUp ? '+' : '') + spread.toFixed(1) + '%'}
            </span>
          )}
          {hasRate && history.length > 0 && (
            <button onClick={onToggle} aria-label={t('Ver historial')} title={t('Ver historial')}
              style={{ width: 30, height: 30, border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-pill)', background: open ? 'var(--surface-2)' : 'var(--surface-1)', color: 'var(--fg-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'var(--surface-1)'; }}>
              <span className="material-icons" style={{ fontSize: 18, transition: 'transform 180ms', transform: open ? 'rotate(180deg)' : 'none' }}>history</span>
            </button>
          )}
        </div>
      </div>

      {/* ── History panel ────────────────────────────────────── */}
      {open && history.length > 0 && (
        <div style={{ padding: '4px 18px 18px 68px', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 12px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{t('Historial de tasas')}</span>
            <Sparkline points={history.map(h => h.current).filter(v => v != null)} />
          </div>
          {/* Legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 18px', alignItems: 'center', paddingBottom: 6, borderBottom: '1px solid var(--border-hairline)', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{t('Fecha')}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--fg-3)', textAlign: 'right', minWidth: 80 }}>{t('BCV')}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--brand-primary-fg-soft, var(--brand-primary))', textAlign: 'right', minWidth: 80 }}>{t('Actual')}</span>
          </div>
          {history.slice().reverse().map((h, idx) => {
            const isToday = h.label === 'Hoy';
            return (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0 18px', alignItems: 'center', padding: '7px 0' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--fg-1)' : 'var(--fg-2)' }}>
                  {isToday && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)' }} />}
                  {t(h.label)}
                </span>
                <span style={{ fontFamily: 'var(--font-money)', fontSize: 12.5, color: 'var(--fg-3)', textAlign: 'right', minWidth: 80, fontVariantNumeric: 'tabular-nums' }}>{h.official != null ? Number(h.official).toLocaleString('en-US', { maximumFractionDigits: def.dp }) : '—'}</span>
                <span style={{ fontFamily: 'var(--font-money)', fontSize: 12.5, fontWeight: isToday ? 700 : 600, color: isToday ? 'var(--brand-primary-fg-soft, var(--brand-primary))' : 'var(--fg-1)', textAlign: 'right', minWidth: 80, fontVariantNumeric: 'tabular-nums' }}>{h.current != null ? Number(h.current).toLocaleString('en-US', { maximumFractionDigits: def.dp }) : '—'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RateField({ label, code, value, badge, focused, onFocus, onBlur, onChange, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 130 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.03em', textTransform: 'uppercase', color: accent }}>
        {label}
        {badge && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.02em', textTransform: 'none', padding: '1px 6px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary-fg-soft, var(--brand-primary))' }}>{badge}</span>}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: focused ? 'var(--surface-1)' : 'var(--surface-2)', border: '1px solid ' + (focused ? 'var(--brand-primary)' : 'var(--border-hairline)'), borderRadius: 'var(--radius-sm)', padding: '7px 12px', transition: 'border-color 160ms' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>1 $ =</span>
        <input
          type="number" min="0" step="any" value={value}
          onChange={e => onChange(e.target.value === '' ? '' : (parseFloat(e.target.value) || ''))}
          onFocus={onFocus} onBlur={onBlur}
          placeholder="—"
          style={{ border: 0, background: 'transparent', fontFamily: 'var(--font-money)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', outline: 'none', width: '100%', minWidth: 0, fontVariantNumeric: 'tabular-nums' }}
        />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, color: 'var(--fg-2)', flexShrink: 0 }}>{code}</span>
      </div>
    </div>
  );
}

/* Tiny inline sparkline of recent "current" values */
function Sparkline({ points }) {
  if (!points || points.length < 2) return null;
  const w = 96, h = 26, pad = 3;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const xs = (i) => pad + (i / (points.length - 1)) * (w - pad * 2);
  const ys = (v) => h - pad - ((v - min) / span) * (h - pad * 2);
  const d = points.map((v, i) => (i === 0 ? 'M' : 'L') + xs(i).toFixed(1) + ' ' + ys(v).toFixed(1)).join(' ');
  const last = points.length - 1;
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }} data-om-raster>
      <path d={d} fill="none" stroke="var(--brand-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs(last)} cy={ys(points[last])} r="2.6" fill="var(--brand-primary)" />
    </svg>
  );
}

Object.assign(window, { ExchangeRatesWidget, RATE_DEFS });
