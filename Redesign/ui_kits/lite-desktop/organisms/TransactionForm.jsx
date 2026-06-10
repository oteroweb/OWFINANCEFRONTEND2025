/* ─── TransactionForm — structured manual entry (LITE + PRO) ────────────
 * Real OWFINANCE model: cabecera + payments[] + items[].
 *   LITE  → simple: monto → cántaro → listo (billetera implícita).
 *   PRO   → 8 caminos: simple · transfer · cross-currency · split ·
 *           ítems+impuestos · cántaro por ítem · ajuste · (bulk: panel aparte).
 * Visual-realistic; no hard validation. Shows a live JSON payload preview.
 *
 * Props: mode('lite'|'pro') · type · prefill · rates · onClose · onSubmit
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useTfState, useMemo: useTfMemo } = React;

function tfMoney(n, sym = '$') {
  const v = Math.abs(Number(n) || 0);
  return `${sym} ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function TransactionForm({ mode = 'pro', type: initialType = 'expense', prefill = null, rates, onClose, onSubmit }) {
  const isLite = mode === 'lite';
  const RATES = rates || window.DEFAULT_RATES;

  const [type,      setType]      = useTfState(initialType === 'income' ? 'income' : initialType === 'transfer' ? 'transfer' : initialType === 'ajuste' ? 'ajuste' : 'expense');
  const [concept,   setConcept]   = useTfState(prefill?.merchant || '');
  const [amount,    setAmount]    = useTfState(prefill?.amount || '');
  const [currency,  setCurrency]  = useTfState(prefill?.currency || 'USD');
  const [dateLabel, setDateLabel] = useTfState('Hoy');
  const [categoryId,setCategoryId]= useTfState(null);
  const [jarId,     setJarId]     = useTfState(isLite ? 'j1' : null);
  const [providerId,setProviderId]= useTfState(null);
  const [accountId, setAccountId] = useTfState(1);
  const [toAccountId,setToAccountId] = useTfState(2);
  const [includeBal,setIncludeBal]= useTfState(true);
  const [showPayload,setShowPayload] = useTfState(false);

  // advanced
  const [splitOn, setSplitOn] = useTfState(false);
  const [itemsOn, setItemsOn] = useTfState(false);
  const [payments, setPayments] = useTfState([{ accountId: 1, amount: '', rate: 1 }, { accountId: 4, amount: '', rate: RATES.VES.current }]);
  const [items, setItems] = useTfState([{ name: '', qty: 1, amount: '', taxId: null, jarId: null, categoryId: null }]);
  // ajuste
  const [targetBalance, setTargetBalance] = useTfState('');
  // comisión (Venezuela: fija / pago móvil / porcentaje)
  const [commOn,    setCommOn]    = useTfState(prefill?.commission ? true : false);
  const [commKind,  setCommKind]  = useTfState(prefill?.commission?.type || 'pagomovil');
  const [commValue, setCommValue] = useTfState(prefill?.commission?.value != null ? String(prefill.commission.value) : '');

  const accents = { expense: 'var(--expense)', income: 'var(--income)', transfer: '#8B5CF6', ajuste: 'var(--warning)' };
  const accent = accents[type];

  // ---- option lists ----
  const acc = window.SAMPLE_ACCOUNTS;
  const accountOpts = acc.map(a => ({ value: a.id, label: a.name, sub: `${window.t(window.ACCOUNT_TYPES[a.type].label)} · ${a.currency}`, color: a.color, right: tfMoney(a.balance, window.CURRENCIES[a.currency].symbol) }));
  const jarOpts = window.SAMPLE_JARS.map(j => ({ value: j.id, label: window.t(j.name), sub: `${j.percent}% · ${window.t('disp.')} ${tfMoney(j.amount)}`, color: j.color }));
  const catOpts = window.SAMPLE_CATEGORIES.map(c => ({ value: c.id, label: window.t(c.name), icon: c.icon }));
  const provOpts = [{ value: null, label: window.t('Sin proveedor'), icon: 'block' }, ...window.SAMPLE_PROVIDERS.map(p => ({ value: p.id, label: p.name, icon: 'storefront' }))];
  const itemTaxOpts = [{ value: null, label: window.t('Sin impuesto') }, ...window.SAMPLE_TAXES.filter(t => t.applies_to !== 'payment').map(t => ({ value: t.id, label: t.name }))];

  const selAccount = acc.find(a => a.id === accountId);
  const selTo = acc.find(a => a.id === toAccountId);
  const userSym = window.CURRENCIES.USD.symbol;

  // ---- derived ----
  const itemsTotal = useTfMemo(() => items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.amount) || 0), 0), [items]);
  const splitTotal = useTfMemo(() => payments.reduce((s, p) => s + (Number(p.amount) || 0) / (Number(p.rate) || 1), 0), [payments]);
  const effectiveAmount = itemsOn ? itemsTotal : (Number(amount) || 0);

  // cross-currency conversion preview (amount typed in `currency` → USD base)
  const rateForCur = (RATES[currency]?.current) || 1;
  const usdEquiv = currency === 'USD' ? effectiveAmount : effectiveAmount / rateForCur;

  // transfer cross-currency
  const xferCross = selAccount && selTo && selAccount.currency !== selTo.currency;
  const xferRate = selTo ? (RATES[selTo.currency]?.current || 1) / (RATES[selAccount?.currency]?.current || 1) : 1;
  const xferArrives = (Number(amount) || 0) * xferRate;

  // ajuste diff
  const adjustDiff = (Number(targetBalance) || 0) - (selAccount?.balance || 0);

  // comisión calculada (sobre el monto de la operación, en su moneda)
  const commBase = type === 'transfer' ? (Number(amount) || 0) : effectiveAmount;
  const commValForCalc = commKind === 'pagomovil' ? window.PAGOMOVIL_PCT : (Number(commValue) || 0);
  const commAmount = commOn ? window.computeCommission(commKind, commValForCalc, commBase) : 0;
  const commCurrency = type === 'transfer' ? (selAccount?.currency || 'USD') : currency;
  const commObj = commOn ? { type: commKind, value: commValForCalc, amount: +commAmount.toFixed(2), currency: commCurrency } : null;

  const buildPayload = () => {
    const txType = window.TX_TYPES.find(t => t.slug === type);
    const base = { name: concept || (type === 'income' ? 'Ingreso' : 'Movimiento'), transaction_type_id: txType?.id, date: dateLabel === 'Hoy' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : dateLabel, include_in_balance: includeBal };
    if (isLite) return { ...base, amount: txType.sign * effectiveAmount, jar_id: jarId, category_id: categoryId };
    if (type === 'transfer') return { ...base, amount: Number(amount) || 0, commission: commObj, payments: [ { account_id: accountId, amount: -(Number(amount) || 0), rate: 1 }, { account_id: toAccountId, amount: xferArrives, rate: xferCross ? +xferRate.toFixed(4) : 1 } ] };
    if (type === 'ajuste') return { name: concept || 'Ajuste manual', transaction_type_id: txType?.id, account_id: accountId, target_balance: Number(targetBalance) || 0, include_in_balance: includeBal };
    // income / expense
    const sign = type === 'income' ? 1 : -1;
    const pay = splitOn
      ? payments.map(p => ({ account_id: p.accountId, amount: sign * (Number(p.amount) || 0), rate: Number(p.rate) || 1 }))
      : [{ account_id: accountId, amount: sign * (currency === selAccount?.currency ? effectiveAmount : effectiveAmount), rate: currency === 'USD' ? 1 : rateForCur, rate_is_current: currency !== 'USD' }];
    const it = itemsOn ? items.map(i => ({ name: i.name, quantity: Number(i.qty) || 1, amount: Number(i.amount) || 0, tax_id: i.taxId, jar_id: i.jarId, category_id: i.categoryId })) : [{ name: concept || 'Movimiento', amount: effectiveAmount, category_id: categoryId, jar_id: jarId }];
    return { ...base, amount: sign * effectiveAmount, provider_id: providerId, category_id: categoryId, commission: commObj, payments: pay, items: it };
  };
  const payload = buildPayload();

  const G = 14; // gap
  const isMobile = useViewportMobile();
  const rowDir = isMobile ? 'column' : 'row';

  // ════════════════════════════════ LITE ════════════════════════════════
  if (isLite) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Segmented
          value={type === 'income' ? 'income' : 'expense'}
          onChange={setType}
          accentMap={accents}
          options={[{ value: 'expense', label: window.t('Gasto'), icon: 'arrow_outward' }, { value: 'income', label: window.t('Ingreso'), icon: 'arrow_downward' }]}
        />

        <MoneyInput value={amount} onChange={setAmount} currency="USD" accent={accent} autoFocus />

        {type === 'expense' ? (
          <Field label={t("¿De qué cántaro sale?")} required>
            <Picker value={jarId} onChange={setJarId} options={jarOpts} placeholder={t("Elige un cántaro")} />
          </Field>
        ) : (
          <div style={{ display: 'flex', gap: 10, padding: '13px 15px', borderRadius: 'var(--radius-md)', background: 'var(--income-soft)', alignItems: 'flex-start' }}>
            <span className="material-icons" style={{ fontSize: 20, color: 'var(--income-fg)' }}>auto_awesome</span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--income-fg)' }}>{t("Se reparte automáticamente")}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', marginTop: 2 }}>
                {window.SAMPLE_JARS.map(j => `${j.name.split(' ')[0]} ${j.percent}%`).join(' · ')}
              </div>
            </div>
          </div>
        )}

        <Field label={t("Concepto (opcional)")}>
          <TextInput value={concept} onChange={setConcept} placeholder={t("Ej: Mercado del super")} icon="notes" />
        </Field>

        <div style={{ display: 'flex', flexDirection: rowDir, gap: G }}>
          <Field label="Fecha" style={{ flex: 1 }}>
            <Picker value={dateLabel} onChange={setDateLabel} options={[{ value: 'Hoy', label: window.t('Hoy'), icon: 'today' }, { value: 'Ayer', label: window.t('Ayer'), icon: 'history' }, { value: 'Personalizada', label: window.t('Otra fecha…'), icon: 'calendar_month' }]} />
          </Field>
          <Field label={t("Categoría (opcional)")} style={{ flex: 1 }}>
            <Picker value={categoryId} onChange={setCategoryId} options={[{ value: null, label: window.t('Sin categoría'), icon: 'block' }, ...catOpts]} placeholder={t("Categoría")} />
          </Field>
        </div>

        <TfFooter accent={accent} onClose={onClose} onSubmit={() => onSubmit && onSubmit(payload)} label={type === 'income' ? t('Registrar ingreso') : t('Registrar gasto')} />
      </div>
    );
  }

  // ════════════════════════════════ PRO ════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Segmented
        value={type} onChange={setType} accentMap={accents}
        options={[
          { value: 'expense', label: window.t('Gasto'), icon: 'arrow_outward' },
          { value: 'income', label: window.t('Ingreso'), icon: 'arrow_downward' },
          { value: 'transfer', label: window.t('Transferir'), icon: 'swap_horiz' },
          { value: 'ajuste', label: window.t('Ajuste'), icon: 'tune' },
        ]}
      />

      {/* ───────── AJUSTE ───────── */}
      {type === 'ajuste' && (
        <>
          <Field label={t("Cuenta a ajustar")} required>
            <Picker value={accountId} onChange={setAccountId} options={accountOpts} />
          </Field>
          <Field label={t('Saldo objetivo')} hint={`${t('Saldo actual:')} ${tfMoney(selAccount?.balance, window.CURRENCIES[selAccount?.currency || 'USD'].symbol)}`}>
            <MoneyInput value={targetBalance} onChange={setTargetBalance} currency={selAccount?.currency || 'USD'} accent={accent} />
          </Field>
          {targetBalance !== '' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderRadius: 'var(--radius-sm)', background: adjustDiff >= 0 ? 'var(--income-soft)' : 'var(--expense-soft)' }}>
              <span className="material-icons" style={{ fontSize: 18, color: adjustDiff >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)' }}>{adjustDiff >= 0 ? 'trending_up' : 'trending_down'}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)' }}>
                {t("Se creará un ajuste de")} <strong>{adjustDiff >= 0 ? '+' : '−'}{tfMoney(adjustDiff, window.CURRENCIES[selAccount?.currency || 'USD'].symbol)}</strong>
              </span>
            </div>
          )}
          <Field label={t("Motivo")}>
            <TextInput value={concept} onChange={setConcept} placeholder={t("Ej: Sincronización con banco")} icon="notes" />
          </Field>
        </>
      )}

      {/* ───────── TRANSFERENCIA ───────── */}
      {type === 'transfer' && (
        <>
          <MoneyInput value={amount} onChange={setAmount} currency={selAccount?.currency || 'USD'} accent={accent} autoFocus />
          <div style={{ display: 'flex', flexDirection: rowDir, gap: G, alignItems: isMobile ? 'stretch' : 'flex-end' }}>
            <Field label={t("Desde (origen)")} style={{ flex: 1 }} required>
              <Picker value={accountId} onChange={setAccountId} options={accountOpts} />
            </Field>
            <div style={{ paddingBottom: 11 }}><span className="material-icons" style={{ fontSize: 22, color: 'var(--fg-3)' }}>arrow_forward</span></div>
            <Field label={t("Hacia (destino)")} style={{ flex: 1 }} required>
              <Picker value={toAccountId} onChange={setToAccountId} options={accountOpts.filter(o => o.value !== accountId)} />
            </Field>
          </div>
          {xferCross && (
            <div style={{ padding: '13px 15px', borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#8B5CF6' }}>{t("Cruce de moneda ·")} {selAccount.currency} → {selTo.currency}</span>
                <span style={{ fontFamily: 'var(--font-money)', fontSize: 12, color: 'var(--fg-2)' }}>{t("tasa")} {xferRate.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div><div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{t('Envías')}</div><div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 18 }}>{tfMoney(amount, window.CURRENCIES[selAccount.currency].symbol)}</div></div>
              <span className="material-icons" style={{ color: 'var(--fg-3)' }}>east</span>
                <div style={{ textAlign: 'right' }}><div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>{t('Llega')}</div><div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 18, color: '#8B5CF6' }}>{tfMoney(xferArrives, window.CURRENCIES[selTo.currency].symbol)}</div></div>
              </div>
            </div>
          )}
          <TfCommission on={commOn} setOn={setCommOn} kind={commKind} setKind={setCommKind} value={commValue} setValue={setCommValue} amount={commAmount} base={commBase} currency={commCurrency} accent={accent} />
          <Field label={t("Concepto (opcional)")}>
            <TextInput value={concept} onChange={setConcept} placeholder={t("Ej: Traspaso a ahorros")} icon="notes" />
          </Field>
        </>
      )}

      {/* ───────── INGRESO / GASTO ───────── */}
      {(type === 'expense' || type === 'income') && (
        <>
          {!itemsOn && (
            <MoneyInput value={amount} onChange={setAmount} currency={currency} onCurrency={setCurrency} currencies={['USD', 'EUR', 'VES']} accent={accent} autoFocus />
          )}
          {itemsOn && (
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{t("Total (suma de ítems)")}</span>
              <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 24, color: 'var(--fg-1)' }}>{tfMoney(itemsTotal)}</span>
            </div>
          )}

          {/* cross-currency single-payment preview */}
          {!splitOn && currency !== 'USD' && !itemsOn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 'var(--radius-sm)', background: 'var(--info-soft)' }}>
              <span className="material-icons" style={{ fontSize: 17, color: 'var(--info-fg)' }}>currency_exchange</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-1)' }}>{t("tasa")} {currency} {rateForCur} · ≈ <strong>{tfMoney(usdEquiv)}</strong></span>
            </div>
          )}

          {/* account / split */}
          {!splitOn ? (
            <Field label={t("Cuenta de origen")} required>
              <Picker value={accountId} onChange={setAccountId} options={accountOpts} />
            </Field>
          ) : (
            <TfPaymentsEditor payments={payments} setPayments={setPayments} accountOpts={accountOpts} accounts={acc} total={splitTotal} />
          )}

          {/* category + jar */}
          {!itemsOn && (
            <div style={{ display: 'flex', flexDirection: rowDir, gap: G }}>
              <Field label="Categoría" style={{ flex: 1 }}>
                <Picker value={categoryId} onChange={setCategoryId} options={[{ value: null, label: window.t('Sin categoría'), icon: 'block' }, ...catOpts]} placeholder={t("Categoría")} />
              </Field>
              <Field label={type === 'income' ? t('Cántaro (opcional)') : t('Cántaro')} style={{ flex: 1 }}>
                <Picker value={jarId} onChange={setJarId} options={[{ value: null, label: type === 'income' ? window.t('Repartir por %') : window.t('Sin cántaro'), color: 'transparent' }, ...jarOpts]} placeholder={t("Cántaro")} />
              </Field>
            </div>
          )}

          {/* items editor */}
          {itemsOn && <TfItemsEditor items={items} setItems={setItems} taxOpts={itemTaxOpts} jarOpts={jarOpts} catOpts={catOpts} />}

          {/* provider + date */}
          <div style={{ display: 'flex', flexDirection: rowDir, gap: G }}>
            <Field label={t("Proveedor")} style={{ flex: 1 }}>
              <Picker value={providerId} onChange={setProviderId} options={provOpts} placeholder={t("Proveedor")} />
            </Field>
            <Field label="Fecha" style={{ flex: 1 }}>
              <Picker value={dateLabel} onChange={setDateLabel} options={[{ value: 'Hoy', label: window.t('Hoy'), icon: 'today' }, { value: 'Ayer', label: window.t('Ayer'), icon: 'history' }, { value: 'Personalizada', label: window.t('Otra fecha…'), icon: 'calendar_month' }]} />
            </Field>
          </div>

          {/* advanced toggles */}
          <div style={{ display: 'flex', flexDirection: rowDir, gap: G }}>
            <Switch on={splitOn} onChange={setSplitOn} icon="call_split" label={t("Pago múltiple")} sub={t("Varias cuentas")} />
            <Switch on={itemsOn} onChange={setItemsOn} icon="receipt_long" label={t("Detalle / factura")} sub={t("Ítems + impuestos")} />
          </div>

          <TfCommission on={commOn} setOn={setCommOn} kind={commKind} setKind={setCommKind} value={commValue} setValue={setCommValue} amount={commAmount} base={commBase} currency={commCurrency} accent={accent} />
          <Switch on={includeBal} onChange={setIncludeBal} icon="account_balance_wallet" label={t("Afecta el saldo")} sub={t("Desactiva para movimientos informativos")} />
        </>
      )}

      {/* payload preview */}
      <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: 12 }}>
        <button type="button" onClick={() => setShowPayload(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', padding: 0 }}>
          <span className="material-icons" style={{ fontSize: 16 }}>{showPayload ? 'expand_less' : 'data_object'}</span>
          {showPayload ? t('Ocultar') : t('Ver')} payload · POST /api/v1/transactions
        </button>
        {showPayload && (
          <pre style={{ marginTop: 10, padding: 14, borderRadius: 'var(--radius-sm)', background: 'var(--ink-base)', color: '#A8BCE6', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11.5, lineHeight: 1.5, overflowX: 'auto', maxHeight: 220 }}>
{JSON.stringify(payload, null, 2)}
          </pre>
        )}
      </div>

      <TfFooter accent={accent} onClose={onClose} onSubmit={() => onSubmit && onSubmit(payload)} label={type === 'transfer' ? t('Registrar transferencia') : type === 'ajuste' ? t('Aplicar ajuste') : type === 'income' ? t('Registrar ingreso') : t('Registrar gasto')} />
    </div>
  );
}

