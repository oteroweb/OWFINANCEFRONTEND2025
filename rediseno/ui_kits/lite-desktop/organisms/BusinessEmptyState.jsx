/* ─── Organism · BusinessEmptyState (Fase 2) ──────────────────────────────
 * La primera pantalla real de una empresa recién creada. No es un "no hay
 * datos": es el arranque, y por eso no dice qué falta sino qué sigue.
 *
 * Por qué no muestra un Inicio de ceros: una pantalla con "$ 0.00", cántaros
 * al 0% y una lista vacía se lee como un error del sistema, no como una cuenta
 * nueva. Con cero movimientos no hay nada que resumir.
 *
 * Tres pasos, en el orden en que se pueden hacer de verdad:
 *   1. El onboarding de la empresa (D-011) — es el que deja cántaros y
 *      categorías listas, así que va primero y destacado.
 *   2. Una cuenta — sin cuenta no se puede registrar nada.
 *   3. El primer movimiento — queda deshabilitado hasta que haya una cuenta,
 *      con el motivo escrito. Un botón que falla al tocarlo es peor que uno
 *      apagado que dice por qué.
 *
 * Props: ctx(object) · hasAccounts(bool) · onboarded(bool)
 *        onOnboard · onAddAccount · onAddTx
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function BusinessEmptyState({ ctx = {}, hasAccounts = false, onboarded = false, onOnboard, onAddAccount, onAddTx }) {
  const tint = ctx.color || 'var(--brand-primary)';
  const steps = [
    {
      n: 1, icon: 'auto_awesome', primary: !onboarded,
      title: 'Configurá la empresa',
      body: onboarded
        ? 'Listo. Los cántaros quedaron armados con el reparto que elegiste.'
        : 'Unas preguntas sobre el negocio — rubro, facturación esperada, temporadas — y quedan los cántaros armados.',
      cta: 'Empezar', action: onOnboard, minutes: onboarded ? null : '3 minutos',
      done: onboarded,
    },
    {
      n: 2, icon: 'account_balance', primary: onboarded,
      title: 'Agregá una cuenta',
      body: 'El banco, la caja o lo que use la empresa para cobrar y pagar.',
      cta: 'Agregar cuenta', action: onAddAccount,
      done: hasAccounts,
    },
    {
      n: 3, icon: 'receipt_long',
      title: 'Registrá el primer movimiento',
      body: hasAccounts ? 'Un cobro o un gasto de la empresa.' : 'Necesita una cuenta primero: un movimiento tiene que entrar o salir de algún lado.',
      cta: 'Registrar', action: onAddTx, disabled: !hasAccounts,
    },
  ];

  return (
    <div style={{ padding: '28px 22px 44px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 22 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: tint, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19 }}>
            {(ctx.name || 'E').charAt(0).toUpperCase()}
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, color: 'var(--fg-1)', letterSpacing: '-.2px' }}>{ctx.name || 'Tu empresa'}</h2>
            <p style={{ margin: '3px 0 0', fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty' }}>
              Está creada y vacía. Sus cuentas, cántaros y movimientos son aparte de los tuyos.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {steps.map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '17px 18px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-1)', border: `1px solid ${s.primary ? tint : 'var(--border-hairline)'}`, boxShadow: s.primary ? 'var(--shadow-card)' : 'none', opacity: s.disabled ? .72 : 1 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'grid', placeItems: 'center', background: s.done ? 'var(--income-soft)' : s.primary ? tint : 'var(--surface-2)', color: s.done ? 'var(--income-fg)' : s.primary ? '#fff' : 'var(--fg-2)' }}>
                <span className="material-icons" style={{ fontSize: 18 }}>{s.done ? 'check' : s.icon}</span>
              </span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--fg-1)' }}>{s.title}</span>
                  {s.minutes && <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>{s.minutes}</span>}
                </div>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5, color: 'var(--fg-2)', textWrap: 'pretty' }}>{s.body}</p>
              </div>
              {!s.done && (
                <button type="button" onClick={s.disabled ? undefined : s.action} disabled={s.disabled}
                  style={{ flexShrink: 0, border: s.primary ? 0 : '1px solid var(--border-hairline)', cursor: s.disabled ? 'default' : 'pointer', padding: '10px 18px', borderRadius: 'var(--radius-pill)', background: s.primary ? tint : 'transparent', color: s.primary ? '#fff' : 'var(--fg-1)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                  {s.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Lo que la app todavía no hace, dicho acá y no descubierto después
          * (D-011: nómina es Fase 4). */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)' }}>
          <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)', flexShrink: 0 }}>schedule</span>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.55, color: 'var(--fg-2)', textWrap: 'pretty' }}>
            La gestión de empleados y pagos de nómina llega más adelante. Por ahora la empresa lleva cuentas, cántaros y movimientos.
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BusinessEmptyState });
