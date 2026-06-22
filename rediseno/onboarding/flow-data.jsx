/* ─── Onboarding · Datos del flujo (compartidos mobile + desktop) ───────
 * Única fuente de verdad para fases, pasos avanzados, iconos y estado base.
 * Cargar ANTES de flow.jsx / flow-desktop.jsx.
 * ──────────────────────────────────────────────────────────────────────── */
/* global window */

/* Tono mentor: pregunta directa + el porqué. */
const ONB_PHASES = [
  { id: 'you', label: 'Quién eres', icon: 'person',
    steps: [
      { kind: 'chip', field: 'occupation',       q: '¿A qué te dedicas?',              sub: 'Define cómo entra tu dinero — y por eso, cómo conviene repartirlo.' },
      { kind: 'chip', field: 'income_range',      q: '¿Cuánto ingresas al mes?',        sub: 'Es la base de todo el cálculo. Aproximado basta; nadie más lo ve.', optional: true },
      { kind: 'chip', field: 'living_situation',  q: '¿Con quién vives?',               sub: 'Cambia cómo se reparten los gastos fijos del hogar.', optional: true },
    ] },
  { id: 'situation', label: 'Tu situación', icon: 'account_balance',
    steps: [
      { kind: 'chip', field: 'debt_situation',     q: '¿Tienes deudas hoy?',            sub: 'Sin juicios. Saberlo me deja priorizar bien tu plan.' },
      { kind: 'chip', field: 'emergency_fund',     q: '¿Cuánto colchón tienes?',        sub: 'Tu fondo de emergencia decide cuánto arriesgar en el resto.', optional: true },
      { kind: 'chip', field: 'money_relationship', q: '¿Cómo te llevas con el dinero?', sub: 'Ajusto el nivel de automatización y los recordatorios a tu estilo.' },
    ] },
  { id: 'goals', label: 'Tus metas', icon: 'flag',
    steps: [
      { kind: 'chip',  field: 'main_goal',         q: '¿Qué quieres lograr ahora?',     sub: 'Tu meta nº1 manda: hacia ahí inclino la distribución.' },
      { kind: 'dream', field: 'long_term_dream',   q: '¿Cuál es tu sueño grande?',      sub: 'Lo uso para recordarte tu norte cuando dudes. Puedes dictarlo.', optional: true },
      { kind: 'chip',  field: 'emotional_keyword', q: '¿Cómo quieres sentirte?',        sub: 'El objetivo final no es el dinero, es cómo te hace sentir.', optional: true },
    ] },
];

/* Pasos avanzados (solo Pro) — opciones propias, no vienen de PROFILE_FIELDS */
const ONB_ADV_STEPS = [
  { kind: 'chip', field: 'income_detail', icon: 'sync_alt', q: '¿Tu ingreso es estable o variable?', sub: 'Define si conviene un colchón de regularización mes a mes.',
    options: [{ value: 'estable', label: 'Estable', desc: 'Mismo monto cada periodo' }, { value: 'variable', label: 'Variable', desc: 'Cambia según el mes o proyecto' }, { value: 'mixto', label: 'Mixto', desc: 'Una base fija + ingresos variables' }] },
  { kind: 'chip', field: 'risk_tolerance', icon: 'speed', q: 'Ante invertir, ¿qué prefieres?', sub: 'Calibra cuánto destino a crecer vs. proteger.',
    options: [{ value: 'conservador', label: 'Proteger', desc: 'Prioridad: no perder' }, { value: 'equilibrado', label: 'Equilibrar', desc: 'Riesgo medido' }, { value: 'agresivo', label: 'Crecer', desc: 'Acepto volatilidad por más retorno' }] },
  { kind: 'chip', field: 'time_horizon', icon: 'schedule', q: '¿En qué plazo piensas tus metas?', sub: 'El horizonte cambia la estrategia por completo.',
    options: [{ value: 'corto', label: 'Corto', desc: 'Menos de 1 año' }, { value: 'medio', label: 'Medio', desc: '1 a 5 años' }, { value: 'largo', label: 'Largo', desc: 'Más de 5 años' }] },
  { kind: 'chip', field: 'goal_priority', icon: 'balance', q: '¿Qué pesa más hoy?', sub: 'Resuelve los empates cuando el dinero no alcanza para todo.',
    options: [{ value: 'seguridad', label: 'Seguridad', desc: 'Dormir tranquilo' }, { value: 'crecimiento', label: 'Crecimiento', desc: 'Construir patrimonio' }, { value: 'experiencias', label: 'Experiencias', desc: 'Vivir el presente' }] },
];

const ONB_FLAT = ONB_PHASES.flatMap((ph, pi) => ph.steps.map((st, si) => ({ ...st, phaseIndex: pi, stepInPhase: si, phaseSteps: ph.steps.length })));

const ONB_STEP_ICONS = { occupation: 'work', income_range: 'payments', living_situation: 'home', debt_situation: 'credit_card', emergency_fund: 'shield', money_relationship: 'favorite', main_goal: 'flag', emotional_keyword: 'spa' };

const ONB_BLANK = { occupation: null, income_range: null, living_situation: null, debt_situation: null, emergency_fund: null, money_relationship: null, main_goal: null, long_term_dream: '', emotional_keyword: null, template_slug: null, plan: 'lite', income_detail: null, risk_tolerance: null, time_horizon: null, goal_priority: null };

Object.assign(window, { ONB_PHASES, ONB_ADV_STEPS, ONB_FLAT, ONB_STEP_ICONS, ONB_BLANK });
