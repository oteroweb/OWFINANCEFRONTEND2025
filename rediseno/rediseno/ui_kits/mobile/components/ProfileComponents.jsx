/* ─── Mobile · Profile components ───────────────────────────────────────
 * ChipGroup (single-select) · JarMiniBar · JarTemplateSelector · JarsTable.
 * Phone-first layout, no i18n helper (literal ES). Inline styles → RN StyleSheet.
 * Used by FinancialProfileScreen + OnboardingMobile.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useMpcState } = React;

const MPC_INPUT = {
  width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-hairline)',
  borderRadius: 'var(--radius-md)', padding: '11px 13px',
  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)',
  background: 'var(--surface-2)', outline: 'none', transition: 'border-color 150ms, background 150ms',
};
function mpcFocus(e) { e.target.style.borderColor = 'var(--brand-primary)'; e.target.style.background = 'var(--surface-1)'; }
function mpcBlur(e)  { e.target.style.borderColor = 'var(--border-hairline)'; e.target.style.background = 'var(--surface-2)'; }

/* ── ChipGroup — full-width stacked chips on phone ── */
function MChipGroup({ group, value, onChange }) {
  if (!group) return null;
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 9 }}>{group.label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {group.options.map(opt => {
          const on = value === opt.value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              style={{ position: 'relative', textAlign: 'left', cursor: 'pointer', width: '100%',
                display: 'flex', flexDirection: 'column', gap: 2, padding: '11px 40px 11px 14px',
                borderRadius: 'var(--radius-md)',
                border: on ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)',
                background: on ? 'var(--brand-primary-soft)' : 'var(--surface-1)', transition: 'all 150ms' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: on ? 'var(--brand-primary-fg-soft)' : 'var(--fg-1)' }}>{opt.label}</span>
              {opt.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.35 }}>{opt.desc}</span>}
              <span style={{ position: 'absolute', top: '50%', right: 13, transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? 'var(--brand-primary)' : 'transparent', border: on ? 'none' : '1.5px solid var(--surface-3)' }}>
                {on && <span className="material-icons" style={{ fontSize: 14, color: '#fff' }}>check</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Mini barra segmentada ── */
function MJarMiniBar({ segments, height = 10 }) {
  return (
    <div style={{ display: 'flex', height, borderRadius: 999, overflow: 'hidden', background: 'var(--surface-3)' }}>
      {segments.map((s, i) => <div key={i} style={{ width: s.percent + '%', background: s.color }} />)}
    </div>
  );
}

/* ── Selector de plantilla de cántaros (scroll horizontal) ── */
function MJarTemplateSelector({ value, onChange }) {
  const templates = window.JAR_TEMPLATES || [];
  const [pending, setPending] = useMpcState(null);
  const pick = (slug) => { if (slug === value) return; setPending(slug); };
  const pendingTpl = templates.find(t0 => t0.slug === pending);
  return (
    <div>
      <div style={{ display: 'flex', gap: 11, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {templates.map(tpl => {
          const on = value === tpl.slug;
          return (
            <button key={tpl.slug} type="button" onClick={() => pick(tpl.slug)}
              style={{ flex: '0 0 auto', width: 184, textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, padding: 13,
                borderRadius: 'var(--radius-md)', border: on ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)',
                background: on ? 'var(--brand-primary-soft)' : 'var(--surface-1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 700, color: 'var(--fg-1)' }}>{tpl.name}</span>
                {on && <span className="material-icons" style={{ fontSize: 17, color: 'var(--brand-primary)' }}>check_circle</span>}
              </div>
              <MJarMiniBar segments={tpl.segments} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, color: 'var(--fg-2)', background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 999 }}>{tpl.count} cántaros</span>
                {tpl.recommended && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, color: 'var(--income-fg)', background: 'var(--income-soft)', padding: '2px 7px', borderRadius: 999 }}>Recomendada</span>}
                {tpl.featured && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, color: 'var(--warning-fg)', background: 'var(--warning-soft)', padding: '2px 7px', borderRadius: 999 }}><span className="material-icons" style={{ fontSize: 11 }}>star</span>Popular</span>}
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.4 }}>{tpl.forWho}</span>
            </button>
          );
        })}
      </div>

      {/* confirmación destructiva — absolute dentro de la pantalla */}
      {pendingTpl && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(8,12,20,0.5)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setPending(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'var(--surface-1)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, animation: 'mSheetUp 240ms var(--ease-out)' }}>
            <style>{`@keyframes mSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--warning-soft)', color: 'var(--warning-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 20 }}>swap_horiz</span></span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--fg-1)' }}>¿Reemplazar tus cántaros?</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>Cambiarás al esquema <strong>{pendingTpl.name}</strong></div>
              </div>
            </div>
            <MJarMiniBar segments={pendingTpl.segments} height={12} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', margin: '12px 0 16px' }}>Tus cántaros con transacciones se conservan; los % se reajustan.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <PillButtonMobile variant="ghost" fullWidth onPress={() => setPending(null)}>Cancelar</PillButtonMobile>
              <PillButtonMobile variant="primary" fullWidth onPress={() => { onChange && onChange(pending); setPending(null); }}>Reemplazar</PillButtonMobile>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tabla editable de cántaros (stacked en phone) ── */
function MJarsTable({ jars, setJars }) {
  const upd = (i, k, v) => setJars(jars.map((j, idx) => idx === i ? { ...j, [k]: v } : j));
  const add = () => setJars([...jars, { id: 'new-' + Date.now(), name: '', percent: 0, color: '#64748B', description: '' }]);
  const rm = (i) => setJars(jars.filter((_, idx) => idx !== i));
  const total = jars.reduce((s, j) => s + (Number(j.percent) || 0), 0);
  const over = total > 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>{jars.length} cántaros</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: over ? 'var(--expense-fg)' : total === 100 ? 'var(--income-fg)' : 'var(--fg-2)' }}>
          {over && <span className="material-icons" style={{ fontSize: 15 }}>error</span>}Suma {total}%
        </span>
      </div>
      {jars.map((j, i) => (
        <div key={j.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 11, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, background: j.color, flexShrink: 0 }} />
            <input value={j.name} placeholder="Nombre" onChange={e => upd(i, 'name', e.target.value)} style={{ ...MPC_INPUT, flex: 1, minWidth: 0, padding: '9px 11px' }} onFocus={mpcFocus} onBlur={mpcBlur} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, ...MPC_INPUT, width: 66, flexShrink: 0, padding: '9px 9px' }}>
              <input type="number" value={j.percent} onChange={e => upd(i, 'percent', e.target.value)} style={{ width: '100%', minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', textAlign: 'right' }} />
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, color: 'var(--fg-3)' }}>%</span>
            </div>
            <button type="button" onClick={() => rm(i)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 18 }}>delete</span></button>
          </div>
          <textarea value={j.description} placeholder="Propósito: ¿para qué es?" onChange={e => upd(i, 'description', e.target.value)} rows={2} style={{ ...MPC_INPUT, resize: 'none', padding: '9px 11px', lineHeight: 1.4 }} onFocus={mpcFocus} onBlur={mpcBlur} />
        </div>
      ))}
      <button type="button" onClick={add} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px dashed var(--border-hairline)', background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 'var(--radius-pill)' }}><span className="material-icons" style={{ fontSize: 16 }}>add</span>Agregar cántaro</button>
      {over && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--expense-soft)' }}><span className="material-icons" style={{ fontSize: 16, color: 'var(--expense-fg)' }}>error</span><span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-1)' }}>Suman más de 100%. Ajusta antes de guardar.</span></div>}
    </div>
  );
}

Object.assign(window, { MChipGroup, MJarMiniBar, MJarTemplateSelector, MJarsTable, MPC_INPUT, mpcFocus, mpcBlur });
