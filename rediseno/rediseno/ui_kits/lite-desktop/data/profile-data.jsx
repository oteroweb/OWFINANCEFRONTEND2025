/* ─── Perfil financiero IA + plantillas de cántaros ─────────────────────
 * Fuente: docs/00-sistema/DESIGN_PROMPT_ONBOARDING.md
 * El asesor IA usa estos campos (chips) para personalizar consejos.
 * Cada chip = { value, label, desc }. Single-select por campo.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const PROFILE_FIELDS = {
  occupation: {
    field: 'occupation', label: 'Ocupación',
    options: [
      { value: 'employee',     label: 'Empleado / asalariado',      desc: 'Ingreso mensual fijo o quincenal' },
      { value: 'freelancer',   label: 'Freelancer',                 desc: 'Proyectos independientes, ingreso variable' },
      { value: 'entrepreneur', label: 'Emprendedor',                desc: 'Negocio propio, ingresos mixtos' },
      { value: 'student',      label: 'Estudiante',                 desc: 'Aprendiendo, ingresos limitados o nulos' },
      { value: 'retired',      label: 'Jubilado / pensionado',      desc: 'Ingreso fijo de pensión' },
      { value: 'other',        label: 'Otra situación',             desc: 'Situación no listada arriba' },
    ],
  },
  income_range: {
    field: 'income_range', label: 'Rango de ingreso',
    options: [
      { value: '<500',      label: 'Menos de $500',   desc: 'Presupuesto ajustado, cada centavo cuenta' },
      { value: '500-1500',  label: '$500 – $1,500',   desc: 'Ingreso moderado, margen de maniobra' },
      { value: '1500-4000', label: '$1,500 – $4,000', desc: 'Ingreso cómodo, capacidad de ahorro real' },
      { value: '>4000',     label: 'Más de $4,000',   desc: 'Ingreso alto, optimización es la prioridad' },
    ],
  },
  living_situation: {
    field: 'living_situation', label: 'Convivencia',
    options: [
      { value: 'solo',      label: 'Vivo solo',        desc: 'Todas las decisiones son mías' },
      { value: 'pareja',    label: 'En pareja',        desc: 'Finanzas compartidas o coordinadas' },
      { value: 'familia',   label: 'Con mi familia',   desc: 'Gastos del hogar divididos' },
      { value: 'roommates', label: 'Con roommates',    desc: 'Renta compartida, vida independiente' },
    ],
  },
  debt_situation: {
    field: 'debt_situation', label: 'Deudas',
    options: [
      { value: 'none',          label: 'Sin deudas',                   desc: 'Libre de compromisos financieros' },
      { value: 'credit_card',   label: 'Tarjeta de crédito',           desc: 'Pago mínimo o saldo acumulado' },
      { value: 'personal_loan', label: 'Préstamo personal',            desc: 'Cuota mensual fija' },
      { value: 'mortgage',      label: 'Hipoteca',                     desc: 'La inversión más importante' },
      { value: 'multiple',      label: 'Varias deudas',                desc: 'Tarjeta + préstamo + otros' },
    ],
  },
  emergency_fund: {
    field: 'emergency_fund', label: 'Fondo de emergencia',
    options: [
      { value: 'none', label: 'No tengo aún',        desc: 'El primer objetivo a construir' },
      { value: '<3m',  label: 'Menos de 3 meses',    desc: 'Colchón inicial, sigo construyendo' },
      { value: '3-6m', label: '3 a 6 meses',         desc: 'Zona de seguridad estándar' },
      { value: '>6m',  label: 'Más de 6 meses',      desc: 'Totalmente protegido' },
    ],
  },
  money_relationship: {
    field: 'money_relationship', label: 'Relación con el dinero',
    options: [
      { value: 'want_improve', label: 'Quiero mejorar mis hábitos', desc: 'Sé que puedo hacerlo mejor' },
      { value: 'organized',    label: 'Soy bastante ordenado',      desc: 'Tengo control, quiero optimizar' },
      { value: 'hard_to_save', label: 'Me cuesta ahorrar',          desc: 'El dinero se va sin darme cuenta' },
      { value: 'day_to_day',   label: 'Vivo al día',                desc: 'Cubrir el mes es el reto' },
    ],
  },
  main_goal: {
    field: 'main_goal', label: 'Meta principal ahora',
    options: [
      { value: 'debt_free',      label: 'Salir de deudas',            desc: 'Liquidar lo que debo y respirar' },
      { value: 'emergency_fund', label: 'Crear fondo de emergencia',  desc: '3-6 meses de gastos guardados' },
      { value: 'saving_goal',    label: 'Ahorrar para algo concreto', desc: 'Viaje, carro, casa, negocio' },
      { value: 'invest',         label: 'Empezar a invertir',         desc: 'Hacer que el dinero trabaje' },
      { value: 'survive',        label: 'Llegar a fin de mes',        desc: 'Cubrir lo básico, sin agobios' },
    ],
  },
  emotional_keyword: {
    field: 'emotional_keyword', label: 'Palabra emocional',
    options: [
      { value: 'tranquilo', label: 'Tranquilo', desc: 'Sin angustia financiera' },
      { value: 'libre',     label: 'Libre',     desc: 'Sin ataduras de deudas ni dependencias' },
      { value: 'seguro',    label: 'Seguro',    desc: 'Con red de seguridad real' },
      { value: 'control',   label: 'En control',desc: 'Sabiendo qué entra y qué sale' },
      { value: 'prospero',  label: 'Próspero',  desc: 'Creciendo, no solo sobreviviendo' },
    ],
  },
};

/* Placeholders rotativos para el sueño a largo plazo (input libre) */
const DREAM_PLACEHOLDERS = [
  'Tener mi propio negocio que funcione solo…',
  'Comprar mi apartamento y no pagar renta…',
  'Retirarme a los 50 con ingresos pasivos…',
  'Viajar 2 meses al año sin preocuparme por el dinero…',
  'Dar a mis hijos una educación sin límites…',
];

