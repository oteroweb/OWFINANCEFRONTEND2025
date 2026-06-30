/* global React */

function DebtsRoute({ hidden }) {
  const total = SAMPLE_DEBTS.reduce((s, d) => s + d.balance, 0);
  const monthly = SAMPLE_DEBTS.reduce((s, d) => s + (d.nextDueAmount || 0), 0);
  const lateCount = SAMPLE_DEBTS.filter(d => d.status === 'late').length;
  const casheaCount = SAMPLE_DEBTS.filter(d => d.provider === 'cashea').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <Eyebrow>{t("Deudas y planes de pago")}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Mantén el control de lo que debes')}</h1>
      </div>

      <Card hero>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Eyebrow>{t("Total pendiente · USD")}</Eyebrow>
            <Money value={total} className="t-hero-amount" hidden={hidden} color="var(--expense)" />
            <div className="t-body-sm">
              {SAMPLE_DEBTS.length} {t("planes activos ·")} {casheaCount} {t("en Cashea ·")}
              {lateCount > 0
                ? <span style={{ color: 'var(--expense)', fontWeight: 600 }}> {lateCount} {t("atrasada")}{lateCount > 1 ? 's' : ''}</span>
                : <span style={{ color: 'var(--income)', fontWeight: 600 }}> {t("todo al día")}</span>
              }
            </div>
            <div className="t-body-sm" style={{ marginTop: 4 }}>
              {t("Próximas cuotas (30 días):")} <strong className="tabular" style={{ color: 'var(--fg-1)' }}>${monthly.toFixed(2)}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <PillButton variant="secondary" icon="payments">{t("Pagar cuota")}</PillButton>
            <PillButton variant="primary" icon="add">{t("Nuevo plan")}</PillButton>
          </div>
        </div>
      </Card>

      <DebtsFullList debts={SAMPLE_DEBTS} hidden={hidden} />
    </div>
  );
}

Object.assign(window, { DebtsRoute });
