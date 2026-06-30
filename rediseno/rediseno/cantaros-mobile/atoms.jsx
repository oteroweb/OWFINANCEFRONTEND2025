/* ─── Cántaros Mobile — átomos ──────────────────────────────────────────
 * Controles compactos específicos del editor de cántaros.
 * Prefijo Cm* para evitar colisiones con el kit.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useCmState, useRef: useCmRef } = React;

/* Helper de formato money */
function cmMoney(v, dec = 2) {
  return (Math.round(v * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

/* ── Toggle (switch) ── */
function CmToggle({ on, onChange, color = 'var(--income)' }) {
  return (
    <div onClick={onChange} role="switch" aria-checked={on} style={{
      width: 42, height: 24, borderRadius: 12, flexShrink: 0, cursor: 'pointer',
      background: on ? color : 'var(--surface-3)', position: 'relative', transition: 'background 180ms',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: 9,
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left 180ms var(--ease-out)',
      }} />
    </div>
  );
}

/* ── Segmented control (2 opciones, con iconos opcionales) ──
 * options: [{ value, label, icon?, accent? }]  accent = color cuando activo */
function CmSeg({ value, onChange, options, size = 'md' }) {
  const pad = size === 'sm' ? '7px 8px' : '9px 10px';
  const fs = size === 'sm' ? 11.5 : 12.5;
  return (
    <div style={{ display: 'flex', gap: 3, background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 3 }}>
      {options.map(o => {
        const on = value === o.value;
        const accent = o.accent || 'var(--brand-primary)';
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{
            flex: 1, border: 0, cursor: 'pointer', padding: pad, borderRadius: 'var(--radius-pill)',
            background: on ? accent : 'transparent', color: on ? '#fff' : 'var(--fg-2)',
            fontFamily: 'var(--font-body)', fontWeight: on ? 700 : 600, fontSize: fs,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            letterSpacing: '0.01em', transition: 'background 160ms, color 160ms', whiteSpace: 'nowrap',
          }}>
            {o.icon && <span className="material-icons" style={{ fontSize: fs + 4 }}>{o.icon}</span>}{o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Mini barra de distribución apilada ── */
function CmMiniBar({ segments, height = 12, radius = 999 }) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  return (
    <div style={{ display: 'flex', height, borderRadius: radius, overflow: 'hidden', background: 'var(--surface-3)', gap: 1.5 }}>
      {segments.map((s, i) => (
        <div key={i} title={s.label} style={{
          width: ((s.value || 0) / total * 100) + '%', background: s.color,
          opacity: s.dim ? 0.35 : 1, minWidth: s.value ? 3 : 0, transition: 'width 240ms var(--ease-out)',
        }} />
      ))}
    </div>
  );
}

/* ── Slider de porcentaje (pointer-based, accesible al tacto) ── */
function CmSlider({ value, onChange, min = 0, max = 100, color = 'var(--brand-primary)' }) {
  const ref = useCmRef(null);
  const dragging = useCmRef(false);
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const setFromX = (clientX) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    onChange(Math.round(min + ratio * (max - min)));
  };
  const onDown = (e) => { dragging.current = true; setFromX(e.clientX ?? e.touches[0].clientX); };
  const onMove = (e) => { if (!dragging.current) return; setFromX(e.clientX ?? (e.touches && e.touches[0].clientX)); };
  const onUp = () => { dragging.current = false; };
  return (
    <div ref={ref}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onDown(e); }}
      onPointerMove={onMove} onPointerUp={onUp}
      style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center', cursor: 'pointer', touchAction: 'none', flex: 1 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3, background: 'var(--surface-3)' }} />
      <div style={{ position: 'absolute', left: 0, width: pct + '%', height: 6, borderRadius: 3, background: color }} />
      <div style={{ position: 'absolute', left: `calc(${pct}% - 11px)`, width: 22, height: 22, borderRadius: 11, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.28)', border: `2px solid ${color}` }} />
    </div>
  );
}

/* ── Pill button compacto ── */
function CmBtn({ children, icon, variant = 'primary', fullWidth = false, onClick, size = 'md' }) {
  const [pressed, setPressed] = useCmState(false);
  const pad = size === 'sm' ? '8px 13px' : '12px 16px';
  const fs = size === 'sm' ? 12.5 : 14;
  const map = {
    primary: { bg: 'var(--brand-primary)', color: '#fff' },
    ghost:   { bg: 'transparent', color: 'var(--fg-1)', border: '1px solid var(--border-hairline)' },
    soft:    { bg: 'var(--surface-2)', color: 'var(--fg-1)' },
    danger:  { bg: 'var(--expense-soft)', color: 'var(--expense-fg)' },
    accent:  { bg: 'var(--info)', color: '#fff' },
  };
  const p = map[variant] || map.primary;
  return (
    <button type="button" onClick={onClick}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: fs, border: p.border || 0,
        borderRadius: 'var(--radius-pill)', cursor: 'pointer', padding: pad,
        width: fullWidth ? '100%' : 'auto', background: p.bg, color: p.color,
        transform: pressed ? 'scale(0.97)' : 'scale(1)', transition: 'transform 80ms',
      }}>
      {icon && <span className="material-icons" style={{ fontSize: fs + 3 }}>{icon}</span>}{children}
    </button>
  );
}

/* ── Cápsula de modo (tag pequeño no interactivo, p/ filas colapsadas) ── */
function CmTag({ icon, children, tone = 'neutral' }) {
  const map = {
    neutral: { bg: 'var(--surface-2)', color: 'var(--fg-2)' },
    accum:   { bg: 'var(--income-soft)', color: 'var(--income-fg)' },
    reset:   { bg: 'var(--surface-2)', color: 'var(--fg-2)' },
    fixed:   { bg: 'var(--info-soft)', color: 'var(--info-fg)' },
    warn:    { bg: 'var(--warning-soft)', color: 'var(--warning-fg)' },
    over:    { bg: 'var(--expense-soft)', color: 'var(--expense-fg)' },
  };
  const p = map[tone] || map.neutral;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10.5, padding: '3px 8px', borderRadius: 999, background: p.bg, color: p.color, whiteSpace: 'nowrap' }}>
      {icon && <span className="material-icons" style={{ fontSize: 12 }}>{icon}</span>}{children}
    </span>
  );
}

/* ── Paleta de colores (popover simple) ── */
const CM_PALETTE = ['#1E3A8A', '#2D4DA6', '#0EA5E9', '#10B981', '#059669', '#14B8A6', '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#8B5CF6', '#A855F7', '#6366F1', '#64748B'];
function CmColorPicker({ value, onChange, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,12,20,0.45)' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 260, background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', padding: 18, boxShadow: 'var(--shadow-popover)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', marginBottom: 12 }}>Color del cántaro</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 9 }}>
          {CM_PALETTE.map(c => (
            <button key={c} type="button" onClick={() => { onChange(c); onClose(); }} style={{
              width: '100%', aspectRatio: '1', borderRadius: 9, background: c, cursor: 'pointer',
              border: value === c ? '2.5px solid var(--fg-1)' : '2.5px solid transparent',
              boxShadow: value === c ? '0 0 0 2px var(--surface-1) inset' : 'none',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { cmMoney, CmToggle, CmSeg, CmMiniBar, CmSlider, CmBtn, CmTag, CmColorPicker, CM_PALETTE });
