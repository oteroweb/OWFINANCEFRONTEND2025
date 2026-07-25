/* ─── Marketing público — Features / Pricing / Matrix (PROMPT_REDISENO_AUTH_PUBLICO.md §2) ─
 * Antes de este archivo, `rediseno/` solo tenía las 4 páginas como HTML
 * estático de referencia (no interactivo, no navegable desde el kit).
 *
 * Decisión tomada (prompt §4 — inconsistencia FeaturesPage↔MatrixPage,
 * ahora resuelta con el detalle técnico real de los prompts de Cántaros/
 * Transacciones, no con las 2 fuentes contradictorias):
 * - "Transferir entre cántaros" NO es una feature real con ese nombre —
 *   el mecanismo real es **Apalancamiento** (mover saldo entre cántaros),
 *   y es 100% exclusivo de Pro, sin versión parcial en Lite (no "parcial
 *   en Lite" como decía FeaturesPage, ni "completo en ambos" como decía
 *   MatrixPage — ninguna de las 2 fuentes tenía razón).
 * - "Carga masiva" está disponible IGUAL en Lite y Pro, sin diferencia
 *   (confirmado en PROMPT_REDISENO_TRANSACCIONES.md §4) — no "simplificada
 *   en Lite" como decía MatrixPage.
 * Este archivo es ahora la única fuente canónica de la comparación
 * Lite/Pro en marketing — FeaturesPage y MatrixPage comparten el mismo
 * array `LITE_PRO_MATRIX` en vez de repetir (y volver a divergir) la
 * tabla en 2 lugares.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useMktState } = React;

/* Disponible / Simplificado / No disponible — misma leyenda en ambas páginas */
const LITE_PRO_MATRIX = [
  { section: 'Cántaros', rows: [
    { feature: 'Reparto % o monto fijo', lite: 'full', pro: 'full' },
    { feature: 'Plantillas (ej. 55/10/10/10/10)', lite: 'full', pro: 'full' },
    { feature: 'Meta de ahorro por cántaro', lite: 'partial', pro: 'full' },
    { feature: 'Ajustes manuales de balance', lite: 'none', pro: 'full' },
    { feature: 'Apalancamiento (mover saldo entre cántaros)', lite: 'none', pro: 'full' },
    { feature: 'Histórico por ciclos', lite: 'none', pro: 'full' },
  ]},
  { section: 'Transacciones', rows: [
    { feature: 'Escribir / Voz / Foto / Auto IA', lite: 'full', pro: 'full' },
    { feature: 'Carga masiva (Excel / texto)', lite: 'full', pro: 'full' },
    { feature: 'Ítems por línea + impuestos (IGTF, etc.)', lite: 'none', pro: 'full' },
    { feature: 'Gasto compartido por categoría', lite: 'none', pro: 'full' },
    { feature: 'Pago múltiple (split entre cuentas)', lite: 'none', pro: 'full' },
    { feature: 'Comisión (Pago Móvil / % / fija)', lite: 'none', pro: 'full' },
  ]},
  { section: 'Cuentas y monedas', rows: [
    { feature: 'Cuenta única ("billetera")', lite: 'full', pro: 'full' },
    { feature: 'Multi-cuenta con carpetas', lite: 'none', pro: 'full' },
    { feature: 'Multimoneda por cuenta', lite: 'none', pro: 'full' },
    { feature: 'Transferencias entre cuentas', lite: 'none', pro: 'full' },
  ]},
  { section: 'Análisis', rows: [
    { feature: 'Distribución por categoría', lite: 'full', pro: 'full' },
    { feature: 'Presupuesto vs. real', lite: 'full', pro: 'full' },
    { feature: 'Navegación por mes/trimestre/año', lite: 'partial', pro: 'full' },
    { feature: 'Top cántaros / asignado vs gastado', lite: 'none', pro: 'full' },
  ]},
];

function MatrixCell({ v }) {
  const map = { full: ['check_circle', 'var(--income-fg)', 'Disponible'], partial: ['remove_circle', 'var(--warning-fg)', 'Simplificado'], none: ['cancel', 'var(--fg-3)', 'No disponible'] };
  const [icon, color, label] = map[v];
  return <span title={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}><span className="material-icons" style={{ fontSize: 17 }}>{icon}</span>{label}</span>;
}

