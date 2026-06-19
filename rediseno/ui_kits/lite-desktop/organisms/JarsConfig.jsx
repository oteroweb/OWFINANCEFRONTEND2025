/* ─── JarTemplateSelector + JarsTable ───────────────────────────────────
 * Paso "Dale propósito a tus cántaros" del onboarding y card "Mis cántaros"
 * del perfil financiero. Plantillas con mini-barra de preview + tabla
 * editable inline (color · nombre · % · propósito).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useJcState } = React;

/* ---------- Mini barra segmentada (preview de una plantilla) ---------- */
function JarMiniBar({ segments, height = 10 }) {
  return (
    <div style={{ display: 'flex', height, borderRadius: 999, overflow: 'hidden', background: 'var(--surface-3)' }}>
      {segments.map((s, i) => <div key={i} title={`${s.name} ${s.percent}%`} style={{ width: s.percent + '%', background: s.color }} />)}
    </div>
  );
}

/* ---------- Selector de plantilla de cántaros ---------- */
function JarTemplateSelector({ value, onChange }) {
  const templates = window.JAR_TEMPLATES || [];
  const [pending, setPending] = useJcState(null); // template slug awaiting confirmation

  const pick = (slug) => { if (slug === value) return; setPending(slug); };
  const confirm = () => { onChange && onChange(pending); setPending(null); };
  const pendingTpl = templates.find(t0 => t0.slug === pending);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'thin' }}>
        {templates.map(tpl => {
          const on = value === tpl.slug;
          return (
            <button key={tpl.slug} type="button" onClick={() => pick(tpl.slug)}
              style={{ flex: '0 0 auto', width: 220, textAlign: 'left', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 9, padding: 14,
                borderRadius: 'var(--radius-md)',
                border: on ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)',
                background: on ? 'var(--brand-primary-soft)' : 'var(--surface-1)', transition: 'all 150ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--fg-1)' }}>{tpl.name}</span>
                {on && <span className="material-icons" style={{ fontSize: 18, color: 'var(--brand-primary)' }}>check_circle</span>}
              </div>
              <JarMiniBar segments={tpl.segments} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 999 }}>{tpl.count} {t('cántaros')}</span>
                {tpl.recommended && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--income-fg)', background: 'var(--income-soft)', padding: '2px 8px', borderRadius: 999 }}>{t('Recomendada')}</span>}
                {tpl.featured && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--warning)', background: 'var(--warning-soft)', padding: '2px 8px', borderRadius: 999 }}><span className="material-icons" style={{ fontSize: 12 }}>star</span>{t('Popular')}</span>}
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)', lineHeight: 1.4, textWrap: 'pretty' }}>{t(tpl.forWho)}</span>
            </button>
          );
        })}
      </div>

      {/* confirmación destructiva */}
      {pendingTpl && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 13000, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setPending(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(420px, 100%)', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--warning-soft)', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 20 }}>swap_horiz</span></span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--fg-1)' }}>{t('¿Reemplazar tus cántaros?')}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>{t('Cambiarás al esquema')} <strong>{pendingTpl.name}</strong> ({pendingTpl.count} {t('cántaros')})</div>
              </div>
            </div>
            <JarMiniBar segments={pendingTpl.segments} height={12} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', margin: '12px 0 18px', textWrap: 'pretty' }}>{t('Tus cántaros con transacciones se conservan; los porcentajes se reajustan a la nueva plantilla.')}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <PillButton variant="ghost" onClick={() => setPending(null)}>{t('Cancelar')}</PillButton>
              <button type="button" onClick={confirm} style={{ border: 0, cursor: 'pointer', padding: '11px 20px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}>{t('Reemplazar')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Tabla editable de cántaros (color · nombre · % · propósito) ---------- */
function JarsTable({ jars, setJars }) {
  const isMobile = useViewportMobile();
  const upd = (i, k, v) => setJars(jars.map((j, idx) => idx === i ? { ...j, [k]: v } : j));
  const add = () => setJars([...jars, { id: 'new-' + Date.now(), name: '', percent: 0, color: '#64748B', description: '' }]);
  const rm = (i) => setJars(jars.filter((_, idx) => idx !== i));
  const total = jars.reduce((s, j) => s + (Number(j.percent) || 0), 0);
  const over = total > 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* encabezado de suma */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>{jars.length} {t('cántaros')}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: over ? 'var(--expense-fg)' : total === 100 ? 'var(--income-fg)' : 'var(--fg-2)' }}>
          {over && <span className="material-icons" style={{ fontSize: 15 }}>error</span>}
          {t('Suma')} {total}%
        </span>
      </div>

      {jars.map((j, i) => (
        <div key={j.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 11, borderRadius: 'var(--radius-md)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, background: j.color, flexShrink: 0 }} />
            <input value={j.name} placeholder={t('Nombre del cántaro')} onChange={e => upd(i, 'name', e.target.value)} style={{ ...window.FC_INPUT_STYLE, flex: 1, minWidth: 0, padding: '9px 11px' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, ...window.FC_INPUT_STYLE, width: 78, flexShrink: 0, padding: '9px 10px' }}>
              <input type="number" value={j.percent} onChange={e => upd(i, 'percent', e.target.value)} style={{ width: '100%', minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }} />
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-3)' }}>%</span>
            </div>
            <button type="button" onClick={() => rm(i)} title={t('Eliminar')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 18 }}>delete</span></button>
          </div>
          <textarea value={j.description} placeholder={t('Propósito: ¿para qué es este cántaro?')} onChange={e => upd(i, 'description', e.target.value)} rows={isMobile ? 2 : 1}
            style={{ ...window.FC_INPUT_STYLE, resize: 'vertical', minHeight: 38, padding: '9px 11px', fontFamily: 'var(--font-body)', lineHeight: 1.4 }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
        </div>
      ))}

      <button type="button" onClick={add} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px dashed var(--border-hairline)', background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 'var(--radius-pill)' }}><span className="material-icons" style={{ fontSize: 17 }}>add</span>{t('Agregar cántaro')}</button>

      {over && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 'var(--radius-sm)', background: 'var(--expense-soft)' }}>
        <span className="material-icons" style={{ fontSize: 17, color: 'var(--expense-fg)' }}>error</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-1)' }}>{t('Los porcentajes suman más de 100%. Ajusta antes de guardar.')}</span>
      </div>}
    </div>
  );
}

Object.assign(window, { JarTemplateSelector, JarsTable, JarMiniBar });
