/* ─── BulkImportPanel — carga masiva con dry-run ────────────────────────
 * PRO only. Paste CSV-like rows → preview (dry-run) con tipo detectado,
 * cuenta, monto, cántaro y estado por fila antes de aplicar.
 * Endpoint real: POST /api/v1/transactions/bulk (dry_run=true).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useBulkState } = React;

const BULK_SAMPLE = `2026-05-26, Whole Foods, -84.12, BofA Corriente, Supermercado
2026-05-26, Sueldo ACME, 3200.00, BofA Ahorros, Ingresos
2026-05-25, Cashea cuota 3/6, -148.50, Mercantil, Deuda
2026-05-24, Uber aeropuerto, -32.60, BofA Corriente, Transporte
2026-05-24, Netflix, -16.99, Visa Crédito, Entretenimiento`;

function bulkParse(text) {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => {
    const [date, name, amountRaw, account, category] = line.split(',').map(s => (s || '').trim());
    const amount = parseFloat(amountRaw);
    const valid = name && !isNaN(amount) && account;
    return {
      i, date: date || '—', name: name || '(sin concepto)',
      amount: isNaN(amount) ? 0 : amount,
      type: isNaN(amount) ? 'expense' : amount >= 0 ? 'income' : 'expense',
      account: account || '—', category: category || '—',
      status: !valid ? 'error' : Math.abs(amount) > 1000 ? 'warn' : 'ok',
    };
  });
}

function BulkImportPanel({ onClose }) {
  const [text, setText] = useBulkState(BULK_SAMPLE);
  const [rows, setRows] = useBulkState(null);

  const run = () => setRows(bulkParse(text));
  const okCount = rows ? rows.filter(r => r.status !== 'error').length : 0;
  const errCount = rows ? rows.filter(r => r.status === 'error').length : 0;
  const total = rows ? rows.reduce((s, r) => s + (r.status !== 'error' ? r.amount : 0), 0) : 0;

  const STATUS = {
    ok:    { bg: 'var(--income-soft)',  fg: 'var(--income-fg)',  icon: 'check_circle', label: window.t('OK') },
    warn:  { bg: 'var(--warning-soft)', fg: 'var(--warning-fg)', icon: 'warning',      label: window.t('Revisar') },
    error: { bg: 'var(--expense-soft)', fg: 'var(--expense-fg)', icon: 'error',        label: window.t('Error') },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--info-soft)' }}>
        <span className="material-icons" style={{ fontSize: 20, color: 'var(--info-fg)' }}>upload_file</span>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{t("Carga masiva (dry-run)")}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', marginTop: 2 }}>{t("Pega filas:")} <code style={{ fontSize: 11 }}>{t("fecha, concepto, monto, cuenta, categoría")}</code>{t(". Verás una vista previa antes de aplicar.")}</div>
        </div>
      </div>

      <textarea value={text} onChange={e => { setText(e.target.value); setRows(null); }} rows={6}
        style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5, lineHeight: 1.6, color: 'var(--fg-1)', background: 'var(--surface-2)', resize: 'vertical', outline: 'none' }}
        onFocus={window.fcFocus} onBlur={window.fcBlur} />

      {!rows && (
        <button type="button" onClick={run} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', padding: '11px 20px', borderRadius: 'var(--radius-pill)', background: 'var(--info)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}>
          <span className="material-icons" style={{ fontSize: 18 }}>play_arrow</span>{t("Procesar (vista previa)")}
        </button>
      )}

      {rows && (
        <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <BulkStat label={t("Filas válidas")} value={okCount} tone="income" />
            <BulkStat label={t("Con error")} value={errCount} tone="expense" />
            <BulkStat label={t("Neto")} value={tfMoney(total)} tone="brand" />
          </div>
          <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-hairline)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr 96px 110px 92px', gap: 0, padding: '9px 12px', background: 'var(--surface-2)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
              <span>{t("Fecha")}</span><span>{t("Concepto")}</span><span style={{ textAlign: 'right' }}>{t("Monto")}</span><span>{t("Cuenta")}</span><span style={{ textAlign: 'center' }}>{t("Estado")}</span>
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {rows.map(r => {
                const st = STATUS[r.status];
                return (
                  <div key={r.i} style={{ display: 'grid', gridTemplateColumns: '88px 1fr 96px 110px 92px', gap: 0, padding: '10px 12px', borderTop: '1px solid var(--border-hairline)', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>{r.date.slice(5)}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{r.name}</span>
                    <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 600, textAlign: 'right', color: r.amount >= 0 ? 'var(--income-fg)' : 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{r.amount >= 0 ? '+' : '−'}{tfMoney(r.amount)}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 8 }}>{r.account}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, justifySelf: 'center', padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: st.bg, color: st.fg, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600 }}>
                      <span className="material-icons" style={{ fontSize: 13 }}>{st.icon}</span>{st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <PillButton variant="ghost" onClick={() => setRows(null)}>{t("← Editar filas")}</PillButton>
            <button type="button" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', padding: '12px 24px', borderRadius: 'var(--radius-pill)', background: 'var(--info)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5 }}>
              <span className="material-icons" style={{ fontSize: 19 }}>library_add_check</span>{t("Aplicar")} {okCount} {t("transacciones")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BulkStat({ label, value, tone }) {
  const c = tone === 'income' ? 'var(--income-fg)' : tone === 'expense' ? 'var(--expense-fg)' : 'var(--brand-primary)';
  return (
    <div style={{ flex: 1, minWidth: 110, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-money)', fontSize: 22, fontWeight: 700, color: c, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

Object.assign(window, { BulkImportPanel });
