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
  // NBSP entre símbolo y cifra: nunca se parten en dos líneas.
  return `${sym}\u00A0${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* Desglose de doble tasa: monto en moneda extranjera → equivalente en USD
 * al PARALELO (tasa actual del usuario) y al BCV (tasa oficial, sincronizada
 * a diario). rates = { [cur]: { current, official } }. */
function TfRateBreakdown({ foreignAmount, currency, rates }) {
  if (currency === 'USD') return null;
  const r = (rates || window.DEFAULT_RATES || {})[currency] || {};
  const cur = r.current || 1;
  const off = r.official || cur;
  const amt = Math.abs(Number(foreignAmount) || 0);
  const fmtRate = n => Number(n).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 13px' };
  const keyStyle = { display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)' };
  const rateStyle = { fontFamily: 'var(--font-money)', fontSize: 11.5, color: 'var(--fg-3)', fontVariantNumeric: 'tabular-nums' };
  const valStyle = { fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };
  return (
    <div style={{ border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface-1)' }}>
      <div style={rowStyle}>
        <span style={keyStyle}><span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--brand-primary)', flexShrink: 0 }} />{t('Paralelo')} <span style={rateStyle}>{fmtRate(cur)}</span></span>
        <span style={valStyle}>≈ {tfMoney(amt / cur)}</span>
      </div>
      <div style={{ ...rowStyle, borderTop: '1px dashed var(--border-hairline)', background: 'color-mix(in srgb, var(--info) 5%, var(--surface-1))' }}>
        <span style={keyStyle}>
          <span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--info)', flexShrink: 0 }} />{t('BCV')} <span style={rateStyle}>{fmtRate(off)}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, color: 'var(--info-fg)', background: 'var(--info-soft)', padding: '2px 7px', borderRadius: 999 }}><span className="material-icons" style={{ fontSize: 12 }}>schedule</span>{t('hoy')}</span>
        </span>
        <span style={valStyle}>≈ {tfMoney(amt / off)}</span>
      </div>
    </div>
  );
}

/* El cántaro está anclado a la categoría: cada categoría define su jar_id.
 * Devuelve el cántaro (jar) asociado a una categoría, o null. */
function jarForCategory(categoryId) {
  if (categoryId == null) return null;
  const cat = (window.SAMPLE_CATEGORIES || []).find(c => c.id === categoryId);
  if (!cat || !cat.jarId) return null;
  return (window.SAMPLE_JARS || []).find(j => j.id === cat.jarId) || null;
}

/* Chip de solo-lectura que muestra el cántaro derivado de la categoría.
 * Reemplaza al selector de cántaro: en el form (legacy/Pro) el cántaro NO
 * se elige a mano — entra anclado a la categoría. */
function AnchoredJar({ categoryId }) {
  const cat = categoryId != null ? (window.SAMPLE_CATEGORIES || []).find(c => c.id === categoryId) : null;
  const jar = jarForCategory(categoryId);

  // Sin categoría aún → invitación neutra
  if (!cat) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px dashed var(--border-hairline)' }}>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>savings</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-3)' }}>{t('El cántaro entra con la categoría')}</span>
      </div>
    );
  }
  // Categoría sin cántaro (p.ej. Ingresos / Otros sin asignar)
  if (!jar) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 13px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)' }}>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>block</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>{t('Esta categoría no aporta a ningún cántaro')}</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 'var(--radius-sm)', background: `color-mix(in srgb, ${jar.color} 9%, var(--surface-1))`, border: `1px solid color-mix(in srgb, ${jar.color} 26%, transparent)` }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, background: jar.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-icons" style={{ fontSize: 16, color: '#fff' }}>{jar.icon}</span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{t(jar.name)}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{jar.percent}% {t('del ingreso')} · {t('anclado a')} {t(cat.name)}</div>
      </div>
      <span className="material-icons" title={t('Definido por la categoría')} style={{ fontSize: 16, color: 'var(--fg-3)' }}>lock</span>
    </div>
  );
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
  const [tags,      setTags]      = useTfState([]);
  const [liteMore,  setLiteMore]  = useTfState(false);
  const [providers, setProviders] = useTfState(window.SAMPLE_PROVIDERS);
  const [accountId, setAccountId] = useTfState(1);
  const [toAccountId,setToAccountId] = useTfState(2);
  const [includeBal,setIncludeBal]= useTfState(true);
  const [showPayload,setShowPayload] = useTfState(false);

  // advanced
  const [splitOn, setSplitOn] = useTfState(false);
  const [itemsOn, setItemsOn] = useTfState(false);
  const [payments, setPayments] = useTfState([{ accountId: 1, amount: '', rate: 1 }, { accountId: 4, amount: '', rate: RATES.VES.current }]);
  const [items, setItems] = useTfState([]);
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
  const provOpts = [{ value: null, label: window.t('Sin proveedor'), icon: 'block' }, ...providers.map(p => ({ value: p.id, label: p.name, icon: 'storefront' }))];
  const createProvider = (name) => {
    const id = 'new-' + Date.now();
    setProviders(prev => [...prev, { id, name }]);
    return id;
  };
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
    if (isLite) return { ...base, amount: txType.sign * effectiveAmount, jar_id: jarForCategory(categoryId)?.id || null, category_id: categoryId, provider_id: providerId, tags };
    if (type === 'transfer') return { ...base, amount: Number(amount) || 0, commission: commObj, tags, payments: [ { account_id: accountId, amount: -(Number(amount) || 0), rate: 1 }, { account_id: toAccountId, amount: xferArrives, rate: xferCross ? +xferRate.toFixed(4) : 1 } ] };
    if (type === 'ajuste') return { name: concept || 'Ajuste manual', transaction_type_id: txType?.id, account_id: accountId, target_balance: Number(targetBalance) || 0, include_in_balance: includeBal };
    // income / expense
    const sign = type === 'income' ? 1 : -1;
    const pay = splitOn
      ? payments.map(p => ({ account_id: p.accountId, amount: sign * (Number(p.amount) || 0), rate: Number(p.rate) || 1 }))
      : [{ account_id: accountId, amount: sign * (currency === selAccount?.currency ? effectiveAmount : effectiveAmount), rate: currency === 'USD' ? 1 : rateForCur, rate_is_current: currency !== 'USD' }];
    const it = itemsOn ? items.map(i => ({ name: i.name, quantity: Number(i.qty) || 1, amount: Number(i.amount) || 0, tax_id: i.taxId, jar_id: jarForCategory(i.categoryId)?.id || null, category_id: i.categoryId })) : [{ name: concept || 'Movimiento', amount: effectiveAmount, category_id: categoryId, jar_id: jarForCategory(categoryId)?.id || null }];
    return { ...base, amount: sign * effectiveAmount, provider_id: providerId, tags, category_id: categoryId, jar_id: jarForCategory(categoryId)?.id || null, commission: commObj, payments: pay, items: it };
  };
  const payload = buildPayload();

  // ── Vista-resumen para el Preview Card (2.6) + validación (2.5) ──
  const curSym = (window.CURRENCIES[currency]?.symbol) || '$';
  const summaryView = {
    type,
    amount: type === 'transfer' ? (Number(amount) || 0) : type === 'ajuste' ? Math.abs(adjustDiff) : effectiveAmount,
    currencySym: curSym,
    account: selAccount?.name,
    toAccount: type === 'transfer' ? selTo?.name : null,
    sameAccount: accountId === toAccountId,
    category: isLite || type === 'expense' || type === 'income' ? jarForCategory(categoryId) && catOpts.find(c => c.value === categoryId)?.label || (categoryId != null ? (window.SAMPLE_CATEGORIES.find(c => c.id === categoryId) || {}).name : null) : null,
    jar: (jarForCategory(categoryId) || {}).name ? t((jarForCategory(categoryId)).name) : null,
    itemsCount: itemsOn ? items.length : 1,
    splitCount: splitOn ? payments.length : 1,
    splitBalanced: true,
    commission: commOn ? commAmount : 0,
    targetBalance: Number(targetBalance) || 0,
    balanceDelta: adjustDiff,
    crossArrives: xferCross ? xferArrives : null,
    toCurrencySym: selTo ? (window.CURRENCIES[selTo.currency]?.symbol || 'Bs.') : null,
  };

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label={t("Categoría")} required hint={t('El cántaro entra con la categoría')}>
              <CategorySelector value={categoryId} onChange={setCategoryId} kind="expense" placeholder={t("Elige una categoría")} />
            </Field>
            <AnchoredJar categoryId={categoryId} />
          </div>
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
          {type === 'income' && (
            <Field label={t("Categoría (opcional)")} style={{ flex: 1 }}>
              <Picker value={categoryId} onChange={setCategoryId} options={[{ value: null, label: window.t('Sin categoría'), icon: 'block' }, ...catOpts.filter((o, i) => (window.SAMPLE_CATEGORIES[i] || {}).kind === 'income')]} placeholder={t("Categoría")} />
            </Field>
          )}
        </div>

        <TfTags selected={tags} onChange={setTags} accent={accent} mode="lite" />

        {/* Más detalles → proveedor (colapsado en Lite) */}
        <div>
          <button type="button" onClick={() => setLiteMore(m => !m)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: 0 }}>
            <span className="material-icons" style={{ fontSize: 17, transition: 'transform 160ms', transform: liteMore ? 'rotate(180deg)' : 'none' }}>expand_more</span>
            {liteMore ? t('Menos detalles') : t('Más detalles')}
          </button>
          {liteMore && (
            <div style={{ marginTop: 12 }}>
              <Field label={t('Proveedor / Comercio')} hint={t('Opcional')}>
                <Picker value={providerId} onChange={setProviderId} options={provOpts} placeholder={t('Proveedor / Comercio')} leadingIcon="storefront" onCreate={createProvider} createLabel={t('Crear proveedor')} />
              </Field>
            </div>
          )}
        </div>

        <TfReview view={summaryView} payload={payload} accent={accent} onClose={onClose}
          onSubmit={() => onSubmit && onSubmit(payload)}
          label={type === 'income' ? t('Registrar ingreso') : t('Registrar gasto')} />
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
            <Picker value={accountId} onChange={setAccountId} options={accountOpts} searchable />
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
              <Picker value={accountId} onChange={setAccountId} options={accountOpts} searchable />
            </Field>
            <div style={{ paddingBottom: 11 }}><span className="material-icons" style={{ fontSize: 22, color: 'var(--fg-3)' }}>arrow_forward</span></div>
            <Field label={t("Hacia (destino)")} style={{ flex: 1 }} required>
              <Picker value={toAccountId} onChange={setToAccountId} options={accountOpts.filter(o => o.value !== accountId)} searchable />
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

          {/* cross-currency single-payment preview — doble tasa (paralelo + BCV) */}
          {!splitOn && currency !== 'USD' && !itemsOn && (
            <TfRateBreakdown foreignAmount={effectiveAmount} currency={currency} rates={RATES} />
          )}

          {/* account / split */}
          {!splitOn ? (
            <Field label={t("Cuenta de origen")} required>
              <Picker value={accountId} onChange={setAccountId} options={accountOpts} searchable />
            </Field>
          ) : (
            <TfPaymentsEditor payments={payments} setPayments={setPayments} accountOpts={accountOpts} accounts={acc} total={splitTotal} />
          )}

          {/* category → cántaro anclado (el cántaro entra por la categoría, no se elige) */}
          {!itemsOn && (
            <div style={{ display: 'flex', flexDirection: rowDir, gap: G, alignItems: 'flex-start' }}>
              <Field label="Categoría" style={{ flex: 1 }}>
                <CategorySelector value={categoryId} onChange={setCategoryId} kind="expense" allowNull placeholder={t("Categoría")} />
              </Field>
              <Field label={t('Cántaro')} hint={t('Anclado a la categoría')} style={{ flex: 1 }}>
                <AnchoredJar categoryId={categoryId} />
              </Field>
            </div>
          )}

          {/* items editor */}
          {itemsOn && <TfItemsEditor items={items} setItems={setItems} taxOpts={itemTaxOpts} jarOpts={jarOpts} catOpts={catOpts} />}

          {/* provider + date */}
          <div style={{ display: 'flex', flexDirection: rowDir, gap: G }}>
            <Field label={t("Proveedor / Comercio")} style={{ flex: 1 }}>
              <Picker value={providerId} onChange={setProviderId} options={provOpts} placeholder={t("Proveedor / Comercio")} leadingIcon="storefront" onCreate={createProvider} createLabel={t("Crear proveedor")} />
            </Field>
            <Field label="Fecha" style={{ flex: 1 }}>
              <Picker value={dateLabel} onChange={setDateLabel} options={[{ value: 'Hoy', label: window.t('Hoy'), icon: 'today' }, { value: 'Ayer', label: window.t('Ayer'), icon: 'history' }, { value: 'Personalizada', label: window.t('Otra fecha…'), icon: 'calendar_month' }]} />
            </Field>
          </div>

          {/* etiquetas (Pro: todas) */}
          <TfTags selected={tags} onChange={setTags} accent={accent} mode="pro" />

          {/* advanced toggles */}
          <div style={{ display: 'flex', flexDirection: rowDir, gap: G }}>
            <Switch on={splitOn} onChange={setSplitOn} icon="call_split" label={t("Pago múltiple")} sub={t("Varias cuentas")} />
            <Switch on={itemsOn} onChange={setItemsOn} icon="receipt_long" label={t("Detalle / factura")} sub={t("Ítems + impuestos")} />
          </div>

          <TfCommission on={commOn} setOn={setCommOn} kind={commKind} setKind={setCommKind} value={commValue} setValue={setCommValue} amount={commAmount} base={commBase} currency={commCurrency} accent={accent} />
          <Switch on={includeBal} onChange={setIncludeBal} icon="account_balance_wallet" label={t("Afecta el saldo")} sub={t("Desactiva para movimientos informativos")} />
        </>
      )}

      {/* Preview card + validación + estados de guardado (2.4/2.5/2.6) */}
      <TfReview view={summaryView} payload={payload} accent={accent} onClose={onClose}
        onSubmit={() => onSubmit && onSubmit(payload)}
        label={type === 'transfer' ? t('Registrar transferencia') : type === 'ajuste' ? t('Aplicar ajuste') : type === 'income' ? t('Registrar ingreso') : t('Registrar gasto')} />
    </div>
  );
}

/* ---------- Review: preview card + validación + guardar con estados ----------
 * 2.6 Preview Card · 2.5 estados (idle/loading/success) + validación ·
 * 2.4 confirmación híbrida (las operaciones complejas muestran el resumen
 * de forma destacada antes de guardar; las simples guardan directo). */
function TfReview({ view, payload, accent, onClose, onSubmit, label }) {
  const [status, setStatus] = useTfState('idle'); // idle | loading | success
  const [showPayload, setShowPayload] = useTfState(false);
  const valid = (window.owfValidateTx ? window.owfValidateTx(view) : { ok: true, reasons: [] });
  const complex = window.owfTxIsComplex ? window.owfTxIsComplex(view) : false;
  const summary = window.owfTxSummary ? window.owfTxSummary(view) : '';

  const go = () => {
    if (!valid.ok || status !== 'idle') return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSubmit && onSubmit();
        setStatus('idle');
        // Parte B del híbrido: confirmación + Deshacer en el shell de la app.
        if (window.owToast) {
          const labels = { expense: 'Gasto', income: 'Ingreso', transfer: 'Transferencia', ajuste: 'Ajuste' };
          window.owToast({
            message: t(labels[view.type] || 'Movimiento') + ' ' + t('registrado'),
            sub: summary,
            accent: accent,
            actionLabel: t('Deshacer'),
            onAction: () => window.owToast({ message: t('Movimiento descartado'), icon: 'undo', accent: 'var(--warning)', duration: 2600 }),
          });
        }
      }, 720);
    }, 760);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border-hairline)', paddingTop: 14 }}>
      {/* Preview card — resumen en lenguaje natural */}
      <div style={{ display: 'flex', gap: 11, padding: '13px 15px', borderRadius: 'var(--radius-md)', background: complex ? `color-mix(in srgb, ${accent} 8%, var(--surface-1))` : 'var(--surface-2)', border: `1px solid ${complex ? `color-mix(in srgb, ${accent} 26%, transparent)` : 'var(--border-hairline)'}` }}>
        <span className="material-icons" style={{ fontSize: 20, color: accent, marginTop: 1 }}>{complex ? 'fact_check' : 'visibility'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 3 }}>{t('Vas a registrar')}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--fg-1)', textWrap: 'pretty' }}>{summary}</div>
        </div>
      </div>

      {/* Motivos por los que no se puede guardar */}
      {!valid.ok && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {valid.reasons.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>
              <span className="material-icons" style={{ fontSize: 15, color: 'var(--warning)' }}>error_outline</span>{r}
            </div>
          ))}
        </div>
      )}

      {/* Dev payload (colapsado) */}
      <div>
        <button type="button" onClick={() => setShowPayload(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', padding: 0 }}>
          <span className="material-icons" style={{ fontSize: 15 }}>{showPayload ? 'expand_less' : 'data_object'}</span>
          {showPayload ? t('Ocultar') : t('Ver')} payload · POST /api/v1/transactions
        </button>
        {showPayload && (
          <pre style={{ marginTop: 9, padding: 13, borderRadius: 'var(--radius-sm)', background: 'var(--ink-base)', color: '#A8BCE6', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11, lineHeight: 1.5, overflowX: 'auto', maxHeight: 200 }}>
{JSON.stringify(payload, null, 2)}
          </pre>
        )}
      </div>

      {/* Footer con estados */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <PillButton variant="ghost" onClick={onClose}>{t("Cancelar")}</PillButton>
        <button type="button" onClick={go} disabled={!valid.ok || status !== 'idle'}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: valid.ok && status === 'idle' ? 'pointer' : 'not-allowed',
            padding: '12px 24px', borderRadius: 'var(--radius-pill)',
            background: status === 'success' ? 'var(--income)' : valid.ok ? accent : 'var(--surface-3)',
            color: valid.ok || status === 'success' ? '#fff' : 'var(--fg-3)',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14.5, transition: 'background 200ms, color 200ms', minWidth: 190, justifyContent: 'center' }}>
          {status === 'loading' && <><span className="material-icons tf-spin" style={{ fontSize: 19 }}>progress_activity</span>{t('Guardando…')}</>}
          {status === 'success' && <><span className="material-icons" style={{ fontSize: 19 }}>check_circle</span>{t('Registrado')}</>}
          {status === 'idle' && <><span className="material-icons" style={{ fontSize: 19 }}>{complex ? 'task_alt' : 'check'}</span>{complex ? t('Confirmar y registrar') : label}</>}
        </button>
      </div>
      <style>{`@keyframes tfSpin{to{transform:rotate(360deg)}}.tf-spin{animation:tfSpin 800ms linear infinite}`}</style>
    </div>
  );
}

/* ---------- Etiquetas (tags) — chips horizontales multi-selección ----------
 * GET /api/v1/tags → chips scrollables. Inactivo: borde suave · Activo: fondo
 * color del tag. Multi-selección. "+ Etiqueta" crea un tag de usuario
 * (POST /api/v1/tags). Lite: 3 relevantes + "más". Pro: todos.
 * onChange recibe number[] con los IDs seleccionados.
 * -------------------------------------------------------------------------- */
function TfTags({ selected, onChange, accent, mode = 'pro' }) {
  const isLite = mode === 'lite';
  const [allTags, setAllTags] = useTfState(window.SAMPLE_TAGS || []);
  const [expanded, setExpanded] = useTfState(!isLite);
  const [creating, setCreating] = useTfState(false);
  const [newName, setNewName] = useTfState('');
  const [newColor, setNewColor] = useTfState((window.TAG_PALETTE || ['#3B82F6'])[3]);
  const [hovered, setHovered] = useTfState(null);

  const relevant = window.LITE_RELEVANT_TAGS || [];
  const palette = window.TAG_PALETTE || ['#3B82F6'];
  const collapsedLite = isLite && !expanded;
  const visible = collapsedLite ? allTags.filter(tg => relevant.includes(tg.id)) : allTags;
  const hiddenCount = allTags.length - visible.length;

  const toggle = (id) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  const createTag = () => {
    const name = newName.trim(); if (!name) return;
    const id = Date.now();
    const tag = { id, slug: name.toLowerCase().replace(/\s+/g, '_'), name, icon: 'sell', color: newColor, type: 'user', description: t('Etiqueta personal') };
    setAllTags(prev => [...prev, tag]);
    onChange([...selected, id]);
    setCreating(false); setNewName('');
  };

  const hoveredTag = allTags.find(tg => tg.id === hovered);
  const chipBase = { display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0, padding: '7px 13px 7px 10px', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, whiteSpace: 'nowrap', transition: 'background 140ms, border-color 140ms, color 140ms', outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <style>{`.tf-tags-row::-webkit-scrollbar{height:5px}.tf-tags-row::-webkit-scrollbar-thumb{background:var(--border-hairline);border-radius:99px}`}</style>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{t('Etiquetas')}</label>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)', minHeight: 15, textAlign: 'right', textWrap: 'pretty' }}>
          {hoveredTag ? hoveredTag.description : selected.length ? `${selected.length} ${t('seleccionadas')}` : t('Toca para clasificar el movimiento')}
        </span>
      </div>

      <div className="tf-tags-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 0 5px' }}>
        {visible.map(tg => {
          const on = selected.includes(tg.id);
          return (
            <button key={tg.id} type="button" title={tg.description}
              onClick={() => toggle(tg.id)}
              onMouseEnter={() => setHovered(tg.id)} onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(tg.id)} onBlur={() => setHovered(null)}
              style={{ ...chipBase,
                border: on ? `1px solid ${tg.color}` : `1px solid color-mix(in srgb, ${tg.color} 34%, var(--border-hairline))`,
                background: on ? tg.color : `color-mix(in srgb, ${tg.color} 7%, var(--surface-1))`,
                color: on ? '#fff' : 'var(--fg-1)', fontWeight: on ? 700 : 500 }}>
              <span className="material-icons" style={{ fontSize: 15, color: on ? '#fff' : tg.color }}>{tg.icon}</span>
              {t(tg.name)}
            </button>
          );
        })}

        {collapsedLite && hiddenCount > 0 && (
          <button type="button" onClick={() => setExpanded(true)}
            style={{ ...chipBase, padding: '7px 13px', border: '1px dashed var(--border-hairline)', background: 'transparent', color: 'var(--fg-2)', fontWeight: 600 }}>
            <span className="material-icons" style={{ fontSize: 15 }}>more_horiz</span>{hiddenCount} {t('más')}
          </button>
        )}

        <button type="button" onClick={() => setCreating(c => !c)}
          style={{ ...chipBase, padding: '7px 13px', border: `1px dashed ${creating ? accent : 'var(--border-hairline)'}`, background: 'transparent', color: creating ? accent : 'var(--brand-primary)', fontWeight: 600 }}>
          <span className="material-icons" style={{ fontSize: 15 }}>add</span>{t('Etiqueta')}
        </button>
      </div>

      {creating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, padding: 13, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)', animation: 'tfCommBar 200ms var(--ease-out)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: newColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-icons" style={{ fontSize: 16, color: '#fff' }}>sell</span>
            </span>
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createTag(); } }}
              placeholder={t('Nombre de la etiqueta')} style={{ ...window.FC_INPUT_STYLE, flex: 1, padding: '9px 12px' }} onFocus={window.fcFocus} onBlur={window.fcBlur} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            {palette.map(c => (
              <button key={c} type="button" onClick={() => setNewColor(c)} title={c}
                style={{ width: 24, height: 24, borderRadius: 8, background: c, cursor: 'pointer', flexShrink: 0, border: newColor === c ? '2px solid var(--fg-1)' : '2px solid transparent', boxShadow: newColor === c ? '0 0 0 2px var(--surface-2)' : 'none' }} />
            ))}
            <span style={{ flex: 1 }} />
            <button type="button" onClick={() => { setCreating(false); setNewName(''); }} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '7px 10px' }}>{t('Cancelar')}</button>
            <button type="button" onClick={createTag} disabled={!newName.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, cursor: newName.trim() ? 'pointer' : 'not-allowed', padding: '8px 14px', borderRadius: 'var(--radius-pill)', background: newName.trim() ? 'var(--brand-primary)' : 'var(--surface-3)', color: newName.trim() ? '#fff' : 'var(--fg-3)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 700 }}>
              <span className="material-icons" style={{ fontSize: 15 }}>add</span>{t('Crear etiqueta')}
            </button>
          </div>
        </div>
      )}
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
                  style={{ flex: 1, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 44, border: active ? `1px solid ${accent}` : '1px solid var(--border-hairline)', cursor: 'pointer', padding: '9px 6px', borderRadius: 'var(--radius-sm)', background: active ? `color-mix(in srgb, ${accent} 12%, var(--surface-1))` : 'var(--surface-1)', color: active ? accent : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: active ? 700 : 500, transition: 'all 150ms' }}>
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
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t('Comisión')} ≈ <strong style={{ color: 'var(--fg-1)', fontFamily: 'var(--font-money)', whiteSpace: 'nowrap' }}>{sym} {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t('Total')} <strong style={{ color: 'var(--fg-1)', fontFamily: 'var(--font-money)', whiteSpace: 'nowrap' }}>{sym} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
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

/* ---------- Payments editor (pago compuesto / múltiples cuentas) ----------
 * Cada pago entra con su CUENTA y su MONTO en la moneda de esa cuenta.
 * Cuando la cuenta no es USD (la moneda base), aparece la TASA editable
 * (USD→moneda) pre-rellenada con la tasa actual del usuario, y se muestra
 * el resultado convertido a USD. Las cuentas en USD bloquean la tasa en 1.
 * El cántaro NO entra aquí: va anclado a la categoría de la cabecera.
 * ------------------------------------------------------------------------ */
function TfPaymentsEditor({ payments, setPayments, accountOpts, accounts, total }) {
  const upd = (i, k, v) => setPayments(payments.map((p, idx) => idx === i ? { ...p, [k]: v } : p));
  const add = () => setPayments([...payments, { accountId: accountOpts[0].value, amount: '', rate: 1 }]);
  const rm = (i) => setPayments(payments.filter((_, idx) => idx !== i));
  const baseSym = window.CURRENCIES.USD.symbol;
  const mini = { fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--fg-3)' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>{t("Pago compuesto")} · {payments.length} {t('cuentas')}</span>
        <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, fontWeight: 700, color: 'var(--fg-1)' }}>Σ ≈ {tfMoney(total)}</span>
      </div>
      {payments.map((p, i) => {
        const a = accounts.find(x => x.id === p.accountId);
        const cur = a?.currency || 'USD';
        const sym = window.CURRENCIES[cur]?.symbol || '$';
        const needsRate = cur !== 'USD';
        const rate = Number(p.rate) || 1;
        const usd = (Number(p.amount) || 0) / (needsRate ? (rate || 1) : 1);
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: 11, borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)', boxShadow: 'var(--shadow-card)' }}>
            {/* fila 1: cuenta + eliminar */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}><Picker value={p.accountId} onChange={v => { const acct = accounts.find(x => x.id === v); upd(i, 'accountId', v); upd(i, 'rate', (window.DEFAULT_RATES[acct.currency]?.current) || 1); }} options={accountOpts} searchable /></div>
              {payments.length > 1 && <button type="button" onClick={() => rm(i)} title={t('Quitar pago')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}><span className="material-icons" style={{ fontSize: 18 }}>close</span></button>}
            </div>
            {/* fila 2: monto · tasa · resultado */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {/* monto en moneda de la cuenta */}
              <label style={{ flex: '1 1 120px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={mini}>{t('Monto')} · {cur}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...window.FC_INPUT_STYLE, padding: '9px 11px' }}>
                  <span style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--fg-3)' }}>{sym}</span>
                  <input type="number" inputMode="decimal" value={p.amount} placeholder="0.00" onChange={e => upd(i, 'amount', e.target.value)} style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
                </div>
              </label>

              {/* tasa: editable solo si la cuenta no es USD */}
              <label style={{ flex: '1 1 130px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={mini}>{t('Tasa')} {needsRate ? `USD→${cur}` : ''}</span>
                {needsRate ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...window.FC_INPUT_STYLE, padding: '9px 11px' }}>
                    <input type="number" inputMode="decimal" value={p.rate} placeholder={String((window.DEFAULT_RATES[cur]?.current) || '')} onChange={e => upd(i, 'rate', e.target.value)} style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 14, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>Bs/$</span>
                  </div>
                ) : (
                  <div title={t('Cuenta en USD · sin conversión')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 11px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border-hairline)' }}>
                    <span className="material-icons" style={{ fontSize: 14, color: 'var(--fg-3)' }}>lock</span>
                    <span style={{ fontFamily: 'var(--font-money)', fontSize: 13, color: 'var(--fg-3)', fontVariantNumeric: 'tabular-nums' }}>1.00</span>
                  </div>
                )}
              </label>

              {/* resultado en USD */}
              <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 80 }}>
                <div style={mini}>{t('Resultado')}</div>
                <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 15, color: usd ? 'var(--fg-1)' : 'var(--fg-3)', fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>{tfMoney(usd, baseSym)}</div>
              </div>
            </div>
          </div>
        );
      })}
      <button type="button" onClick={add} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '4px 0' }}><span className="material-icons" style={{ fontSize: 16 }}>add</span>{t("Añadir cuenta")}</button>
    </div>
  );
}

/* ---------- Cántaro de un ítem (derivado de su categoría, solo lectura) ---------- */
function TfItemJar({ categoryId }) {
  const jar = jarForCategory(categoryId);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-body)', fontSize: 11.5 }}>
      <span className="material-icons" style={{ fontSize: 14, color: 'var(--fg-3)' }}>savings</span>
      {jar ? (
        <>
          <span style={{ width: 8, height: 8, borderRadius: 3, background: jar.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{t(jar.name)}</span>
          <span style={{ color: 'var(--fg-3)' }}>· {t('anclado a la categoría')}</span>
        </>
      ) : (
        <span style={{ color: 'var(--fg-3)' }}>{categoryId == null ? t('El cántaro entra con la categoría') : t('Sin cántaro para esta categoría')}</span>
      )}
    </div>
  );
}

/* ---------- Items editor (factura) ---------- */
function TfItemsEditor({ items, setItems, taxOpts, jarOpts, catOpts }) {
  const upd = (i, k, v) => setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const add = () => setItems([...items, { name: '', qty: 1, amount: '', taxId: null, jarId: null, categoryId: null }]);
  const rm = (i) => setItems(items.filter((_, idx) => idx !== i));
  // Estado vacío (2.2)
  if (!items.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '28px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px dashed var(--border-hairline)', textAlign: 'center' }}>
        <span style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--surface-1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-icons" style={{ fontSize: 25, color: 'var(--fg-3)' }}>receipt_long</span>
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{t('Sin ítems todavía')}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-3)', marginTop: 2 }}>{t('Desglosa la factura línea por línea. El total se suma solo.')}</div>
        </div>
        <button type="button" onClick={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, cursor: 'pointer', padding: '10px 16px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700 }}><span className="material-icons" style={{ fontSize: 16 }}>add</span>{t('Añadir primer ítem')}</button>
      </div>
    );
  }
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
            <div style={{ flex: 1 }}><CategorySelector value={it.categoryId} onChange={v => upd(i, 'categoryId', v)} kind="expense" allowNull placeholder={t("Categoría")} /></div>
            <div style={{ flex: 1 }}><Picker value={it.taxId} onChange={v => upd(i, 'taxId', v)} options={taxOpts} placeholder={t("Impuesto")} /></div>
          </div>
          <TfItemJar categoryId={it.categoryId} />
        </div>
      ))}
      <button type="button" onClick={add} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: '2px 0' }}><span className="material-icons" style={{ fontSize: 16 }}>add</span>{t("Añadir ítem")}</button>
    </div>
  );
}

Object.assign(window, { TransactionForm });
