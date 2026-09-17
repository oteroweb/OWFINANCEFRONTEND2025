/* ─── Organism · CreateBusinessModal (Fase 2) ─────────────────────────────
 * Alta de una contabilidad de empresa, desde "Crear una empresa" del selector
 * de contexto. Ver DECISIONS.md D-009 (color, modo por contabilidad), D-010
 * (Config propia) y D-011 (onboarding propio).
 *
 * Cuatro campos y nada más. Es a propósito: todo lo que define cómo se maneja
 * la empresa — cántaros, categorías, temporadas — sale de su onboarding, no de
 * este formulario. Pedir aquí lo que el wizard va a preguntar de nuevo hace
 * que crear una empresa se sienta como un trámite.
 *
 *   · Nombre — lo único obligatorio.
 *   · RIF / identificación fiscal — opcional. Muchas empresas chicas empiezan
 *     a llevar cuentas antes de estar registradas; exigirlo las deja afuera.
 *   · Moneda — la de la empresa, no la del usuario (D-010).
 *   · Modo — Lite o Pro, propio de esta contabilidad (D-009). Va con una línea
 *     que dice qué cambia, porque "Lite/Pro" solo no significa nada la primera
 *     vez que lo ves.
 *
 * El COLOR no se pregunta: se asigna el siguiente libre de la paleta cerrada
 * y se muestra ya aplicado, con un enlace para cambiarlo. Nadie tiene que
 * elegir un color para poder empezar a trabajar (D-009).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, OWF_CONTEXT_COLORS, owfNextContextColor */
const { useState: useCbState } = React;

function CbField({ label, hint, optional, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>{label}</span>
        {optional && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)' }}>opcional</span>}
      </div>
      {children}
      {hint && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, lineHeight: 1.45, color: 'var(--fg-3)', textWrap: 'pretty' }}>{hint}</span>}
    </div>
  );
}

function CreateBusinessModal({ open, usedColors = [], onClose, onCreate }) {
  const [name, setName] = useCbState('');
  const [taxId, setTaxId] = useCbState('');
  const [currency, setCurrency] = useCbState('USD');
  const [mode, setMode] = useCbState('lite');
  const [color, setColor] = useCbState(null);
  const [pickColor, setPickColor] = useCbState(false);

  if (!open) return null;

  const auto = owfNextContextColor(usedColors);
  const tint = color || auto;
  const valid = name.trim().length > 1;

  const close = () => { setName(''); setTaxId(''); setCurrency('USD'); setMode('lite'); setColor(null); setPickColor(false); onClose && onClose(); };
  const submit = () => {
    if (!valid) return;
    onCreate && onCreate({
      id: 'b' + Date.now(), name: name.trim(), kind: 'business',
      color: tint, mode, currency, taxId: taxId.trim() || null,
      /* Nace sin cuentas y sin cántaros. Que su Inicio muestre el arranque en
       * vez de una pantalla de ceros sale de eso, no de una bandera aparte. */
    });
    close();
  };

  const input = { ...window.FC_INPUT_STYLE, padding: '11px 13px' };
  const modes = [
    ['lite', 'Lite', 'Una vista simple: saldo, cántaros y movimientos.'],
    ['pro', 'Pro', 'Paneles, reportes y categorías en árbol.'],
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal, 100)', background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={close}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(470px, 100%)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', overflow: 'hidden' }}>

        {/* La cabecera ya viene teñida con el color asignado: el usuario ve de
          * entrada cómo se va a reconocer esta empresa. Va fuera del área que
          * scrollea — el `overflow:hidden` de la caja es lo que le recorta las
          * esquinas, así que el scroll tiene que vivir en el cuerpo, no acá. */}
        <div style={{ background: tint, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'rgba(255,255,255,.22)', color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
            {name.trim() ? name.trim().charAt(0).toUpperCase() : <span className="material-icons" style={{ fontSize: 18 }}>store</span>}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name.trim() || 'Nueva empresa'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'rgba(255,255,255,.8)', marginTop: 1 }}>Su propia contabilidad, aparte de la tuya</div>
          </div>
          <button type="button" onClick={close} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,.85)', display: 'flex' }}>
            <span className="material-icons" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', minHeight: 0 }}>
          <CbField label="Nombre de la empresa">
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Distribuidora Otero"
              onFocus={window.fcFocus} onBlur={window.fcBlur} style={input} />
          </CbField>

          <CbField label="RIF o identificación fiscal" optional
            hint="Podés dejarlo vacío y agregarlo después, cuando la empresa esté registrada.">
            <input value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="J-00000000-0"
              onFocus={window.fcFocus} onBlur={window.fcBlur} style={{ ...input, fontFamily: 'var(--font-money)' }} />
          </CbField>

          <CbField label="Moneda de la empresa" hint="Es la de esta contabilidad; no cambia la de tus cuentas personales.">
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={input}>
              {Object.keys(window.CURRENCIES || { USD: 1 }).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </CbField>

          <CbField label="Cómo querés verla">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 9 }}>
              {modes.map(([id, label, desc]) => {
                const on = mode === id;
                return (
                  <button key={id} type="button" onClick={() => setMode(id)}
                    style={{ textAlign: 'left', cursor: 'pointer', padding: '12px 13px', borderRadius: 'var(--radius-md)', background: on ? 'var(--surface-2)' : 'transparent', border: `1px solid ${on ? tint : 'var(--border-hairline)'}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 15, height: 15, borderRadius: 999, flexShrink: 0, border: `2px solid ${on ? tint : 'var(--border-strong, var(--surface-3))'}`, background: on ? tint : 'transparent', boxShadow: on ? 'inset 0 0 0 2.5px var(--surface-1)' : 'none' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>{label}</span>
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, lineHeight: 1.45, color: 'var(--fg-2)', textWrap: 'pretty' }}>{desc}</span>
                  </button>
                );
              })}
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, lineHeight: 1.45, color: 'var(--fg-3)', textWrap: 'pretty' }}>
              Cada contabilidad guarda su propia vista. Podés tener tu cuenta personal en Lite y esta empresa en Pro.
            </span>
          </CbField>

          {/* Color: asignado, no preguntado. El enlace lo abre si a alguien le importa. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: tint, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.45, color: 'var(--fg-2)', textWrap: 'pretty' }}>
              Con este color vas a reconocer la empresa en la barra de arriba.
            </span>
            <button type="button" onClick={() => setPickColor(p => !p)}
              style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: tint, whiteSpace: 'nowrap' }}>
              {pickColor ? 'Listo' : 'Cambiar'}
            </button>
          </div>

          {pickColor && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {OWF_CONTEXT_COLORS.map(c => {
                const taken = usedColors.includes(c.value) && c.value !== tint;
                return (
                  <button key={c.id} type="button" onClick={() => setColor(c.value)} title={taken ? `${c.label} — ya en uso` : c.label}
                    style={{ width: 30, height: 30, borderRadius: 9, background: c.value, cursor: 'pointer', opacity: taken ? 0.35 : 1, border: tint === c.value ? '2px solid var(--fg-1)' : '2px solid transparent' }} />
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
            <button type="button" onClick={submit} disabled={!valid}
              style={{ flex: 1, border: 0, cursor: valid ? 'pointer' : 'default', opacity: valid ? 1 : .5, padding: '13px 20px', borderRadius: 'var(--radius-pill)', background: tint, color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}>
              Crear empresa
            </button>
            <button type="button" onClick={close}
              style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '13px 16px', borderRadius: 'var(--radius-pill)', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CreateBusinessModal });
