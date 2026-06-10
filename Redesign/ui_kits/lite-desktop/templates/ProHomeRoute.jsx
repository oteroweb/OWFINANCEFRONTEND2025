/* ─── Pro Home Route ─────────────────────────────────────────────────────
 * Denser dashboard for Pro mode: KPI strip + spending breakdown +
 * full jars grid + dense transactions list.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function ProHomeRoute({ hidden, onQuickAdd, onGo, onOpenAI }) {
  const isMobile = useViewportMobile();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Top KPI strip ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 16 }}>
        {[
          { label: window.t('Disponible'), value: 12480.50, icon: 'account_balance', color: 'var(--info)', delta: '+4.2%' },
          { label: window.t('Ingresos · mes'), value: 4820.00, icon: 'arrow_downward', color: 'var(--income)', delta: '+8.1%' },
          { label: window.t('Gastos · mes'), value: -2360.50, icon: 'arrow_outward', color: 'var(--expense)', delta: '-2.3%' },
          { label: window.t('Tasa de ahorro'), value: null, text: '42%', icon: 'trending_up', color: 'var(--income)', delta: window.t('Meta: 40%') },
        ].map((kpi, i) => (
          <div key={i} style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--info-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ fontSize: 18, color: kpi.color }}>{kpi.icon}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: i < 3 ? (kpi.delta.startsWith('+') ? 'var(--income-fg)' : 'var(--expense-fg)') : 'var(--income-fg)', background: i < 3 ? (kpi.delta.startsWith('+') ? 'var(--income-soft)' : 'var(--expense-soft)') : 'var(--income-soft)', padding: '3px 8px', borderRadius: 'var(--radius-pill)' }}>{kpi.delta}</span>
            </div>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 4 }}>{kpi.label}</div>
              {kpi.text
                ? <span style={{ fontFamily: 'var(--font-money)', fontSize: 28, fontWeight: 700, color: 'var(--fg-1)' }}>{hidden ? '••%' : kpi.text}</span>
                : <Money value={kpi.value} className="t-amount-lg" hidden={hidden} color={kpi.value < 0 ? 'var(--expense-fg)' : 'var(--fg-1)'} />
              }
            </div>
          </div>
        ))}
      </div>

      {/* ── Mid row: spending breakdown + jars summary ─────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
        {/* Spending breakdown */}
        <Card>
          <SectionHeader title={t("Gastos por categoría")} action={<PillButton variant="ghost" size="sm">{t("Ver análisis")}</PillButton>} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {[[window.t('Vivienda'), 1450.00, 61], [window.t('Supermercado'), 268.42, 11], [window.t('Transporte'), 32.60, 2], [window.t('Entretenimiento'), 16.99, 1], [window.t('Cántaros'), 200.00, 8]].map(([cat, amt, pct]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)', width: 110, flexShrink: 0 }}>{cat}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct * 1.5}%`, background: 'var(--info)', borderRadius: 3 }} />
                </div>
                <Money value={-amt} className="t-amount-sm" hidden={hidden} color="var(--expense-fg)" />
              </div>
            ))}
          </div>
        </Card>

        {/* Jars summary */}
        <Card>
          <SectionHeader title={t("Cántaros")} action={<PillButton variant="ghost" size="sm" onClick={() => onGo('jars')}>{t("Ver todos")}</PillButton>} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {SAMPLE_JARS.map(j => {
              const bar = j.tone === 'warn' ? 'var(--warning)' : j.tone === 'income' ? 'var(--income)' : 'var(--info)';
              return (
                <div key={j.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(j.name)}</span>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${j.progress}%`, background: bar, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)', width: 26, textAlign: 'right' }}>{j.progress}%</span>
                  <Money value={j.amount} className="t-amount-sm" hidden={hidden} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Transactions dense ──────────────────────────────────── */}
      <div>
        <SectionHeader title={t("Movimientos recientes")} action={<PillButton variant="ghost" size="sm" onClick={() => onGo('transactions')}>{t("Ver todos")}</PillButton>} />
        <Card padding={0}>
          {SAMPLE_TX.slice(0, 6).map((tx, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 14,
              alignItems: 'center', padding: '11px 20px',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: tx.amount > 0 ? 'var(--income-soft)' : 'var(--expense-soft)', color: tx.amount > 0 ? 'var(--income-fg)' : 'var(--expense-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ fontSize: 16 }}>{tx.amount > 0 ? 'arrow_downward' : 'arrow_outward'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(tx.label)}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t(tx.day)}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-2)', color: 'var(--fg-2)' }}>{t(tx.category)}</span>
              <Money value={tx.amount} className="t-amount-sm" sign hidden={hidden} color={tx.amount > 0 ? 'var(--income-fg)' : 'var(--expense-fg)'} />
            </div>
          ))}
        </Card>
      </div>

      {/* ── AI advisor prompt strip ──────────────────────────────── */}
      <button onClick={onOpenAI} style={{
        border: 0, cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 24px', borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(90deg, rgba(124,58,237,0.08) 0%, rgba(14,165,233,0.08) 100%)',
        border: '1px solid rgba(124,58,237,0.15)',
        transition: 'background 160ms',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(124,58,237,0.14) 0%, rgba(14,165,233,0.14) 100%)'}
      onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(124,58,237,0.08) 0%, rgba(14,165,233,0.08) 100%)'}
      >
        <div style={{ width: 44, height: 44, borderRadius: 22, background: 'linear-gradient(135deg,#7C3AED,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-icons" style={{ fontSize: 22, color: '#fff' }}>auto_awesome</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--fg-1)' }}>{t("Asesor Financiero IA")}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{t("Tu tasa de ahorro es 42%. Hay $540 inactivos que podrías mover al jar de emergencia.")}</div>
        </div>
        <span className="material-icons" style={{ fontSize: 20, color: 'var(--fg-3)' }}>chevron_right</span>
      </button>
    </div>
  );
}

Object.assign(window, { ProHomeRoute });
