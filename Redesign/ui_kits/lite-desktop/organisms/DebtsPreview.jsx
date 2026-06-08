/* global React */
/* ─── Debts / Planes de pago ──────────────────────────────────────────
 * DebtTile      — card for a single debt/plan
 * CasheaPlanTile — special card for Cashea BNPL plans
 * DebtsPreview  — home preview (3 tiles + summary)
 * DebtsFullList — full route grid
 * ──────────────────────────────────────────────────────────────────── */

const DEBT_PROVIDER_META = {
  cashea:   { label: 'Cashea',     icon: 'shopping_bag',  accent: '#F97316', tint: 'rgba(249,115,22,0.10)' },
  card:     { label: 'Tarjeta',    icon: 'credit_card',   accent: '#EF4444', tint: 'rgba(239,68,68,0.10)'  },
  loan:     { label: 'Préstamo',   icon: 'account_balance', accent: '#8B5CF6', tint: 'rgba(139,92,246,0.10)' },
  personal: { label: 'Personal',   icon: 'handshake',     accent: '#0EA5E9', tint: 'rgba(14,165,233,0.10)' },
};

const DEBT_STATUS_META = {
  'on-track': { label: 'Al día',       color: 'var(--income)',  soft: 'var(--income-soft)',  fg: 'var(--income-fg)'  },
  'due-soon': { label: 'Próximo',      color: 'var(--warning)', soft: 'var(--warning-soft)', fg: 'var(--warning-fg)' },
  'late':     { label: 'Atrasado',     color: 'var(--expense)', soft: 'var(--expense-soft)', fg: 'var(--expense-fg)' },
  'paid':     { label: 'Pagado',       color: 'var(--income)',  soft: 'var(--income-soft)',  fg: 'var(--income-fg)'  },
};

function DebtTile({ debt, hidden, compact = false }) {
  const provider = DEBT_PROVIDER_META[debt.provider] || DEBT_PROVIDER_META.loan;
  const status   = DEBT_STATUS_META[debt.status]     || DEBT_STATUS_META['on-track'];
  const progress = debt.total ? Math.round((debt.paid / debt.total) * 100) : Math.round(((debt.original - debt.balance) / debt.original) * 100);
  const isCashea = debt.provider === 'cashea';

  return (
    <Card padding={compact ? 18 : 22} style={{ display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      {isCashea && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
          color: '#fff', fontFamily: 'var(--font-body)', fontSize: 9.5, fontWeight: 700,
          padding: '4px 10px', letterSpacing: '0.08em', textTransform: 'uppercase',
          borderBottomLeftRadius: 'var(--radius-md)',
        }}>
          Cashea
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          background: provider.tint, color: provider.accent,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span className="material-icons" style={{ fontSize: 19 }}>{provider.icon}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{debt.name}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t(debt.merchant)} · {debt.rate}</span>
        </div>
      </div>

      {/* Balance */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="t-eyebrow" style={{ marginBottom: 2 }}>{t('Pendiente')}</span>
          <Money value={debt.balance} className="t-amount-lg" hidden={hidden} />
        </div>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
          padding: '3px 9px', borderRadius: 'var(--radius-pill)',
          background: status.soft, color: status.fg,
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          {t(status.label)}
        </span>
      </div>

      {/* Progress (cuotas) */}
      <div style={{ height: 4, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: status.color, borderRadius: 999, transition: 'width var(--dur-slow) var(--ease-out)' }} />
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>
        <span>
          {debt.total
            ? <>{t('Cuota')} <strong style={{ color: 'var(--fg-1)' }}>{debt.paid}/{debt.total}</strong></>
            : <>{progress}% {t('pagado')}</>
          }
        </span>
        <span>
          {t('Próxima:')} <strong style={{ color: 'var(--fg-1)' }} className="tabular">${debt.nextDueAmount.toFixed(2)}</strong> · {debt.nextDueDate}
        </span>
      </div>
    </Card>
  );
}

function DebtsPreview({ debts, hidden, onViewAll }) {
  const isMobile = useViewportMobile();
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const nextDue = debts
    .filter(d => d.status !== 'paid')
    .sort((a, b) => a.nextDueAmount - b.nextDueAmount);
  const upcomingThisMonth = debts.reduce((s, d) => s + (d.nextDueAmount || 0), 0);
  const lateCount = debts.filter(d => d.status === 'late').length;

  return (
    <div>
      <SectionHeader
        title={t('Deudas y planes de pago')}
        action={<PillButton variant="ghost" size="sm" onClick={onViewAll}>{t('Ver todas')}</PillButton>}
      />

      {/* Summary strip */}
      <Card padding={20} style={{ marginBottom: 14, display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="t-eyebrow">{t('Total pendiente')}</span>
          <Money value={totalBalance} className="t-amount-xl" hidden={hidden} color="var(--expense)" />
        </div>
        <div style={{ width: 1, height: 36, background: 'var(--border-hairline)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="t-eyebrow">{t('Próximas cuotas · 30d')}</span>
          <span className="t-amount-lg tabular" style={{ color: 'var(--fg-1)' }}>
            {hidden ? '••••••' : `$ ${upcomingThisMonth.toFixed(2)}`}
          </span>
        </div>
        <div style={{ width: 1, height: 36, background: 'var(--border-hairline)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="t-eyebrow">{t('Estado')}</span>
          <span className="t-body" style={{ color: lateCount > 0 ? 'var(--expense)' : 'var(--income)', fontWeight: 600 }}>
            {lateCount > 0 ? `${lateCount} ${t('atrasada')}${lateCount > 1 ? 's' : ''}` : t('Todo al día')}
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <PillButton variant="secondary" size="sm" icon="payments">{t('Pagar cuota')}</PillButton>
          <PillButton variant="primary" size="sm" icon="add">{t('Nuevo plan')}</PillButton>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
        {nextDue.slice(0, 3).map(d => <DebtTile key={d.id} debt={d} hidden={hidden} />)}
      </div>
    </div>
  );
}

function DebtsFullList({ debts, hidden }) {
  const isMobile = useViewportMobile();
  const cashea = debts.filter(d => d.provider === 'cashea');
  const others = debts.filter(d => d.provider !== 'cashea');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {cashea.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
            }}>
              c
            </div>
            <h3 className="t-h3" style={{ margin: 0 }}>{t('Planes Cashea')}</h3>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: 'rgba(249,115,22,0.10)', color: '#F97316', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {t('0% interés')}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
            {cashea.map(d => <DebtTile key={d.id} debt={d} hidden={hidden} />)}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h3 className="t-h3" style={{ margin: '0 0 12px' }}>{t('Otras deudas')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
            {others.map(d => <DebtTile key={d.id} debt={d} hidden={hidden} />)}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DebtTile, DebtsPreview, DebtsFullList, DEBT_PROVIDER_META, DEBT_STATUS_META });
