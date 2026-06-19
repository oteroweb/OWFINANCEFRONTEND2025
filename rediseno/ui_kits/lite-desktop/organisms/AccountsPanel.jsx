/* ─── Accounts Panel — Pro Desktop Right Column ──────────────────────────
 * Shows multi-currency accounts + debts + Cashea.
 * Renders as a fixed right column inside ProShell (280px wide).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useAPState } = React;

/* Accounts aligned with data/finance-data.jsx (SAMPLE_ACCOUNTS) */
const ACCOUNTS_DATA = [
  { id: 1, name: 'BofA · Corriente', short: 'BofA', sub: 'Cuenta corriente', currency: 'USD', balance: 3420.50,  color: '#1E3A8A', flag: '🇺🇸' },
  { id: 2, name: 'BofA · Ahorros',   short: 'BofA', sub: 'Cuenta ahorros',   currency: 'USD', balance: 12480.00, color: '#2D4DA6', flag: '🇺🇸' },
  { id: 3, name: 'Efectivo USD',     short: 'EFE',  sub: 'Caja',             currency: 'USD', balance: 340.00,   color: '#10B981', flag: '🇺🇸' },
  { id: 4, name: 'Mercantil',        short: 'MER',  sub: 'Cuenta corriente', currency: 'VES', balance: 48500.00, color: '#F59E0B', flag: '🇻🇪' },
];

const DEBTS_DATA = [
  { id: 1, name: 'Visa · Crédito', type: 'credit',  icon: 'credit_card',  balance: 1240.20, currency: 'USD', apr: 17.9, next: 120.00, dueDate: '5 Jun',  status: 'due_soon' },
  { id: 2, name: 'Cashea · iPhone',type: 'bnpl',    icon: 'shopping_bag', balance: 445.50,  currency: 'USD', cuota: '3/6', next: 148.50, dueDate: '8 Jun', status: 'pending' },
  { id: 3, name: 'Cashea · TV',    type: 'bnpl',    icon: 'shopping_bag', balance: 320.00,  currency: 'USD', cuota: '2/6', next: 80.00,  dueDate: '12 Jun', status: 'pending' },
  { id: 4, name: 'Préstamo personal', type: 'loan', icon: 'account_balance', balance: 6400.00, currency: 'USD', apr: 12.5, next: 320.00, dueDate: '15 Jun', status: 'active' },
];

/* Local fallback rates (flat). Real rates come from finance-data DEFAULT_RATES
 * (nested: { USD: { current, official } }) via the `rates` prop — toUSD handles both. */
const AP_RATES = { USD: 1, EUR: 0.92, VES: 40.50, COP: 4100 };