/* Plantillas de cántaros — GET /api/v1/jar-templates
 * segments: mini-barra proporcional (suman 100). count = nº cántaros. */
const JAR_TEMPLATES = [
  {
    slug: 'bases-y-suenos', name: 'Bases + Sueños', count: 11, featured: true,
    forWho: 'Emprendedor con proyectos activos y metas de vida concretas',
    segments: [
      { name: 'Necesidades', percent: 12, color: '#1E3A8A' }, { name: 'Ahorro', percent: 31, color: '#10B981' },
      { name: 'Sueño · Casa', percent: 8, color: '#8B5CF6' }, { name: 'Sueño · Viaje', percent: 8, color: '#EC4899' },
      { name: 'Sueño · Negocio', percent: 8, color: '#F97316' }, { name: 'Educación', percent: 7, color: '#0EA5E9' },
      { name: 'Diversión', percent: 7, color: '#F59E0B' }, { name: 'Salud', percent: 6, color: '#14B8A6' },
      { name: 'Reservas', percent: 5, color: '#6366F1' }, { name: 'Dar', percent: 4, color: '#A855F7' }, { name: 'Inversión', percent: 4, color: '#059669' },
    ],
  },
  {
    slug: 'conservador', name: 'Conservador', count: 6,
    forWho: 'Perfil de estabilidad, prioriza seguridad sobre experiencias',
    segments: [
      { name: 'Necesidades', percent: 60, color: '#1E3A8A' }, { name: 'Ahorro', percent: 15, color: '#10B981' },
      { name: 'Educación', percent: 10, color: '#0EA5E9' }, { name: 'Reservas', percent: 8, color: '#8B5CF6' },
      { name: 'Diversión', percent: 5, color: '#F59E0B' }, { name: 'Dar', percent: 2, color: '#A855F7' },
    ],
  },
  {
    slug: 'moderado', name: 'Moderado', count: 6, recommended: true,
    forWho: 'Equilibrio clásico (base T. Harv Eker adaptado)',
    segments: [
      { name: 'Necesidades', percent: 55, color: '#1E3A8A' }, { name: 'Ahorro', percent: 10, color: '#10B981' },
      { name: 'Diversión', percent: 10, color: '#F59E0B' }, { name: 'Educación', percent: 10, color: '#0EA5E9' },
      { name: 'Reservas', percent: 10, color: '#8B5CF6' }, { name: 'Dar', percent: 5, color: '#A855F7' },
    ],
  },
  {
    slug: 'avanzado', name: 'Avanzado', count: 8,
    forWho: 'Ingresos mayores que quiere granularidad',
    segments: [
      { name: 'Vivienda', percent: 20, color: '#1E3A8A' }, { name: 'Comida', percent: 15, color: '#2D4DA6' },
      { name: 'Servicios', percent: 8, color: '#3B82F6' }, { name: 'Transporte', percent: 7, color: '#0EA5E9' },
      { name: 'Ahorro', percent: 15, color: '#10B981' }, { name: 'Inversión', percent: 12, color: '#059669' },
      { name: 'Educación', percent: 8, color: '#14B8A6' }, { name: 'Diversión', percent: 15, color: '#F59E0B' },
    ],
  },
  {
    slug: 'arriesgado', name: 'Arriesgado', count: 6,
    forWho: 'Más énfasis en experiencias y metas, menor colchón',
    segments: [
      { name: 'Necesidades', percent: 40, color: '#1E3A8A' }, { name: 'Diversión', percent: 20, color: '#F59E0B' },
      { name: 'Inversión', percent: 15, color: '#059669' }, { name: 'Ahorro', percent: 10, color: '#10B981' },
      { name: 'Sueños', percent: 10, color: '#8B5CF6' }, { name: 'Educación', percent: 5, color: '#0EA5E9' },
    ],
  },
];

/* Perfil IA por defecto (usuario José) + cántaros con propósito */
const AI_PROFILE = {
  occupation: 'entrepreneur', income_range: '1500-4000', living_situation: 'pareja',
  debt_situation: 'credit_card', emergency_fund: '<3m', money_relationship: 'organized',
  main_goal: 'saving_goal', emotional_keyword: 'libre',
  long_term_dream: 'Tener un negocio que funcione solo y comprar casa propia en Caracas.',
  template_slug: 'moderado', onboarding_profile_completed: false, updated_days_ago: 3,
};

/* Cántaros del usuario con propósito (description) — para JarsTable */
const USER_JARS = [
  { id: 'j1', name: 'Necesidades básicas', percent: 55, color: '#1E3A8A', description: 'Alquiler, comida, servicios y transporte del día a día.' },
  { id: 'j2', name: 'Diversión',           percent: 10, color: '#F59E0B', description: 'Salidas, streaming y caprichos sin culpa.' },
  { id: 'j3', name: 'Ahorro',              percent: 10, color: '#10B981', description: 'Colchón que no se toca salvo emergencia real.' },
  { id: 'j4', name: 'Educación',           percent: 10, color: '#0EA5E9', description: 'Cursos y libros para crecer profesionalmente.' },
  { id: 'j5', name: 'Reservas',            percent: 10, color: '#8B5CF6', description: '' },
  { id: 'j6', name: 'Dar',                 percent: 5,  color: '#A855F7', description: 'Regalos y aportes a quien lo necesita.' },
];

Object.assign(window, { PROFILE_FIELDS, DREAM_PLACEHOLDERS, JAR_TEMPLATES, AI_PROFILE, USER_JARS });
