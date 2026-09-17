/* ─── Organism · Seguridad (Config Pro + Lite) ────────────────────────────
 * Cierra §2.4 del canónico: el diálogo de PIN existía como spec y como fila
 * muerta (`onActivate={() => {}}`) en ProConfigRoute, sin diseño.
 *
 * Piezas:
 *   SecuritySection — bloque de filas, se inserta en las dos rutas de Config.
 *   PinDialog       — crear / cambiar / eliminar PIN, con validación.
 *
 * Decisión de diseño que se separa del canónico a propósito:
 * §2.5 dice que las preferencias se guardan optimistas y **silenciosas en
 * error**. Para el PIN eso no aplica: un ajuste de seguridad que falla sin
 * decirlo deja al usuario creyendo que está protegido cuando no lo está.
 * El PIN confirma explícitamente y muestra el error. Registrado en D-007.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, Card, Eyebrow, PillButton, Field, TextInput */

const PIN_MIN = 4, PIN_MAX = 6;

function SecuritySection({ mode = 'lite', hasPin = false, privacyLock = false, onChange, onGo }) {
  const [ui, setUi] = React.useState({ dialog: null, hasPin, privacyLock, toast: null });
  const label = { fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' };

  const Row = ({ icon, title, hint, first, onClick, right, danger }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderTop: first ? 'none' : '1px solid var(--border-hairline)', cursor: onClick ? 'pointer' : 'default' }}>
      <span className="material-icons" style={{ fontSize: 20, color: danger ? 'var(--expense)' : 'var(--fg-2)', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: danger ? 'var(--expense-fg)' : 'var(--fg-1)' }}>{title}</span>
        {hint && <span style={label}>{hint}</span>}
      </div>
      {right}
    </div>
  );

  const Switch = ({ on }) => (
    <span style={{ width: 36, height: 22, borderRadius: 999, background: on ? 'var(--brand-primary)' : 'var(--surface-3)', position: 'relative', flexShrink: 0, display: 'inline-block', transition: 'background 180ms' }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 16 : 2, width: 18, height: 18, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.20)', transition: 'left var(--dur-base) var(--ease-out)' }} />
    </span>
  );

  const chevron = <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>chevron_right</span>;

  return (
    <div>
      <Eyebrow>Seguridad</Eyebrow>
      <Card padding={0} style={{ marginTop: 10 }}>
        {/* Contraseña: inline en Pro, otra página en Lite (§2.3) */}
        <Row first icon="key" title="Contraseña"
          hint={mode === 'pro' ? 'Se cambia en la pestaña Perfil, más abajo' : 'Se cambia en tu perfil'}
          onClick={mode === 'lite' ? () => onGo && onGo('profile') : undefined}
          right={mode === 'lite' ? chevron : undefined} />

        <Row icon="visibility_off" title="Bloqueo de privacidad"
          hint="Oculta los montos cuando la app queda en segundo plano"
          onClick={() => { setUi(u => ({ ...u, privacyLock: !u.privacyLock })); onChange && onChange('privacyLock', !ui.privacyLock); }}
          right={<Switch on={ui.privacyLock} />} />

        <Row icon="pin" title={ui.hasPin ? 'PIN de acceso' : 'Crear PIN de acceso'}
          hint={ui.hasPin ? 'Activo · se pide al abrir la app' : 'Sin configurar'}
          onClick={() => setUi(u => ({ ...u, dialog: 'pin' }))}
          right={ui.hasPin
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--income-soft)', color: 'var(--income-fg)' }}><span className="material-icons" style={{ fontSize: 13 }}>check</span>Activo</span>
            : chevron} />
      </Card>

      {ui.toast && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, padding: '11px 16px', borderRadius: 'var(--radius-md)', background: 'var(--income-soft)', color: 'var(--income-fg)' }}>
          <span className="material-icons" style={{ fontSize: 17 }}>check_circle</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{ui.toast}</span>
        </div>
      )}

      {ui.dialog === 'pin' && (
        <PinDialog hasPin={ui.hasPin}
          onClose={() => setUi(u => ({ ...u, dialog: null }))}
          onSave={() => setUi(u => ({ ...u, dialog: null, hasPin: true, toast: 'PIN guardado' }))}
          onRemove={() => setUi(u => ({ ...u, dialog: null, hasPin: false, toast: 'PIN eliminado' }))} />
      )}
    </div>
  );
}

/* ── PinDialog ────────────────────────────────────────────────────────────
 * `forceError` ('password'|'server') solo existe para revisar los estados de
 * error desde el mapa de rutas del documento. En producción viene del backend.
 * ──────────────────────────────────────────────────────────────────────── */