function MarketingNav({ onGo, active }) {
  const tf = (window.t || (s => s));
  const items = [['landing', tf('Inicio')], ['features', tf('Funciones')], ['pricing', tf('Planes')], ['matrix', tf('Comparativa')]];
  return (
    <div style={{ borderBottom: '1px solid var(--border-hairline)', background: 'var(--surface-1)' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', flexWrap: 'wrap', gap: 14 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(150deg, var(--brand-primary), var(--brand-primary-press))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 17, color: '#fff' }}>savings</span></span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>OW Finance</span>
        </span>
        <nav style={{ display: 'flex', gap: 4 }}>
          {items.map(([id, label]) => (
            <button key={id} type="button" onClick={() => onGo(id)} style={{ border: 0, background: active === id ? 'var(--brand-primary-soft)' : 'transparent', color: active === id ? 'var(--brand-primary)' : 'var(--fg-2)', cursor: 'pointer', padding: '8px 14px', borderRadius: 999, fontFamily: 'var(--font-body)', fontWeight: active === id ? 700 : 500, fontSize: 13.5 }}>{label}</button>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 8 }}>
          <PillButton variant="ghost" size="sm" onClick={() => onGo('login')}>{tf('Iniciar sesión')}</PillButton>
          <PillButton variant="primary" size="sm" onClick={() => onGo('register')}>{tf('Crear cuenta')}</PillButton>
        </div>
      </div>
    </div>
  );
}

/* ═══ Features (§2.2) ═══ */
const FEATURE_SECTIONS = [
  { id: 'jars', icon: 'savings', title: 'Cántaros', body: 'Reparte tu ingreso en % o monto fijo, con plantillas listas (ej. 55/10/10/10/10 de Harv Eker), metas de ahorro y transferencias entre cántaros.', pro: 'En Pro: ajustes manuales, apalancamiento entre cántaros e histórico por ciclos.' },
  { id: 'dreams', icon: 'auto_awesome', title: 'Sueños', body: 'Una meta por sueño, progreso combinado de todos tus sueños activos, y prioridades claras de a qué le metes plata primero.' },
  { id: 'tx', icon: 'receipt_long', title: 'Transacciones', body: '5 formas de registrar: escribe, dicta por voz, fotografía el recibo (OCR), deja que la IA lo detecte automático, o carga un Excel completo.', pro: 'En Pro: ítems por línea con impuestos (IGTF 3%), split por cántaro y comisiones.' },
  { id: 'analisis', icon: 'donut_small', title: 'Análisis', body: 'Distribución por cántaro y categoría, presupuesto vs. real con sobre-gastos resaltados, navegación por mes, trimestre o año.' },
  { id: 'accounts', icon: 'account_balance_wallet', title: 'Cuentas y monedas', badge: 'Pro', body: 'Multi-cuenta, multimoneda real, transferencias entre monedas, cuentas compartidas con permisos, impuestos y pago múltiple/split.' },
];

function FeaturesPage({ onGo }) {
  const tf = (window.t || (s => s));
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      <MarketingNav onGo={onGo} active="features" />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 38, color: 'var(--fg-1)', margin: '0 0 12px', textAlign: 'center' }}>{tf('Todo lo que puedes hacer con OW')}</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--fg-2)', textAlign: 'center', margin: '0 0 40px' }}>{tf('Un recorrido completo, función por función.')}</p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
          {FEATURE_SECTIONS.map(s => <a key={s.id} href={'#' + s.id} style={{ textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-2)', padding: '7px 14px', borderRadius: 999, background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)' }}>{tf(s.title)}</a>)}
          <a href="#litepro" style={{ textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--brand-primary)', padding: '7px 14px', borderRadius: 999, background: 'var(--brand-primary-soft)' }}>{tf('Lite vs Pro')}</a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {FEATURE_SECTIONS.map(s => (
            <Card key={s.id} style={{ scrollMarginTop: 90 }}>
              <div id={s.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 24 }}>{s.icon}</span></span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>{tf(s.title)}</span>
                    {s.badge && <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, color: 'var(--info)', background: 'var(--info-soft)', padding: '2px 9px', borderRadius: 999 }}>{s.badge}</span>}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6, margin: '6px 0 0' }}>{tf(s.body)}</p>
                  {s.pro && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--info)', lineHeight: 1.6, margin: '8px 0 0' }}>{tf(s.pro)}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div id="litepro" style={{ marginTop: 56, scrollMarginTop: 90 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--fg-1)', textAlign: 'center', margin: '0 0 24px' }}>{tf('Lite vs Pro')}</h2>
          <LiteProMatrixTable />
        </div>

        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <PillButton variant="primary" icon="arrow_forward" onClick={() => onGo('register')}>{tf('Crear mi cuenta gratis')}</PillButton>
        </div>
      </div>
    </div>
  );
}

