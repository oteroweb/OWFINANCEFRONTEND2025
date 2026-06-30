/* ─── ChipGroup — selector tipo chip, single-select ─────────────────────
 * Cada opción muestra label + descripción corta (subtexto). Checkmark sutil
 * al seleccionar. Grid 2-col en móvil / flex-wrap en desktop.
 * Props: group({label,options}) · value · onChange · accent · compact
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function ChipGroup({ group, value, onChange, accent = 'var(--brand-primary)', compact = false }) {
  const isMobile = useViewportMobile();
  if (!group) return null;
  return (
    <div>
      {group.label && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 9 }}>{t(group.label)}</div>
      )}
      <div style={{ display: isMobile ? 'grid' : 'flex', gridTemplateColumns: isMobile ? '1fr 1fr' : undefined, flexWrap: isMobile ? undefined : 'wrap', gap: 8 }}>
        {group.options.map(opt => {
          const on = value === opt.value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              style={{
                position: 'relative', textAlign: 'left', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 2,
                padding: compact ? '9px 12px' : '11px 14px', paddingRight: 30,
                borderRadius: 'var(--radius-md)',
                border: on ? `1.5px solid ${accent}` : '1.5px solid var(--border-hairline)',
                background: on ? `color-mix(in srgb, ${accent} 9%, var(--surface-1))` : 'var(--surface-1)',
                minWidth: isMobile ? 0 : 150, flex: isMobile ? undefined : '0 1 auto',
                transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.borderColor = 'var(--fg-3)'; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.borderColor = 'var(--border-hairline)'; }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: on ? accent : 'var(--fg-1)' }}>{t(opt.label)}</span>
              {opt.desc && !compact && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)', lineHeight: 1.35, textWrap: 'pretty' }}>{t(opt.desc)}</span>}
              <span style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? accent : 'transparent', border: on ? 'none' : '1.5px solid var(--surface-3)', transition: 'all 150ms' }}>
                {on && <span className="material-icons" style={{ fontSize: 13, color: '#fff' }}>check</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { ChipGroup });