function PinDialog({ hasPin = false, initialView = null, forceError = null, onSave, onRemove, onClose }) {
  const [f, setF] = React.useState({ view: initialView || (hasPin ? 'menu' : 'set'), pass: '', pin: '', confirm: '', touched: false, error: forceError });
  const set = (patch) => setF(s => ({ ...s, ...patch }));
  const label = { fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' };

  const digits = f.pin.replace(/\D/g, '');
  const badFormat = digits.length > 0 && (digits.length < PIN_MIN || digits.length > PIN_MAX);
  const mismatch = f.confirm.length > 0 && f.confirm !== digits;
  const ready = digits.length >= PIN_MIN && digits.length <= PIN_MAX && f.confirm === digits && f.pass.length > 0;

  const backdrop = { position: 'fixed', inset: 0, background: 'rgba(4,7,13,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 'var(--z-modal, 900)' };
  const shell = { background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 26, width: 440, maxWidth: '100%' };

  const head = (title, sub) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>{title}</div>
        <div style={{ ...label, marginTop: 3, lineHeight: 1.5, textWrap: 'pretty' }}>{sub}</div>
      </div>
      <button onClick={onClose} aria-label="Cerrar" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', display: 'flex', padding: 2 }}>
        <span className="material-icons" style={{ fontSize: 22 }}>close</span>
      </button>
    </div>
  );

  /* Puntos de progreso: dice cuántos dígitos faltan sin revelar el PIN. */
  const Dots = ({ n }) => (
    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
      {Array.from({ length: PIN_MAX }).map((_, i) => (
        <span key={i} style={{ width: 9, height: 9, borderRadius: 999, background: i < n ? 'var(--brand-primary)' : 'var(--surface-3)', opacity: i < PIN_MIN || i < n ? 1 : 0.45 }} />
      ))}
      <span style={{ ...label, fontSize: 11.5, marginLeft: 6 }}>{n < PIN_MIN ? `mínimo ${PIN_MIN} dígitos` : `${n} dígitos`}</span>
    </div>
  );

  const Err = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 14px', borderRadius: 'var(--radius-md)', background: 'var(--expense-soft)' }}>
      <span className="material-icons" style={{ fontSize: 17, color: 'var(--expense-fg)' }}>error_outline</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.5, color: 'var(--expense-fg)', textWrap: 'pretty' }}>{children}</span>
    </div>
  );

  /* ── Menú: ya hay PIN ─────────────────────────────────────────────────── */
  if (f.view === 'menu') {
    return (
      <div style={backdrop} onClick={e => e.target === e.currentTarget && onClose && onClose()}>
        <div style={shell}>
          {head('PIN de acceso', 'Se pide cada vez que abrís la app. No cifra tus datos: es una barrera para que nadie con tu teléfono en la mano vea tus cuentas.')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PillButton icon="edit" onClick={() => set({ view: 'set', pin: '', confirm: '', pass: '', error: null })}>Cambiar PIN</PillButton>
            <PillButton variant="ghost" icon="delete_outline" onClick={() => set({ view: 'remove', pass: '', error: null })}>Eliminar PIN</PillButton>
          </div>
        </div>
      </div>
    );
  }

  /* ── Eliminar ─────────────────────────────────────────────────────────── */
  if (f.view === 'remove') {
    return (
      <div style={backdrop} onClick={e => e.target === e.currentTarget && onClose && onClose()}>
        <div style={shell}>
          {head('Eliminar el PIN', 'La app deja de pedir PIN al abrirse. Tu contraseña sigue igual.')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Tu contraseña" hint="Se pide para confirmar que sos vos">
              <TextInput type="password" value={f.pass} onChange={v => set({ pass: v, error: null })} placeholder="••••••••" />
            </Field>
            {f.error === 'password' && <Err>La contraseña no es correcta. El PIN sigue activo.</Err>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <PillButton variant="ghost" onClick={() => set({ view: 'menu' })}>Volver</PillButton>
              <PillButton variant="danger" onClick={() => (f.pass ? onRemove && onRemove() : set({ error: 'password' }))}>Eliminar PIN</PillButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Crear / cambiar ──────────────────────────────────────────────────── */
  return (
    <div style={backdrop} onClick={e => e.target === e.currentTarget && onClose && onClose()}>
      <div style={shell}>
        {head(hasPin ? 'Cambiar el PIN' : 'Crear un PIN de acceso',
          hasPin ? 'Escribí el nuevo PIN dos veces. El anterior deja de funcionar en cuanto guardes.'
                 : `Entre ${PIN_MIN} y ${PIN_MAX} dígitos. Se pide al abrir la app; no cifra tus datos ni reemplaza tu contraseña.`)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Tu contraseña" hint="Se pide para confirmar que sos vos">
            <TextInput type="password" value={f.pass} onChange={v => set({ pass: v, error: null })} placeholder="••••••••" />
          </Field>
          <Field label={hasPin ? 'Nuevo PIN' : 'PIN'}>
            <TextInput type="password" value={f.pin} onChange={v => set({ pin: v.replace(/\D/g, '').slice(0, PIN_MAX), error: null })} placeholder="····" />
          </Field>
          <div style={{ marginTop: -10 }}><Dots n={digits.length} /></div>
          <Field label="Repetir el PIN">
            <TextInput type="password" value={f.confirm} onChange={v => set({ confirm: v.replace(/\D/g, '').slice(0, PIN_MAX), error: null })} placeholder="····" />
          </Field>

          {badFormat && <Err>El PIN tiene que ser de {PIN_MIN} a {PIN_MAX} dígitos.</Err>}
          {mismatch && !badFormat && <Err>Los dos PIN no coinciden.</Err>}
          {f.error === 'password' && <Err>La contraseña no es correcta. No se guardó ningún PIN.</Err>}
          {f.error === 'server' && <Err>No se pudo guardar el PIN. Seguís sin protección: volvé a intentarlo antes de cerrar.</Err>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ ...label, fontSize: 12, lineHeight: 1.45, textWrap: 'pretty' }}>
              {ready ? 'Listo para guardar.' : 'Completá los tres campos para poder guardar.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <PillButton variant="ghost" onClick={hasPin ? () => set({ view: 'menu' }) : onClose}>Cancelar</PillButton>
              <PillButton onClick={() => ready && onSave && onSave()}>{hasPin ? 'Guardar PIN nuevo' : 'Guardar PIN'}</PillButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SecuritySection, PinDialog });