function AccountsPanel({ hidden = false, rates = AP_RATES, mobile = false }) {
  const [section, setSection] = useAPState('accounts'); // 'accounts' | 'debts'

  // Robust to flat ({VES: 40.5}) or nested ({VES: {current: 40.5}}) rate maps
  const rateOf = (currency) => {
    const r = rates[currency];
    const f = (r && typeof r === 'object') ? r.current : r;
    return f || AP_RATES[currency] || 1;
  };
  const toUSD = (amount, currency) => amount / rateOf(currency);
  const totalUSD = ACCOUNTS_DATA.reduce((s, a) => s + toUSD(a.balance, a.currency), 0);
  const totalDebt = DEBTS_DATA.reduce((s, d) => s + d.balance, 0);

  return (
    <aside style={mobile ? {
      width: '100%', background: 'transparent',
      display: 'flex', flexDirection: 'column',
    } : {
      width: 280, flexShrink: 0,
      background: 'var(--surface-1)',
      borderLeft: '1px solid var(--border-hairline)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header + toggle */}
      <div style={{ padding: mobile ? '0 0 12px' : '18px 18px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 3, gap: 2 }}>
          {[['accounts', t('Cuentas')], ['debts', t('Deudas')]].map(([s, label]) => (
            <button key={s} onClick={() => setSection(s)} style={{ flex: 1, border: 0, cursor: 'pointer', padding: '7px', borderRadius: 'var(--radius-pill)', background: section === s ? 'var(--surface-1)' : 'transparent', color: section === s ? (s === 'debts' ? 'var(--expense-fg)' : 'var(--fg-1)') : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: section === s ? 700 : 500, boxShadow: section === s ? 'var(--shadow-card)' : 'none', transition: 'all 150ms' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Accounts section ───────────────────────────────────── */}
      {section === 'accounts' && (
        <div style={mobile ? {} : { flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {/* Net total */}
          <div style={{ padding: mobile ? '0 2px 14px' : '0 18px 14px' }}>
            <div className="t-eyebrow" style={{ marginBottom: 4 }}>{t('Patrimonio neto · USD')}</div>
            <div className="t-amount-lg">{hidden ? '$ ••••••' : `$ ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
          </div>
          <div style={{ height: 1, background: 'var(--border-hairline)', margin: mobile ? '0 2px 12px' : '0 18px 12px' }} />

          {/* Account list */}
          {ACCOUNTS_DATA.map(acc => (
            <AccountRow key={acc.id} account={acc} hidden={hidden} usdValue={toUSD(acc.balance, acc.currency)} mobile={mobile} />
          ))}

          {/* Add account */}
          <button style={{ width: '100%', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: mobile ? '12px 2px' : '12px 18px', background: 'transparent', color: 'var(--info)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>add_circle_outline</span>
            {t('Agregar cuenta')}
          </button>
        </div>
      )}

      {/* ── Debts section ──────────────────────────────────────── */}
      {section === 'debts' && (
        <div style={mobile ? {} : { flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {/* Total debt */}
          <div style={{ padding: mobile ? '0 2px 14px' : '0 18px 14px' }}>
            <div className="t-eyebrow" style={{ marginBottom: 4 }}>{t('Total adeudado · USD')}</div>
            <div className="t-amount-lg" style={{ color: 'var(--expense-fg)' }}>{hidden ? '$ ••••••' : `$ ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}</div>
          </div>
          <div style={{ height: 1, background: 'var(--border-hairline)', margin: mobile ? '0 2px 12px' : '0 18px 12px' }} />

          {/* Debt list */}
          {DEBTS_DATA.map(d => <DebtRow key={d.id} debt={d} hidden={hidden} mobile={mobile} />)}

          {/* Add debt */}
          <button style={{ width: '100%', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: mobile ? '12px 2px' : '12px 18px', background: 'transparent', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>add_circle_outline</span>
            {t('Registrar deuda')}
          </button>
        </div>
      )}
    </aside>
  );
}

function AccountRow({ account: a, hidden, usdValue, mobile = false }) {
  const fmt = (n, cur) => {
    if (cur === 'VES' || cur === 'COP') return `${cur} ${(n / 1000).toFixed(0)}k`;
    return `${cur} ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: mobile ? '11px 2px' : '11px 18px', cursor: 'pointer', transition: 'background 150ms' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', flexShrink: 0 }}>{a.short.slice(0,3)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t(a.sub)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : fmt(a.balance, a.currency)}</div>
        {a.currency !== 'USD' && <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-3)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '' : `≈ $ ${usdValue.toFixed(2)}`}</div>}
      </div>
    </div>
  );
}

function DebtRow({ debt: d, hidden, mobile = false }) {
  const statusColor = { pending: 'var(--fg-2)', due_soon: 'var(--warning-fg)', overdue: 'var(--expense-fg)', active: 'var(--fg-2)' }[d.status];
  const statusBg    = { pending: 'var(--surface-2)', due_soon: 'var(--warning-soft)', overdue: 'var(--expense-soft)', active: 'var(--surface-2)' }[d.status];
  const statusLabel = { pending: t('Pendiente'), due_soon: t('Vence pronto'), overdue: t('Vencido'), active: t('Activo') }[d.status];

  return (
    <div style={{ padding: mobile ? '12px 2px' : '12px 18px', cursor: 'pointer', transition: 'background 150ms' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--expense-soft)', color: 'var(--expense-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-icons" style={{ fontSize: 16 }}>{d.icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{d.name}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t('Vence:')} {d.dueDate}{d.apr ? ` · ${d.apr}% APR` : ''}{d.cuota ? ` · ${t('cuota')} ${d.cuota}` : ''}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-money)', fontSize: 14, fontWeight: 700, color: 'var(--expense-fg)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : `$ ${d.balance.toFixed(2)}`}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: statusBg, color: statusColor }}>{statusLabel}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{t('Próx. pago:')} <strong style={{ color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••' : `$ ${d.next.toFixed(2)}`}</strong></span>
      </div>
    </div>
  );
}

Object.assign(window, { AccountsPanel, ACCOUNTS_DATA, DEBTS_DATA });
