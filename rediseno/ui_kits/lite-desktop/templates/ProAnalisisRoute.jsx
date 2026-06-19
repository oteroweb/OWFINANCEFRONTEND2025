/* global React, AN_TOTAL */
/* ─── Pro · Análisis route — "Navegador financiero" (dirección Mezcla) ──── */

function ProAnalisisRoute({ hidden }) {
  const isMobile = useViewportMobile();
  const ACCENT = 'var(--info)';

  const card = { background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 22 };
  const head = (title, hint) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
      <div className="t-h3" style={{ flex: 1, minWidth: 0 }}>{t(title)}</div>
      {hint && <span style={{ color: 'var(--fg-2)', fontSize: 12.5, flexShrink: 0, whiteSpace: 'nowrap', paddingTop: 3 }}>{t(hint)}</span>}
    </div>
  );
  const desc = txt => <div style={{ color: 'var(--fg-2)', fontSize: 12.5, margin: '2px 0 16px' }}>{t(txt)}</div>;

  const field = (label, value, icon = 'expand_more') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-2)' }}>{t(label)}</label>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', fontSize: 13, color: 'var(--fg-1)', cursor: 'pointer' }}>
        {t(value)}<span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>{icon}</span>
      </div>
    </div>
  );

  return (
    <div>
      <AnPeriodNav accent={ACCENT} />
      <AnJarStrip />

      <div style={{ padding: '4px 0 18px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: ACCENT }}>{t('Analítica de gastos')}</div>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Navegador financiero')}</h1>
      </div>

      <div style={{ marginBottom: 18 }}><AnUnassigned /></div>

      {/* Narrative */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 14, color: 'var(--fg-2)', marginBottom: 4 }}>{t('En')} <b style={{ color: 'var(--fg-1)' }}>junio 2026</b> {t('registraste')} <b style={{ color: 'var(--fg-1)' }}>29 {t('movimientos')}</b>. {t('Gastaste')}</div>
          <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 44, letterSpacing: '-.02em' }}><span style={{ color: 'var(--fg-3)', fontSize: 22 }}>$</span>162.26</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'var(--income-soft)', color: 'var(--income-fg)' }}><span className="material-icons" style={{ fontSize: 17 }}>trending_down</span>18% {t('menos que mayo')}</span>
          <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{t('Ingresos del periodo')} · <b style={{ color: 'var(--income-fg)', fontFamily: 'var(--font-money)' }}>$17.79M</b></span>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}><AnKpis /></div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Rail */}
        {!isMobile && (
          <aside style={{ position: 'sticky', top: 0 }}>
            <div style={{ ...card, padding: 18 }}>
              <div className="t-h3" style={{ marginBottom: 2 }}>{t('Vista')}</div>
              {desc('Agrupa y filtra como prefieras.')}
              {field('Agrupación principal', 'Cántaro › Categoría › Transacción')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', fontSize: 13, color: 'var(--fg-3)', cursor: 'pointer' }}>{t('Buscar concepto, categoría o cuenta')}<span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>search</span></div>
              </div>
              {field('Filtrar por cántaro', 'Todos')}
              {field('Filtrar por categoría', 'Todas')}
              {field('Filtrar por cuenta', 'Todas')}
              {field('Filtrar por tipo', 'Todos')}
              <div style={{ height: 1, background: 'var(--border-hairline)', margin: '14px 0' }} />
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--fg-2)', padding: 0 }}><span className="material-icons" style={{ color: ACCENT, fontSize: 18 }}>filter_alt_off</span>{t('Limpiar filtros')}</button>
            </div>
          </aside>
        )}

        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>{head('Distribución por cántaro', 'Gastos · Junio 2026')}{desc('Pasa por la leyenda para enfocar un cántaro.')}<AnDonutLegend /></div>
          <div style={card}>{head('Top cántaros', 'Toca para ver movimientos')}<div style={{ marginTop: 8 }}><AnTopList /></div></div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>{head('Asignado vs gastado')}{desc('Lo planificado contra lo consumido.')}<AnBudget /></div>
          <AnInsight icon="warning"><b>Donaciones</b> {t('superó su presupuesto')}: $26.17 / $20.00 (131%).</AnInsight>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={card}>{head('Detalle agrupado', 'Moneda base: USD')}{desc('Haz click en cualquier transacción para abrir la edición completa.')}<AnDetalle /></div>
      </div>
    </div>
  );
}

Object.assign(window, { ProAnalisisRoute });
