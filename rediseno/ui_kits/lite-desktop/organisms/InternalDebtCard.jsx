/* ─── Organism · InternalDebtCard (D-004) ─────────────────────────────────
 * Deuda entre dos miembros del grupo familiar. UN registro, DOS vistas:
 * la de quien la registró y la de la contraparte.
 *
 * Resuelve la pregunta abierta de D-004 — la contraparte **no edita**, solo
 * confirma o disputa. El monto lo escribe quien la registra. Dejar que ambos
 * editaran el mismo monto sería una guerra de ediciones sin historial y sin
 * dueño de la verdad.
 *
 * **D-013 lo refina**: en disputa sí puede CONTRAPROPONER — con historial
 * visible, monto obligatorio y motivo opcional. Eso vive en
 * `DebtNegotiation.jsx`, que también cubre el estado congelado (D-015).
 *
 * Contrato de callbacks:
 *   onSelectAction('confirm:<id>' | 'dispute:<id>' | 'remind:<id>' | 'settle:<id>' | 'cancel:<id>')
 *
 * Props: debt · viewerUserId (quién está mirando)
 * Se distingue de la deuda externa por la fila de contraparte con avatar +
 * el estado de confirmación. La externa no tiene ninguna de las dos.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, Avatar, Money, PillButton, OWF_DEBT_CONFIRMATION */

function InternalDebtCard({ debt, viewerUserId = 1, onSelectAction }) {
  const conf = OWF_DEBT_CONFIRMATION[debt.confirmation] || OWF_DEBT_CONFIRMATION.pending;
  const iRegistered = debt.registered_by_user_id === viewerUserId;
  const theyOweMe = debt.direction === 'they_owe_me';
  const progress = debt.original ? Math.round(((debt.original - debt.balance) / debt.original) * 100) : 0;
  const label = { fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' };

  /* La dirección se dice en palabras, no con un signo, y **desde el lado de
   * quien mira**: el fixture la describe desde el usuario 1, así que a la
   * contraparte le salía "le debés a vos mismo". */
  const view = window.owfDebtView ? window.owfDebtView(debt, viewerUserId) : null;
  const direction = view ? view.directionText
    : (theyOweMe ? `${debt.counterparty_name.split(' ')[0]} te debe` : `Le debés a ${debt.counterparty_name.split(' ')[0]}`);
  const otherName = view ? view.otherName : debt.counterparty_name;

  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary-fg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-icons" style={{ fontSize: 20 }}>handshake</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{debt.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <Avatar initial={otherName.charAt(0)} size={15} />
            <span style={{ ...label, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{direction} · {debt.created_at}</span>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: conf.bg, color: conf.fg, whiteSpace: 'nowrap' }}>
          <span className="material-icons" style={{ fontSize: 13 }}>{conf.icon}</span>{conf.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          {/* En negociación el monto grande NO es lo que se debe: es lo que se
            * registró, y hay otra cifra sobre la mesa. Llamarlo "Pendiente"
            * contradice el hilo justo debajo. */}
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>
            {debt.confirmation === 'disputed' ? 'Monto registrado' : debt.confirmation === 'frozen' ? 'Quedó en' : 'Pendiente'}
          </div>
          <Money value={debt.balance} currency={debt.currency_symbol} className="t-amount-lg" />
        </div>
        {debt.original !== debt.balance && <span style={{ ...label, fontSize: 12 }}>{progress}% pagado</span>}
      </div>

      {debt.original !== debt.balance && (
        <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: progress + '%', background: 'var(--brand-primary)', borderRadius: 3 }} />
        </div>
      )}

      {/* La acción disponible depende de quién mira y del estado — no un menú
       * idéntico para los dos lados. */}
      {debt.confirmation === 'pending' && (
        <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <p style={{ ...label, lineHeight: 1.5, textWrap: 'pretty' }}>
            {iRegistered
              ? `${otherName.split(' ')[0]} todavía no confirmó esta deuda. Mientras no lo haga, no cuenta en el total de ninguno de los dos.`
              : `${debt.name}, registrada por ${otherName.split(' ')[0]}. Si el monto es correcto, confirmala; si no, marcala en disputa y háblenlo.`}
          </p>
          <div style={{ display: 'flex', gap: 9 }}>
            {iRegistered ? (
              <React.Fragment>
                <PillButton size="sm" variant="ghost" icon="notifications" onClick={() => onSelectAction && onSelectAction('remind:' + debt.id)}>Recordarle</PillButton>
                <PillButton size="sm" variant="ghost" onClick={() => onSelectAction && onSelectAction('cancel:' + debt.id)}>Eliminar</PillButton>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <PillButton size="sm" icon="check" onClick={() => onSelectAction && onSelectAction('confirm:' + debt.id)}>Confirmar</PillButton>
                <PillButton size="sm" variant="ghost" onClick={() => onSelectAction && onSelectAction('dispute:' + debt.id)}>No estoy de acuerdo</PillButton>
              </React.Fragment>
            )}
          </div>
        </div>
      )}

      {/* En disputa la contraparte NO edita, pero sí contrapropone (D-013):
        * el ida y vuelta con historial vive en `DebtNegotiation`. Y una deuda
        * congelada (D-015) usa el mismo componente en solo lectura. */}
      {(debt.confirmation === 'disputed' || debt.confirmation === 'frozen' || debt.frozen) && (
        <DebtNegotiation debt={debt} viewerUserId={viewerUserId}
          onSelectAction={onSelectAction}
          onPropose={p => onSelectAction && onSelectAction(`propose:${debt.id}:${p.amount}`)} />
      )}

      {debt.confirmation === 'confirmed' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
          <p style={{ ...label, flex: 1, lineHeight: 1.45, textWrap: 'pretty' }}>Los dos la reconocen. Al saldarla se registra el movimiento en las dos cuentas.</p>
          <PillButton size="sm" onClick={() => onSelectAction && onSelectAction('settle:' + debt.id)}>Saldar</PillButton>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { InternalDebtCard });
