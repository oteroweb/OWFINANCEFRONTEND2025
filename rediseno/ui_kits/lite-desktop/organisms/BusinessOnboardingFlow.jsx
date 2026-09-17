/* ─── Organism · BusinessOnboardingFlow (Fase 2 · D-011) ──────────────────
 * El wizard de una empresa. NO es el personal con otro título: el personal
 * pregunta por convivencia, fondo de emergencia y una palabra emocional, y
 * nada de eso aplica a un negocio. Las cinco preguntas son las de D-011:
 * rubro, facturación mensual esperada, empleados, estacionalidad y meta del año.
 *
 * Dos cosas que el flujo hace a propósito:
 *   · Nómina se siembra como cántaro y se dice que la gestión de empleados
 *     llega después (Fase 4). Sembrar el cántaro sin decirlo prometería una
 *     función que no está.
 *   · Estacionalidad solo pregunta SI el negocio tiene temporadas. Nombrarlas
 *     y asignarles meses es el editor de temporadas (D-012), y meterlo acá
 *     convertiría un wizard de tres minutos en una carga de datos.
 *
 * Props: open · ctx(object) · onClose · onFinish(profile)
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useBoState } = React;

const BO_SECTORS = [
  { id: 'retail',    label: 'Comercio / tienda',      icon: 'storefront' },
  { id: 'food',      label: 'Comida y bebida',        icon: 'restaurant' },
  { id: 'services',  label: 'Servicios profesionales', icon: 'work' },
  { id: 'trades',    label: 'Oficios y reparaciones',  icon: 'handyman' },
  { id: 'wholesale', label: 'Distribución / mayoreo',  icon: 'local_shipping' },
  { id: 'digital',   label: 'Digital / software',      icon: 'computer' },
  { id: 'health',    label: 'Salud y bienestar',       icon: 'medical_services' },
  { id: 'other',     label: 'Otro',                    icon: 'category' },
];

const BO_REVENUE = [
  { id: 'under5',  label: 'Menos de $5.000' },
  { id: '5to20',   label: '$5.000 – $20.000' },
  { id: '20to50',  label: '$20.000 – $50.000' },
  { id: 'over50',  label: 'Más de $50.000' },
  { id: 'unknown', label: 'Todavía no sé' },
];

const BO_STAFF = [
  { id: 'solo',  label: 'Solo yo' },
  { id: '2to5',  label: '2 a 5' },
  { id: '6to20', label: '6 a 20' },
  { id: 'over20', label: 'Más de 20' },
];

/* El reparto sale del rubro, no de una fórmula genérica: un negocio de comida
 * gasta la mayor parte en insumos y una consultora en su gente. Son puntos de
 * partida editables, no una recomendación cerrada. */
const BO_PLANS = {
  food:      [['Insumos y mercancía', 45], ['Operación y local', 20], ['Nómina', 15], ['Impuestos', 12], ['Reserva', 8]],
  retail:    [['Insumos y mercancía', 45], ['Operación y local', 18], ['Nómina', 15], ['Impuestos', 12], ['Reserva', 10]],
  wholesale: [['Insumos y mercancía', 50], ['Operación y logística', 17], ['Nómina', 13], ['Impuestos', 12], ['Reserva', 8]],
  services:  [['Nómina', 40], ['Operación', 18], ['Impuestos', 15], ['Crecimiento', 12], ['Reserva', 15]],
  trades:    [['Materiales', 35], ['Herramientas y transporte', 18], ['Nómina', 20], ['Impuestos', 12], ['Reserva', 15]],
  digital:   [['Nómina', 45], ['Herramientas y servicios', 15], ['Impuestos', 15], ['Crecimiento', 13], ['Reserva', 12]],
  health:    [['Insumos', 28], ['Nómina', 27], ['Operación y local', 18], ['Impuestos', 14], ['Reserva', 13]],
  other:     [['Operación', 35], ['Nómina', 25], ['Impuestos', 15], ['Crecimiento', 10], ['Reserva', 15]],
};

function BoCard({ children, style = {} }) {
  return <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: 20, ...style }}>{children}</div>;
}