/* Tabla compartida — usada por FeaturesPage (ancla "Lite vs Pro") y MatrixPage (contenido principal) */
function LiteProMatrixTable() {
  const tf = (window.t || (s => s));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {LITE_PRO_MATRIX.map(sec => (
        <Card key={sec.section} padding={0}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-hairline)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>{tf(sec.section)}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 13 }}>
            <thead><tr>
              <th style={{ textAlign: 'left', padding: '10px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-3)' }}>{tf('Feature')}</th>
              <th style={{ textAlign: 'left', padding: '10px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-3)' }}>Lite</th>
              <th style={{ textAlign: 'left', padding: '10px 18px', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-3)' }}>Pro</th>
            </tr></thead>
            <tbody>
              {sec.rows.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border-hairline)' }}>
                  <td style={{ padding: '10px 18px', color: 'var(--fg-1)' }}>{tf(r.feature)}</td>
                  <td style={{ padding: '10px 18px' }}><MatrixCell v={r.lite} /></td>
                  <td style={{ padding: '10px 18px' }}><MatrixCell v={r.pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
}

/* ═══ Pricing (§2.3) ═══ */
function PricingPage({ onGo }) {
  const [annual, setAnnual] = useMktState(false);
  const tf = (window.t || (s => s));
  const plans = [
    { id: 'free', name: 'Gratis', price: 0, features: ['Cántaros y sueños', 'Registro texto/voz/foto', 'Análisis básico', '1 moneda'] },
    { id: 'plus', name: 'Plus', price: annual ? 5 : 6, badge: 'Recomendado', features: ['Todo en Gratis', 'Multi-moneda y multi-cuenta', 'Carga masiva', 'Ítems por línea', 'Análisis avanzado', 'Transferencias cross-currency'] },
    { id: 'familiar', name: 'Familiar', price: annual ? 10 : 12, sub: 'Hasta 5 personas', features: ['Todo en Plus', 'Cuentas compartidas', 'Apalancamiento entre cántaros', 'Histórico por ciclos', 'Soporte prioritario'] },
  ];
  const faqs = [
    ['¿Lite y Pro son planes distintos?', 'No — son modos de uso, no planes. Todos los planes incluyen ambos modos; puedes cambiar entre Lite y Pro cuando quieras sin perder datos.'],
    ['¿Puedo cambiar de plan luego?', 'Sí, en cualquier momento desde Configuración.'],
    ['¿Hay descuento anual?', 'Sí, 20% de descuento pagando anual en Plus y Familiar.'],
    ['¿Qué pasa con mis datos si bajo de plan?', 'Se conservan — solo dejan de estar disponibles las features exclusivas del plan superior.'],
    ['¿El plan Familiar comparte cuentas automáticamente?', 'No, cada miembro decide qué comparte y con qué permisos.'],
    ['¿Puedo cancelar cuando quiera?', 'Sí, sin permanencia mínima.'],
  ];
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      <MarketingNav onGo={onGo} active="pricing" />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '56px 32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 38, color: 'var(--fg-1)', margin: '0 0 10px', textAlign: 'center' }}>{tf('Planes simples, sin sorpresas')}</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-2)', textAlign: 'center', margin: '0 0 8px' }}>{tf('Lite y Pro son modos de uso — todos los planes incluyen ambos.')}</p>

        {/* Hallazgo de producto (prompt §3): el paywall descrito acá no está implementado técnicamente hoy — layout_mode es libre, sin chequeo de suscripción. */}
        <div style={{ maxWidth: 640, margin: '18px auto 36px', padding: '10px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-soft)', color: 'var(--warning-fg)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
          ⚠️ {tf('Nota interna (no mostrar en producción): hoy no existe paywall técnico — cualquier usuario puede activar Pro sin pasar por un plan pago. Confirmar con producto antes de lanzar esta página tal cual.')}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', background: 'var(--surface-2)', borderRadius: 999, padding: 4, gap: 4 }}>
            {[['Mensual', false], ['Anual · -20%', true]].map(([label, val]) => (
              <button key={label} type="button" onClick={() => setAnnual(val)} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 999, background: annual === val ? 'var(--surface-1)' : 'transparent', color: annual === val ? 'var(--brand-primary)' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, boxShadow: annual === val ? 'var(--shadow-card)' : 'none' }}>{tf(label)}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {plans.map(p => (
            <Card key={p.id} style={{ position: 'relative', border: p.badge ? '2px solid var(--brand-primary)' : undefined, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {p.badge && <span style={{ position: 'absolute', top: -12, left: 24, background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 999 }}>{tf(p.badge)}</span>}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>{p.name}</div>
                {p.sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{tf(p.sub)}</div>}
              </div>
              <div style={{ fontFamily: 'var(--font-money)', fontWeight: 800, fontSize: 34, color: 'var(--fg-1)' }}>${p.price}<span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--fg-2)' }}>/{tf('mes')}</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {p.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>
                    <span className="material-icons" style={{ fontSize: 16, color: 'var(--income-fg)', flexShrink: 0, marginTop: 1 }}>check</span>{tf(f)}
                  </div>
                ))}
              </div>
              <PillButton variant={p.badge ? 'primary' : 'secondary'} onClick={() => onGo('register')}>{tf(p.id === 'free' ? 'Empezar gratis' : 'Elegir ' + p.name)}</PillButton>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)', textAlign: 'center', margin: '0 0 24px' }}>{tf('Preguntas frecuentes')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 700, margin: '0 auto' }}>
            {faqs.map(([q, a], i) => <FaqItem key={i} q={q} a={a} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useMktState(false);
  const tf = (window.t || (s => s));
  return (
    <Card padding={0} onClick={() => setOpen(o => !o)} style={{ cursor: 'pointer' }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)' }}>{tf(q)}</span>
        <span className="material-icons" style={{ fontSize: 20, color: 'var(--fg-3)' }}>{open ? 'expand_less' : 'expand_more'}</span>
      </div>
      {open && <div style={{ padding: '0 18px 16px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>{tf(a)}</div>}
    </Card>
  );
}

/* ═══ Matrix (§2.4) ═══ */
function MatrixPage({ onGo }) {
  const tf = (window.t || (s => s));
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      <MarketingNav onGo={onGo} active="matrix" />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, color: 'var(--fg-1)', textAlign: 'center', margin: '0 0 10px' }}>{tf('Matriz Lite vs Pro')}</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-2)', textAlign: 'center', margin: '0 0 8px' }}>{tf('Lite y Pro comparten la misma base de datos — cambiar de modo no altera tus datos.')}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '32px 0 40px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><span className="material-icons" style={{ color: 'var(--brand-primary)' }}>speed</span><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>Lite</span></div>
            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.9 }}>
              <li>{tf('Simplicidad y velocidad')}</li><li>{tf('Mobile-first')}</li><li>{tf('"Billetera implícita" — una sola cuenta')}</li>
            </ul>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}><span className="material-icons" style={{ color: 'var(--info)' }}>dashboard_customize</span><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>Pro</span></div>
            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.9 }}>
              <li>{tf('Control total y trazabilidad')}</li><li>{tf('Desktop denso')}</li><li>{tf('Multi-cuenta y multimoneda')}</li>
            </ul>
          </Card>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          {['full', 'partial', 'none'].map(v => <MatrixCell key={v} v={v} />)}
        </div>

        <LiteProMatrixTable />

        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <PillButton variant="primary" icon="arrow_forward" onClick={() => onGo('register')}>{tf('Crear mi cuenta gratis')}</PillButton>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FeaturesPage, PricingPage, MatrixPage, MarketingNav, LiteProMatrixTable, LITE_PRO_MATRIX });
