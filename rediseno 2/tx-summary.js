/* ─── OW Finance · Resumen de transacción en lenguaje natural ───────────
 * Genera el texto del Transaction Preview Card (pieza 2.6) y la validación
 * de campos (pieza 2.5) a partir del payload que ya construyen los forms.
 * Compartido por ambos kits. Sin dependencias de React.
 * ──────────────────────────────────────────────────────────────────────── */
(function () {
  function money(n, sym) {
    sym = sym || '$';
    var v = Math.abs(Number(n) || 0);
    return sym + ' ' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function acctName(id) {
    var a = (window.SAMPLE_ACCOUNTS || []).find(function (x) { return x.id === id; });
    return a ? a.name : null;
  }
  function catName(id) {
    var c = window.owfCategory ? window.owfCategory(id) : null;
    return c ? c.name : null;
  }

  /* Resumen legible. Recibe un objeto "vista" normalizado desde el form:
   * { type, amount, currencySym, account, toAccount, category, jar,
   *   itemsCount, splitCount, commission, targetBalance, balanceDelta } */
  function owfTxSummary(v) {
    v = v || {};
    var sym = v.currencySym || '$';
    var amt = money(v.amount, sym);
    var t = v.type;

    if (t === 'transfer') {
      var s = 'Transfieres ' + amt;
      if (v.account) s += ' desde ' + v.account;
      if (v.toAccount) s += ' a ' + v.toAccount;
      if (v.crossArrives != null) s += ', llegan ' + money(v.crossArrives, v.toCurrencySym || 'Bs.');
      if (v.commission) s += ' (comisión ' + money(v.commission, sym) + ')';
      return s + '.';
    }
    if (t === 'ajuste') {
      var dir = (v.balanceDelta || 0) >= 0 ? 'sube' : 'baja';
      var d = money(v.balanceDelta, sym);
      var base = 'Ajustas ' + (v.account || 'la cuenta') + ' a ' + money(v.targetBalance, sym);
      return base + ' — el saldo ' + dir + ' ' + d + '.';
    }

    // expense / income
    var verb = t === 'income' ? 'Registras un ingreso de' : 'Registras un gasto de';
    var str = verb + ' ' + amt;
    if (v.itemsCount > 1) str += ' (' + v.itemsCount + ' ítems)';
    if (v.category) str += ' en ' + v.category;
    if (v.splitCount > 1) str += ', repartido en ' + v.splitCount + ' cuentas';
    else if (v.account) str += ' desde ' + v.account;
    if (v.jar) str += '. Aporta al cántaro ' + v.jar;
    else str += '.';
    if (v.commission) str += ' Comisión ' + money(v.commission, sym) + '.';
    return str;
  }

  /* ¿La operación es "compleja"? (para el flujo de confirmación 2.4:
   * complejas → preview card antes de guardar; simples → toast deshacer). */
  function owfTxIsComplex(v) {
    v = v || {};
    return !!(v.splitCount > 1 || v.itemsCount > 1 || v.commission || v.type === 'transfer' || v.type === 'ajuste');
  }

  /* Validación de campos. Devuelve { ok, errors:[{field,msg}], reasons:[msg] }.
   * reasons = motivos legibles por los que Guardar está deshabilitado. */
  function owfValidateTx(v) {
    v = v || {};
    var errors = [];
    var t = v.type;
    var amt = Number(v.amount) || 0;

    if (t === 'ajuste') {
      if (!v.account) errors.push({ field: 'account', msg: 'Elige la cuenta a ajustar' });
      if (v.targetBalance === '' || v.targetBalance == null) errors.push({ field: 'targetBalance', msg: 'Indica el nuevo saldo' });
    } else {
      if (!(amt > 0) && !(v.itemsCount > 1)) errors.push({ field: 'amount', msg: 'Ingresa un monto mayor a 0' });
      if (t === 'transfer') {
        if (!v.account) errors.push({ field: 'account', msg: 'Elige la cuenta de origen' });
        if (!v.toAccount) errors.push({ field: 'toAccount', msg: 'Elige la cuenta de destino' });
        if (v.account && v.toAccount && v.sameAccount) errors.push({ field: 'toAccount', msg: 'Origen y destino no pueden ser la misma cuenta' });
      } else if (t === 'expense') {
        if (v.category == null) errors.push({ field: 'category', msg: 'Elige una categoría' });
      }
      if (v.splitCount > 1 && v.splitBalanced === false) errors.push({ field: 'split', msg: 'La suma de los pagos no coincide con el monto' });
    }
    return { ok: errors.length === 0, errors: errors, reasons: errors.map(function (e) { return e.msg; }) };
  }

  var api = { owfTxSummary: owfTxSummary, owfTxIsComplex: owfTxIsComplex, owfValidateTx: owfValidateTx, owfMoney: money };
  if (typeof window !== 'undefined') Object.assign(window, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