/* ---------- Commission (Venezuela: fija / pago móvil / porcentaje) ---------- */
function TfCommission({ on, setOn, kind, setKind, value, setValue, amount, base, currency, accent }) {
  const sym = (window.CURRENCIES?.[currency]?.symbol) || '$';
  const types = window.COMMISSION_TYPES || [];
  const sel = types.find(x => x.id === kind) || {};
  const total = Math.abs(Number(base) || 0) + (Number(amount) || 0);
  return (
    <div>
      <Switch on={on} onChange={setOn} icon="receipt_long" label={t('Cobrar comisión')} sub={t('Pago móvil, fija o porcentaje')} />
      {on && (
        <div style={{ marginTop: 10, padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', display: 'flex', flexDirection: 'column', gap: 12, animation: 'tfCommBar 220ms var(--ease-out)' }}>
          <style>{`@keyframes tfCommBar{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Tipo de comisión */}
          <div style={{ display: 'flex', gap: 6 }}>
            {types.map(ty => {
              const active = kind === ty.id;
              return (
                <button key={ty.id} type="button" onClick={() => setKind(ty.id)}
                  style={{ flex: 1, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: active ? `1px solid ${accent}` : '1px solid var(--border-hairline)', cursor: 'pointer', padding: '9px 6px', borderRadius: 'var(--radius-sm)', background: active ? `color-mix(in srgb, ${accent} 12%, var(--surface-1))` : 'var(--surface-1)', color: active ? accent : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: active ? 700 : 500, transition: 'all 150ms' }}>
                  <span className="material-icons" style={{ fontSize: 18 }}>{ty.icon}</span>{t(ty.label)}
                </button>
              );
            })}
          </div>

          {/* Entrada según tipo */}
          {kind === 'fija' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-3)' }}>{sym}</span>
              <input type="number" inputMode="decimal" value={value} placeholder="0.00" onChange={e => setValue(e.target.value)} style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>{t('monto fijo')}</span>
            </div>
          )}
          {kind === 'porcentaje' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <input type="number" inputMode="decimal" value={value} placeholder="1.50" onChange={e => setValue(e.target.value)} style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
              <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 16, color: 'var(--fg-3)' }}>%</span>
            </div>
          )}
          {kind === 'pagomovil' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', background: 'var(--info-soft)', borderRadius: 'var(--radius-sm)' }}>
              <span className="material-icons" style={{ fontSize: 18, color: 'var(--info-fg)' }}>smartphone</span>
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-1)' }}>{t('Tarifa P2P')} <strong>0,30%</strong> · {t('mín. Bs 2')}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-3)' }}>BCV</span>
            </div>
          )}

          {/* Resultado */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px solid var(--border-hairline)', paddingTop: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t('Comisión')} ≈ <strong style={{ color: 'var(--fg-1)', fontFamily: 'var(--font-money)' }}>{sym} {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t('Total')} <strong style={{ color: 'var(--fg-1)', fontFamily: 'var(--font-money)' }}>{sym} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Footer ---------- */
function TfFooter({ accent, onClose, onSubmit, label }) {
  const [h, setH] = useTfState(false);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
      <PillButton variant="ghost" onClick={onClose}>{t("Cancelar")}</PillButton>
      <button type="button" onClick={onSubmit} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', padding: '12px 24px', borderRadius: 'var(--radius-pill)', background: accent, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5, filter: h ? 'brightness(0.92)' : 'none', transition: 'filter 150ms' }}>
        <span className="material-icons" style={{ fontSize: 19 }}>check</span>{label}
      </button>
    </div>
  );
}

/* ---------- Payments editor (split) ---------- */
function TfPaymentsEditor({ payments, setPayments, accountOpts, accounts, total }) {
  const upd = (i, k, v) => setPayments(payments.map((p, idx) => idx === i ? { ...p, [k]: v } : p));
  const add = () => setPayments([...payments, { accountId: accountOpts[0].value, amount: '', rate: 1 }]);
  const rm = (i) => setPayments(payments.filter((_, idx) => idx !== i));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>{t("Pagos")} ({payments.length})</span>
        <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: 'var(--fg-1)' }}>Σ ≈ {tfMoney(total)}</span>
      </div>
      {payments.map((p, i) => {
        const a = accounts.find(x => x.id === p.accountId);
        return (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1.6 }}><Picker value={p.accountId} onChange={v => { const acct = accounts.find(x => x.id === v); upd(i, 'accountId', v); upd(i, 'rate', (window.DEFAULT_RATES[acct.currency]?.current) || 1); }} options={accountOpts} /></div>
            <input type="number" value={p.amount} placeholder="0.00" onChange={e => upd(i, 'amount', e.target.value)} style={{ ...window.FC_INPUT_STYLE, flex: 1, padding: '11px 12px' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)', width: 30 }}>{a?.currency}</span>
            {payments.length > 1 && <button type="button" onClick={() => rm(i)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 18 }}>close</span></button>}
          </div>
        );
      })}
      <button type="button" onClick={add} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '4px 0' }}><span className="material-icons" style={{ fontSize: 16 }}>add</span>{t("Añadir cuenta")}</button>
    </div>
  );
}

/* ---------- Items editor (factura) ---------- */
function TfItemsEditor({ items, setItems, taxOpts, jarOpts, catOpts }) {
  const upd = (i, k, v) => setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const add = () => setItems([...items, { name: '', qty: 1, amount: '', taxId: null, jarId: null, categoryId: null }]);
  const rm = (i) => setItems(items.filter((_, idx) => idx !== i));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>{t("Ítems de la factura")}</span>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 11, borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <input value={it.name} placeholder={`${t("Ítem")} ${i + 1}`} onChange={e => upd(i, 'name', e.target.value)} style={{ ...window.FC_INPUT_STYLE, flex: 1, padding: '9px 11px' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
            <input type="number" value={it.qty} onChange={e => upd(i, 'qty', e.target.value)} title={t("Cantidad")} style={{ ...window.FC_INPUT_STYLE, width: 56, padding: '9px 8px', textAlign: 'center' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
            <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>×</span>
            <input type="number" value={it.amount} placeholder="0.00" onChange={e => upd(i, 'amount', e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: 90, padding: '9px 10px' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
            {items.length > 1 && <button type="button" onClick={() => rm(i)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 18 }}>close</span></button>}
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <div style={{ flex: 1 }}><Picker value={it.jarId} onChange={v => upd(i, 'jarId', v)} options={[{ value: null, label: window.t('Cántaro'), color: 'transparent' }, ...jarOpts]} placeholder={t("Cántaro")} /></div>
            <div style={{ flex: 1 }}><Picker value={it.categoryId} onChange={v => upd(i, 'categoryId', v)} options={[{ value: null, label: window.t('Categoría'), icon: 'block' }, ...catOpts]} placeholder={t("Categoría")} /></div>
            <div style={{ flex: 1 }}><Picker value={it.taxId} onChange={v => upd(i, 'taxId', v)} options={taxOpts} placeholder={t("Impuesto")} /></div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '2px 0' }}><span className="material-icons" style={{ fontSize: 16 }}>add</span>{t("Añadir ítem")}</button>
    </div>
  );
}

Object.assign(window, { TransactionForm });
