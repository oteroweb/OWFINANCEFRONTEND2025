/* global React */
/* DebtsRoute — implementa PROMPT_REDISENO_DEUDAS_SUENOS_PERFIL.md §1 completo.
 * Antes solo tenía hero + grid de solo-lectura (DebtsFullList), sin ninguna
 * acción real. Agregado acá: detalle (Pagar cuota/Editar/Eliminar), edición/
 * alta con los campos reales del formulario Vue, pago de cuota, confirmación
 * de borrado y estado vacío. Misma pantalla para Pro y Lite — no hay
 * diferenciación en el Vue real (ver prompt §6), así que tampoco acá. */
const { useState: useDbState } = React;

const DEBT_TYPE_OPTS = [
  ['loan', t('Préstamo')], ['card', t('Tarjeta de crédito')],
  ['cashea', t('Cashea')], ['personal', t('Deuda personal')],
];
const DEBT_STATUS_OPTS = [
  ['on-track', t('Al día')], ['due-soon', t('Próximo vencimiento')],
  ['late', t('Atrasado')], ['paid', t('Pagado')],
];

function DbModal({ title, onClose, children, width = 400 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 15000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: `min(${width}px,100%)`, maxHeight: '86vh', overflowY: 'auto', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{title}</div>
          <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 20 }}>close</span></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DbField({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

/* ── Detalle: hero + Pagar cuota + footer Eliminar/Cerrar/Editar ── */
function DebtDetail({ debt, onClose, onEdit, onDelete, onPay }) {
  const provider = DEBT_PROVIDER_META[debt.provider] || DEBT_PROVIDER_META.loan;
  const status = DEBT_STATUS_META[debt.status] || DEBT_STATUS_META['on-track'];
  return (
    <DbModal title={t('Detalle de la deuda')} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '4px 0 6px' }}>
        <span style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: provider.tint, color: provider.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-icons" style={{ fontSize: 24 }}>{provider.icon}</span>
        </span>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{debt.name}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t(debt.merchant)} · {debt.rate}</div>
        <Money value={debt.balance} className="t-hero-amount" style={{ fontSize: 26 }} color="var(--expense)" />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: status.soft, color: status.fg, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t(status.label)}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-2)', marginBottom: 4 }}>{t('Cuota')}</div>
          <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>{debt.total ? `${debt.paid}/${debt.total}` : '—'}</div>
        </div>
        <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-2)', marginBottom: 4 }}>{t('Próxima cuota')}</div>
          <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>${debt.nextDueAmount.toFixed(2)} · {debt.nextDueDate}</div>
        </div>
      </div>
      <button type="button" onClick={onPay} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 0, cursor: 'pointer', padding: '10px 14px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12.5 }}>
        <span className="material-icons" style={{ fontSize: 16 }}>payments</span>{t('Pagar cuota')}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6, borderTop: '1px solid var(--border-hairline)' }}>
        <button type="button" onClick={onDelete} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>{t('Eliminar')}</button>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cerrar')}</button>
        <button type="button" onClick={onEdit} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Editar')}</button>
      </div>
    </DbModal>
  );
}

