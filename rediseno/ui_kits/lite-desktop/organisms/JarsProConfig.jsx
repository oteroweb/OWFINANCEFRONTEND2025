/* ─── JarsProConfig — pantalla completa "Cántaros" (Pro desktop) ─────────
 * Paridad con la vista de referencia: barra KPI de ingreso, resumen del
 * mes, tabla completa por cántaro, configuración global y editor de
 * cántaros con panel de Categorías a la derecha.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useJpState } = React;

/* ── Store compartido: qué cántaro absorbe cada categoría. Vive en window
 * porque el panel de Categorías (AccountsPanel, columna derecha global) y
 * el editor de cántaros (JarsProConfigPage, contenido principal) son dos
 * árboles React separados — el drag & drop entre ambos necesita un estado
 * fuera de React.
 *
 * Fuente única: este store YA NO mantiene copias/overrides paralelas —
 * lee y escribe directamente sobre `window.OWF_CATEGORIES` (tx-catalog.js,
 * la fuente compartida por todos los kits, ver DECISIONS.md D-003). Así
 * cualquier edición acá es visible para cualquier otra superficie que
 * también consuma OWF_CATEGORIES (mobile incluido, una vez migrado). ── */
(function () {
  if (window.OwCategoryStore) return;
  const listeners = new Set();
  const notify = () => listeners.forEach(fn => fn());
  const cats = () => window.OWF_CATEGORIES || [];
  const find = (catId) => cats().find(c => c.id === catId);
  window.OwCategoryStore = {
    getJarId(cat) { return cat.jarId; },
    setJarId(catId, jarId) { const c = find(catId); if (c) { c.jarId = jarId; notify(); } },
    getColor(cat) { return window.owfCategoryColor ? window.owfCategoryColor(cat.id) : (cat.color || '#64748B'); },
    setColor(catId, color) { const c = find(catId); if (c) { c.color = color; notify(); } },
    getName(cat) { return cat.name; },
    setName(catId, name) { const c = find(catId); if (c) { c.name = name; notify(); } },
    /* description: contexto para el asesor IA — no se muestra en el selector, solo se usa como señal semántica al generar consejos. */
    getDescription(cat) { return cat.description || ''; },
    setDescription(catId, d) { const c = find(catId); if (c) { c.description = d; notify(); } },
    addCategory(cat) { cats().push({ color: null, description: '', ...cat }); notify(); },
    getAll() { return cats(); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();

function jpTint(c, p) { return `color-mix(in srgb, ${c} ${p}%, var(--surface-1))`; }
const jpMoney = (n, hidden) => hidden ? '••••' : `$ ${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ── Fila superior: Ingreso esperado / real / asignado / disponible ── */
function JarsKpiBar({ expectedIncome, setExpectedIncome, realIncome, useReal, setUseReal, totalPercent, hidden }) {
  const [editing, setEditing] = useJpState(false);
  const [val, setVal] = useJpState(String(expectedIncome));
  const totalAssigned = expectedIncome * totalPercent / 100;
  const available = (useReal ? realIncome : expectedIncome) - totalAssigned;
  const realPct = expectedIncome ? Math.round(realIncome / expectedIncome * 100) : 0;
  const availPct = expectedIncome ? Math.max(0, Math.round(available / expectedIncome * 100)) : 0;
  const missing = expectedIncome - realIncome;
  const save = () => { const v = parseFloat(val); if (!isNaN(v) && v >= 0) setExpectedIncome(v); setEditing(false); };

  return (
    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ background: 'var(--info)', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>
            <span className="material-icons" style={{ fontSize: 14 }}>savings</span>{t('Ingreso Esperado')}
          </div>
          {editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <input autoFocus type="number" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()}
                style={{ width: 110, border: 0, borderRadius: 8, padding: '6px 9px', fontFamily: 'var(--font-money)', fontSize: 18, fontWeight: 700 }} />
              <button onClick={save} style={{ border: 0, background: 'rgba(255,255,255,.25)', borderRadius: 8, color: '#fff', cursor: 'pointer', width: 30, height: 30, display: 'grid', placeItems: 'center' }}><span className="material-icons" style={{ fontSize: 17 }}>check</span></button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-money)', fontSize: 30, fontWeight: 800, color: '#fff' }}>{jpMoney(expectedIncome, hidden)}</span>
              <button onClick={() => { setVal(String(expectedIncome)); setEditing(true); }} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,.75)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 17 }}>edit</span></button>
            </div>
          )}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}><span className="material-icons" style={{ fontSize: 14 }}>bar_chart</span>{t('Ingreso Real')}</div>
          <div style={{ fontFamily: 'var(--font-money)', fontSize: 22, fontWeight: 800, color: '#fff' }}>{jpMoney(realIncome, hidden)} <span style={{ fontSize: 13, fontWeight: 600, opacity: .85 }}>({realPct}%)</span></div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 3 }}><span className="material-icons" style={{ fontSize: 13 }}>arrow_downward</span>{jpMoney(missing, hidden)}</div>
        </div>
        <span style={{ width: 1, height: 40, background: 'rgba(255,255,255,.25)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>{t('Total Asignado')}</div>
          <div style={{ fontFamily: 'var(--font-money)', fontSize: 22, fontWeight: 800, color: '#fff' }}>{jpMoney(totalAssigned, hidden)}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'rgba(255,255,255,.75)' }}>{Math.round(totalPercent)}% {t('del esperado')}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>{t('Disponible')}</div>
          <div style={{ fontFamily: 'var(--font-money)', fontSize: 22, fontWeight: 800, color: available < 0 ? '#FCA5A5' : '#6EE7B7' }}>{jpMoney(available, hidden)}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'rgba(255,255,255,.75)' }}>{availPct}% {t('restante')}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setUseReal(v => !v)} style={{ width: 40, height: 22, borderRadius: 999, border: 0, cursor: 'pointer', background: useReal ? '#fff' : 'rgba(255,255,255,.3)', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 2, left: useReal ? 20 : 2, width: 18, height: 18, borderRadius: 999, background: useReal ? 'var(--info)' : '#fff', transition: 'left 150ms' }} />
          </button>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: '#fff' }}>{t('Usar ingreso real')}</span>
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--surface-2)' }}><div style={{ height: '100%', width: `${Math.min(100, realPct)}%`, background: '#10B981' }} /></div>
      {missing > 0 && (
        <div style={{ background: 'var(--expense)', padding: '11px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="material-icons" style={{ fontSize: 18, color: '#fff' }}>error</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: '#fff' }}>{t('Faltan')} {jpMoney(missing, hidden)} {t('para alcanzar tu meta')}</span>
        </div>
      )}
    </div>
  );
}

/* ── Resumen del mes (Pro) ── */
function JarsMonthSummary({ rows, hidden }) {
  const totalGastado = rows.reduce((s, r) => s + r.gastado, 0);
  const totalAjustes = rows.reduce((s, r) => s + r.ajuste, 0);
  const totalDisponible = rows.reduce((s, r) => s + r.disponibleMes, 0);
  const noUsado = Math.max(0, totalDisponible - totalGastado);
  const savingsBalances = (ACCOUNTS_DATA || []).filter(a => a.color === '#10B981' || a.sub === 'Cuenta ahorros').reduce((s, a) => s + a.balance, 0);
  const ahorroTeorico = rows.reduce((s, r) => s + Math.max(0, r.balance), 0) + savingsBalances;

  const tiles = [
    { label: t('Total gastado'), value: totalGastado, color: 'var(--expense-fg)', hint: t('Consumo acumulado entre todos los cántaros activos.') },
    { label: t('Total ajustes'), value: totalAjustes, color: totalAjustes < 0 ? 'var(--expense-fg)' : 'var(--fg-1)', hint: t('Correcciones manuales aplicadas al periodo.') },
    { label: t('No usado este mes'), value: noUsado, color: 'var(--fg-1)', hint: t('Disponible no ejecutado en cántaros reset.') },
    { label: t('Ahorro teórico total'), value: ahorroTeorico, color: 'var(--info)', hint: t('Incluye ahorro en cuentas:') + ' ' + jpMoney(savingsBalances, hidden) },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{t('Resumen del mes')}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, color: 'var(--info)', background: 'var(--info-soft)', padding: '2px 9px', borderRadius: 999 }}>Pro</span>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', marginBottom: 16 }}>{t('Balance del mes con los indicadores clave arriba y la tabla de seguimiento debajo.')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {tiles.map((tl, i) => (
          <div key={i} style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', marginBottom: 6 }}>{tl.label}</div>
            <div style={{ fontFamily: 'var(--font-money)', fontSize: 22, fontWeight: 700, color: tl.color }}>{hidden ? '••••' : `${tl.value < 0 ? '-' : ''}${Math.abs(tl.value).toLocaleString('en-US', { minimumFractionDigits: 2 })} US$`}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)', marginTop: 4 }}>{tl.hint}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Tabla completa por cántaro ── */
function JarsFullTable({ rows, hidden }) {
  const cols = [
    ['name', t('CÁNTARO')], ['carriedIn', t('SALDO ANTERIOR'), t('mes previo')],
    ['expected', t('ASIGNADO'), t('esperado')], ['real', t('ASIGNADO'), t('real')],
    ['disponibleMes', t('DISPONIBLE MES'), t('anterior + asignado')], ['gastado', t('GASTADO')],
    ['ajuste', t('AJUSTE')], ['totalGasto', t('TOTAL GASTO')], ['balance', t('BALANCE')],
  ];
  const totals = rows.reduce((a, r) => ({
    carriedIn: a.carriedIn + r.carriedIn, expected: a.expected + r.expected, real: a.real + r.real,
    disponibleMes: a.disponibleMes + r.disponibleMes, gastado: a.gastado + r.gastado, ajuste: a.ajuste + r.ajuste,
    totalGasto: a.totalGasto + r.totalGasto, balance: a.balance + r.balance,
  }), { carriedIn: 0, expected: 0, real: 0, disponibleMes: 0, gastado: 0, ajuste: 0, totalGasto: 0, balance: 0 });

  const cell = (v, opts = {}) => {
    if (v === 0 && opts.dashZero) return <span style={{ color: 'var(--fg-3)' }}>—</span>;
    const color = opts.color || (v < 0 ? 'var(--expense-fg)' : opts.pos ? 'var(--income-fg)' : 'var(--fg-1)');
    return <span style={{ color, fontWeight: opts.bold ? 700 : 500 }}>{hidden ? '••••' : `${v < 0 ? '-' : ''}${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2 })} US$`}</span>;
  };

  return (
    <Card padding={0} style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 12.5, minWidth: 860 }}>
        <thead>
          <tr>
            {cols.map(([k, l, sub], i) => (
              <th key={k} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '13px 16px', borderBottom: '1px solid var(--border-hairline)', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-3)' }}>{l}</div>
                {sub && <div style={{ fontSize: 10, color: 'var(--fg-3)', fontWeight: 500 }}>{sub}</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
              <td style={{ padding: '13px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: r.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: 'var(--fg-1)' }}>{r.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{r.percent}%</span>
                </div>
                {r.carriedIn !== 0 && <div style={{ fontSize: 10.5, marginTop: 2, marginLeft: 16, color: r.carriedIn > 0 ? 'var(--income-fg)' : 'var(--expense-fg)' }}>{r.carriedIn > 0 ? t('superávit') : t('excedido')}</div>}
              </td>
              <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(r.carriedIn, { dashZero: true })}</td>
              <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(r.expected, { color: 'var(--info)' })}</td>
              <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(r.real, { color: 'var(--income-fg)' })}</td>
              <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(r.disponibleMes, { color: '#8B5CF6', bold: true })}</td>
              <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(r.gastado, { color: 'var(--expense-fg)' })}</td>
              <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(r.ajuste, { dashZero: true })}</td>
              <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(r.totalGasto, { color: 'var(--expense-fg)' })}</td>
              <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(r.balance, { bold: true })}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ padding: '13px 16px', fontWeight: 700, color: 'var(--fg-1)' }}>{t('Total')}</td>
            <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(totals.carriedIn)}</td>
            <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(totals.expected, { color: 'var(--info)' })}</td>
            <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(totals.real, { color: 'var(--income-fg)' })}</td>
            <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(totals.disponibleMes, { bold: true })}</td>
            <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(totals.gastado, { color: 'var(--expense-fg)' })}</td>
            <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(totals.ajuste)}</td>
            <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(totals.totalGasto, { color: 'var(--expense-fg)' })}</td>
            <td style={{ padding: '13px 16px', textAlign: 'right' }}>{cell(totals.balance, { bold: true })}</td>
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}

/* ── Configuración global de cántaros ── */
function JarsGlobalConfig({ jars }) {
  const [inicio, setInicio] = useJpState('2025-01-11');
  const [allowNeg, setAllowNeg] = useJpState(false);
  const [limNeg, setLimNeg] = useJpState('');
  const [ciclo, setCiclo] = useJpState('none');
  const [diaCiclo, setDiaCiclo] = useJpState('1');
  const [leverageJarGlobal, setLeverageJarGlobal] = useJpState('');
  const [leverageJarMonth, setLeverageJarMonth] = useJpState('');
  const [autoLeverage, setAutoLeverage] = useJpState(false);
  const month = new Date().toISOString().slice(0, 7);

  const Toggle2 = ({ on, onClick }) => (
    <button onClick={onClick} style={{ width: 36, height: 22, borderRadius: 999, border: 0, cursor: 'pointer', background: on ? 'var(--brand-primary)' : 'var(--surface-3)', position: 'relative', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 999, background: '#fff', transition: 'left 150ms' }} />
    </button>
  );

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{t('Configuración global de cántaros')}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', marginTop: 2 }}>{t('Define el inicio de contabilidad y los valores por defecto sin salir del flujo principal.')}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 7 }}>{t('Inicio de contabilidad (global)')}</div>
          <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '10px 12px' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 7 }}>{t('Ciclo por defecto')}</div>
          <select value={ciclo} onChange={e => setCiclo(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '10px 12px' }}>
            <option value="none">{t('Sin reinicio')}</option>
            <option value="monthly">{t('Mensual')}</option>
            <option value="quarterly">{t('Trimestral')}</option>
            <option value="biannual">{t('Semestral')}</option>
            <option value="yearly">{t('Anual')}</option>
          </select>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 7 }}>{t('Día del ciclo por defecto')}</div>
          <input type="number" min="1" max="28" value={diaCiclo} onChange={e => setDiaCiclo(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '10px 12px' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 7 }}>{t('Cántaro de apalancamiento (global)')}</div>
          <select value={leverageJarGlobal} onChange={e => setLeverageJarGlobal(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '10px 12px' }}>
            <option value="">{t('Ninguno')}</option>
            {jars.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 7 }}>{t('Cántaro de apalancamiento')} <span style={{ color: 'var(--fg-3)', fontWeight: 500 }}>({month} · {t('override')})</span></div>
          <select value={leverageJarMonth} onChange={e => setLeverageJarMonth(e.target.value)} style={{ ...window.FC_INPUT_STYLE, width: '100%', boxSizing: 'border-box', padding: '10px 12px' }}>
            <option value="">{t('Usar global')}</option>
            {jars.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Toggle2 on={allowNeg} onClick={() => setAllowNeg(v => !v)} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)' }}>{t('Permitir negativos por defecto')}</span>
        </div>
        <input placeholder={t('Límite negativo por defecto')} disabled={!allowNeg} value={limNeg} onChange={e => setLimNeg(e.target.value)}
          style={{ ...window.FC_INPUT_STYLE, flex: 1, minWidth: 180, boxSizing: 'border-box', padding: '10px 12px', opacity: allowNeg ? 1 : .5 }} />
      </div>
      <div style={{ height: 1, background: 'var(--border-hairline)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Toggle2 on={autoLeverage} onClick={() => setAutoLeverage(v => !v)} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)' }}>{t('Habilitar apalancamiento automático')}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, textWrap: 'pretty' }}>{t('Si está habilitado, los cántaros negativos se reabsorben automáticamente desde el cántaro de apalancamiento.')}</div>
    </Card>
  );
}

Object.assign(window, { JarsKpiBar, JarsMonthSummary, JarsFullTable, JarsGlobalConfig });
