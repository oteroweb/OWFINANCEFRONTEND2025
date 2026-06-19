/* global React */

function DreamsRoute({ hidden }) {
  const totalSaved = SAMPLE_DREAMS.reduce((s, d) => s + d.amount, 0);
  const totalGoal  = SAMPLE_DREAMS.reduce((s, d) => s + d.goal,   0);
  const overallProgress = Math.round((totalSaved / totalGoal) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <Eyebrow>{t("Sueños")}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Lo que estás construyendo')}</h1>
      </div>

      <Card hero style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(236,72,153,0.06) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Eyebrow>{t("Total acumulado · USD")}</Eyebrow>
            <Money value={totalSaved} className="t-hero-amount" hidden={hidden} color="#8B5CF6" />
            <div className="t-body-sm">
              {SAMPLE_DREAMS.length} {t("sueños activos · meta combinada")}{' '}
              <strong className="tabular" style={{ color: 'var(--fg-1)' }}>${totalGoal.toLocaleString('en-US')}</strong>
              {' '}· <span style={{ color: '#8B5CF6', fontWeight: 600 }}>{overallProgress}% {t("del camino")}</span>
            </div>
          </div>
          <PillButton variant="primary" icon="add">{t("Nuevo sueño")}</PillButton>
        </div>
      </Card>

      <DreamsFullGrid dreams={SAMPLE_DREAMS} hidden={hidden} />
    </div>
  );
}

Object.assign(window, { DreamsRoute });
