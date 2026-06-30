/* ─── Onboarding · Panel (home) + Mi perfil ─────────────────────────────
 * PanelScreen  → home con saludo, tarjeta de progreso/gamificación, resumen
 *                de cántaros, tip del asesor y resumen de perfil.
 * ProfileScreen→ "Mi perfil": anillo de completitud, nivel + beneficio,
 *                insignias por sección, secciones editables, campos avanzados Pro.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, OnbStatusBar, OnbRing, OnbLevelBadge, OnbSectionBadges, onbCompleteness,
   ONB_LEVELS, ONB_SECTIONS, AIAvatar, PillButtonMobile, MJarMiniBar */
const { useState: usePanelState } = React;

/* Consejos contextuales del asesor según lo que falta */
function onbTip(c) {
  if (!c.essentialsDone) return { icon: 'flag', text: 'Define tu meta principal y un esquema de cántaros: es lo que más cambia tus consejos.' };
  if (c.levelId === 'basico') return { icon: 'insights', text: 'Completa tu situación financiera para pasar de consejos generales a consejos a tu medida.' };
  if (c.levelId === 'completo') return { icon: 'workspace_premium', text: 'Con Pro desbloqueas el nivel Avanzado: proyecciones y estrategia personalizada.' };
  return { icon: 'verified', text: 'Tu perfil está al máximo. El asesor ya trabaja con toda tu información.' };
}

/* ── Tarjeta de progreso / gamificación (reutilizable en panel) ── */
function OnbProgressCard({ comp, onContinue, onView }) {
  const next = comp.nextLevel;
  const missingCount = comp.missing.length;
  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', padding: 18, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <OnbRing pct={comp.pct} size={78} stroke={8} color={comp.level.color}>
          <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 20, color: 'var(--fg-1)', lineHeight: 1 }}>{comp.pct}%</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 8.5, color: 'var(--fg-3)', marginTop: 1 }}>perfil</span>
        </OnbRing>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 6 }}><OnbLevelBadge level={comp.level} size="sm" /></div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.45, margin: 0 }}>
            {!next ? 'Perfil al máximo nivel. ¡Bien hecho!'
              : missingCount > 0 ? <>Te faltan <strong style={{ color: 'var(--fg-1)' }}>{missingCount} {missingCount === 1 ? 'dato' : 'datos'}</strong> para el nivel <strong style={{ color: next.color }}>{next.label}</strong>.</>
              : next.pro ? <>Desbloquea el nivel <strong style={{ color: next.color }}>{next.label}</strong> con Pro para una estrategia a tu medida.</>
              : <>Ya casi: un paso más para <strong style={{ color: next.color }}>{next.label}</strong>.</>}
          </p>
        </div>
      </div>
      <div style={{ margin: '14px 0 14px' }}>
        <OnbSectionBadges sections={comp.sections} onTap={onView} />
      </div>
      <div style={{ display: 'flex', gap: 9 }}>
        {next && <PillButtonMobile variant="primary" fullWidth icon="arrow_forward" size="sm" onPress={onContinue}>Subir a {next.label}</PillButtonMobile>}
        <PillButtonMobile variant={next ? 'secondary' : 'primary'} fullWidth icon="badge" size="sm" onPress={onView}>Ver mi perfil</PillButtonMobile>
      </div>
    </div>
  );
}