/* ── Formulario alta/edición (§1.5 del prompt) ── */
function DebtForm({ debt, onClose, onSave }) {
  const isEdit = !!debt;
  const [f, setF] = useDbState(() => debt ? { ...debt } : {
    name: '', provider: 'loan', merchant: '', original: '', balance: '',
    total: '', paid: '0', nextDueDate: '', nextDueAmount: '', rate: '', status: 'on-track', notes: '',
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.name.trim() && Number(f.original) >= 0;
  const submit = () => {
    if (!valid) return;
    onSave({
      ...f,
      id: debt ? debt.id : 'd-' + Date.now(),
      original: Number(f.original) || 0,
      balance: f.balance === '' ? Number(f.original) || 0 : Number(f.balance),
      total: f.total === '' ? null : Number(f.total),
      paid: Number(f.paid) || 0,
      nextDueAmount: Number(f.nextDueAmount) || 0,
    });
  };
  return (
    <DbModal title={isEdit ? t('Editar deuda') : t('Nuevo plan')} onClose={onClose} width={460}>
      <DbField label={t('Nombre del plan') + ' *'}>
        <input value={f.name} onChange={e => set('name', e.target.value)} placeholder={t('Ej: iPhone 15 · Cashea')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
      </DbField>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <DbField label={t('Tipo / proveedor')}>
            <select value={f.provider} onChange={e => set('provider', e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }}>
              {DEBT_TYPE_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </DbField>
        </div>
        <div style={{ flex: 1 }}>
          <DbField label={t('Comercio / entidad')}>
            <input value={f.merchant} onChange={e => set('merchant', e.target.value)} placeholder={t('Opcional')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} />
          </DbField>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <DbField label={t('Monto original') + ' *'}>
            <input type="number" min="0" value={f.original} onChange={e => set('original', e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
          </DbField>
        </div>
        <div style={{ flex: 1 }}>
          <DbField label={t('Saldo pendiente')}>
            <input type="number" min="0" value={f.balance} onChange={e => set('balance', e.target.value)} placeholder={t('= monto original si vacío')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
          </DbField>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <DbField label={t('Total de cuotas')}>
            <input type="number" min="0" value={f.total ?? ''} onChange={e => set('total', e.target.value)} placeholder={t('Opcional')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
          </DbField>
        </div>
        <div style={{ flex: 1 }}>
          <DbField label={t('Cuotas pagadas')}>
            <input type="number" min="0" value={f.paid} onChange={e => set('paid', e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
          </DbField>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <DbField label={t('Próxima cuota $')}>
            <input type="number" min="0" value={f.nextDueAmount} onChange={e => set('nextDueAmount', e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
          </DbField>
        </div>
        <div style={{ flex: 1 }}>
          <DbField label={t('Fecha')}>
            <input value={f.nextDueDate} onChange={e => set('nextDueDate', e.target.value)} placeholder={t('Ej: 28 Mar')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} />
          </DbField>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <DbField label={t('Tasa / interés')}>
            <input value={f.rate} onChange={e => set('rate', e.target.value)} placeholder={t('Ej: TEA 28% / 0% interés')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }} />
          </DbField>
        </div>
        <div style={{ flex: 1 }}>
          <DbField label={t('Estado')}>
            <select value={f.status} onChange={e => set('status', e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px' }}>
              {DEBT_STATUS_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </DbField>
        </div>
      </div>
      <DbField label={t('Notas')}>
        <textarea value={f.notes || ''} onChange={e => set('notes', e.target.value)} rows={2} placeholder={t('Opcional')} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', resize: 'vertical' }} />
      </DbField>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
        <button type="button" disabled={!valid} onClick={submit} style={{ border: 0, cursor: valid ? 'pointer' : 'default', opacity: valid ? 1 : .5, padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{isEdit ? t('Guardar') : t('Crear plan')}</button>
      </div>
    </DbModal>
  );
}

/* ── Pagar cuota (§1.6): monto a pagar, reduce el saldo ── */
function DebtPay({ debt, onClose, onPay }) {
  const [monto, setMonto] = useDbState(String(debt.nextDueAmount || ''));
  const valid = parseFloat(monto) > 0;
  return (
    <DbModal title={t('Pagar cuota')} onClose={onClose} width={340}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{debt.name}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t('Saldo actual:')} ${debt.balance.toFixed(2)}</div>
      <DbField label={t('Monto a pagar') + ' *'}>
        <input autoFocus type="number" min="0.01" step="0.01" value={monto} onChange={e => setMonto(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '9px 11px', fontFamily: 'var(--font-money)' }} />
      </DbField>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
        <button type="button" disabled={!valid} onClick={() => onPay(parseFloat(monto))} style={{ border: 0, cursor: valid ? 'pointer' : 'default', opacity: valid ? 1 : .5, padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Registrar pago')}</button>
      </div>
    </DbModal>
  );
}

function DebtsRoute({ hidden }) {
  const [debts, setDebts] = useDbState(() => SAMPLE_DEBTS.map(d => ({ ...d })));
  const [detailId, setDetailId] = useDbState(null);
  const [editId, setEditId] = useDbState(null);
  const [payId, setPayId] = useDbState(null);
  const [newOpen, setNewOpen] = useDbState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useDbState(null);

  const total = debts.reduce((s, d) => s + d.balance, 0);
  const monthly = debts.reduce((s, d) => s + (d.nextDueAmount || 0), 0);
  const lateCount = debts.filter(d => d.status === 'late').length;
  const casheaCount = debts.filter(d => d.provider === 'cashea').length;

  const detailDebt = debts.find(d => d.id === detailId);
  const editDebt = debts.find(d => d.id === editId);
  const payDebt = debts.find(d => d.id === payId);

  const updateDebt = (id, patch) => setDebts(ds => ds.map(d => d.id === id ? { ...d, ...patch } : d));
  const saveDebt = (data) => {
    setDebts(ds => ds.some(d => d.id === data.id) ? ds.map(d => d.id === data.id ? data : d) : [...ds, data]);
    setEditId(null); setNewOpen(false);
  };
  const removeDebt = (id) => { setDebts(ds => ds.filter(d => d.id !== id)); setDetailId(null); setConfirmDeleteId(null); };
  const registerPay = (id, monto) => {
    setDebts(ds => ds.map(d => d.id === id ? { ...d, balance: Math.max(0, d.balance - monto), paid: d.total ? Math.min(d.total, (d.paid || 0) + 1) : d.paid } : d));
    setPayId(null); setDetailId(null);
  };

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
              {debts.length} {t("planes activos ·")} {casheaCount} {t("en Cashea ·")}
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
            <PillButton variant="secondary" icon="payments" onClick={() => debts[0] && setPayId(debts[0].id)}>{t("Pagar cuota")}</PillButton>
            <PillButton variant="primary" icon="add" onClick={() => setNewOpen(true)}>{t("Nuevo plan")}</PillButton>
          </div>
        </div>
      </Card>

      {debts.length === 0 ? (
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40, textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: 34, color: 'var(--fg-3)' }}>credit_score</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>{t('Sin deudas registradas')}</div>
          <PillButton variant="primary" icon="add" onClick={() => setNewOpen(true)}>{t('Agregar primera deuda')}</PillButton>
        </Card>
      ) : (
        <DebtsFullList debts={debts} hidden={hidden} onOpen={setDetailId} />
      )}

      {detailDebt && (
        <DebtDetail debt={detailDebt} onClose={() => setDetailId(null)}
          onEdit={() => { setEditId(detailDebt.id); setDetailId(null); }}
          onDelete={() => setConfirmDeleteId(detailDebt.id)}
          onPay={() => { setPayId(detailDebt.id); setDetailId(null); }} />
      )}
      {editDebt && <DebtForm debt={editDebt} onClose={() => setEditId(null)} onSave={saveDebt} />}
      {newOpen && <DebtForm onClose={() => setNewOpen(false)} onSave={saveDebt} />}
      {payDebt && <DebtPay debt={payDebt} onClose={() => setPayId(null)} onPay={(monto) => registerPay(payDebt.id, monto)} />}
      {confirmDeleteId && (
        <DbModal title={t('Eliminar deuda')} onClose={() => setConfirmDeleteId(null)} width={340}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>
            {t('¿Eliminar')} "{debts.find(d => d.id === confirmDeleteId)?.name}"? {t('Esta acción no se puede deshacer.')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={() => setConfirmDeleteId(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
            <button type="button" onClick={() => removeDebt(confirmDeleteId)} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--expense)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Eliminar')}</button>
          </div>
        </DbModal>
      )}
    </div>
  );
}

Object.assign(window, { DebtsRoute });
