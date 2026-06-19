/* ─── Debts Screen (Deudas / Planes de pago) ─────────────────────────────
 * Pantalla completa: header + resumen rojo + lista agrupada (Cashea / Otras).
 * Alcanzable desde el preview de Home (ambas Home Lite y Pro) y desde el
 * Quick Action "Pago deuda". Back → Home.
 *
 * RN: Stack.Screen. Lista → SectionList. CTA fija → footer absoluto.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function DebtsScreen({ hidden, onBack }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MobileHeader
        title="Deudas"
        subtitle="Planes de pago"
        onBack={onBack}
        rightActions={[{ icon: 'add', onPress: () => {} }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingBottom: 16 }}>
        {/* Summary */}
        <div style={{ marginBottom: 20 }}>
          <DebtSummaryCard debts={MOBILE_DEBTS} hidden={hidden} />
        </div>

        {/* Grouped list */}
        <DebtsList debts={MOBILE_DEBTS} hidden={hidden} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, padding: '20px 16px 8px' }}>
          <PillButtonMobile variant="secondary" icon="payments" fullWidth onPress={() => {}}>Pagar cuota</PillButtonMobile>
          <PillButtonMobile variant="primary" icon="add" fullWidth onPress={() => {}}>Nuevo plan</PillButtonMobile>
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

Object.assign(window, { DebtsScreen });