/* ── Panel / Home ── */
function PanelScreen({ profile, userName, onContinue, onViewProfile, onRestart }) {
  const comp = onbCompleteness(profile, { pro: profile.plan === 'pro' });
  const tip = onbTip(comp);
  const tpl = (window.JAR_TEMPLATES || []).find(t => t.slug === profile.template_slug);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OnbStatusBar />
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 12px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>Hola{userName ? ',' : ''}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>{userName || 'tu panel'} 👋</div>
        </div>
        <button type="button" onClick={onRestart} title="Reiniciar demo" style={{ border: 0, background: 'var(--surface-1)', cursor: 'pointer', width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-2)', boxShadow: 'var(--shadow-card)' }}>
          <span className="material-icons" style={{ fontSize: 21 }}>refresh</span>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Progreso / gamificación */}
        <OnbProgressCard comp={comp} onContinue={onContinue} onView={onViewProfile} />

        {/* Tip del asesor */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
          <AIAvatar size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8B5CF6', marginBottom: 3 }}>Consejo del asesor</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.5, margin: 0 }}>{tip.text}</p>
          </div>
        </div>

        {/* Resumen de cántaros */}
        {tpl && (
          <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>
                <span className="material-icons" style={{ fontSize: 19, color: 'var(--brand-primary)' }}>savings</span>Tus cántaros
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{tpl.name}</span>
            </div>
            <MJarMiniBar segments={tpl.segments} height={14} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 12 }}>
              {tpl.segments.slice(0, 5).map((s, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.name}
                </span>
              ))}
              {tpl.segments.length > 5 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>+{tpl.segments.length - 5} más</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Mi perfil (detalle) ── */
function ProfileScreen({ profile, userName, onBack, onEditSection, onUpgrade }) {
  const pro = profile.plan === 'pro';
  const comp = onbCompleteness(profile, { pro });
  const F = window.PROFILE_FIELDS || {};
  const labelFor = (field) => { const g = F[field]; const o = g && g.options.find(x => x.value === profile[field]); return o ? o.label : (profile[field] || null); };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OnbStatusBar />
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '2px 14px 8px' }}>
        <button type="button" onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-1)' }}>
          <span className="material-icons" style={{ fontSize: 22 }}>arrow_back</span>
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)' }}>Mi perfil</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '4px 16px 24px' }}>
        {/* Cabecera: anillo + nivel + beneficio */}
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', padding: 18, marginBottom: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <OnbRing pct={comp.pct} size={104} stroke={10} color={comp.level.color}>
            <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 27, color: 'var(--fg-1)', lineHeight: 1 }}>{comp.pct}%</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-3)' }}>completado</span>
          </OnbRing>
          <OnbLevelBadge level={comp.level} />
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '11px 13px', width: '100%' }}>
            <span className="material-icons" style={{ fontSize: 18, color: comp.level.color, flexShrink: 0, marginTop: 1 }}>{comp.level.icon}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-1)', lineHeight: 1.45 }}>{comp.level.advisor}</span>
          </div>
        </div>

        {/* Niveles (camino) */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {ONB_LEVELS.map((lv, i) => {
            const reached = comp.levelIndex >= i;
            const locked = lv.pro && !pro;
            return (
              <div key={lv.id} style={{ flex: 1, padding: '11px 8px', borderRadius: 'var(--radius-md)', textAlign: 'center', background: reached ? 'var(--surface-1)' : 'var(--surface-2)', border: comp.levelIndex === i ? `1.5px solid ${lv.color}` : '1.5px solid transparent', boxShadow: reached ? 'var(--shadow-card)' : 'none', opacity: locked ? 0.7 : 1 }}>
                <span className="material-icons" style={{ fontSize: 20, color: reached ? lv.color : 'var(--fg-3)' }}>{locked ? 'lock' : lv.icon}</span>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: reached ? 'var(--fg-1)' : 'var(--fg-3)', marginTop: 3 }}>{lv.label}</div>
              </div>
            );
          })}
        </div>

        {/* Secciones editables */}
        {comp.sections.map(sec => (
          <div key={sec.id} style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginBottom: 12, overflow: 'hidden' }}>
            <button type="button" onClick={() => onEditSection(sec)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: sec.complete ? 'var(--brand-primary-soft)' : 'var(--surface-2)', color: sec.complete ? 'var(--brand-primary)' : 'var(--fg-3)' }}>
                <span className="material-icons" style={{ fontSize: 19 }}>{sec.icon}</span>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5, color: 'var(--fg-1)' }}>{sec.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: sec.complete ? 'var(--income-fg)' : 'var(--fg-3)' }}>{sec.complete ? 'Completo' : `${sec.done}/${sec.total} · te falta detalle`}</div>
              </div>
              {sec.complete
                ? <span className="material-icons" style={{ fontSize: 20, color: 'var(--income-fg)' }}>check_circle</span>
                : <span className="material-icons" style={{ fontSize: 22, color: 'var(--brand-primary)' }}>add_circle</span>}
            </button>
            {/* Valores resumidos de la sección */}
            <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sec.fields.map(f => {
                const val = f === 'template_slug' ? ((window.JAR_TEMPLATES || []).find(t => t.slug === profile[f]) || {}).name : (f === 'long_term_dream' ? (profile[f] ? '“' + profile[f].slice(0, 24) + (profile[f].length > 24 ? '…' : '') + '”' : null) : labelFor(f));
                if (!val) return null;
                return <span key={f} style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, color: 'var(--fg-2)', background: 'var(--surface-2)', padding: '4px 9px', borderRadius: 999 }}>{val}</span>;
              })}
            </div>
          </div>
        ))}

        {/* Bloque avanzado (Pro) */}
        <div style={{ background: pro ? 'var(--surface-1)' : 'var(--income-soft)', borderRadius: 'var(--radius-lg)', boxShadow: pro ? 'var(--shadow-card)' : 'none', border: pro ? '1px solid var(--border-hairline)' : '1px solid var(--income)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--income-fg)', color: '#fff' }}><span className="material-icons" style={{ fontSize: 18 }}>workspace_premium</span></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14.5, color: 'var(--fg-1)' }}>Nivel Avanzado {!pro && <span style={{ fontSize: 9.5, fontWeight: 800, background: 'var(--income-fg)', color: '#fff', padding: '1px 5px', borderRadius: 4, verticalAlign: 'middle' }}>PRO</span>}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>Detalle de ingresos, riesgo, horizonte y prioridades.</div>
            </div>
          </div>
          {pro
            ? <button type="button" onClick={() => onEditSection({ id: 'advanced', label: 'Avanzado' })} style={{ width: '100%', marginTop: 6, border: 0, background: 'var(--surface-2)', cursor: 'pointer', borderRadius: 'var(--radius-pill)', padding: '11px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13.5, color: 'var(--fg-1)' }}>Completar detalle avanzado</button>
            : <PillButtonMobile variant="proAccent" fullWidth icon="lock_open" size="sm" onPress={onUpgrade}>Desbloquear con Pro</PillButtonMobile>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PanelScreen, ProfileScreen, OnbProgressCard, onbTip });
