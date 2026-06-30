/* ─── Onboarding · Gamificación (niveles, completitud, anillo, voz IA) ───
 * Modelo de completitud del perfil por NIVELES:
 *   Básico    → esenciales (occupation, income_range, main_goal, cántaros)
 *   Completo  → todos los campos estándar
 *   Avanzado  → + campos de detalle (solo Pro)
 * Cada nivel desbloquea mejor asesoría IA. Insignias por sección.
 * Botón de voz-a-texto con IA (simulado) para campos de texto.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useGamState, useEffect: useGamEffect, useRef: useGamRef } = React;

/* Pesos de los 10 campos estándar (suman 100). Esenciales = 50. */
const ONB_WEIGHTS = {
  occupation: 12.5, income_range: 12.5, main_goal: 12.5, template_slug: 12.5,   // esenciales → 50
  debt_situation: 10, emergency_fund: 9, money_relationship: 9, living_situation: 9, long_term_dream: 9, emotional_keyword: 4, // → 50
};
const ONB_ESSENTIALS = ['occupation', 'income_range', 'main_goal', 'template_slug'];
const ONB_STANDARD = Object.keys(ONB_WEIGHTS);

/* Campos avanzados (Pro) — desbloquean nivel Avanzado */
const ONB_ADVANCED_FIELDS = ['income_detail', 'risk_tolerance', 'time_horizon', 'goal_priority'];

const ONB_LEVELS = [
  { id: 'basico',   label: 'Básico',   color: 'var(--info)',          icon: 'eco',
    advisor: 'El asesor te da consejos generales para empezar con orden.' },
  { id: 'completo', label: 'Completo', color: 'var(--brand-primary)',  icon: 'verified',
    advisor: 'Consejos personalizados según tu situación real y tus metas.' },
  { id: 'avanzado', label: 'Avanzado', color: 'var(--income-fg)',      icon: 'workspace_premium', pro: true,
    advisor: 'Estrategia a tu medida: proyecciones, prioridades y simulaciones.' },
];

const ONB_SECTIONS = [
  { id: 'you',       label: 'Quién eres',   icon: 'person',          fields: ['occupation', 'income_range', 'living_situation'] },
  { id: 'situation', label: 'Tu situación', icon: 'account_balance', fields: ['debt_situation', 'emergency_fund', 'money_relationship'] },
  { id: 'goals',     label: 'Tus metas',    icon: 'flag',            fields: ['main_goal', 'long_term_dream', 'emotional_keyword'] },
  { id: 'jars',      label: 'Tus cántaros', icon: 'savings',         fields: ['template_slug'] },
];

const onbFilled = (v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);

/* Cálculo central de completitud */
function onbCompleteness(profile, opts = {}) {
  const pro = !!opts.pro;
  let pct = 0;
  ONB_STANDARD.forEach(f => { if (onbFilled(profile[f])) pct += ONB_WEIGHTS[f]; });
  pct = Math.round(pct);

  const essentialsDone = ONB_ESSENTIALS.every(f => onbFilled(profile[f]));
  const standardDone = ONB_STANDARD.every(f => onbFilled(profile[f]));
  const advDone = pro && ONB_ADVANCED_FIELDS.every(f => onbFilled(profile[f]));

  let levelId = 'basico';
  if (standardDone && advDone) levelId = 'avanzado';
  else if (standardDone) levelId = 'completo';
  else levelId = 'basico';

  const levelIndex = ONB_LEVELS.findIndex(l => l.id === levelId);
  const level = ONB_LEVELS[levelIndex];
  const nextLevel = ONB_LEVELS[levelIndex + 1] || null;

  // Campos que faltan hacia el siguiente hito
  let missing = [];
  if (!standardDone) missing = ONB_STANDARD.filter(f => !onbFilled(profile[f]));
  else if (pro && !advDone) missing = ONB_ADVANCED_FIELDS.filter(f => !onbFilled(profile[f]));

  // Estado por sección (insignias)
  const sections = ONB_SECTIONS.map(s => {
    const done = s.fields.filter(f => onbFilled(profile[f])).length;
    return { ...s, done, total: s.fields.length, complete: done === s.fields.length };
  });

  return { pct, level, levelId, levelIndex, nextLevel, missing, sections, essentialsDone, standardDone, advDone };
}