function BoOptions({ options, value, onChange, tint, columns = 2, multi = false }) {
  const picked = (id) => (multi ? (value || []).includes(id) : value === id);
  const toggle = (id) => {
    if (!multi) return onChange(id);
    const cur = value || [];
    onChange(cur.includes(id) ? cur.filter(x => x !== id) : cur.concat([id]));
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 9 }}>
      {options.map(o => {
        const on = picked(o.id);
        return (
          <button key={o.id} type="button" onClick={() => toggle(o.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', cursor: 'pointer', padding: '13px 14px', minHeight: 48, borderRadius: 'var(--radius-md)', border: `1px solid ${on ? tint : 'var(--border-hairline)'}`, background: on ? 'var(--surface-2)' : 'transparent' }}>
            {o.icon && <span className="material-icons" style={{ fontSize: 19, color: on ? tint : 'var(--fg-2)', flexShrink: 0 }}>{o.icon}</span>}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: on ? 600 : 500, color: 'var(--fg-1)', textWrap: 'pretty' }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function BusinessOnboardingFlow({ open, ctx = {}, onClose, onFinish }) {
  const [step, setStep] = useBoState(0);
  const [f, setF] = useBoState({ sector: null, revenue: null, staff: null, seasonal: null, goal: '' });
  const set = (patch) => setF(s => ({ ...s, ...patch }));

  if (!open) return null;
  const tint = ctx.color || 'var(--brand-primary)';
  const name = ctx.name || 'tu empresa';

  const plan = BO_PLANS[f.sector] || BO_PLANS.other;
  const hasStaff = f.staff && f.staff !== 'solo';

  const steps = [
    {
      title: `¿A qué se dedica ${name}?`,
      hint: 'Con esto armamos un reparto de cántaros que se parezca a tu negocio.',
      body: <BoOptions options={BO_SECTORS} value={f.sector} onChange={v => set({ sector: v })} tint={tint} />,
      ready: !!f.sector,
    },
    {
      title: '¿Cuánto esperás facturar por mes?',
      hint: 'Una estimación alcanza. Sirve para dimensionar los cántaros, no para controlarte.',
      body: <BoOptions options={BO_REVENUE} value={f.revenue} onChange={v => set({ revenue: v })} tint={tint} columns={1} />,
      ready: !!f.revenue,
    },
    {
      title: '¿Cuánta gente trabaja en la empresa?',
      hint: null,
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <BoOptions options={BO_STAFF} value={f.staff} onChange={v => set({ staff: v })} tint={tint} />
          {/* Se dice acá, no cuando el usuario lo descubra vacío (D-011). */}
          {hasStaff && (
            <div style={{ display: 'flex', gap: 10, padding: '13px 15px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)', flexShrink: 0 }}>schedule</span>
              <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.55, color: 'var(--fg-2)', textWrap: 'pretty' }}>
                Te dejamos un cántaro de Nómina para apartar la plata de los sueldos. La gestión de empleados y pagos llega más adelante.
              </p>
            </div>
          )}
        </div>
      ),
      ready: !!f.staff,
    },
    {
      title: '¿El negocio tiene temporadas?',
      hint: 'Meses claramente más flojos o más fuertes que el resto.',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <BoOptions tint={tint} value={f.seasonal} onChange={v => set({ seasonal: v })} columns={1}
            options={[
              { id: 'yes', label: 'Sí, cambia bastante según el mes' },
              { id: 'no', label: 'No, se mantiene parejo todo el año' },
              { id: 'unsure', label: 'No estoy seguro todavía' },
            ]} />
          {f.seasonal === 'yes' && (
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.55, color: 'var(--fg-2)', textWrap: 'pretty' }}>
              Después vas a poder crear tus temporadas con nombre y darle a cada una su propio reparto. Acá no te lo pedimos: son varias decisiones y no hacen falta para arrancar.
            </p>
          )}
        </div>
      ),
      ready: !!f.seasonal,
    },
    {
      title: '¿Qué querés lograr este año?',
      hint: 'En tus palabras. Lo usa el asesor para entender qué es una buena noticia y qué no.',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <textarea value={f.goal} onChange={e => set({ goal: e.target.value.slice(0, 500) })} rows={4}
            placeholder="Ej: dejar de mezclar la plata del negocio con la mía y poder pagarme un sueldo fijo"
            onFocus={window.fcFocus} onBlur={window.fcBlur}
            style={{ ...window.FC_INPUT_STYLE, padding: '12px 13px', resize: 'vertical', lineHeight: 1.55 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>Se puede saltar y escribirlo después.</span>
            {f.goal.length > 450 && <span style={{ fontFamily: 'var(--font-money)', fontSize: 11.5, color: 'var(--warning-fg)' }}>{f.goal.length}/500</span>}
          </div>
        </div>
      ),
      ready: true,
    },
    {
      title: 'Este es el reparto que te propongo',
      hint: 'Son un punto de partida: los porcentajes se ajustan cuando quieras.',
      body: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', background: 'var(--surface-2)' }}>
            {plan.map(([n, p], i) => <span key={n} style={{ width: `${p}%`, background: tint, opacity: 1 - i * 0.15 }} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.map(([n, p], i) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 11, height: 11, borderRadius: 4, flexShrink: 0, background: tint, opacity: 1 - i * 0.15 }} />
                <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)' }}>{n}</span>
                <span style={{ fontFamily: 'var(--font-money)', fontSize: 13.5, fontWeight: 700, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{p}%</span>
              </div>
            ))}
          </div>
        </div>
      ),
      ready: true,
      last: true,
    },
  ];

  const s = steps[step];
  const finish = () => {
    onFinish && onFinish({ ...f, sectorLabel: (BO_SECTORS.find(o => o.id === f.sector) || {}).label, jars: plan });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal, 100)', background: 'rgba(15,23,42,.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 'min(560px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', overflow: 'hidden' }}>

        <div style={{ background: tint, padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: 'rgba(255,255,255,.22)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{name.charAt(0).toUpperCase()}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'rgba(255,255,255,.8)' }}>Paso {step + 1} de {steps.length}</div>
          </div>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,.85)', display: 'flex' }}>
            <span className="material-icons" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <div style={{ height: 3, background: 'var(--surface-2)', flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${((step + 1) / steps.length) * 100}%`, background: tint, transition: 'width 220ms' }} />
        </div>

        <div style={{ padding: '22px 20px', overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--fg-1)', letterSpacing: '-.2px', textWrap: 'pretty' }}>{s.title}</h3>
            {s.hint && <p style={{ margin: '5px 0 0', fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty' }}>{s.hint}</p>}
          </div>
          {s.body}
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {step > 0 && (
            <button type="button" onClick={() => setStep(n => n - 1)}
              style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '11px 14px', borderRadius: 'var(--radius-pill)', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5 }}>Atrás</button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={s.last ? finish : () => setStep(n => n + 1)} disabled={!s.ready}
            style={{ border: 0, cursor: s.ready ? 'pointer' : 'default', opacity: s.ready ? 1 : .5, padding: '12px 24px', borderRadius: 'var(--radius-pill)', background: tint, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}>
            {s.last ? 'Usar este reparto' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BusinessOnboardingFlow, BO_SECTORS, BO_PLANS });
