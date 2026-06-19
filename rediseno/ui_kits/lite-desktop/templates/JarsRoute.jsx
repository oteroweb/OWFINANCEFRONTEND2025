/* global React */

function JarsRoute({ hidden }) {
  const total = SAMPLE_JARS.reduce((s, j) => s + j.amount, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <Eyebrow>{t("Cántaros")}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Tu dinero, repartido')}</h1>
      </div>

      <Card hero>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Eyebrow>{t("Total en cántaros · USD")}</Eyebrow>
            <Money value={total} className="t-hero-amount" hidden={hidden} />
            <div className="t-body-sm">{SAMPLE_JARS.length} {t("cántaros activos · 1 requiere atención")}</div>
          </div>
          <PillButton variant="primary" icon="add">{t("Nuevo cántaro")}</PillButton>
        </div>
      </Card>

      <JarsFullGrid jars={SAMPLE_JARS} hidden={hidden} />
    </div>
  );
}

Object.assign(window, { JarsRoute });
