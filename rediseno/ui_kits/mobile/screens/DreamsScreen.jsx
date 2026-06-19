/* ─── Dreams Screen (Sueños) ─────────────────────────────────────────────
 * Pantalla completa: header + resumen violeta + lista de sueños.
 * Alcanzable desde el preview de Home (ambas Home Lite y Pro) y desde el
 * Quick Action "Aporte sueño". Back → Home.
 *
 * RN: Stack.Screen. Lista → FlatList. CTA fija → footer absoluto.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function DreamsScreen({ hidden, onBack }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <MobileHeader
        title="Sueños"
        subtitle="Lo que estás construyendo"
        onBack={onBack}
        rightActions={[{ icon: 'add', onPress: () => {} }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingBottom: 16 }}>
        {/* Summary */}
        <div style={{ marginBottom: 20 }}>
          <DreamSummaryCard dreams={MOBILE_DREAMS} hidden={hidden} />
        </div>

        {/* List */}
        <DreamsList dreams={MOBILE_DREAMS} hidden={hidden} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, padding: '20px 16px 8px' }}>
          <PillButtonMobile variant="secondary" icon="favorite" fullWidth onPress={() => {}}>Aportar</PillButtonMobile>
          <PillButtonMobile variant="primary" icon="add" fullWidth onPress={() => {}}>Nuevo sueño</PillButtonMobile>
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

Object.assign(window, { DreamsScreen });
