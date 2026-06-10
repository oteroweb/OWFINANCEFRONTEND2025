/* ─── OW Finance Mobile — Debt Components (Deudas / Planes de pago) ──────
 * Espejo móvil de lite-desktop/organisms/DebtsPreview.jsx, adaptado a
 * tarjetas full-width para pantalla angosta.
 *
 * Componentes:
 *   DebtCard         — tarjeta individual de una deuda/plan
 *   DebtSummaryCard  — resumen (total pendiente, próximas cuotas, estado)
 *   DebtsList        — lista agrupada (Cashea / Otras) para la pantalla full
 *
 * RN MAPPING:
 *   DebtCard        → <View> card. DebtsList → SectionList (2 secciones).
 *   Progress bar    → <View> con width animado (Animated/reanimated).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const DEBT_PROVIDER_META = {
  cashea:   { label: 'Cashea',    icon: 'shopping_bag',    accent: '#F97316', tint: 'rgba(249,115,22,0.14)' },
  card:     { label: 'Tarjeta',   icon: 'credit_card',     accent: '#EF4444', tint: 'rgba(239,68,68,0.14)'  },
  loan:     { label: 'Préstamo',  icon: 'account_balance', accent: '#8B5CF6', tint: 'rgba(139,92,246,0.14)' },
  personal: { label: 'Personal',  icon: 'handshake',       accent: '#0EA5E9', tint: 'rgba(14,165,233,0.14)' },
};

const DEBT_STATUS_META = {
  'on-track': { label: 'Al día',    variant: 'income',  color: 'var(--income)'  },
  'due-soon': { label: 'Próximo',   variant: 'warning', color: 'var(--warning)' },
  'late':     { label: 'Atrasado',  variant: 'expense', color: 'var(--expense)' },
  'paid':     { label: 'Pagado',    variant: 'income',  color: 'var(--income)'  },
};

/* ── DebtCard ───────────────────────────────────────────────────────────
 * Tarjeta full-width de una deuda. Props: debt(object) hidden(bool) */
function DebtCard({ debt, hidden = false }) {
  const provider = DEBT_PROVIDER_META[debt.provider] || DEBT_PROVIDER_META.loan;
  const status   = DEBT_STATUS_META[debt.status]     || DEBT_STATUS_META['on-track'];
  const progress = debt.total
    ? Math.round((debt.paid / debt.total) * 100)
    : Math.round(((debt.original - debt.balance) / debt.original) * 100);
  const isCashea = debt.provider === 'cashea';

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)',
      padding: '16px', boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {isCashea && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
          color: '#fff', fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
          padding: '3px 10px', letterSpacing: '0.08em', textTransform: 'uppercase',
          borderBottomLeftRadius: 'var(--radius-md)',
        }}>Cashea</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 'var(--radius-md)',
          background: provider.tint, color: provider.accent, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-icons" style={{ fontSize: 20 }}>{provider.icon}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, paddingRight: isCashea ? 40 : 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{debt.name}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{debt.merchant} · {debt.rate}</span>
        </div>
      </div>

      {/* Balance + estado */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>Pendiente</span>
          <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 24, color: 'var(--fg-1)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {hidden ? '$ ••••' : `$ ${debt.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </span>
        </div>
        <MobileChip variant={status.variant} size="sm">{status.label}</MobileChip>
      </div>

      {/* Progress (cuotas) */}
      <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: status.color, borderRadius: 3, transition: 'width var(--dur-slow) var(--ease-out)' }} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>
        <span>
          {debt.total
            ? <>Cuota <strong style={{ color: 'var(--fg-1)' }}>{debt.paid}/{debt.total}</strong></>
            : <>{progress}% pagado</>}
        </span>
        <span>
          Próxima: <strong style={{ color: 'var(--fg-1)' }} className="tabular">${debt.nextDueAmount.toFixed(2)}</strong> · {debt.nextDueDate}
        </span>
      </div>
    </div>
  );
}

/* ── DebtSummaryCard ────────────────────────────────────────────────────
 * Resumen rojo de deuda. Tappable → navega a la pantalla Deudas.
 * Props: debts(array) hidden(bool) onPress(fn?) compact(bool) */
function DebtSummaryCard({ debts, hidden = false, onPress, compact = false }) {
  const total   = debts.reduce((s, d) => s + d.balance, 0);
  const monthly = debts.reduce((s, d) => s + (d.nextDueAmount || 0), 0);
  const late    = debts.filter(d => d.status === 'late').length;

  return (
    <div onClick={onPress} style={{
      margin: '0 16px', cursor: onPress ? 'pointer' : 'default',
      background: 'linear-gradient(135deg, #B91C1C 0%, #EF4444 100%)',
      borderRadius: 'var(--radius-xl)', padding: '18px 20px',
      boxShadow: '0 8px 24px rgba(239,68,68,0.28)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>Total pendiente · USD</span>
        {onPress && <span className="material-icons" style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)' }}>chevron_right</span>}
      </div>
      <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: compact ? 32 : 38, color: '#fff', lineHeight: 1, letterSpacing: -0.8, fontVariantNumeric: 'tabular-nums' }}>
        {hidden ? '$ ••••••' : `$ ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
      </span>
      <div style={{ display: 'flex', gap: 22, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.18)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Próx. cuotas · 30d</span>
          <span style={{ fontFamily: 'var(--font-money)', fontSize: 16, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{hidden ? '••••' : `$ ${monthly.toFixed(2)}`}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado</span>
          <span style={{ fontFamily: 'var(--font-money)', fontSize: 16, fontWeight: 700, color: late > 0 ? '#FCA5A5' : '#86EFAC' }}>
            {late > 0 ? `${late} atrasada${late > 1 ? 's' : ''}` : 'Todo al día'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── DebtsList ──────────────────────────────────────────────────────────
 * Lista agrupada Cashea / Otras deudas, para la pantalla completa.
 * RN: SectionList con 2 secciones. */
function DebtsList({ debts, hidden = false }) {
  const cashea = debts.filter(d => d.provider === 'cashea');
  const others = debts.filter(d => d.provider !== 'cashea');

  const Group = ({ title, items, badge }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ padding: '0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)' }}>{title}</span>
        {badge && <MobileChip variant="warning" size="sm">{badge}</MobileChip>}
      </div>
      {items.map(d => <DebtCard key={d.id} debt={d} hidden={hidden} />)}
    </div>
  );

  return (
    <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {cashea.length > 0 && <Group title="Planes Cashea" items={cashea} badge="0% interés" />}
      {others.length > 0 && <Group title="Otras deudas" items={others} />}
    </div>
  );
}

Object.assign(window, { DebtCard, DebtSummaryCard, DebtsList, DEBT_PROVIDER_META, DEBT_STATUS_META });
