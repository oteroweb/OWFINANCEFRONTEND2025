/* global React, AN_TOTAL, AN_BUDGET */
/* ─── Lite · Análisis route — "¿En qué se fue?" (enfocado) ──────────────── */

function AnalisisRoute({ hidden }) {
  const ACCENT = 'var(--brand-primary)';
  const card = { background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 22, marginBottom: 18 };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <AnPeriodNav accent={ACCENT} simple={true} />

      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: ACCENT, marginBottom: 10 }}>{t('En qué se fue')}</div>

      {/* Hero hook */}
      <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-float)', padding: 28, marginBottom: 18 }}>
        <div style={{ fontSize: 15, color: 'var(--fg-2)' }}>{t('En')} <b style={{ color: 'var(--fg-1)' }}>junio</b> {t('hiciste')} <b style={{ color: 'var(--fg-1)' }}>29 {t('movimientos')}</b>. {t('Gastaste')}</div>
        <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 60, letterSpacing: '-.02em', lineHeight: 1.05, margin: '8px 0 14px', color: 'var(--expense-fg)' }}>
          <span style={{ color: 'var(--fg-3)', fontSize: 30 }}>$</span>{hidden ? '••••' : '162.26'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: 'var(--income-soft)', color: 'var(--income-fg)' }}><span className="material-icons" style={{ fontSize: 17 }}>trending_down</span>18% {t('menos que mayo')}</span>
          <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>{t('Ingresos del mes')} · <b style={{ color: 'var(--income-fg)', fontFamily: 'var(--font-money)' }}>$17.79M</b></span>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}><AnUnassigned /></div>

      {/* Donut */}
      <div style={card}>
        <div className="t-h3">{t('¿En qué se fue?')}</div>
        <div style={{ color: 'var(--fg-2)', fontSize: 12.5, margin: '3px 0 18px' }}>{t('Tu gasto del mes, por cántaro.')}</div>
        <AnDonutLegend size={200} />
      </div>

      {/* Insight */}
      <div style={{ marginBottom: 18 }}>
        <AnInsight icon="bolt">{t('El')} <b>57%</b> {t('de tu gasto fue en')} <b>Necesidades básicas</b> {t('y')} <b>Ocio / Diversión</b>. {t('Ahí está el foco si quieres mover la aguja.')}</AnInsight>
      </div>

      {/* Budget pulse */}
      <div style={card}>
        <div className="t-h3">{t('Tu presupuesto')}</div>
        <div style={{ color: 'var(--fg-2)', fontSize: 12.5, margin: '3px 0 18px' }}>{t('Cómo vas contra lo que asignaste este mes.')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', flex: '0 0 auto', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 12, color: ACCENT, background: `conic-gradient(${ACCENT} 184deg, var(--surface-3) 0)`, boxShadow: 'inset 0 0 0 4px var(--surface-2)' }}>51%</div>
          <div style={{ fontSize: 13.5 }}>{t('Vas al')} <b>51%</b> {t('de lo asignado')} ($162.26 {t('de')} $267.00). <b style={{ color: 'var(--expense-fg)' }}>Donaciones</b> {t('ya se pasó del límite.')}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AnalisisRoute });
