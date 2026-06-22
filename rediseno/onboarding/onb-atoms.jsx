/* ─── Onboarding · átomos compartidos ───────────────────────────────────
 * Scaffold de pantalla, barra de progreso por fases, opción grande (chip
 * de onboarding), input, y la heurística de recomendación de plantilla.
 * Reutiliza tokens de colors_and_type.css. Prefijo Onb*.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useOnbState, useEffect: useOnbEffect, useRef: useOnbRef } = React;

if (typeof document !== 'undefined' && !document.getElementById('onb-style')) {
  const s = document.createElement('style');
  s.id = 'onb-style';
  s.textContent =
    /* Entradas SOLO transform: el estado base es visible (opacity:1) pase lo que pase. */
    '@keyframes onbIn{from{transform:translateY(14px)}to{transform:translateY(0)}}' +
    '@keyframes onbInRight{from{transform:translateX(24px)}to{transform:translateX(0)}}' +
    '@keyframes onbPop{0%{transform:scale(.9)}60%{transform:scale(1.04)}100%{transform:scale(1)}}' +
    '@keyframes onbBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}' +
    '@keyframes onbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}' +
    '.onb-stagger>*{animation:onbIn .42s var(--ease-out) both}' +
    '.onb-stagger>*:nth-child(1){animation-delay:.02s}.onb-stagger>*:nth-child(2){animation-delay:.08s}' +
    '.onb-stagger>*:nth-child(3){animation-delay:.14s}.onb-stagger>*:nth-child(4){animation-delay:.20s}' +
    '.onb-stagger>*:nth-child(5){animation-delay:.26s}.onb-stagger>*:nth-child(6){animation-delay:.32s}';
  document.head.appendChild(s);
}

/* ── Scaffold: status bar + header (back/skip) + cuerpo + footer fijo ── */
function OnbStatusBar() {
  return (
    <div style={{ height: 50, flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 26px 5px' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-1)' }}>
        <span className="material-icons" style={{ fontSize: 15 }}>signal_cellular_alt</span>
        <span className="material-icons" style={{ fontSize: 15 }}>wifi</span>
        <span className="material-icons" style={{ fontSize: 17 }}>battery_full</span>
      </div>
    </div>
  );
}

/* ── Barra de progreso segmentada por fases ── */
function OnbProgress({ phases, phaseIndex, withinPhase }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '2px 20px 4px' }}>
      {phases.map((ph, i) => {
        const done = i < phaseIndex;
        const active = i === phaseIndex;
        const fill = done ? 1 : active ? withinPhase : 0;
        return (
          <div key={ph.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: (fill * 100) + '%', borderRadius: 3, background: 'var(--brand-primary)', transition: 'width 360ms var(--ease-out)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9.5, fontWeight: active ? 700 : 600, letterSpacing: '0.02em', color: active || done ? 'var(--brand-primary)' : 'var(--fg-3)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ph.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Opción grande de onboarding (chip con icono + descripción) ── */
function OnbChoice({ label, desc, icon, selected, onClick }) {
  const [hover, setHover] = useOnbState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', width: '100%', textAlign: 'left', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 13, padding: '15px 46px 15px 15px',
        borderRadius: 'var(--radius-lg)',
        border: selected ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)',
        background: selected ? 'var(--brand-primary-soft)' : 'var(--surface-1)',
        boxShadow: selected ? 'none' : hover ? 'var(--shadow-card)' : 'none',
        transform: hover && !selected ? 'translateY(-1px)' : 'none',
        transition: 'all 150ms var(--ease-out)',
      }}>
      {icon && (
        <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: selected ? 'var(--brand-primary)' : 'var(--surface-2)', color: selected ? '#fff' : 'var(--fg-2)', transition: 'all 150ms' }}>
          <span className="material-icons" style={{ fontSize: 21 }}>{icon}</span>
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: selected ? 'var(--brand-primary-fg-soft)' : 'var(--fg-1)' }}>{label}</span>
        {desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.35 }}>{desc}</span>}
      </span>
      <span style={{ position: 'absolute', top: '50%', right: 15, transform: 'translateY(-50%)', width: 22, height: 22, borderRadius: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: selected ? 'var(--brand-primary)' : 'transparent', border: selected ? 'none' : '1.5px solid var(--surface-3)', transition: 'all 150ms' }}>
        {selected && <span className="material-icons" style={{ fontSize: 15, color: '#fff' }}>check</span>}
      </span>
    </button>
  );
}

/* ── Input de texto ── */
function OnbInput({ value, onChange, placeholder, type = 'text', icon, autoFocus, onEnter }) {
  const [focus, setFocus] = useOnbState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '14px 15px', borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-1)', border: focus ? '1.5px solid var(--brand-primary)' : '1.5px solid var(--border-hairline)',
      transition: 'border-color 150ms',
    }}>
      {icon && <span className="material-icons" style={{ fontSize: 20, color: focus ? 'var(--brand-primary)' : 'var(--fg-3)' }}>{icon}</span>}
      <input type={type} value={value} placeholder={placeholder} autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onKeyDown={e => { if (e.key === 'Enter' && onEnter) onEnter(); }}
        style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-1)' }} />
    </div>
  );
}

/* ── Heurística de recomendación de plantilla a partir del perfil ── */
function onbRecommendTemplate(p) {
  const g = p.main_goal, m = p.money_relationship, inc = p.income_range, occ = p.occupation, emo = p.emotional_keyword;
  let slug = 'moderado', why = 'Un equilibrio clásico para empezar con orden sin complicarte.';
  if (m === 'day_to_day' || g === 'survive') {
    slug = 'conservador'; why = 'Priorizamos cubrir lo esencial y construir un colchón antes que nada.';
  } else if (g === 'invest' || inc === '>4000') {
    slug = 'avanzado'; why = 'Tienes margen: más granularidad para optimizar y hacer crecer tu dinero.';
  } else if (occ === 'entrepreneur' && (g === 'saving_goal' || g === 'invest')) {
    slug = 'bases-y-suenos'; why = 'Tu perfil emprendedor encaja con cubrir bases y separar tus sueños concretos.';
  } else if (emo === 'prospero' || g === 'saving_goal') {
    slug = 'arriesgado'; why = 'Más énfasis en experiencias y metas, con un colchón ágil.';
  } else if (g === 'emergency_fund' || g === 'debt_free') {
    slug = 'conservador'; why = 'Vamos seguros: refuerza tu colchón y reduce deudas con un esquema estable.';
  }
  const tpl = (window.JAR_TEMPLATES || []).find(t => t.slug === slug) || (window.JAR_TEMPLATES || [])[2];
  return { slug, why, tpl };
}

Object.assign(window, { OnbStatusBar, OnbProgress, OnbChoice, OnbInput, onbRecommendTemplate });