/* ── Anillo de completitud (SVG) ── */
function OnbRing({ pct, size = 88, stroke = 8, color = 'var(--brand-primary)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 700ms var(--ease-out), stroke 300ms' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children || <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: size * 0.26, color: 'var(--fg-1)' }}>{pct}%</span>}
      </div>
    </div>
  );
}

/* ── Badge de nivel ── */
function OnbLevelBadge({ level, size = 'md' }) {
  const sm = size === 'sm';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: sm ? 4 : 6, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: sm ? 11 : 12.5, padding: sm ? '3px 9px' : '5px 11px', borderRadius: 999, background: level.id === 'avanzado' ? 'var(--income-soft)' : level.id === 'completo' ? 'var(--brand-primary-soft)' : 'var(--info-soft)', color: level.color }}>
      <span className="material-icons" style={{ fontSize: sm ? 13 : 15 }}>{level.icon}</span>{level.label}{level.pro && <span style={{ fontSize: sm ? 8.5 : 9.5, fontWeight: 800, letterSpacing: '0.04em', background: level.color, color: '#fff', padding: '1px 4px', borderRadius: 4 }}>PRO</span>}
    </span>
  );
}

/* ── Insignias por sección ── */
function OnbSectionBadges({ sections, onTap }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {sections.map(s => (
        <button key={s.id} type="button" onClick={() => onTap && onTap(s)} style={{ flex: 1, border: 0, cursor: onTap ? 'pointer' : 'default', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: 0 }}>
          <span style={{ position: 'relative', width: 42, height: 42, borderRadius: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: s.complete ? 'var(--brand-primary)' : 'var(--surface-2)', color: s.complete ? '#fff' : 'var(--fg-3)', transition: 'all 250ms' }}>
            <span className="material-icons" style={{ fontSize: 21 }}>{s.icon}</span>
            {s.complete && <span style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: 8, background: 'var(--income-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-canvas)' }}><span className="material-icons" style={{ fontSize: 9, color: '#fff' }}>check</span></span>}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 9.5, fontWeight: 600, color: s.complete ? 'var(--fg-1)' : 'var(--fg-3)', textAlign: 'center', lineHeight: 1.1 }}>{s.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Botón de voz-a-texto con IA (simulado para prototipo) ── */
function OnbVoiceButton({ onResult, samples, compact = false }) {
  const [state, setState] = useGamState('idle'); // idle | listening | thinking
  const timer = useGamRef(null);
  useGamEffect(() => () => timer.current && clearTimeout(timer.current), []);
  const start = () => {
    if (state !== 'idle') { setState('idle'); timer.current && clearTimeout(timer.current); return; }
    setState('listening');
    timer.current = setTimeout(() => {
      setState('thinking');
      timer.current = setTimeout(() => {
        const s = samples[Math.floor(Math.random() * samples.length)];
        onResult(s); setState('idle');
      }, 700);
    }, 1700);
  };
  const listening = state === 'listening';
  const thinking = state === 'thinking';
  return (
    <button type="button" onClick={start} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: 0,
      borderRadius: 'var(--radius-pill)', padding: compact ? '8px 13px' : '10px 15px',
      fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
      background: listening ? 'var(--expense-soft)' : 'rgba(139,92,246,0.13)',
      color: listening ? 'var(--expense-fg)' : '#8B5CF6',
      transition: 'background 180ms, color 180ms',
    }}>
      {listening ? (
        <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
          {[0, 1, 2, 3].map(i => <span key={i} style={{ width: 3, borderRadius: 2, background: 'var(--expense-fg)', height: 16, animation: `onbWave 0.7s ease-in-out ${i * 0.12}s infinite` }} />)}
        </span>
      ) : (
        <span className="material-icons" style={{ fontSize: 17 }}>{thinking ? 'auto_awesome' : 'mic'}</span>
      )}
      {listening ? 'Escuchando…' : thinking ? 'Procesando…' : (compact ? 'Dictar' : 'Dictar con IA')}
    </button>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('onb-gam-style')) {
  const s = document.createElement('style');
  s.id = 'onb-gam-style';
  s.textContent = '@keyframes onbWave{0%,100%{height:5px}50%{height:16px}}';
  document.head.appendChild(s);
}

Object.assign(window, {
  ONB_WEIGHTS, ONB_ESSENTIALS, ONB_STANDARD, ONB_ADVANCED_FIELDS, ONB_LEVELS, ONB_SECTIONS,
  onbCompleteness, onbFilled, OnbRing, OnbLevelBadge, OnbSectionBadges, OnbVoiceButton,
});
